import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'

export class NextTurnButton extends GameObjects.Container {
  private background: GameObjects.Rectangle
  private buttonText: GameObjects.Text
  private hotkeyText: GameObjects.Text
  private isProcessing = false

  constructor(scene: PotatoScene, x: number, y: number) {
    super(scene, x, y)

    this.background = scene.add.rectangle(0, 0, 180, 60, 0x2a5d3e, 0.9)
    this.background.setStrokeStyle(3, 0x3a6d4e)
    this.background.setInteractive()
    this.add(this.background)

    this.buttonText = scene.add.text(0, -8, 'NEXT TURN', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    this.buttonText.setOrigin(0.5)
    this.add(this.buttonText)

    this.hotkeyText = scene.add.text(0, 15, '[Space]', {
      fontSize: '12px',
      color: '#aaaaaa',
    })
    this.hotkeyText.setOrigin(0.5)
    this.add(this.hotkeyText)

    this.setupInteractions()
    this.setupKeyboardShortcut(scene)

    scene.add.existing(this)
  }

  private setupInteractions() {
    this.background.on('pointerover', () => {
      if (!this.isProcessing) {
        this.background.setFillStyle(0x3a7d5e, 1)
        this.buttonText.setScale(1.05)
        this.scene.tweens.add({
          targets: this.background,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 100,
          ease: 'Power2',
        })
      }
    })

    this.background.on('pointerout', () => {
      if (!this.isProcessing) {
        this.background.setFillStyle(0x2a5d3e, 0.9)
        this.buttonText.setScale(1)
        this.scene.tweens.add({
          targets: this.background,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
          ease: 'Power2',
        })
      }
    })

    this.background.on('pointerdown', () => {
      if (!this.isProcessing) {
        this.triggerNextTurn()
      }
    })
  }

  private setupKeyboardShortcut(scene: PotatoScene) {
    scene.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.isProcessing) {
        this.triggerNextTurn()
      }
    })
  }

  private triggerNextTurn() {
    if (this.isProcessing) return

    this.setProcessing(true)
    this.animatePress()
    this.emit('next-turn')

    this.scene.time.delayedCall(500, () => {
      this.setProcessing(false)
    })
  }

  private animatePress() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 100,
      yoyo: true,
      ease: 'Power2',
    })

    this.background.setFillStyle(0x4a8d6e, 1)
    this.scene.time.delayedCall(200, () => {
      this.background.setFillStyle(0x2a5d3e, 0.9)
    })
  }

  setProcessing(processing: boolean) {
    this.isProcessing = processing

    if (processing) {
      this.buttonText.setText('PROCESSING...')
      this.buttonText.setColor('#ffff00')
      this.background.setAlpha(0.6)
      this.background.disableInteractive()

      this.scene.tweens.add({
        targets: this.buttonText,
        alpha: 0.5,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Power2',
      })
    } else {
      this.buttonText.setText('NEXT TURN')
      this.buttonText.setColor('#ffffff')
      this.buttonText.setAlpha(1)
      this.background.setAlpha(0.9)
      this.background.setInteractive()

      this.scene.tweens.killTweensOf(this.buttonText)
    }
  }

  setEnabled(enabled: boolean) {
    if (enabled && !this.isProcessing) {
      this.background.setInteractive()
      this.background.setAlpha(0.9)
      this.buttonText.setAlpha(1)
      this.hotkeyText.setAlpha(1)
    } else {
      this.background.disableInteractive()
      this.background.setAlpha(0.4)
      this.buttonText.setAlpha(0.5)
      this.hotkeyText.setAlpha(0.3)
    }
  }
}
