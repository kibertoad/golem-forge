import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects, Geom } from 'phaser'
import { CountryCities } from '../../../../model/enums/Cities.ts'
import { CountryCityNeighbors } from '../../../../model/enums/CityNeighbors.ts'
import { type Country, CountryNames } from '../../../../model/enums/Countries.ts'

export class CityZoomView extends GameObjects.Container {
  private country: Country
  private cities: Map<string, GameObjects.Container> = new Map()
  private background: GameObjects.Graphics
  private titleText: GameObjects.Text
  private selectedCity: string | null = null

  constructor(scene: PotatoScene, x: number, y: number, country: Country) {
    super(scene, x, y)
    this.country = country

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
    this.setDepth(2000)
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

      // City name label
      const fontSize = city.isCapital ? '14px' : '12px'
      const nameLabel = scene.add.text(0, city.isCapital ? 40 : 35, city.name, {
        fontSize,
        fontFamily: 'Courier',
        color: city.isCapital ? '#ffff00' : '#ffffff',
        fontStyle: city.isCapital ? 'bold' : 'normal',
      })
      nameLabel.setOrigin(0.5)
      nameLabel.setShadow(1, 1, '#000000', 2, true, true)

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

      cityBlock.on('pointerdown', () => {
        this.selectCity(city.name)
        this.emit('city-selected', { country: this.country, city: city.name })
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

  destroy() {
    this.scene.input.keyboard?.off('keydown-ESC')
    super.destroy()
  }
}
