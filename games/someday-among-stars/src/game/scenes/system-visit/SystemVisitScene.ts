import { PotatoScene } from '@potato-golem/ui'
import Phaser from 'phaser'
import type { Dependencies } from '../../diConfig.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'

export interface SystemData {
  name: string
  colonized: boolean
  biome: string
  government?: string
  onMission?: boolean
  region?: string
  inhabitant?: string
  hasShipyard?: boolean
  hasMercenaryGuild?: boolean
  economicType?: 'industrial' | 'scientific' | 'mining' | 'agricultural' | null
  distance?: number
}

export class SystemVisitScene extends PotatoScene {
  private readonly worldModel: WorldModel
  private systemData: SystemData | null = null

  // UI Elements
  private backgroundRect!: Phaser.GameObjects.Rectangle
  private systemImage!: Phaser.GameObjects.Image
  private titleText!: Phaser.GameObjects.Text
  private infoText!: Phaser.GameObjects.Text
  private buttonContainer!: Phaser.GameObjects.Container
  private buttons: Phaser.GameObjects.Text[] = []

  constructor(dependencies: Dependencies) {
    super(dependencies.globalSceneEventEmitter, { key: sceneRegistry.SYSTEM_VISIT_SCENE })
    this.worldModel = dependencies.worldModel
  }

  init(data: SystemData) {
    this.systemData = data
  }

  create() {
    const { width, height } = this.scale

    // Create fullscreen background
    this.backgroundRect = this.add.rectangle(0, 0, width, height, 0x0a0a0f, 1).setOrigin(0, 0)

    // Add decorative stars background
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const star = this.add.circle(x, y, Phaser.Math.FloatBetween(0.5, 2), 0xffffff)
      star.setAlpha(Phaser.Math.FloatBetween(0.2, 0.6))
    }

    // Create main UI panel
    const panelWidth = Math.min(width * 0.9, 1200)
    const panelHeight = Math.min(height * 0.85, 800)
    const panelX = (width - panelWidth) / 2
    const panelY = (height - panelHeight) / 2

    // Panel background
    const panel = this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0x1a1a2e, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(3, 0x4444ff, 0.8)

    // System image
    this.systemImage = this.add
      .image(panelX + 80, panelY + 100, imageRegistry.ABOVE_PLANET_BACKGROUND)
      .setOrigin(0, 0)
      .setDisplaySize(280, 400)

    // Title
    this.titleText = this.add
      .text(panelX + 400, panelY + 40, `SYSTEM: ${this.systemData?.name || 'Unknown'}`, {
        fontSize: '42px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0)

    // System information
    const infoX = panelX + 400
    const infoY = panelY + 100
    this.infoText = this.add
      .text(infoX, infoY, this.buildSystemInfo(), {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#dddddd',
        lineSpacing: 8,
      })
      .setOrigin(0, 0)

    // Button container
    this.buttonContainer = this.add.container(panelX + 400, panelY + 450)

    // Create buttons
    this.createButtons()

    // Add ESC key handler
    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToStarmap()
    })
  }

  private buildSystemInfo(): string {
    if (!this.systemData) return 'No system data available'

    let info = ''

    // Region and distance
    if (this.systemData.region) {
      info += `Region: ${this.systemData.region}\n`
    }
    if (this.systemData.distance !== undefined) {
      info += `Distance from Hub: ${this.systemData.distance.toFixed(1)} ly\n`
    }
    info += '────────────────────────────────\n'

    // Colonization status
    if (this.systemData.colonized) {
      info += 'Status: COLONIZED\n'
      if (this.systemData.inhabitant) {
        info += `Population: ${this.systemData.inhabitant}\n`
      }
      if (this.systemData.government) {
        info += `Government: ${this.systemData.government}\n`
      }
    } else {
      info += 'Status: UNINHABITED\n'
      info += 'Available for colonization\n'
    }

    // Biome
    info += `\nPlanetary Biome: ${this.systemData.biome}\n`

    // Economic type
    if (this.systemData.economicType) {
      const typeLabel =
        this.systemData.economicType.charAt(0).toUpperCase() + this.systemData.economicType.slice(1)
      info += `Economic Focus: ${typeLabel} Hub\n`
    }

    // Facilities
    info += '\n━━━ FACILITIES ━━━\n'
    const facilities: string[] = []
    if (this.systemData.colonized) facilities.push('Spaceport')
    if (this.systemData.hasShipyard) facilities.push('Shipyard')
    if (this.systemData.hasMercenaryGuild) facilities.push('Mercenary Guild')
    if (this.systemData.economicType) facilities.push('Trade Hub')

    if (facilities.length > 0) {
      facilities.forEach((f) => {
        info += `  ▸ ${f}\n`
      })
    } else {
      info += '  None available\n'
    }

    return info
  }

  private createButtons() {
    const buttonConfigs: { label: string; visible: boolean; action: () => void }[] = [
      {
        label: '🏛️ Visit Spaceport',
        visible: !!this.systemData?.colonized,
        action: () => this.visitSpaceport(),
      },
      {
        label: '🔧 Enter Shipyard',
        visible: !!this.systemData?.hasShipyard,
        action: () => this.visitShipyard(),
      },
      {
        label: '⚔️ Mercenary Guild',
        visible: !!this.systemData?.hasMercenaryGuild,
        action: () => this.visitMercenaryGuild(),
      },
      {
        label: '💰 Trade Hub',
        visible: !!this.systemData?.economicType,
        action: () => this.visitTradeHub(),
      },
      {
        label: '🔍 Explore System',
        visible: !this.systemData?.colonized,
        action: () => this.exploreSystem(),
      },
      {
        label: '📜 Active Mission',
        visible: !!this.systemData?.onMission,
        action: () => this.checkMission(),
      },
      {
        label: '🚀 Return to Space',
        visible: true,
        action: () => this.returnToStarmap(),
      },
    ]

    let yOffset = 0
    buttonConfigs.forEach((config) => {
      if (config.visible) {
        const button = this.createButton(config.label, yOffset, config.action)
        this.buttonContainer.add(button)
        this.buttons.push(button)
        yOffset += 60
      }
    })
  }

  private createButton(label: string, y: number, onClick: () => void): Phaser.GameObjects.Text {
    const button = this.add
      .text(0, y, label, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffff88',
        backgroundColor: '#2a2a3e',
        padding: { x: 20, y: 12 },
        fixedWidth: 300,
      })
      .setOrigin(0, 0)
      .setInteractive({ cursor: 'pointer' })

    button.on('pointerover', () => {
      button.setBackgroundColor('#3a3a5e')
      button.setColor('#ffffff')
      button.setScale(1.05)
    })

    button.on('pointerout', () => {
      button.setBackgroundColor('#2a2a3e')
      button.setColor('#ffff88')
      button.setScale(1)
    })

    button.on('pointerdown', onClick)

    return button
  }

  private visitSpaceport() {
    console.log('Visiting spaceport...')
    // Launch the trading scene
    this.scene.start(sceneRegistry.STARPORT_TRADE_SCENE, {
      systemData: this.systemData,
    })
  }

  private visitShipyard() {
    console.log('Visiting shipyard...')
    // TODO: Implement shipyard interaction
    this.showTemporaryMessage('Ship upgrades and repairs coming soon!')
  }

  private visitMercenaryGuild() {
    console.log('Visiting mercenary guild...')
    // TODO: Implement mercenary guild interaction
    this.showTemporaryMessage('Hire crew and mercenaries coming soon!')
  }

  private visitTradeHub() {
    console.log('Visiting trade hub...')
    // TODO: Implement trade hub interaction
    this.showTemporaryMessage('Trading system coming soon!')
  }

  private exploreSystem() {
    console.log('Exploring uninhabited system...')
    // TODO: Implement exploration
    this.showTemporaryMessage('System exploration coming soon!')
  }

  private checkMission() {
    console.log('Checking mission status...')
    // TODO: Implement mission system
    this.showTemporaryMessage('Mission system coming soon!')
  }

  private showTemporaryMessage(message: string) {
    const { width, height } = this.scale
    const messageText = this.add
      .text(width / 2, height - 100, message, {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#88ff88',
        backgroundColor: '#000000',
        padding: { x: 30, y: 15 },
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)

    this.tweens.add({
      targets: messageText,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 2000,
      onComplete: () => {
        messageText.destroy()
      },
    })
  }

  private returnToStarmap() {
    // Wake up the starmap scenes
    this.scene.wake(sceneRegistry.STARMAP_SCENE)
    this.scene.wake(sceneRegistry.STARMAP_UI_SCENE)

    // Stop this scene (it will be destroyed)
    this.scene.stop()
  }
}
