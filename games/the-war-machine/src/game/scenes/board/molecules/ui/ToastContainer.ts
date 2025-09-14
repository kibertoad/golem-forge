import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'
import { type ToastData, ToastNotification } from './ToastNotification.ts'

export type { ToastData }

export class ToastContainer extends GameObjects.Container {
  private toasts: Map<string, ToastNotification> = new Map()
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
        this.removeToast(firstToast.getData('id'))
      }
    }

    const yOffset = this.calculateToastY(this.toasts.size)
    const toast = new ToastNotification(this.scene as PotatoScene, 0, yOffset, data)

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
