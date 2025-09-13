import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects, Geom } from 'phaser'

export enum EarthRegion {
  NORTH_AMERICA = 'north_america',
  SOUTH_AMERICA = 'south_america',
  EUROPE = 'europe',
  AFRICA = 'africa',
  ASIA = 'asia',
  OCEANIA = 'oceania',
}

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
  private globeOutline: GameObjects.Arc
  private regionData: Map<EarthRegion, RegionData> = new Map()

  constructor(scene: PotatoScene, x: number, y: number) {
    super(scene, x, y)

    this.createBackground(scene)
    this.createContinents(scene)
    this.createLabels(scene)

    scene.add.existing(this)
  }

  private createBackground(scene: PotatoScene) {
    this.earthBackground = scene.add.graphics()

    // Ocean layers
    this.earthBackground.fillStyle(0x0a2e4a, 0.3)
    this.earthBackground.fillCircle(0, 0, 220)

    this.earthBackground.fillStyle(0x1a4d6e, 0.2)
    this.earthBackground.fillCircle(0, 0, 210)

    // Gradient effect
    const gradient = scene.add.graphics()
    gradient.fillStyle(0x2a6d8e, 0.1)
    for (let i = 200; i > 0; i -= 20) {
      gradient.fillCircle(0, 0, i)
    }
    this.add(gradient)

    this.add(this.earthBackground)

    // Globe outline
    this.globeOutline = scene.add.arc(0, 0, 220, 0, 360, false, 0x3a8dae)
    this.globeOutline.setStrokeStyle(3, 0x4a9dbe, 0.8)
    this.add(this.globeOutline)
  }

  private createContinents(scene: PotatoScene) {
    const continentData: RegionData[] = [
      {
        region: EarthRegion.NORTH_AMERICA,
        label: 'North America',
        points: [
          // Alaska and Western Canada
          -190, -45, -185, -55, -180, -60, -175, -65, -170, -70, -160, -72, -150, -73, -140, -75,
          -130, -73,
          // Canadian Arctic
          -120, -72, -110, -70, -100, -68, -90, -65, -80, -63,
          // Hudson Bay area
          -75, -60, -70, -55, -65, -50,
          // Eastern Canada/Newfoundland
          -60, -48, -55, -45, -50, -43,
          // US East Coast
          -48, -40, -46, -35, -45, -30, -44, -25, -45, -20,
          // Florida
          -47, -15, -50, -12, -53, -10,
          // Gulf of Mexico
          -58, -8, -65, -8, -70, -10, -75, -12,
          // Mexico
          -80, -15, -85, -18, -90, -20, -95, -18, -100, -15, -105, -12, -110, -10,
          // Central America
          -115, -8, -120, -10,
          // Baja California
          -125, -15, -128, -20, -130, -25,
          // US West Coast
          -132, -30, -135, -35, -138, -40, -140, -45,
          // Pacific Northwest
          -145, -48, -150, -50, -155, -52, -160, -50, -165, -48, -170, -47, -175, -46, -180, -45,
          -185, -45,
        ],
        centerX: -110,
        centerY: -40,
        color: 0x4a7c59,
        hoverColor: 0x5a8c69,
      },
      {
        region: EarthRegion.SOUTH_AMERICA,
        label: 'South America',
        points: [
          // Venezuela/Colombia
          -85, 5, -80, 3, -75, 2, -70, 0, -65, -2,
          // Guyana/Suriname
          -60, -3, -55, -2, -50, 0,
          // Brazil Northeast
          -45, 2, -40, 5, -38, 10, -37, 15, -38, 20, -40, 25,
          // Brazil East Coast
          -42, 30, -43, 35, -45, 40, -47, 45, -48, 50, -50, 55, -52, 60, -53, 65, -54, 70, -55, 75,
          // Argentina East Coast
          -56, 80, -57, 85, -58, 90, -59, 95, -60, 100, -61, 105,
          // Tierra del Fuego
          -62, 110, -63, 115, -65, 118, -68, 120, -71, 118, -73, 115,
          // Chile South
          -75, 110, -76, 105, -77, 100, -78, 95, -79, 90, -80, 85, -81, 80, -82, 75, -83, 70,
          // Chile/Peru Coast
          -84, 65, -85, 60, -86, 55, -87, 50, -88, 45, -89, 40, -90, 35, -91, 30, -92, 25, -93, 20,
          -94, 15, -93, 10, -90, 7, -87, 5,
        ],
        centerX: -65,
        centerY: 50,
        color: 0x5a8c69,
        hoverColor: 0x6a9c79,
      },
      {
        region: EarthRegion.EUROPE,
        label: 'Europe',
        points: [
          // Iceland
          -15, -62, -12, -63, -10, -62,
          // Norway
          -5, -65, -2, -68, 0, -70, 3, -72, 5, -70, 8, -68, 10, -65, 12, -62, 15, -60, 18, -58,
          // Sweden/Finland
          20, -62, 22, -65, 25, -67, 28, -65, 30, -62, 32, -60,
          // Russia Northwest
          35, -58, 38, -56, 40, -54,
          // Baltic
          35, -52, 32, -50, 30, -48, 28, -46,
          // Poland/Germany
          25, -45, 22, -44, 20, -43, 18, -42,
          // Denmark
          15, -44, 12, -45, 10, -43,
          // UK
          5, -45, 2, -47, 0, -48, -2, -47, -3, -45, -2, -43, 0, -41,
          // France
          2, -40, 3, -38, 4, -36, 3, -34,
          // Spain/Portugal
          0, -32, -3, -30, -5, -32, -7, -34, -8, -36, -7, -38, -5, -40,
          // Bay of Biscay
          -3, -42, -5, -44, -7, -46, -5, -48, -3, -50,
          // Ireland
          -8, -48, -10, -50, -12, -52, -10, -54, -8, -56, -10, -58, -12, -60,
        ],
        centerX: 15,
        centerY: -50,
        color: 0x6a9c79,
        hoverColor: 0x7aac89,
      },
      {
        region: EarthRegion.AFRICA,
        label: 'Africa',
        points: [
          // Morocco/Tunisia
          -5, -28, -2, -30, 0, -32, 3, -33, 5, -34, 8, -33, 10, -32, 12, -30,
          // Libya/Egypt
          15, -28, 18, -27, 20, -26, 23, -25, 25, -24, 28, -23, 30, -22,
          // Red Sea Coast
          32, -20, 33, -18, 34, -15, 35, -12, 36, -8, 37, -5, 38, -2,
          // Horn of Africa
          40, 0, 42, 3, 43, 6, 44, 10, 43, 13, 42, 16, 40, 18,
          // East Africa
          38, 20, 36, 23, 34, 26, 32, 30, 30, 35, 28, 40, 26, 45, 24, 50, 22, 55, 20, 60, 18, 65,
          // South Africa East
          16, 70, 14, 75, 12, 78, 10, 80, 8, 82,
          // Cape of Good Hope
          5, 83, 2, 82, 0, 80, -2, 78,
          // South Africa West
          -4, 75, -6, 70, -8, 65, -10, 60,
          // Namibia/Angola
          -12, 55, -14, 50, -15, 45, -16, 40, -17, 35, -18, 30, -19, 25, -20, 20,
          // West Africa
          -21, 15, -22, 10, -23, 5, -24, 0, -23, -5, -22, -8, -20, -10, -18, -12, -15, -15, -12,
          -18, -10, -20, -8, -23, -6, -26,
        ],
        centerX: 10,
        centerY: 25,
        color: 0x7aac89,
        hoverColor: 0x8abc99,
      },
      {
        region: EarthRegion.ASIA,
        label: 'Asia',
        points: [
          // Russia West
          40, -52, 45, -54, 50, -56, 55, -58, 60, -60, 65, -62, 70, -64, 75, -66, 80, -68, 85, -70,
          90, -72, 95, -73, 100, -74, 105, -75, 110, -74, 115, -73, 120, -71, 125, -69, 130, -67,
          135, -64, 140, -61, 145, -58, 150, -55,
          // Russia East/Kamchatka
          155, -52, 158, -50, 160, -47, 162, -44, 163, -41,
          // Japan
          162, -38, 160, -35, 158, -32,
          // Korea/China East
          155, -30, 152, -28, 150, -25, 147, -22, 145, -20, 142, -18, 140, -15,
          // Southeast Asia
          138, -12, 135, -10, 132, -8, 130, -5, 128, -2, 125, 0, 122, 2, 120, 5, 118, 8,
          // Indonesia
          115, 10, 112, 12, 110, 10, 108, 8, 105, 5,
          // India East
          102, 3, 100, 0, 98, -3, 95, -5, 92, -8,
          // India
          90, -10, 87, -12, 85, -10, 82, -8, 80, -5, 78, -3, 75, -2, 72, 0, 70, -2,
          // India West
          68, -5, 65, -8, 62, -10, 60, -12,
          // Pakistan/Afghanistan
          58, -15, 55, -18, 52, -20, 50, -23, 48, -26,
          // Iran
          45, -28, 42, -30, 40, -32, 38, -35,
          // Turkey
          35, -38, 33, -40, 32, -42, 33, -44, 35, -46, 37, -48, 40, -50,
        ],
        centerX: 90,
        centerY: -35,
        color: 0x8abc99,
        hoverColor: 0x9acca9,
      },
      {
        region: EarthRegion.OCEANIA,
        label: 'Oceania',
        points: [
          // Australia West
          95, 35, 98, 33, 100, 32, 103, 31, 106, 30, 110, 30, 113, 31, 116, 32,
          // Australia North
          120, 33, 123, 34, 126, 35, 130, 36, 133, 38, 136, 40, 138, 42, 140, 45,
          // Australia East
          142, 48, 143, 52, 144, 55, 143, 58, 142, 62, 140, 65, 138, 68, 135, 70, 132, 72,
          // Australia South
          128, 73, 125, 74, 122, 73, 118, 72, 115, 70, 112, 68,
          // Tasmania area
          110, 70, 108, 72, 106, 70,
          // Australia Southwest
          104, 68, 102, 65, 100, 62, 98, 58, 96, 55, 95, 52, 94, 48, 93, 45, 92, 42, 93, 38,
        ],
        centerX: 118,
        centerY: 52,
        color: 0x9acca9,
        hoverColor: 0xaadcb9,
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

    graphics.fillStyle(data.color, 0.6)
    graphics.lineStyle(2, 0xffffff, 0.4)

    graphics.beginPath()
    graphics.moveTo(data.points[0], data.points[1])

    for (let i = 2; i < data.points.length; i += 2) {
      graphics.lineTo(data.points[i], data.points[i + 1])
    }

    graphics.closePath()
    graphics.fillPath()
    graphics.strokePath()

    // Add additional geographic features
    this.createIslands(graphics, data)

    graphics.setInteractive(new Geom.Polygon(data.points), Geom.Polygon.Contains)

    graphics.on('pointerover', () => {
      if (this.selectedRegion !== data.region) {
        graphics.clear()
        graphics.fillStyle(data.hoverColor, 0.8)
        graphics.lineStyle(3, 0xffffff, 0.8)

        graphics.beginPath()
        graphics.moveTo(data.points[0], data.points[1])
        for (let i = 2; i < data.points.length; i += 2) {
          graphics.lineTo(data.points[i], data.points[i + 1])
        }
        graphics.closePath()
        graphics.fillPath()
        graphics.strokePath()

        this.createIslands(graphics, data)

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
        graphics.fillStyle(data.color, 0.6)
        graphics.lineStyle(2, 0xffffff, 0.4)

        graphics.beginPath()
        graphics.moveTo(data.points[0], data.points[1])
        for (let i = 2; i < data.points.length; i += 2) {
          graphics.lineTo(data.points[i], data.points[i + 1])
        }
        graphics.closePath()
        graphics.fillPath()
        graphics.strokePath()

        this.createIslands(graphics, data)

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
      this.emit('region-selected', data.region)
    })

    this.add(graphics)
    return graphics
  }

  private createIslands(graphics: GameObjects.Graphics, data: RegionData) {
    if (data.region === EarthRegion.OCEANIA) {
      // New Zealand
      graphics.fillStyle(data.color, 0.5)
      graphics.fillCircle(155, 73, 4)
      graphics.fillCircle(157, 76, 3)
      // Papua New Guinea
      graphics.fillCircle(138, 30, 6)
      // Pacific Islands
      graphics.fillCircle(160, 40, 3)
      graphics.fillCircle(165, 45, 2)
      graphics.fillCircle(170, 50, 2)
    }

    if (data.region === EarthRegion.ASIA) {
      // Japan main islands
      graphics.fillStyle(data.color, 0.5)
      graphics.fillCircle(165, -36, 4)
      graphics.fillCircle(166, -33, 3)
      graphics.fillCircle(164, -30, 3)
      // Philippines
      graphics.fillCircle(150, -10, 4)
      graphics.fillCircle(152, -7, 3)
      // Sri Lanka
      graphics.fillCircle(75, 5, 3)
      // Taiwan
      graphics.fillCircle(155, -20, 2)
    }

    if (data.region === EarthRegion.EUROPE) {
      // British Isles detail
      graphics.fillStyle(data.color, 0.5)
      graphics.fillCircle(-5, -47, 3)
      // Corsica/Sardinia
      graphics.fillCircle(8, -35, 2)
      graphics.fillCircle(9, -32, 2)
      // Sicily
      graphics.fillCircle(12, -30, 2)
      // Crete
      graphics.fillCircle(20, -28, 2)
    }

    if (data.region === EarthRegion.NORTH_AMERICA) {
      // Greenland
      graphics.fillStyle(data.color, 0.5)
      graphics.fillCircle(-40, -68, 8)
      graphics.fillCircle(-38, -72, 6)
      graphics.fillCircle(-42, -75, 5)
      // Cuba
      graphics.fillCircle(-55, -6, 4)
      // Hispaniola
      graphics.fillCircle(-48, -5, 3)
      // Vancouver Island
      graphics.fillCircle(-142, -47, 2)
    }

    if (data.region === EarthRegion.AFRICA) {
      // Madagascar
      graphics.fillStyle(data.color, 0.5)
      graphics.fillCircle(40, 55, 5)
      graphics.fillCircle(41, 60, 4)
      graphics.fillCircle(42, 65, 3)
    }

    if (data.region === EarthRegion.SOUTH_AMERICA) {
      // Galapagos
      graphics.fillStyle(data.color, 0.5)
      graphics.fillCircle(-100, 15, 2)
      // Falklands
      graphics.fillCircle(-55, 115, 2)
    }
  }

  private createLabels(scene: PotatoScene) {
    this.regionData.forEach((data, region) => {
      const label = scene.add.text(data.centerX, data.centerY, data.label, {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 6, y: 3 },
        align: 'center',
      })
      label.setOrigin(0.5)
      label.setAlpha(0.9)
      label.setShadow(2, 2, '#000000', 2, true, true)

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
        graphics.fillStyle(data.hoverColor, 0.9)
        graphics.lineStyle(4, 0xffff00, 1)
      } else {
        graphics.fillStyle(data.color, 0.6)
        graphics.lineStyle(2, 0xffffff, 0.4)
      }

      graphics.beginPath()
      graphics.moveTo(data.points[0], data.points[1])
      for (let i = 2; i < data.points.length; i += 2) {
        graphics.lineTo(data.points[i], data.points[i + 1])
      }
      graphics.closePath()
      graphics.fillPath()
      graphics.strokePath()

      this.createIslands(graphics, data)

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
}
