import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'

export class ActionPointsDisplay extends GameObjects.Container {
  private background: GameObjects.Graphics
  private pointsText: GameObjects.Text
  private currentPoints: number
  private maxPoints: number

  constructor(scene: PotatoScene, x: number, y: number, currentPoints: number, maxPoints: number) {
    super(scene, x, y)

    this.currentPoints = currentPoints
    this.maxPoints = maxPoints

    // Background
    this.background = scene.add.graphics()
    this.background.fillStyle(0x440044, 0.8)
    this.background.fillRoundedRect(0, 0, 200, 80, 5)
    this.background.lineStyle(2, 0xff00ff, 0.8)
    this.background.strokeRoundedRect(0, 0, 200, 80, 5)
    this.add(this.background)

    // Title
    const title = scene.add.text(100, 20, 'ACTION POINTS', {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#ff00ff',
      fontStyle: 'bold',
    })
    title.setOrigin(0.5)
    this.add(title)

    // Points display
    this.pointsText = scene.add.text(100, 50, `${currentPoints} / ${maxPoints}`, {
      fontSize: '28px',
      fontFamily: 'Courier',
      color: '#ffffff',
    })
    this.pointsText.setOrigin(0.5)
    this.add(this.pointsText)

    scene.add.existing(this)
  }

  updatePoints(current: number) {
    this.currentPoints = current
    this.pointsText.setText(`${this.currentPoints} / ${this.maxPoints}`)

    // Change color based on remaining points
    if (this.currentPoints === 0) {
      this.pointsText.setColor('#ff0000')
    } else if (this.currentPoints <= 2) {
      this.pointsText.setColor('#ffff00')
    } else {
      this.pointsText.setColor('#ffffff')
    }
  }

  getPoints(): { current: number; max: number } {
    return { current: this.currentPoints, max: this.maxPoints }
  }
}
