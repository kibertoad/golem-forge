import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects, Geom } from 'phaser'
import { getCountryContinent } from '../../../../model/enums/ContinentData.ts'
import { type Country, CountryNames } from '../../../../model/enums/Countries.ts'
import { EarthRegion } from '../../../../model/enums/EarthRegions.ts'
import { WarSystem } from '../../../../model/WarSystem.ts'
import { imageRegistry } from '../../../../registries/imageRegistry.ts'
import type { ToastContainer, ToastData } from '../ui/ToastContainer.ts'
import { ContinentZoomView } from './ContinentZoomView.ts'

interface RegionData {
  region: EarthRegion
  label: string
  points: number[]
  centerX: number
  centerY: number
  color: number
  hoverColor: number
}

export class EarthMap extends GameObjects.Container {
  private regions: Map<EarthRegion, GameObjects.Graphics> = new Map()
  private regionLabels: Map<EarthRegion, GameObjects.Text> = new Map()
  private selectedRegion: EarthRegion | null = null
  private earthBackground: GameObjects.Graphics
  private regionData: Map<EarthRegion, RegionData> = new Map()
  private eventMarkers: Array<GameObjects.Graphics | GameObjects.Text> = []
  private zoomView: ContinentZoomView | null = null
  private potatoScene: PotatoScene
  private warSystem: WarSystem
  private toastContainer?: ToastContainer

  constructor(scene: PotatoScene, x: number, y: number, toastContainer?: ToastContainer) {
    super(scene, x, y)
    this.potatoScene = scene
    this.toastContainer = toastContainer

    // Initialize war system
    this.warSystem = new WarSystem()

    // Hook up war declaration notifications using existing toast system
    this.warSystem.onWarDeclared = (aggressor: Country, defender: Country) => {
      if (this.toastContainer) {
        const aggressorName = CountryNames[aggressor] || aggressor
        const defenderName = CountryNames[defender] || defender
        const warToast: ToastData = {
          id: `war-${Date.now()}-${Math.random()}`,
          icon: imageRegistry.EXPLOSION, // Use explosion icon for wars
          title: 'War Declaration!',
          description: `${aggressorName} attacks ${defenderName}`,
          timestamp: Date.now(),
          metadata: { aggressor } // Store aggressor country for click handling
        }
        this.toastContainer.addToast(warToast)
      }
    }

    // Listen for toast clicks to open continent view
    if (this.toastContainer) {
      this.toastContainer.on('toast-detail-requested', (toastData: ToastData) => {
        if (toastData.metadata?.aggressor) {
          const continent = getCountryContinent(toastData.metadata.aggressor as Country)
          if (continent) {
            this.showContinentZoom(continent)
          }
        }
      })
    }

    // Create ocean background - larger frame (increased by 10px on each side)
    this.earthBackground = scene.add.graphics()
    this.earthBackground.fillStyle(0x001122, 0.8)
    this.earthBackground.fillRect(-760, -400, 1520, 800)
    this.add(this.earthBackground)

    // Add grid pattern for ocean
    this.earthBackground.lineStyle(1, 0x003355, 0.3)
    for (let gx = -760; gx <= 760; gx += 76) {
      this.earthBackground.moveTo(gx, -400)
      this.earthBackground.lineTo(gx, 400)
    }
    for (let gy = -400; gy <= 400; gy += 80) {
      this.earthBackground.moveTo(-760, gy)
      this.earthBackground.lineTo(760, gy)
    }

    // Create continents
    this.createContinents(scene)

    // Create labels
    this.createLabels(scene)

    // Add interaction
    scene.add.existing(this)

    // Border frame
    const border = scene.add.graphics()
    border.lineStyle(3, 0x00ffff, 0.8)
    border.strokeRect(-760, -400, 1520, 800)
    this.add(border)

    // Initialize wars after UI is ready (with a small delay)
    scene.time.delayedCall(1000, () => {
      this.warSystem.initializeWars()
      console.log('Active wars:', this.warSystem.getActiveWars())
    })
  }

  private createContinents(scene: PotatoScene) {
    const continentData: RegionData[] = [
      {
        region: EarthRegion.NORTH_AMERICA,
        label: 'NORTH AMERICA',
        points: [
          // Simple rectangle shape in upper left
          -650,
          -350, // Top left
          -400,
          -350, // Top right
          -400,
          -120, // Bottom right
          -650,
          -120, // Bottom left
        ],
        centerX: -525,
        centerY: -235,
        color: 0x00ff44,
        hoverColor: 0x44ff88,
      },
      {
        region: EarthRegion.SOUTH_AMERICA,
        label: 'SOUTH AMERICA',
        points: [
          // Simple vertical rectangle below North America
          -600,
          -60, // Top left
          -450,
          -60, // Top right
          -450,
          250, // Bottom right
          -600,
          250, // Bottom left
        ],
        centerX: -525,
        centerY: 95,
        color: 0xff4400,
        hoverColor: 0xff8844,
      },
      {
        region: EarthRegion.EUROPE,
        label: 'EUROPE',
        points: [
          // Simple rectangle in upper center
          -250,
          -350, // Top left
          0,
          -350, // Top right
          0,
          -180, // Bottom right
          -250,
          -180, // Bottom left
        ],
        centerX: -125,
        centerY: -265,
        color: 0x00aaff,
        hoverColor: 0x44ccff,
      },
      {
        region: EarthRegion.AFRICA,
        label: 'AFRICA',
        points: [
          // Simple diamond/rectangle below Europe
          -200,
          -120, // Top left
          -50,
          -120, // Top right
          -50,
          250, // Bottom right
          -200,
          250, // Bottom left
        ],
        centerX: -125,
        centerY: 65,
        color: 0xffaa00,
        hoverColor: 0xffcc44,
      },
      {
        region: EarthRegion.ASIA,
        label: 'ASIA',
        points: [
          // Large rectangle on the right
          120,
          -350, // Top left
          650,
          -350, // Top right
          650,
          80, // Bottom right
          120,
          80, // Bottom left
        ],
        centerX: 385,
        centerY: -135,
        color: 0xff00ff,
        hoverColor: 0xff44ff,
      },
      {
        region: EarthRegion.OCEANIA,
        label: 'OCEANIA',
        points: [
          // Small rectangle in bottom right
          320,
          180, // Top left
          580,
          180, // Top right
          580,
          360, // Bottom right
          320,
          360, // Bottom left
        ],
        centerX: 450,
        centerY: 270,
        color: 0x00ffaa,
        hoverColor: 0x44ffcc,
      },
    ]

    continentData.forEach((data) => {
      this.regionData.set(data.region, data)
      const continent = this.createContinent(scene, data)
      this.regions.set(data.region, continent)
    })
  }

  private createContinent(scene: PotatoScene, data: RegionData): GameObjects.Graphics {
    const graphics = scene.add.graphics()

    graphics.fillStyle(data.color, 0.3)
    graphics.lineStyle(3, data.color, 1)

    graphics.beginPath()
    graphics.moveTo(data.points[0], data.points[1])

    for (let i = 2; i < data.points.length; i += 2) {
      graphics.lineTo(data.points[i], data.points[i + 1])
    }

    graphics.closePath()
    graphics.fillPath()
    graphics.strokePath()

    graphics.setInteractive(new Geom.Polygon(data.points), Geom.Polygon.Contains)

    graphics.on('pointerover', () => {
      if (this.selectedRegion !== data.region) {
        graphics.clear()
        graphics.fillStyle(data.hoverColor, 0.5)
        graphics.lineStyle(4, data.hoverColor, 1)

        graphics.beginPath()
        graphics.moveTo(data.points[0], data.points[1])
        for (let i = 2; i < data.points.length; i += 2) {
          graphics.lineTo(data.points[i], data.points[i + 1])
        }
        graphics.closePath()
        graphics.fillPath()
        graphics.strokePath()

        scene.tweens.add({
          targets: graphics,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 100,
          ease: 'Power2',
        })

        const label = this.regionLabels.get(data.region)
        if (label) {
          label.setAlpha(1)
          label.setScale(1.1)
        }
      }
    })

    graphics.on('pointerout', () => {
      if (this.selectedRegion !== data.region) {
        graphics.clear()
        graphics.fillStyle(data.color, 0.3)
        graphics.lineStyle(3, data.color, 1)

        graphics.beginPath()
        graphics.moveTo(data.points[0], data.points[1])
        for (let i = 2; i < data.points.length; i += 2) {
          graphics.lineTo(data.points[i], data.points[i + 1])
        }
        graphics.closePath()
        graphics.fillPath()
        graphics.strokePath()

        scene.tweens.add({
          targets: graphics,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
          ease: 'Power2',
        })

        const label = this.regionLabels.get(data.region)
        if (label) {
          label.setAlpha(0.9)
          label.setScale(1)
        }
      }
    })

    graphics.on('pointerdown', () => {
      this.selectRegion(data.region)
      this.showContinentZoom(data.region)
      this.emit('region-selected', data.region)
    })

    this.add(graphics)
    return graphics
  }

  private createLabels(scene: PotatoScene) {
    this.regionData.forEach((data, region) => {
      const label = scene.add.text(data.centerX, data.centerY, data.label, {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: '#00ffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 },
        align: 'center',
      })
      label.setOrigin(0.5)
      label.setAlpha(0.8)
      label.setStroke('#00ffff', 2)

      this.regionLabels.set(region, label)
      this.add(label)
    })
  }

  selectRegion(region: EarthRegion) {
    this.regions.forEach((graphics, regionKey) => {
      const data = this.regionData.get(regionKey)!
      const isSelected = regionKey === region

      graphics.clear()

      if (isSelected) {
        graphics.fillStyle(data.hoverColor, 0.6)
        graphics.lineStyle(5, 0xffffff, 1)
      } else {
        graphics.fillStyle(data.color, 0.3)
        graphics.lineStyle(3, data.color, 1)
      }

      graphics.beginPath()
      graphics.moveTo(data.points[0], data.points[1])
      for (let i = 2; i < data.points.length; i += 2) {
        graphics.lineTo(data.points[i], data.points[i + 1])
      }
      graphics.closePath()
      graphics.fillPath()
      graphics.strokePath()

      const label = this.regionLabels.get(regionKey)
      if (label) {
        if (isSelected) {
          label.setScale(1.15)
          label.setStyle({ backgroundColor: '#ffff00', color: '#000000' })
        } else {
          label.setScale(1)
          label.setStyle({ backgroundColor: '#000000', color: '#ffffff' })
        }
      }
    })

    this.selectedRegion = region
  }

  getSelectedRegion(): EarthRegion | null {
    return this.selectedRegion
  }

  highlightRegion(region: EarthRegion, color: number = 0xffff00) {
    const graphics = this.regions.get(region)
    if (graphics) {
      this.scene.tweens.add({
        targets: graphics,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          graphics.setAlpha(1)
        },
      })
    }
  }

  addEventMarker(x: number, y: number, label?: string): GameObjects.Graphics {
    const marker = this.scene.add.graphics()

    // Draw pulsing red circle (scaled 3x)
    marker.fillStyle(0xff0000, 0.8)
    marker.fillCircle(x, y, 24)
    marker.lineStyle(3, 0xffffff, 1)
    marker.strokeCircle(x, y, 24)

    // Add outer ring
    marker.lineStyle(3, 0xff0000, 0.5)
    marker.strokeCircle(x, y, 36)

    // Pulsing animation
    this.scene.tweens.add({
      targets: marker,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    if (label) {
      const text = this.scene.add.text(x, y - 60, label, {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#ff0000',
        padding: { x: 4, y: 2 },
      })
      text.setOrigin(0.5)
      text.setShadow(2, 2, '#000000', 2, true, true)
      this.add(text)
      this.eventMarkers.push(text) // Track text for removal
    }

    this.add(marker)
    this.eventMarkers.push(marker)

    return marker
  }

  clearEventMarkers() {
    this.eventMarkers.forEach((marker) => {
      marker.destroy()
    })
    this.eventMarkers = []
  }

  addEventMarkerAtCapital(capitalX: number, capitalY: number, label?: string) {
    // Capital positions are already relative to map center
    return this.addEventMarker(capitalX, capitalY, label)
  }

  private showContinentZoom(region: EarthRegion) {
    // Hide the main earth view
    this.setVisible(false)

    // Close existing zoom view if any
    if (this.zoomView) {
      this.zoomView.destroy()
      this.zoomView = null
    }

    // Create new zoom view at the same position as the Earth map
    this.zoomView = new ContinentZoomView(this.potatoScene, this.x, this.y, region, this.warSystem)

    // Listen for close event to return to Earth view
    this.zoomView.on('close', () => {
      this.zoomView = null
      this.setVisible(true)
    })
  }

  closeZoomView() {
    if (this.zoomView) {
      this.zoomView.destroy()
      this.zoomView = null
      this.setVisible(true)
    }
  }

  // Show arms show on map - jumps to continent view if country is found
  showArmsShowLocation(country: Country, armsShowName: string) {
    const continent = getCountryContinent(country)
    if (continent) {
      // Jump to the continent view
      this.showContinentZoom(continent)

      // Highlight the country in the zoom view
      if (this.zoomView) {
        this.zoomView.highlightCountry(country, armsShowName)
      }
    }
  }
}
