import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'

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
  x: number
  y: number
  width: number
  height: number
  color: number
}

export class EarthMap extends GameObjects.Container {
  private regions: Map<EarthRegion, GameObjects.Container> = new Map()
  private selectedRegion: EarthRegion | null = null
  private earthBackground: GameObjects.Arc

  constructor(scene: PotatoScene, x: number, y: number) {
    super(scene, x, y)

    this.earthBackground = scene.add.circle(0, 0, 200, 0x1a4d2e, 0.3)
    this.earthBackground.setStrokeStyle(3, 0x2a5d3e)
    this.add(this.earthBackground)

    const regionData: RegionData[] = [
      {
        region: EarthRegion.NORTH_AMERICA,
        label: 'N. America',
        x: -120,
        y: -50,
        width: 80,
        height: 60,
        color: 0x4a7c59,
      },
      {
        region: EarthRegion.SOUTH_AMERICA,
        label: 'S. America',
        x: -80,
        y: 60,
        width: 60,
        height: 80,
        color: 0x5a8c69,
      },
      {
        region: EarthRegion.EUROPE,
        label: 'Europe',
        x: 20,
        y: -60,
        width: 60,
        height: 50,
        color: 0x6a9c79,
      },
      {
        region: EarthRegion.AFRICA,
        label: 'Africa',
        x: 20,
        y: 20,
        width: 70,
        height: 90,
        color: 0x7aac89,
      },
      {
        region: EarthRegion.ASIA,
        label: 'Asia',
        x: 100,
        y: -30,
        width: 100,
        height: 80,
        color: 0x8abc99,
      },
      {
        region: EarthRegion.OCEANIA,
        label: 'Oceania',
        x: 110,
        y: 80,
        width: 70,
        height: 50,
        color: 0x9acca9,
      },
    ]

    regionData.forEach((data) => {
      const region = this.createRegion(scene, data)
      this.regions.set(data.region, region)
    })

    scene.add.existing(this)
  }

  private createRegion(scene: PotatoScene, data: RegionData): GameObjects.Container {
    const container = scene.add.container(data.x, data.y)

    const shape = scene.add.rectangle(0, 0, data.width, data.height, data.color, 0.6)
    shape.setStrokeStyle(2, 0xffffff, 0.4)
    shape.setInteractive()
    container.add(shape)

    const label = scene.add.text(0, 0, data.label, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 },
    })
    label.setOrigin(0.5)
    label.setAlpha(0.8)
    container.add(label)

    shape.on('pointerover', () => {
      if (this.selectedRegion !== data.region) {
        shape.setFillStyle(data.color, 0.8)
        shape.setStrokeStyle(2, 0xffffff, 0.8)
        label.setAlpha(1)
        scene.tweens.add({
          targets: container,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 100,
          ease: 'Power2',
        })
      }
    })

    shape.on('pointerout', () => {
      if (this.selectedRegion !== data.region) {
        shape.setFillStyle(data.color, 0.6)
        shape.setStrokeStyle(2, 0xffffff, 0.4)
        label.setAlpha(0.8)
        scene.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
          ease: 'Power2',
        })
      }
    })

    shape.on('pointerdown', () => {
      this.selectRegion(data.region)
      this.emit('region-selected', data.region)
    })

    this.add(container)
    return container
  }

  selectRegion(region: EarthRegion) {
    this.regions.forEach((container, regionKey) => {
      const shape = container.list[0] as GameObjects.Rectangle
      const isSelected = regionKey === region

      if (isSelected) {
        shape.setStrokeStyle(3, 0xffff00, 1)
        container.setScale(1.1)
      } else {
        shape.setStrokeStyle(2, 0xffffff, 0.4)
        container.setScale(1)
      }
    })

    this.selectedRegion = region
  }

  getSelectedRegion(): EarthRegion | null {
    return this.selectedRegion
  }

  highlightRegion(region: EarthRegion, color: number = 0xffff00) {
    const container = this.regions.get(region)
    if (container) {
      const shape = container.list[0] as GameObjects.Rectangle
      this.scene.tweens.add({
        targets: shape,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          shape.setAlpha(1)
        },
      })
    }
  }
}
