import { ActivationContainer, type ChoiceDefinition } from '@potato-golem/core'
import { PotatoScene } from '@potato-golem/ui'
import Phaser from 'phaser'
import type { Dependencies } from '../../diConfig.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import type { TravelTurnProcessor } from '../../model/processors/TravelTurnProcessor.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { DEFAULT_ZOOM, STAR_AMOUNT } from './internal/starmapConstants.ts'
import { getRandomStarColor, getStarName } from './internal/starUtils.ts'
import type { StarmapUIScene } from './StarmapUIScene.ts'

interface Star {
  x: number
  y: number
  color: number
  name: string
  distance: number
  display: Phaser.GameObjects.Arc
  region: string
  colonized: boolean
  inhabitant?: string
  hasShipyard: boolean
  hasMercenaryGuild: boolean
  economicType?: 'industrial' | 'scientific' | 'mining' | 'agricultural' | null
}

export class StarmapScene extends PotatoScene {
  private readonly worldModel: WorldModel
  private readonly travelTurnProcessor: TravelTurnProcessor

  private starmapUIScene: StarmapUIScene
  private stars: Star[] = []
  private starGroup!: Phaser.GameObjects.Group

  private isDragging = false
  private dragStart = { x: 0, y: 0 }
  private cameraStart = { x: 0, y: 0 }

  private travelSpeed = 40

  private playerX = 0
  private playerY = 0

  private selectedStar: Star | null = null
  private selectedPoint: { x: number; y: number } | null = null
  private lineGraphics!: Phaser.GameObjects.Graphics

  private isTraveling = false

  private playerShipSprite!: Phaser.GameObjects.Image // <--- ADDED

  // Fog of war properties
  private fogTexture!: Phaser.Textures.CanvasTexture
  private fogSprite!: Phaser.GameObjects.Image
  private fogRevealRadius = 150 // Radius around ship that gets revealed
  private fogResolution = 2048 // Resolution of fog texture
  private fogBounds = { minX: -2000, maxX: 2000, minY: -2000, maxY: 2000 } // World bounds for fog

  // Hub Systems properties
  private hubSystemsRadius = this.fogRevealRadius * 4 // Hub Systems is 4 scanning radiuses wide
  private hubSystemsCenter = { x: 0, y: 0 } // Hub Systems at center of map
  private regionLabels: Phaser.GameObjects.Text[] = []

  // Alien races for colonization
  private alienRaces = [
    'Terrans',
    'Zephyrians',
    'Crystallites',
    'Void Dancers',
    'Mechanoids',
    'Drifters',
    'Swarm Collective',
    'Ancient Ones',
  ]

  constructor(dependencies: Dependencies) {
    super(dependencies.globalSceneEventEmitter, { key: sceneRegistry.STARMAP_SCENE })
    this.worldModel = dependencies.worldModel
    this.travelTurnProcessor = dependencies.travelTurnProcessor
    this.starmapUIScene = dependencies.starmapUIScene
  }

  preload() {}

  create() {
    if (!this.scene.isActive(sceneRegistry.STARMAP_UI_SCENE)) {
      this.scene.launch(sceneRegistry.STARMAP_UI_SCENE)
    }

    this.cameras.main.setZoom(DEFAULT_ZOOM)

    // Add a dark background for space
    this.cameras.main.setBackgroundColor(0x0a0a0f)

    this.starGroup = this.add.group()

    // Initialize fog of war
    this.initializeFogOfWar()

    // Draw play area boundary
    this.drawPlayAreaBoundary()

    this.lineGraphics = this.add.graphics().setDepth(1000)

    // Add the ship image sprite
    this.playerShipSprite = this.add
      .image(this.playerX, this.playerY, imageRegistry.ROCKET)
      .setOrigin(0.5, 0.5)
      .setDepth(1001) // on top of everything

    this.events.on('encounter_choice_selected', (choice: ChoiceDefinition) => {
      console.log(`Processing choice ${choice.id}`)
      const effectContainer = ActivationContainer.fromEffectList(choice.effects)
      effectContainer.activateOnlySync()
    })

    this.events.on('travelButtonClicked', () => {
      if (this.isTraveling) {
        this.isTraveling = false
        this.showTravelButtonIfAvailable()
      } else if (this.selectedStar || this.selectedPoint) {
        this.isTraveling = true
        this.showTravelButtonIfAvailable()
      }
    })

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.middleButtonDown()) {
        this.isDragging = true
        this.dragStart.x = pointer.x
        this.dragStart.y = pointer.y
        this.cameraStart.x = this.cameras.main.scrollX
        this.cameraStart.y = this.cameras.main.scrollY
        this.input.setDefaultCursor('grabbing')
        this.hideOverlay()
        return
      }
      if (pointer.rightButtonDown()) return

      // Get world coordinates from pointer
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)

      // Check if clicking on a star
      const objectsUnderPointer = this.input.hitTestPointer(
        pointer,
      ) as Phaser.GameObjects.GameObject[]
      const arc = objectsUnderPointer.find(
        (obj) => obj instanceof Phaser.GameObjects.Arc && this.starGroup.contains(obj),
      ) as Phaser.GameObjects.Arc | undefined

      if (arc) {
        const star = this.stars.find((s) => s.display === arc)
        if (star) {
          // Check if star is within play area bounds
          if (!this.isPointInPlayArea(star.x, star.y)) {
            // Star is outside play area, don't select it
            return
          }

          // If we have a selected point/star and click on it again, start traveling
          if (
            this.selectedStar === star ||
            (this.selectedPoint &&
              this.selectedPoint.x === star.x &&
              this.selectedPoint.y === star.y)
          ) {
            if (!this.isTraveling) {
              this.isTraveling = true
              this.showTravelButtonIfAvailable()
            }
          } else {
            // Select the star
            this.selectedStar = star
            this.selectedPoint = { x: star.x, y: star.y }
            this.showTravelButtonIfAvailable()
          }
          return
        }
      }

      // If clicking on the currently selected point, start traveling
      if (this.selectedPoint && !this.isTraveling) {
        const distance = Phaser.Math.Distance.Between(
          worldPoint.x,
          worldPoint.y,
          this.selectedPoint.x,
          this.selectedPoint.y,
        )
        if (distance < 10) {
          // Close enough to the selected point
          this.isTraveling = true
          this.showTravelButtonIfAvailable()
          return
        }
      }

      // Check if the clicked point is within play area bounds
      if (!this.isPointInPlayArea(worldPoint.x, worldPoint.y)) {
        // Point is outside play area, don't select it - show visual feedback
        this.selectedStar = null
        this.selectedPoint = null
        this.hideTravelButton()

        // Flash a red circle to indicate area is out of bounds
        const flashCircle = this.add
          .circle(worldPoint.x, worldPoint.y, 20, 0xff0000, 0.5)
          .setDepth(1002)

        this.tweens.add({
          targets: flashCircle,
          alpha: 0,
          scale: 2,
          duration: 300,
          ease: 'Power2',
          onComplete: () => {
            flashCircle.destroy()
          },
        })

        return
      }

      // Otherwise, select the clicked point in space
      this.selectedStar = null
      this.selectedPoint = { x: worldPoint.x, y: worldPoint.y }
      this.showTravelButtonIfAvailable()
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const cam = this.cameras.main
        cam.scrollX = this.cameraStart.x - (pointer.x - this.dragStart.x) / cam.zoom
        cam.scrollY = this.cameraStart.y - (pointer.y - this.dragStart.y) / cam.zoom
        this.hideOverlay()
      } else {
        this.handleStarHover(pointer)
      }
    })

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && pointer.middleButtonReleased()) {
        this.isDragging = false
        this.input.setDefaultCursor('default')
      }
    })

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      const cam = this.cameras.main
      const newZoom = Phaser.Math.Clamp(cam.zoom - deltaY * 0.001, 0.2, 5)
      cam.setZoom(newZoom)
    })

    // Generate universe with regions
    this.generateUniverse()

    // Add region labels
    this.addRegionLabels()

    // Center camera on player starting position (center of Hub Systems)
    this.cameras.main.centerOn(this.playerX, this.playerY)

    // Initial fog reveal
    this.updateFogOfWar()
  }

  drawPlayAreaBoundary() {
    // Draw a border around the play area
    const borderGraphics = this.add.graphics()
    borderGraphics.lineStyle(3, 0x4444ff, 0.5)
    borderGraphics.strokeRect(
      this.fogBounds.minX,
      this.fogBounds.minY,
      this.fogBounds.maxX - this.fogBounds.minX,
      this.fogBounds.maxY - this.fogBounds.minY,
    )
    borderGraphics.setDepth(998) // Just below fog
  }

  initializeFogOfWar() {
    // Create fog texture
    this.fogTexture = this.textures.createCanvas('fogOfWar', this.fogResolution, this.fogResolution)
    const context = this.fogTexture.getContext()

    // Fill with gray fog initially for better visibility
    context.fillStyle = 'rgba(128, 128, 128, 1)'
    context.fillRect(0, 0, this.fogResolution, this.fogResolution)

    // Create fog sprite covering the entire world
    this.fogSprite = this.add
      .image(0, 0, 'fogOfWar')
      .setOrigin(0.5, 0.5)
      .setDepth(999) // Below line graphics but above stars
      .setAlpha(0.75) // More opaque to clearly distinguish explored/unexplored
      .setBlendMode(Phaser.BlendModes.NORMAL)

    // Scale fog to cover world bounds
    const worldWidth = this.fogBounds.maxX - this.fogBounds.minX
    const worldHeight = this.fogBounds.maxY - this.fogBounds.minY
    this.fogSprite.setScale(worldWidth / this.fogResolution, worldHeight / this.fogResolution)

    // Apply previously discovered areas
    const context2d = this.fogTexture.getContext()
    context2d.globalCompositeOperation = 'destination-out'

    for (const area of this.worldModel.discoveredAreas) {
      this.revealFogArea(area.x, area.y, area.radius, false)
    }

    this.fogTexture.refresh()
  }

  revealFogArea(worldX: number, worldY: number, radius: number, addToModel = true) {
    const context = this.fogTexture.getContext()

    // Convert world coordinates to texture coordinates
    const texX =
      ((worldX - this.fogBounds.minX) / (this.fogBounds.maxX - this.fogBounds.minX)) *
      this.fogResolution
    const texY =
      ((worldY - this.fogBounds.minY) / (this.fogBounds.maxY - this.fogBounds.minY)) *
      this.fogResolution
    const texRadius = (radius / (this.fogBounds.maxX - this.fogBounds.minX)) * this.fogResolution

    // Create gradient for smooth edges with more distinct transition
    const gradient = context.createRadialGradient(texX, texY, 0, texX, texY, texRadius)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.9, 'rgba(255, 255, 255, 0.5)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    context.globalCompositeOperation = 'destination-out'
    context.fillStyle = gradient
    context.beginPath()
    context.arc(texX, texY, texRadius, 0, Math.PI * 2)
    context.fill()

    // Store in world model if needed
    if (addToModel) {
      // Check if this area overlaps with existing areas
      let merged = false
      for (const area of this.worldModel.discoveredAreas) {
        const dist = Phaser.Math.Distance.Between(area.x, area.y, worldX, worldY)
        if (dist < area.radius + radius) {
          // Merge areas by expanding the existing one
          const newRadius = Math.max(area.radius, dist + radius)
          area.radius = newRadius
          merged = true
          break
        }
      }

      if (!merged) {
        this.worldModel.discoveredAreas.push({ x: worldX, y: worldY, radius })
      }
    }
  }

  updateFogOfWar() {
    // Reveal area around current player position
    this.revealFogArea(this.playerX, this.playerY, this.fogRevealRadius)
    this.fogTexture.refresh()
  }

  isPointInPlayArea(x: number, y: number): boolean {
    // Check if the point is within the fog bounds (playable area)
    return (
      x >= this.fogBounds.minX &&
      x <= this.fogBounds.maxX &&
      y >= this.fogBounds.minY &&
      y <= this.fogBounds.maxY
    )
  }

  generateUniverse() {
    // Generate Hub Systems (dense star cluster at center)
    const hubStarCount = Math.floor(STAR_AMOUNT * 0.4) // 40% of stars in Hub Systems
    for (let i = 0; i < hubStarCount; i++) {
      // Generate stars within Hub Systems radius
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * this.hubSystemsRadius
      const x = this.hubSystemsCenter.x + Math.cos(angle) * radius
      const y = this.hubSystemsCenter.y + Math.sin(angle) * radius
      this.addStar(x, y, 'Hub Systems')
    }

    // Generate Frontier Systems (medium density ring around Hub)
    const frontierStarCount = Math.floor(STAR_AMOUNT * 0.3) // 30% in Frontier
    for (let i = 0; i < frontierStarCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = this.hubSystemsRadius + Math.random() * 400 // Ring from hub edge to +400
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      this.addStar(x, y, 'Frontier Systems')
    }

    // Generate Outer Rim (sparse stars at edges)
    const outerRimStarCount = STAR_AMOUNT - hubStarCount - frontierStarCount // Remaining stars
    for (let i = 0; i < outerRimStarCount; i++) {
      // Generate in outer areas, avoiding center
      let x: number, y: number
      do {
        x = Phaser.Math.Between(this.fogBounds.minX, this.fogBounds.maxX)
        y = Phaser.Math.Between(this.fogBounds.minY, this.fogBounds.maxY)
      } while (Phaser.Math.Distance.Between(0, 0, x, y) < this.hubSystemsRadius + 400)
      this.addStar(x, y, 'Outer Rim')
    }
  }

  addRegionLabels() {
    // Add "The Hub Systems" label
    const hubLabel = this.add
      .text(
        this.hubSystemsCenter.x,
        this.hubSystemsCenter.y - this.hubSystemsRadius * 0.7,
        'THE HUB SYSTEMS',
        {
          fontSize: '32px',
          fontFamily: 'Arial',
          color: '#aaaaff',
          stroke: '#000033',
          strokeThickness: 3,
          align: 'center',
        },
      )
      .setOrigin(0.5, 0.5)
      .setAlpha(0.6)
      .setDepth(5) // Below stars but visible
    this.regionLabels.push(hubLabel)

    // Add "Frontier Systems" labels
    const frontierLabel1 = this.add
      .text(-800, -800, 'FRONTIER SYSTEMS', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#88aa88',
        stroke: '#002200',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0.4)
      .setDepth(5)
    this.regionLabels.push(frontierLabel1)

    const frontierLabel2 = this.add
      .text(800, 800, 'FRONTIER SYSTEMS', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#88aa88',
        stroke: '#002200',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0.4)
      .setDepth(5)
    this.regionLabels.push(frontierLabel2)

    // Add "Outer Rim" labels
    const outerLabel = this.add
      .text(0, -1500, 'OUTER RIM', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#666666',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0.3)
      .setDepth(5)
    this.regionLabels.push(outerLabel)
  }

  addStar(x: number, y: number, region: string) {
    const color = getRandomStarColor()
    const name = getStarName()
    const distance = this.calcDistanceToPlayer(x, y)

    // Colonization probability based on region
    let colonizationChance = 0
    if (region === 'Hub Systems') colonizationChance = 0.7
    else if (region === 'Frontier Systems') colonizationChance = 0.4
    else colonizationChance = 0.15

    const colonized = Math.random() < colonizationChance
    const inhabitant = colonized
      ? this.alienRaces[Math.floor(Math.random() * this.alienRaces.length)]
      : undefined

    // Facilities more common in Hub Systems
    const facilityModifier = region === 'Hub Systems' ? 2 : region === 'Frontier Systems' ? 1 : 0.5
    const hasShipyard = Math.random() < 0.15 * facilityModifier
    const hasMercenaryGuild = Math.random() < 0.1 * facilityModifier

    // Economic type (more likely if colonized)
    let economicType: 'industrial' | 'scientific' | 'mining' | 'agricultural' | null = null
    if (colonized && Math.random() < 0.6) {
      const types: Array<'industrial' | 'scientific' | 'mining' | 'agricultural'> = [
        'industrial',
        'scientific',
        'mining',
        'agricultural',
      ]
      economicType = types[Math.floor(Math.random() * types.length)]
    }

    // Adjust star size based on importance
    const baseSize = region === 'Hub Systems' ? 2 : 1
    const importanceBonus = hasShipyard || hasMercenaryGuild || economicType ? 1 : 0
    const starSize = Phaser.Math.Between(baseSize, baseSize + 2) + importanceBonus

    const star = this.add
      .circle(x, y, starSize, color)
      .setAlpha(Phaser.Math.FloatBetween(0.5, 1))
      .setInteractive({ cursor: 'pointer' })
      .setDepth(10) // Stars should be below fog

    this.starGroup.add(star)
    this.stars.push({
      x,
      y,
      color,
      name,
      distance,
      display: star,
      region,
      colonized,
      inhabitant,
      hasShipyard,
      hasMercenaryGuild,
      economicType,
    })
  }

  handleStarHover(pointer: Phaser.Input.Pointer) {
    const objectsUnderPointer = this.input.hitTestPointer(
      pointer,
    ) as Phaser.GameObjects.GameObject[]
    const arc = objectsUnderPointer.find(
      (obj) => obj instanceof Phaser.GameObjects.Arc && this.starGroup.contains(obj),
    ) as Phaser.GameObjects.Arc | undefined

    if (arc) {
      const star = this.stars.find((s) => s.display === arc)
      if (star) {
        // Check if star is within play area
        if (this.isPointInPlayArea(star.x, star.y)) {
          const distance = this.calcDistanceToPlayer(star.x, star.y)

          // Build system information text
          let text = `SYSTEM: ${star.name}\n`
          text += `Region: ${star.region}\n`
          text += `Distance: ${distance.toFixed(1)} ly\n`
          text += `─────────────────\n`

          // Colonization status
          if (star.colonized) {
            text += `Status: COLONIZED\n`
            text += `Inhabitants: ${star.inhabitant}\n`
          } else {
            text += `Status: UNINHABITED\n`
          }

          // Economic type
          if (star.economicType) {
            const typeLabel = star.economicType.charAt(0).toUpperCase() + star.economicType.slice(1)
            text += `Economy: ${typeLabel} Hub\n`
          }

          // Facilities
          const facilities: string[] = []
          if (star.hasShipyard) facilities.push('Shipyard')
          if (star.hasMercenaryGuild) facilities.push('Merc Guild')

          if (facilities.length > 0) {
            text += `Facilities: ${facilities.join(', ')}\n`
          }

          const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any
          if (uiScene?.showOverlay) {
            uiScene.showOverlay(pointer.x, pointer.y, text)
          }
          // Set pointer cursor for stars in play area
          this.input.setDefaultCursor('pointer')
        } else {
          // Set default cursor for out-of-bounds stars
          this.input.setDefaultCursor('default')
        }
        return
      }
    }
    const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any
    if (uiScene?.hideOverlay) uiScene.hideOverlay()
    this.input.setDefaultCursor('default')
  }

  hideOverlay() {
    const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any
    if (uiScene?.hideOverlay) uiScene.hideOverlay()
  }

  private onShipArrivedAtDestination(): void {
    console.log('Ship arrived at destination!')

    // Get the star system data if we arrived at a star
    if (this.selectedStar) {
      const systemData = {
        name: this.selectedStar.name,
        colonized: this.selectedStar.colonized,
        biome: this.worldModel.planets[0]?.biome?.name || 'Unknown',
        inhabitant: this.selectedStar.inhabitant,
        region: this.selectedStar.region,
        hasShipyard: this.selectedStar.hasShipyard,
        hasMercenaryGuild: this.selectedStar.hasMercenaryGuild,
        economicType: this.selectedStar.economicType,
        distance: this.selectedStar.distance,
      }

      // Sleep the starmap scenes (preserve state)
      this.scene.sleep(sceneRegistry.STARMAP_SCENE)
      this.scene.sleep(sceneRegistry.STARMAP_UI_SCENE)

      // Launch the system visit scene with the system data
      this.scene.launch(sceneRegistry.SYSTEM_VISIT_SCENE, systemData)
    }
  }

  showTravelButtonIfAvailable() {
    const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as StarmapUIScene
    if ((this.selectedStar || this.selectedPoint) && uiScene?.showTravelButton) {
      uiScene.showTravelButton(true, this.isTraveling ? 'Stop' : 'Travel to destination')
    }
  }

  hideTravelButton() {
    const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any
    if (uiScene?.showTravelButton) {
      uiScene.showTravelButton(false)
    }
  }

  calcDistanceToPlayer(x: number, y: number): number {
    return Phaser.Math.Distance.Between(this.playerX, this.playerY, x, y) / 10
  }

  drawDestinationLine(): void {
    const destX = this.selectedPoint?.x ?? this.selectedStar!.x
    const destY = this.selectedPoint?.y ?? this.selectedStar!.y

    this.lineGraphics.fillStyle(0xff0000, 1)
    this.lineGraphics.fillCircle(this.playerX, this.playerY, 6)

    this.lineGraphics.fillStyle(0x00ff00, 1)
    this.lineGraphics.fillCircle(destX, destY, 6)

    const dashLength = 12
    const gapLength = 8
    const dx = destX - this.playerX
    const dy = destY - this.playerY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)
    let drawn = 0

    this.lineGraphics.lineStyle(2, 0xffffff, 0.85)

    while (drawn < dist - 1) {
      const x1 = this.playerX + Math.cos(angle) * drawn
      const y1 = this.playerY + Math.sin(angle) * drawn
      drawn += dashLength
      if (drawn > dist) drawn = dist
      const x2 = this.playerX + Math.cos(angle) * drawn
      const y2 = this.playerY + Math.sin(angle) * drawn
      this.lineGraphics.moveTo(x1, y1)
      this.lineGraphics.lineTo(x2, y2)
      drawn += gapLength
    }

    this.lineGraphics.strokePath()

    // --- Arrowhead at destination ---
    if (dist > 1) {
      const arrowLength = 12
      const arrowAngle = Phaser.Math.DegToRad(25)

      // End position of the line is the destination
      const destX = this.selectedPoint?.x ?? this.selectedStar!.x
      const destY = this.selectedPoint?.y ?? this.selectedStar!.y

      // Draw left side
      this.lineGraphics.lineStyle(2, 0xffffff, 1)
      this.lineGraphics.beginPath()
      this.lineGraphics.moveTo(destX, destY)
      this.lineGraphics.lineTo(
        destX - Math.cos(angle - arrowAngle) * arrowLength,
        destY - Math.sin(angle - arrowAngle) * arrowLength,
      )
      this.lineGraphics.strokePath()

      // Draw right side
      this.lineGraphics.beginPath()
      this.lineGraphics.moveTo(destX, destY)
      this.lineGraphics.lineTo(
        destX - Math.cos(angle + arrowAngle) * arrowLength,
        destY - Math.sin(angle + arrowAngle) * arrowLength,
      )
      this.lineGraphics.strokePath()
    }
  }

  update(time: number, delta: number) {
    this.lineGraphics.clear()

    // Move the ship if traveling
    if (this.isTraveling && (this.selectedStar || this.selectedPoint)) {
      const destX = this.selectedPoint?.x ?? this.selectedStar!.x
      const destY = this.selectedPoint?.y ?? this.selectedStar!.y
      const dx = destX - this.playerX
      const dy = destY - this.playerY
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Arrive if close enough
      if (dist < this.travelSpeed * (delta / 1000)) {
        this.playerX = destX
        this.playerY = destY
        this.isTraveling = false
        this.showTravelButtonIfAvailable()
        // Only show planet overlay if arriving at a star
        if (this.selectedStar) {
          this.onShipArrivedAtDestination()
        }
      } else {
        const angle = Math.atan2(dy, dx)
        const step = this.travelSpeed * (delta / 1000)
        this.playerX += Math.cos(angle) * step
        this.playerY += Math.sin(angle) * step

        // Rotate ship toward destination as it moves
        this.playerShipSprite.setRotation(angle + Phaser.Math.DegToRad(90))

        // Reveal fog as we travel
        this.updateFogOfWar()

        const encounter = this.travelTurnProcessor.processTurn()
        if (encounter) {
          this.isTraveling = false
          this.starmapUIScene.showEncounterOverlay(encounter)
        }
      }
    }

    // Always keep ship sprite on player coords
    this.playerShipSprite.setPosition(this.playerX, this.playerY)

    // paint line towards destination
    if (this.selectedStar || this.selectedPoint) {
      this.drawDestinationLine()
    }

    if (this.isTraveling) {
      this.cameras.main.centerOn(this.playerX, this.playerY)
    }
  }
}
