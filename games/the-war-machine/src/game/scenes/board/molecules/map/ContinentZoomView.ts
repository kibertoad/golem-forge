import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects, Geom, type Input } from 'phaser'
import { ContinentCountries, type CountryInfo } from '../../../../model/enums/ContinentData.ts'
import { Country, CountryNames } from '../../../../model/enums/Countries.ts'
import { CountryCapitals } from '../../../../model/enums/CountryCapitals.ts'
import { EarthRegion } from '../../../../model/enums/EarthRegions.ts'
import { WarSystem } from '../../../../model/WarSystem.ts'
import { CountryInfoOverlay } from '../CountryInfoOverlay.ts'
import { CityZoomView } from './CityZoomView.ts'

interface CountryBlock {
  country: Country
  graphics: GameObjects.Graphics
  label: GameObjects.Text
  info: CountryInfo
}

export class ContinentZoomView extends GameObjects.Container {
  private readonly continent: EarthRegion
  private countryBlocks: Map<Country, CountryBlock> = new Map()
  private background: GameObjects.Graphics
  private title: GameObjects.Text
  private selectedCountry: Country | null = null
  private armsShowMarker: GameObjects.Container | null = null
  private warSystem: WarSystem
  private currentInfoOverlay: CountryInfoOverlay | null = null

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    continent: EarthRegion,
    warSystem?: WarSystem,
  ) {
    super(scene, x, y)
    this.continent = continent
    this.warSystem = warSystem || new WarSystem()

    // Create background panel - larger size matching Earth map (increased by 10px on each side)
    this.background = scene.add.graphics()
    this.background.fillStyle(0x001122, 0.95)
    this.background.fillRect(-760, -400, 1520, 800)
    this.background.lineStyle(3, 0x00ffff, 1)
    this.background.strokeRect(-760, -400, 1520, 800)
    this.add(this.background)

    // Add grid for reference
    this.background.lineStyle(1, 0x003366, 0.3)
    for (let gx = -760; gx <= 760; gx += 152) {
      this.background.moveTo(gx, -400)
      this.background.lineTo(gx, 400)
    }
    for (let gy = -400; gy <= 400; gy += 80) {
      this.background.moveTo(-760, gy)
      this.background.lineTo(760, gy)
    }

    // Make background interactive for right-click
    this.background.setInteractive(
      new Geom.Rectangle(-760, -400, 1520, 800),
      Geom.Rectangle.Contains,
    )
    this.background.on('pointerdown', (pointer: Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        // Clean up info overlay when closing
        if (this.currentInfoOverlay) {
          this.currentInfoOverlay.destroy()
          this.currentInfoOverlay = null
        }
        this.emit('close')
        this.destroy()
      }
    })

    // Create title
    const continentName = this.getContinentName(continent)
    this.title = scene.add.text(0, -360, continentName, {
      fontSize: '48px',
      fontFamily: 'Courier',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4,
    })
    this.title.setOrigin(0.5)
    this.add(this.title)

    // Create instruction text
    const instructionText = scene.add.text(0, -310, 'Right-click to return to world view', {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#88aacc',
      stroke: '#000000',
      strokeThickness: 2,
    })
    instructionText.setOrigin(0.5)
    this.add(instructionText)

    // Create country blocks
    this.createCountryBlocks(scene)

    scene.add.existing(this)
    this.setDepth(2000)
  }

  private createCountryBlocks(scene: PotatoScene) {
    const countries = ContinentCountries[this.continent] || []

    countries.forEach((countryInfo) => {
      const blockSize = this.getBlockSize(countryInfo.relativeSize)
      const blockX = -685 + countryInfo.gridX * 152 // Adjusted for wider frame
      const blockY = -320 + countryInfo.gridY * 80

      // Create country block
      const graphics = scene.add.graphics()

      // Get country-specific color
      const color = this.getCountryColor(countryInfo.country)

      graphics.fillStyle(color, 0.6)
      graphics.fillRoundedRect(
        blockX - blockSize.width / 2,
        blockY - blockSize.height / 2,
        blockSize.width,
        blockSize.height,
        8,
      )

      graphics.lineStyle(2, color, 1)
      graphics.strokeRoundedRect(
        blockX - blockSize.width / 2,
        blockY - blockSize.height / 2,
        blockSize.width,
        blockSize.height,
        8,
      )

      // Create country label with fixed font sizes for better rendering
      const countryName = CountryNames[countryInfo.country] || countryInfo.country
      // Use fixed font sizes instead of scaling
      let fontSize = 16
      if (countryInfo.relativeSize >= 4) {
        fontSize = 20
      } else if (countryInfo.relativeSize >= 2) {
        fontSize = 18
      }
      const label = scene.add.text(blockX, blockY - 5, countryName, {
        fontSize: `${fontSize}px`,
        fontFamily: 'Courier',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        wordWrap: { width: blockSize.width - 10 },
        align: 'center',
      })
      label.setOrigin(0.5)

      // Add capital city indicator
      const capital = CountryCapitals[countryInfo.country]
      if (capital) {
        const capitalLabel = scene.add.text(
          blockX,
          blockY + blockSize.height / 4,
          `★ ${capital.name}`,
          {
            fontSize: '14px', // Fixed size for capitals
            fontFamily: 'Courier',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 1,
          },
        )
        capitalLabel.setOrigin(0.5)
        this.add(capitalLabel)
      }

      // Make interactive
      graphics.setInteractive(
        new Geom.Rectangle(
          blockX - blockSize.width / 2,
          blockY - blockSize.height / 2,
          blockSize.width,
          blockSize.height,
        ),
        Geom.Rectangle.Contains,
      )

      graphics.on('pointerover', () => {
        graphics.clear()
        graphics.fillStyle(color, 0.8)
        graphics.fillRoundedRect(
          blockX - blockSize.width / 2 - 5,
          blockY - blockSize.height / 2 - 5,
          blockSize.width + 10,
          blockSize.height + 10,
          8,
        )
        graphics.lineStyle(3, 0xffffff, 1)
        graphics.strokeRoundedRect(
          blockX - blockSize.width / 2 - 5,
          blockY - blockSize.height / 2 - 5,
          blockSize.width + 10,
          blockSize.height + 10,
          8,
        )
        label.setScale(1.1)

        // Show country info overlay on hover
        if (this.currentInfoOverlay) {
          this.currentInfoOverlay.destroy()
        }
        this.currentInfoOverlay = new CountryInfoOverlay(scene, countryInfo.country, this.warSystem)
      })

      graphics.on('pointerout', () => {
        graphics.clear()
        graphics.fillStyle(color, 0.6)
        graphics.fillRoundedRect(
          blockX - blockSize.width / 2,
          blockY - blockSize.height / 2,
          blockSize.width,
          blockSize.height,
          8,
        )
        graphics.lineStyle(2, color, 1)
        graphics.strokeRoundedRect(
          blockX - blockSize.width / 2,
          blockY - blockSize.height / 2,
          blockSize.width,
          blockSize.height,
          8,
        )
        label.setScale(1)

        // Hide country info overlay on pointer out
        if (this.currentInfoOverlay) {
          this.currentInfoOverlay.destroy()
          this.currentInfoOverlay = null
        }
      })

      graphics.on('pointerdown', () => {
        this.selectCountry(countryInfo.country)
        // Show city zoom view
        this.showCityView(countryInfo.country)
      })

      this.add(graphics)
      this.add(label)

      // Add war icon if country is at war
      if (this.warSystem.isAtWar(countryInfo.country)) {
        this.addWarIcon(scene, blockX, blockY, blockSize, countryInfo.country)
      }

      this.countryBlocks.set(countryInfo.country, {
        country: countryInfo.country,
        graphics,
        label,
        info: countryInfo,
      })
    })
  }

  private getBlockSize(relativeSize: number): { width: number; height: number } {
    const baseSize = 100
    const scale = 0.8 + relativeSize * 0.3 // Scale from 0.8 to 2.3
    return {
      width: baseSize * scale,
      height: baseSize * scale * 0.75, // Slightly rectangular
    }
  }

  private getCountryColor(country: Country): number {
    // Assign colors based on military/economic power or region
    const colorMap: Partial<Record<Country, number>> = {
      [Country.USA]: 0x0044ff,
      [Country.CHINA]: 0xff0000,
      [Country.RUSSIA]: 0xff4400,
      [Country.UK]: 0x0088ff,
      [Country.FRANCE]: 0x4488ff,
      [Country.GERMANY]: 0x444444,
      [Country.JAPAN]: 0xff0088,
      [Country.INDIA]: 0xff8800,
      [Country.BRAZIL]: 0x00ff00,
      [Country.CANADA]: 0xff0044,
      [Country.AUSTRALIA]: 0x00ff88,
      [Country.ISRAEL]: 0x0088ff,
      [Country.SAUDI_ARABIA]: 0x008800,
      [Country.SOUTH_KOREA]: 0x0044ff,
      [Country.ITALY]: 0x00ff44,
      [Country.SPAIN]: 0xffaa00,
      [Country.POLAND]: 0xff4444,
      [Country.TURKEY]: 0xff0044,
      [Country.MEXICO]: 0x00ff00,
      [Country.ARGENTINA]: 0x88ccff,
      [Country.SOUTH_AFRICA]: 0xffaa00,
      [Country.EGYPT]: 0xccaa00,
      [Country.PAKISTAN]: 0x008844,
      [Country.UKRAINE]: 0xffff00,
      [Country.INDONESIA]: 0xff4400,
      [Country.THAILAND]: 0x4444ff,
      [Country.VIETNAM]: 0xff0000,
      [Country.PHILIPPINES]: 0x0088ff,
      [Country.MALAYSIA]: 0xffaa00,
      [Country.GREECE]: 0x0088ff,
      [Country.ROMANIA]: 0x0044ff,
      [Country.FINLAND]: 0x0088ff,
      [Country.DENMARK]: 0xff0044,
      [Country.NEW_ZEALAND]: 0x0044ff,
      [Country.CHILE]: 0xff4444,
      [Country.COLOMBIA]: 0xffff00,
    }

    return colorMap[country] || 0x888888
  }

  private getContinentName(continent: EarthRegion): string {
    const names: Record<EarthRegion, string> = {
      [EarthRegion.NORTH_AMERICA]: 'NORTH AMERICA',
      [EarthRegion.SOUTH_AMERICA]: 'SOUTH AMERICA',
      [EarthRegion.EUROPE]: 'EUROPE',
      [EarthRegion.AFRICA]: 'AFRICA',
      [EarthRegion.ASIA]: 'ASIA',
      [EarthRegion.OCEANIA]: 'OCEANIA',
    }
    return names[continent] || continent
  }

  private selectCountry(country: Country) {
    // Clear previous selection
    this.countryBlocks.forEach((block) => {
      const color = this.getCountryColor(block.country)
      block.graphics.clear()
      block.graphics.fillStyle(color, 0.6)
      const blockSize = this.getBlockSize(block.info.relativeSize)
      const blockX = -685 + block.info.gridX * 152 // Adjusted for wider frame
      const blockY = -320 + block.info.gridY * 80

      block.graphics.fillRoundedRect(
        blockX - blockSize.width / 2,
        blockY - blockSize.height / 2,
        blockSize.width,
        blockSize.height,
        8,
      )
      block.graphics.lineStyle(2, color, 1)
      block.graphics.strokeRoundedRect(
        blockX - blockSize.width / 2,
        blockY - blockSize.height / 2,
        blockSize.width,
        blockSize.height,
        8,
      )
    })

    // Highlight selected country
    const selectedBlock = this.countryBlocks.get(country)
    if (selectedBlock) {
      const color = this.getCountryColor(country)
      const blockSize = this.getBlockSize(selectedBlock.info.relativeSize)
      const blockX = -685 + selectedBlock.info.gridX * 152 // Adjusted for wider frame
      const blockY = -320 + selectedBlock.info.gridY * 80

      selectedBlock.graphics.clear()
      selectedBlock.graphics.fillStyle(0xffff00, 0.8)
      selectedBlock.graphics.fillRoundedRect(
        blockX - blockSize.width / 2,
        blockY - blockSize.height / 2,
        blockSize.width,
        blockSize.height,
        8,
      )
      selectedBlock.graphics.lineStyle(4, 0xffffff, 1)
      selectedBlock.graphics.strokeRoundedRect(
        blockX - blockSize.width / 2,
        blockY - blockSize.height / 2,
        blockSize.width,
        blockSize.height,
        8,
      )
    }

    this.selectedCountry = country
  }

  getSelectedCountry(): Country | null {
    return this.selectedCountry
  }

  private addWarIcon(
    scene: PotatoScene,
    x: number,
    y: number,
    blockSize: { width: number; height: number },
    country: Country,
  ) {
    // Create war icon using flame unicode symbol
    const iconX = x + blockSize.width / 2 - 15
    const iconY = y - blockSize.height / 2 + 15

    // Create flame text symbol
    const warIcon = scene.add.text(iconX, iconY, '🔥', {
      fontSize: '24px',
      fontFamily: 'Arial',
    })
    warIcon.setOrigin(0.5)

    // Add pulsing animation
    scene.tweens.add({
      targets: warIcon,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Make interactive for tooltip
    warIcon.setInteractive()

    const wars = this.warSystem.getWarsForCountry(country)
    if (wars.length > 0) {
      const war = wars[0]
      const isAggressor = war.aggressor === country
      const opponent = isAggressor ? war.defender : war.aggressor
      const role = isAggressor ? 'Attacking' : 'Defending against'

      warIcon.on('pointerover', () => {
        const tooltip = scene.add.text(iconX, iconY - 25, `${role} ${CountryNames[opponent]}`, {
          fontSize: '12px',
          fontFamily: 'Courier',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 4, y: 2 },
        })
        tooltip.setOrigin(0.5)
        tooltip.setDepth(3000)
        this.add(tooltip)

        warIcon.once('pointerout', () => {
          tooltip.destroy()
        })
      })
    }

    this.add(warIcon)
  }

  highlightCountry(country: Country, armsShowName: string) {
    // Remove previous marker if any
    if (this.armsShowMarker) {
      this.armsShowMarker.destroy()
      this.armsShowMarker = null
    }

    // Find the country block
    const countryBlock = this.countryBlocks.get(country)
    if (countryBlock) {
      const blockSize = this.getBlockSize(countryBlock.info.relativeSize)
      const blockX = -685 + countryBlock.info.gridX * 152 // Adjusted for wider frame
      const blockY = -320 + countryBlock.info.gridY * 80

      // Create arms show marker container
      this.armsShowMarker = this.scene.add.container(blockX, blockY)

      // Create pulsing red marker
      const marker = this.scene.add.graphics()
      marker.fillStyle(0xff0000, 0.8)
      marker.fillCircle(0, -blockSize.height / 2 - 20, 12)
      marker.lineStyle(2, 0xffffff, 1)
      marker.strokeCircle(0, -blockSize.height / 2 - 20, 12)

      // Add arms show label
      const label = this.scene.add.text(0, -blockSize.height / 2 - 40, armsShowName, {
        fontSize: '16px',
        fontFamily: 'Courier',
        color: '#ffffff',
        backgroundColor: '#ff0000',
        padding: { x: 4, y: 2 },
      })
      label.setOrigin(0.5)

      this.armsShowMarker.add([marker, label])
      this.add(this.armsShowMarker)

      // Add pulsing animation
      this.scene.tweens.add({
        targets: marker,
        scaleX: 1.3,
        scaleY: 1.3,
        alpha: 0.6,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })

      // Auto-select the country
      this.selectCountry(country)
    }
  }

  private showCityView(country: Country) {
    // Hide continent view
    this.setVisible(false)

    // Create city zoom view
    const cityView = new CityZoomView(this.scene as PotatoScene, this.x, this.y, country)

    // Listen for close event to return to continent view
    cityView.on('close', () => {
      this.setVisible(true)
    })

    // Listen for city selection
    cityView.on('city-selected', (data: { country: Country; city: string }) => {
      console.log(`City selected: ${data.city} in ${CountryNames[data.country]}`)
      // Don't create overlay on city selection since we show it on hover now
    })
  }
}
