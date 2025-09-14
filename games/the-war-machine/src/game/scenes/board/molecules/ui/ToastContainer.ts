import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'

export interface ToastData {
  id: string
  icon: string
  title: string
  description: string
  timestamp: number
  metadata?: Record<string, unknown>
}

class Toast extends GameObjects.Container {
  private background: GameObjects.Rectangle
  private iconSprite: GameObjects.Sprite
  private titleText: GameObjects.Text
  private descriptionText: GameObjects.Text
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

    this.titleText = scene.add.text(-50, -10, data.title, {
      fontSize: '14px',
      color: '#ffff00',
      fontStyle: 'bold',
    })
    this.titleText.setOrigin(0, 0.5)
    this.add(this.titleText)

    this.descriptionText = scene.add.text(-50, 10, data.description, {
      fontSize: '12px',
      color: '#ffffff',
      wordWrap: { width: 180 },
    })
    this.descriptionText.setOrigin(0, 0.5)
    this.add(this.descriptionText)

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

  getData(key: string) {
    if (key === 'id') return this.toastData.id
    return null
  }
}

export class ToastContainer extends GameObjects.Container {
  private toasts: Map<string, Toast> = new Map()
  private maxToasts = 5

  constructor(scene: PotatoScene, x: number, y: number) {
    super(scene, x, y)
    scene.add.existing(this)
  }

  private calculateToastY(toastCount: number) {
    return 200 + toastCount * 90
  }

  addToast(data: ToastData) {
    if (this.toasts.size >= this.maxToasts) {
      const firstToast = this.toasts.values().next().value
      if (firstToast) {
        this.removeToast(firstToast.getData('id') as string)
      }
    }

    const yOffset = this.calculateToastY(this.toasts.size)
    const toast = new Toast(this.scene as PotatoScene, 0, yOffset, data)

    toast.on('toast-clicked', (toastData: ToastData) => {
      this.emit('toast-detail-requested', toastData)
    })

    toast.on('toast-dismissed', (toastData: ToastData) => {
      this.removeToast(toastData.id)
    })

    toast.fadeIn()
    this.add(toast)
    this.toasts.set(data.id, toast)

    this.repositionToasts()
  }

  removeToast(id: string) {
    const toast = this.toasts.get(id)
    if (toast) {
      toast.fadeOut().then(() => {
        this.toasts.delete(id)
        this.repositionToasts()
      })
    }
  }

  private repositionToasts() {
    let index = 0
    this.toasts.forEach((toast) => {
      this.scene.tweens.add({
        targets: toast,
        y: this.calculateToastY(index),
        duration: 200,
        ease: 'Power2',
      })
      index++
    })
  }

  clearAll() {
    this.toasts.forEach((toast) => {
      toast.destroy()
    })
    this.toasts.clear()
  }
}
