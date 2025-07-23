import { PotatoContainer } from '@potato-golem/ui'
import Phaser from 'phaser'

export class ShipIndicatorContainer extends PotatoContainer {
  // For ship indicator demo
  private playerHull = 0.9
  private playerShield = 0.7
  private enemyHull = 0.6
  private enemyShield = 0.35

  // --- SHIP INDICATOR LOGIC ---
  public renderShipIndicators(midX: number) {
    // Player ship (left)
    const shipY = this.scene.scale.height - 96

    this.drawShipIndicator(120, shipY, 40, this.playerHull, this.playerShield, true)
    this.drawShipIndicator(
      this.scene.scale.width - 120,
      shipY,
      40,
      this.enemyHull,
      this.enemyShield,
      false,
    )
  }

  private drawShipIndicator(
    x: number,
    y: number,
    r: number,
    hullRatio: number,
    shieldRatio: number,
    isPlayer: boolean,
  ) {
    const g = this.scene.add.graphics()
    g.setDepth(1) // below all interactive elements

    // Outer hull background
    g.lineStyle(10, 0x444466, 1)
    g.strokeCircle(x, y, r)

    // Hull status
    g.lineStyle(10, 0xcc3333, 1)
    g.beginPath()
    g.arc(x, y, r, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + 360 * hullRatio), false)
    g.strokePath()

    // Shield status (outer ring)
    g.lineStyle(5, 0x6ad5ff, 1)
    g.beginPath()
    g.arc(
      x,
      y,
      r + 7,
      Phaser.Math.DegToRad(-90),
      Phaser.Math.DegToRad(-90 + 360 * shieldRatio),
      false,
    )
    g.strokePath()

    // Ship "body"
    g.fillStyle(isPlayer ? 0x2aabff : 0xcc3333, 1)
    g.fillRect(x - 14, y - 20, 28, 40)

    // Hull cracks
    if (hullRatio < 0.8) {
      g.lineStyle(2, 0x555555, 1)
      g.beginPath()
      g.moveTo(x - 8, y - 18)
      g.lineTo(x + 6, y + 18)
      g.strokePath()
    }
    if (hullRatio < 0.5) {
      g.lineStyle(2, 0x333333, 1)
      g.beginPath()
      g.moveTo(x + 10, y - 12)
      g.lineTo(x - 10, y + 12)
      g.strokePath()
    }

    // Label
    this.scene.add
      .text(
        x,
        y + r + 12,
        isPlayer
          ? `YOU\nHull: ${Math.round(hullRatio * 100)}%   Shield: ${Math.round(shieldRatio * 100)}%`
          : `ENEMY\nHull: ${Math.round(hullRatio * 100)}%   Shield: ${Math.round(shieldRatio * 100)}%`,
        {
          fontSize: '14px',
          color: '#aaaaff',
          fontFamily: 'monospace',
          align: 'center',
        },
      )
      .setOrigin(0.5, 0)
      .setDepth(2)
  }
}
