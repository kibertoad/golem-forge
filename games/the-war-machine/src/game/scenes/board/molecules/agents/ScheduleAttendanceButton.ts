import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import { GameObjects } from 'phaser'

export class ScheduleAttendanceButton extends GameObjects.Container {
  private background: GameObjects.Graphics
  private buttonText: GameObjects.Text
  private isEnabled: boolean
  private onClick: () => void

  constructor(scene: PotatoScene, x: number, y: number, canAfford: boolean, onClick: () => void) {
    super(scene, x, y)
    this.isEnabled = canAfford
    this.onClick = onClick

    // Create button background
    this.background = scene.add.graphics()
    this.updateButtonAppearance()

    // Create button text
    this.buttonText = scene.add.text(0, 0, 'Schedule Attendance', {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: this.isEnabled ? '#ffffff' : '#666666',
      align: 'center',
    })
    this.buttonText.setOrigin(0.5)

    this.add([this.background, this.buttonText])

    // Set up interactivity if enabled
    if (this.isEnabled) {
      this.setupInteraction()
    }

    scene.add.existing(this)
  }

  private updateButtonAppearance() {
    this.background.clear()

    if (this.isEnabled) {
      this.background.fillStyle(0x00aa00, 0.8)
      this.background.lineStyle(2, 0x00ff00, 1)
    } else {
      this.background.fillStyle(0x444444, 0.5)
      this.background.lineStyle(2, 0x666666, 0.5)
    }

    this.background.fillRoundedRect(-100, -22, 200, 44, 5)
    this.background.strokeRoundedRect(-100, -22, 200, 44, 5)
  }

  private setupInteraction() {
    this.background.setInteractive(
      new Phaser.Geom.Rectangle(-100, -22, 200, 44),
      Phaser.Geom.Rectangle.Contains,
    )

    this.background.on('pointerover', () => {
      if (this.isEnabled) {
        this.background.clear()
        this.background.fillStyle(0x00cc00, 1)
        this.background.lineStyle(3, 0x00ff00, 1)
        this.background.fillRoundedRect(-100, -22, 200, 44, 5)
        this.background.strokeRoundedRect(-100, -22, 200, 44, 5)
        this.buttonText.setScale(1.05)
      }
    })

    this.background.on('pointerout', () => {
      if (this.isEnabled) {
        this.updateButtonAppearance()
        this.buttonText.setScale(1)
      }
    })

    this.background.on('pointerdown', () => {
      if (this.isEnabled) {
        this.onClick()
      }
    })
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    this.buttonText.setColor(enabled ? '#ffffff' : '#666666')
    this.updateButtonAppearance()

    if (enabled && !this.background.input) {
      this.setupInteraction()
    } else if (!enabled && this.background.input) {
      this.background.removeInteractive()
    }
  }

  updateAffordability(canAfford: boolean) {
    this.setEnabled(canAfford)
  }
}
