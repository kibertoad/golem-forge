import type { PotatoScene } from '@potato-golem/ui'
import type { EventEmitter } from 'emitix'
import { GameObjects } from 'phaser'
import type { WorldModel, WorldModelEvents } from '../model/entities/WorldModel.ts'
import { Colors, Typography } from '../registries/styleRegistry.ts'
import { formatMoney } from '../utils/FormatUtils.ts'

/**
 * Shared status bar component that displays money and date
 * Automatically updates when WorldModel emits change events
 * Fixed optimal configuration for consistent display across all scenes
 */
export class StatusBar extends GameObjects.Container {
  private moneyText!: GameObjects.Text
  private dateText!: GameObjects.Text
  private background!: GameObjects.Rectangle
  private border!: GameObjects.Graphics
  private separator!: GameObjects.Graphics
  private worldModel: WorldModel
  private eventListeners: Array<() => void> = []

  // Fixed optimal dimensions
  private static readonly WIDTH = 320
  private static readonly HEIGHT = 80

  constructor(scene: PotatoScene, worldModel: WorldModel) {
    // Always position at top-right corner
    const { width } = scene.cameras.main
    const x = width - 160
    const y = 80
    super(scene, x, y)

    this.worldModel = worldModel

    this.createUI()
    this.setupEventListeners()
    scene.add.existing(this)
  }

  private createUI() {
    const width = StatusBar.WIDTH
    const height = StatusBar.HEIGHT

    // Create background with gradient effect
    this.background = this.scene.add.rectangle(0, 0, width, height, Colors.background.secondary, 0.9)
    this.background.setOrigin(1, 0.5) // Always right-aligned
    this.add(this.background)

    // Add border for better definition
    this.border = this.scene.add.graphics()
    this.border.lineStyle(2, Colors.primary.light, 1)
    this.border.strokeRoundedRect(-width, -height / 2, width, height, 8)
    this.add(this.border)

    // Text position for right alignment
    const textX = -25
    const textOrigin = 1

    // Create money display with icon
    const moneyString = `💰 ${formatMoney(this.worldModel.gameStatus.money)}`
    this.moneyText = this.scene.add.text(textX, -15, moneyString, {
      fontSize: Typography.fontSize.h4,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.money.neutral,
      fontStyle: Typography.fontStyle.bold,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#000000',
        blur: 2,
        fill: true,
      },
    })
    this.moneyText.setOrigin(textOrigin, 0.5)
    this.add(this.moneyText)

    // Add separator between money and date
    this.separator = this.scene.add.graphics()
    this.separator.lineStyle(1, 0x64748b, 0.5)
    this.separator.lineBetween(-width + 15, 0, -15, 0)
    this.add(this.separator)

    // Create date display with icon
    const dateString = `📅 ${this.getDateString()}`
    this.dateText = this.scene.add.text(textX, 15, dateString, {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.secondary,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#000000',
        blur: 2,
        fill: true,
      },
    })
    this.dateText.setOrigin(textOrigin, 0.5)
    this.add(this.dateText)
  }

  private setupEventListeners() {
    // Get the WorldModel's event emitter
    const emitter = this.worldModel.getEventEmitter() as EventEmitter<WorldModelEvents>

    // Listen for money changes
    const moneyHandler = (data: { oldAmount: number; newAmount: number }) => {
      this.updateMoney(data.newAmount)
    }
    emitter.on('money-changed', moneyHandler)
    // Store cleanup function with proper off method
    this.eventListeners.push(() => {
      emitter.off('money-changed', moneyHandler)
    })

    // Listen for date changes
    const dateHandler = () => {
      this.updateDate()
    }
    emitter.on('date-changed', dateHandler)
    // Store cleanup function with proper off method
    this.eventListeners.push(() => {
      emitter.off('date-changed', dateHandler)
    })
  }

  private getDateString(): string {
    const { date, week } = this.worldModel.gameStatus
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    const month = date.getMonth() // 0-based month
    const year = date.getFullYear()
    return `${monthNames[month]} Week ${week}, ${year}`
  }

  /**
   * Update the money display
   */
  public updateMoney(amount?: number) {
    if (!this.moneyText) return
    const newAmount = amount ?? this.worldModel.gameStatus.money
    const moneyString = `💰 ${formatMoney(newAmount)}`
    this.moneyText.setText(moneyString)

    // Flash effect for money changes with animation
    if (amount !== undefined) {
      const isGain = amount > this.worldModel.gameStatus.money
      const changeColor = isGain ? Colors.money.positive : Colors.money.negative

      // Apply color and scale effect
      this.moneyText.setColor(changeColor)
      this.moneyText.setScale(1.1)

      // Animate back to normal
      this.scene.tweens.add({
        targets: this.moneyText,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Power2',
      })

      this.scene.time.delayedCall(600, () => {
        if (this.moneyText) {
          this.moneyText.setColor(Colors.money.neutral)
        }
      })
    }
  }

  /**
   * Update the date display
   */
  public updateDate() {
    if (!this.dateText) return
    this.dateText.setText(`📅 ${this.getDateString()}`)
  }

  /**
   * Force refresh all displays
   */
  public refresh() {
    this.updateMoney()
    this.updateDate()
  }

  /**
   * Clean up event listeners when destroyed
   */
  destroy() {
    // Guard against multiple destroy calls
    if (!this.scene) {
      return
    }

    // Remove all event listeners
    this.eventListeners.forEach((cleanup) => cleanup())
    this.eventListeners = []

    // Clear references
    this.moneyText = undefined
    this.dateText = undefined
    this.background = undefined
    this.border = undefined
    this.separator = undefined

    super.destroy()
  }
}