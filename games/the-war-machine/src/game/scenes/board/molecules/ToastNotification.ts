import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'

export interface ToastData {
  id: string
  icon: string
  title: string
  description: string
  timestamp: number
}

export class ToastNotification extends GameObjects.Container {
  private background: GameObjects.Rectangle
  private iconSprite: GameObjects.Sprite
  private titleText: GameObjects.Text
  private closeButton: GameObjects.Text
  private toastData: ToastData

  constructor(scene: PotatoScene, x: number, y: number, data: ToastData) {
    super(scene, x, y)
    this.toastData = data

    this.background = scene.add.rectangle(0, 0, 280, 80, 0x2a2a2a, 0.95)
    this.background.setStrokeStyle(2, 0x4a4a4a)
    this.background.setInteractive()
    this.add(this.background)

    this.iconSprite = scene.add.sprite(-110, 0, data.icon)
    this.iconSprite.setDisplaySize(48, 48)
    this.add(this.iconSprite)

    this.titleText = scene.add.text(-50, 0, data.title, {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 180 },
    })
    this.titleText.setOrigin(0, 0.5)
    this.add(this.titleText)

    this.closeButton = scene.add.text(120, -30, '✕', {
      fontSize: '20px',
      color: '#888888',
    })
    this.closeButton.setOrigin(0.5)
    this.closeButton.setInteractive()
    this.add(this.closeButton)

    this.background.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.emit('toast-dismissed', this.toastData)
      } else {
        this.emit('toast-clicked', this.toastData)
      }
    })

    this.closeButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation()
      this.emit('toast-dismissed', this.toastData)
    })

    this.closeButton.on('pointerover', () => {
      this.closeButton.setColor('#ffffff')
    })

    this.closeButton.on('pointerout', () => {
      this.closeButton.setColor('#888888')
    })

    scene.add.existing(this)
  }

  fadeIn() {
    this.setAlpha(0)
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    })
  }

  fadeOut() {
    return new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          this.destroy()
          resolve()
        },
      })
    })
  }
}
