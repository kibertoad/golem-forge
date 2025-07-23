import { ActivationContainer, type ChoiceDefinition } from '@potato-golem/core'
import { PotatoScene } from '@potato-golem/ui'
import Phaser from 'phaser'
import type { Dependencies } from '../../diConfig.ts'
import type { PlanetModel } from '../../model/entities/PlanetModel.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import type { TravelTurnProcessor } from '../../model/processors/TravelTurnProcessor.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import type { PlanetOverlayData, StarmapUIScene } from './StarmapUIScene.ts'
import { getRandomStarColor, getStarName } from './internal/starUtils.ts'
import { DEFAULT_ZOOM, STAR_AMOUNT } from './internal/starmapConstants.ts'

interface Star {
  x: number
  y: number
  color: number
  name: string
  distance: number
  display: Phaser.GameObjects.Arc
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
  private lineGraphics!: Phaser.GameObjects.Graphics

  private isTraveling = false

  private playerShipSprite!: Phaser.GameObjects.Image // <--- ADDED

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
    this.starGroup = this.add.group()

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
      } else if (this.selectedStar) {
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

      const objectsUnderPointer = this.input.hitTestPointer(
        pointer,
      ) as Phaser.GameObjects.GameObject[]
      const arc = objectsUnderPointer.find(
        (obj) => obj instanceof Phaser.GameObjects.Arc && this.starGroup.contains(obj),
      ) as Phaser.GameObjects.Arc | undefined

      if (arc) {
        const star = this.stars.find((s) => s.display === arc)
        if (star) {
          this.selectedStar = star
          this.showTravelButtonIfAvailable()
          return
        }
      }
      this.selectedStar = null
      this.hideTravelButton()
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

    for (let i = 0; i < STAR_AMOUNT; i++) {
      this.addStar(Phaser.Math.Between(-1000, 1000), Phaser.Math.Between(-1000, 1000))
    }
    this.cameras.main.centerOn(this.playerX, this.playerY)
  }

  addStar(x: number, y: number) {
    const color = getRandomStarColor()
    const name = getStarName()
    const distance = this.calcDistanceToPlayer(x, y)

    const star = this.add
      .circle(x, y, Phaser.Math.Between(1, 3), color)
      .setAlpha(Phaser.Math.FloatBetween(0.5, 1))
      .setInteractive({ cursor: 'pointer' })

    this.starGroup.add(star)
    this.stars.push({ x, y, color, name, distance, display: star })
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
        const distance = this.calcDistanceToPlayer(star.x, star.y)
        const text = `Name: ${star.name}\n` + `Distance: ${distance.toFixed(1)} ly`
        const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any
        if (uiScene?.showOverlay) {
          uiScene.showOverlay(pointer.x, pointer.y, text)
        }
        return
      }
    }
    const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any
    if (uiScene?.hideOverlay) uiScene.hideOverlay()
  }

  hideOverlay() {
    const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any
    if (uiScene?.hideOverlay) uiScene.hideOverlay()
  }

  private toOverlayData(planet: PlanetModel): PlanetOverlayData {
    return {
      biome: planet.biome.name,
      colonized: !!planet.race,
      government: 'dummy',
      name: planet.name,
      onMission: false,
    }
  }

  private onShipArrivedAtDestination(): void {
    console.log('Ship arrived at destination!')
    const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as StarmapUIScene

    uiScene.showPlanetOverlay(this.toOverlayData(this.worldModel.planets[0]))
  }

  showTravelButtonIfAvailable() {
    const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as StarmapUIScene
    if (this.selectedStar && uiScene?.showTravelButton) {
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
    this.lineGraphics.fillStyle(0xff0000, 1)
    this.lineGraphics.fillCircle(this.playerX, this.playerY, 6)

    this.lineGraphics.fillStyle(0x00ff00, 1)
    this.lineGraphics.fillCircle(this.selectedStar!.x, this.selectedStar!.y, 6)

    const dashLength = 12
    const gapLength = 8
    const dx = this.selectedStar!.x - this.playerX
    const dy = this.selectedStar!.y - this.playerY
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

      // End position of the line is the star
      const destX = this.selectedStar!.x
      const destY = this.selectedStar!.y

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
    if (this.isTraveling && this.selectedStar) {
      const dx = this.selectedStar.x - this.playerX
      const dy = this.selectedStar.y - this.playerY
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Arrive if close enough
      if (dist < this.travelSpeed * (delta / 1000)) {
        this.playerX = this.selectedStar.x
        this.playerY = this.selectedStar.y
        this.isTraveling = false
        this.showTravelButtonIfAvailable()
        this.onShipArrivedAtDestination()
      } else {
        const angle = Math.atan2(dy, dx)
        const step = this.travelSpeed * (delta / 1000)
        this.playerX += Math.cos(angle) * step
        this.playerY += Math.sin(angle) * step

        // Rotate ship toward destination as it moves
        this.playerShipSprite.setRotation(angle + Phaser.Math.DegToRad(90))

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
    if (this.selectedStar) {
      this.drawDestinationLine()
    }

    if (this.isTraveling) {
      this.cameras.main.centerOn(this.playerX, this.playerY)
    }
  }
}
