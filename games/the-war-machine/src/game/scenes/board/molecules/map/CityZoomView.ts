import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import { GameObjects, Geom } from 'phaser'
import type { WorldModel } from '../../../../model/entities/WorldModel.ts'
import { CountryCities } from '../../../../model/enums/Cities.ts'
import { CountryCityNeighbors } from '../../../../model/enums/CityNeighbors.ts'
import { type Country, CountryNames } from '../../../../model/enums/Countries.ts'
import type { WarSystem } from '../../../../model/WarSystem.ts'
import { AttackVisualization } from './AttackVisualization.ts'

export class CityZoomView extends GameObjects.Container {
  private country: Country
  private cities: Map<string, GameObjects.Container> = new Map()
  private background: GameObjects.Graphics
  private titleText: GameObjects.Text
  private selectedCity: string | null = null
  private worldModel?: WorldModel
  private warSystem?: WarSystem
  private attackVisualization?: AttackVisualization

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    country: Country,
    worldModel?: WorldModel,
    warSystem?: WarSystem,
  ) {
    super(scene, x, y)
    this.country = country
    this.worldModel = worldModel
    this.warSystem = warSystem

    // Create background
    this.background = scene.add.graphics()
    this.background.fillStyle(0x001a33, 0.95)
    this.background.fillRoundedRect(-760, -400, 1520, 800, 20)
    this.background.lineStyle(3, 0x00ffff, 0.8)
    this.background.strokeRoundedRect(-760, -400, 1520, 800, 20)
    this.add(this.background)

    // Add grid pattern
    this.background.lineStyle(1, 0x003366, 0.3)
    for (let gx = -760; gx <= 760; gx += 152) {
      this.background.moveTo(gx, -400)
      this.background.lineTo(gx, 400)
    }
    for (let gy = -400; gy <= 400; gy += 80) {
      this.background.moveTo(-760, gy)
      this.background.lineTo(760, gy)
    }

    // Title
    const countryName = CountryNames[country] || country
    this.titleText = scene.add.text(0, -350, `${countryName} - Major Cities`, {
      fontSize: '32px',
      fontFamily: 'Courier',
      color: '#00ffff',
      fontStyle: 'bold',
    })
    this.titleText.setOrigin(0.5)
    this.titleText.setShadow(2, 2, '#000000', 2, true, true)
    this.add(this.titleText)

    // Right-click to close
    this.setInteractive(new Geom.Rectangle(-760, -400, 1520, 800), Geom.Rectangle.Contains)
    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.emit('close')
        this.destroy()
      }
    })

    // Create cities
    this.createCities(scene)

    // Create attack visualization if we have worldModel
    if (this.worldModel) {
      console.log(`[CityZoomView] Creating AttackVisualization for ${country}`)
      this.attackVisualization = new AttackVisualization(scene, 0, 0, this.worldModel)
      this.add(this.attackVisualization)

      // Set up city positions for attack visualization
      this.setupCityPositionsForAttacks()

      // Update attack visualization
      this.updateAttackVisualization()
    } else {
      console.log(`[CityZoomView] No worldModel provided, skipping AttackVisualization`)
    }

    // Instructions
    const instructionText = scene.add.text(
      0,
      360,
      'Click on a city to select • Right-click or ESC to return',
      {
        fontSize: '14px',
        fontFamily: 'Courier',
        color: '#888888',
        fontStyle: 'italic',
      },
    )
    instructionText.setOrigin(0.5)
    this.add(instructionText)

    // Add ESC key handler
    scene.input.keyboard?.on('keydown-ESC', () => {
      this.emit('close')
      this.destroy()
    })

    scene.add.existing(this)
    // Allow depth to be set by parent component
    if (!this.depth) {
      this.setDepth(2000)
    }
  }

  private createCities(scene: PotatoScene) {
    const cityData = CountryCities[this.country]
    if (!cityData) {
      // No city data for this country
      const noDataText = scene.add.text(0, 0, 'No city data available', {
        fontSize: '24px',
        fontFamily: 'Courier',
        color: '#666666',
      })
      noDataText.setOrigin(0.5)
      this.add(noDataText)
      return
    }

    // Calculate city block dimensions - use more horizontal space
    const gridWidth = 1480 // Total width for the grid (nearly full container width)
    const gridHeight = 680 // Total height for the grid
    const blockSizeX = gridWidth / 10 // Horizontal spacing
    const blockSizeY = gridHeight / 10 // Vertical spacing
    const blockSize = Math.min(blockSizeX, blockSizeY) // Keep cities square but use full grid
    const startX = -gridWidth / 2
    const startY = -gridHeight / 2 + 40 // Offset for title

    // Draw connection lines first (so they appear under cities)
    this.drawCityConnections(scene, cityData, startX, startY, blockSizeX, blockSizeY)

    cityData.forEach((city) => {
      const cityX = startX + city.x * blockSizeX + blockSizeX / 2
      const cityY = startY + city.y * blockSizeY + blockSizeY / 2

      const cityContainer = scene.add.container(cityX, cityY)

      // City block
      const cityBlock = scene.add.graphics()
      const baseColor = city.isCapital ? 0xffff00 : 0x00aa88
      const hoverColor = city.isCapital ? 0xffff88 : 0x00ffaa

      // Draw city block
      const drawCity = (color: number, scale: number = 1) => {
        cityBlock.clear()
        cityBlock.fillStyle(color, 0.7)
        cityBlock.lineStyle(2, color, 1)

        // All cities are squares
        const size = city.isCapital ? 30 * scale : 25 * scale
        cityBlock.fillRect(-size, -size, size * 2, size * 2)
        cityBlock.strokeRect(-size, -size, size * 2, size * 2)

        // Add star on top for capitals
        if (city.isCapital) {
          cityBlock.fillStyle(0xffff00, 1)
          cityBlock.lineStyle(1, 0xffff00, 1)
          const starSize = 12 * scale
          const points: Phaser.Math.Vector2[] = []
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI * 2) / 10 - Math.PI / 2
            const radius = i % 2 === 0 ? starSize : starSize * 0.5
            points.push(new Phaser.Math.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius))
          }
          cityBlock.fillPoints(points)
          cityBlock.strokePoints(points)
        }
      }

      drawCity(baseColor)

      // Add house symbol if player has location in this city
      if (this.worldModel && this.worldModel.hasLocationInCity(this.country, city.name)) {
        const houseSymbol = scene.add.text(35, -35, '🏠', {
          fontSize: '24px',
          fontFamily: 'Arial',
        })
        houseSymbol.setOrigin(0.5)
        cityContainer.add(houseSymbol)
      }

      // City name label - increased font sizes for better readability
      const fontSize = city.isCapital ? '18px' : '16px'
      const nameLabel = scene.add.text(0, city.isCapital ? 45 : 40, city.name, {
        fontSize,
        fontFamily: 'Courier',
        color: city.isCapital ? '#ffff00' : '#ffffff',
        fontStyle: city.isCapital ? 'bold' : 'normal',
      })
      nameLabel.setOrigin(0.5)
      nameLabel.setShadow(2, 2, '#000000', 3, true, true)

      // Make interactive
      const hitArea = new Geom.Rectangle(-40, -40, 80, 80)
      cityBlock.setInteractive(hitArea, Geom.Rectangle.Contains)

      cityBlock.on('pointerover', () => {
        drawCity(hoverColor, 1.1)
        nameLabel.setScale(1.1)
        scene.tweens.add({
          targets: cityContainer,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100,
          ease: 'Power2',
        })
      })

      cityBlock.on('pointerout', () => {
        if (this.selectedCity !== city.name) {
          drawCity(baseColor, 1)
          nameLabel.setScale(1)
          scene.tweens.add({
            targets: cityContainer,
            scaleX: 1,
            scaleY: 1,
            duration: 100,
            ease: 'Power2',
          })
        }
      })

      cityBlock.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.rightButtonDown()) {
          // Right-click acts as back navigation - close the city view
          this.emit('close')
          this.destroy()
          return
        }
        // Left-click selects the city
        console.log('City clicked:', city.name, 'in country:', this.country)
        this.selectCity(city.name)
        this.emit('city-selected', { country: this.country, city: city.name })
        console.log('Emitted city-selected event')
      })

      cityContainer.add([cityBlock, nameLabel])
      this.add(cityContainer)
      this.cities.set(city.name, cityContainer)
    })
  }

  private drawCityConnections(
    scene: PotatoScene,
    cityData: any[],
    startX: number,
    startY: number,
    blockSizeX: number,
    blockSizeY: number,
  ) {
    const neighbors = CountryCityNeighbors[this.country]
    if (!neighbors) return

    const cityPositions = new Map<string, { x: number; y: number }>()

    // Calculate all city positions
    cityData.forEach((city) => {
      const cityX = startX + city.x * blockSizeX + blockSizeX / 2
      const cityY = startY + city.y * blockSizeY + blockSizeY / 2
      cityPositions.set(city.name, { x: cityX, y: cityY })
    })

    // Draw connection lines
    const connectionsGraphics = scene.add.graphics()
    connectionsGraphics.lineStyle(2, 0x00ffff, 0.3) // Cyan lines with transparency

    const drawnConnections = new Set<string>()

    for (const [cityName, cityNeighbors] of Object.entries(neighbors)) {
      const cityPos = cityPositions.get(cityName)
      if (!cityPos) continue

      for (const neighborName of cityNeighbors) {
        // Create a unique key for this connection (sorted to avoid duplicates)
        const connectionKey = [cityName, neighborName].sort().join('-')
        if (drawnConnections.has(connectionKey)) continue
        drawnConnections.add(connectionKey)

        const neighborPos = cityPositions.get(neighborName)
        if (!neighborPos) continue

        // Draw line between cities
        connectionsGraphics.moveTo(cityPos.x, cityPos.y)
        connectionsGraphics.lineTo(neighborPos.x, neighborPos.y)
      }
    }

    connectionsGraphics.strokePath()
    this.add(connectionsGraphics)
  }

  private selectCity(cityName: string) {
    // Deselect previous city
    if (this.selectedCity) {
      const prevCity = this.cities.get(this.selectedCity)
      if (prevCity) {
        this.scene.tweens.add({
          targets: prevCity,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
          ease: 'Power2',
        })
      }
    }

    // Select new city
    this.selectedCity = cityName
    const cityContainer = this.cities.get(cityName)
    if (cityContainer) {
      this.scene.tweens.add({
        targets: cityContainer,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        ease: 'Back.easeOut',
      })

      // Add selection effect
      const flash = this.scene.add.graphics()
      flash.fillStyle(0xffffff, 0.3)
      flash.fillCircle(cityContainer.x, cityContainer.y, 50)
      this.add(flash)

      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          flash.destroy()
        },
      })
    }
  }

  getSelectedCity(): string | null {
    return this.selectedCity
  }

  private setupCityPositionsForAttacks() {
    if (!this.attackVisualization) return

    // Set the country position at the center for this view
    // Cities are already positioned, we just need to tell the attack visualization
    // where this country is centered
    this.attackVisualization.setCountryPosition(this.country, 0, 0)
    console.log(`[CityZoomView] Set country position for ${this.country} at (0, 0)`)
  }

  private updateAttackVisualization() {
    if (!this.attackVisualization || !this.worldModel) return

    // Check if this country is being defended (not attacking)
    const countryModel = this.worldModel.getCountry(this.country)
    console.log(`[CityZoomView] Checking war status for ${this.country}:`, {
      hasModel: !!countryModel,
      isAtWar: countryModel?.isAtWar,
      warsWith: countryModel?.warsWith ? Array.from(countryModel.warsWith) : [],
      isDefending: countryModel?.isDefending ? Array.from(countryModel.isDefending) : [],
    })

    if (!countryModel || !countryModel.isAtWar) return

    // Simply check if this country is defending against anyone
    const isBeingAttacked = countryModel.isDefending.size > 0

    console.log(`[CityZoomView] ${this.country} is at war with:`, Array.from(countryModel.warsWith))
    console.log(
      `[CityZoomView] ${this.country} is defending against:`,
      Array.from(countryModel.isDefending),
    )
    console.log(`[CityZoomView] ${this.country} is being attacked:`, isBeingAttacked)

    // Only show attack visualization if this country is being attacked
    if (isBeingAttacked) {
      // Update the visualization
      this.attackVisualization.updateAttacks()
    }
  }

  destroy() {
    this.scene.input.keyboard?.off('keydown-ESC')
    if (this.attackVisualization) {
      this.attackVisualization.destroy()
    }
    super.destroy()
  }
}
