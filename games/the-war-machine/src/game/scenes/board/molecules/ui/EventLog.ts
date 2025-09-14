import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'

export interface EventLogEntry {
  timestamp: Date
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export class EventLog extends GameObjects.Container {
  private background: GameObjects.Graphics
  private entries: GameObjects.Text[] = []
  private maxEntries = 5
  private logData: EventLogEntry[] = []

  constructor(scene: PotatoScene, x: number, y: number) {
    super(scene, x, y)

    // Create semi-transparent background - increased size
    this.background = scene.add.graphics()
    this.background.fillStyle(0x000000, 0.7)
    this.background.fillRoundedRect(-500, -80, 1000, 160, 5)
    this.background.lineStyle(1, 0x444444, 0.5)
    this.background.strokeRoundedRect(-500, -80, 1000, 160, 5)
    this.add(this.background)

    // Add title
    const title = scene.add.text(-490, -75, 'EVENT LOG', {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#888888',
      fontStyle: 'bold',
    })
    this.add(title)

    scene.add.existing(this)
  }

  addEntry(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const entry: EventLogEntry = {
      timestamp: new Date(),
      message,
      type,
    }

    this.logData.unshift(entry)
    if (this.logData.length > this.maxEntries) {
      this.logData.pop()
    }

    this.updateDisplay()
  }

  private updateDisplay() {
    // Clear existing entries
    this.entries.forEach((text) => {
      text.destroy()
    })
    this.entries = []

    // Display entries
    this.logData.forEach((entry, index) => {
      const color = this.getColorForType(entry.type)
      const timeStr = this.formatTime(entry.timestamp)
      const entryText = this.scene.add.text(
        -490,
        -45 + index * 24,
        `[${timeStr}] ${entry.message}`,
        {
          fontSize: '20px',
          fontFamily: 'Courier',
          color,
        },
      )
      this.add(entryText)
      this.entries.push(entryText)

      // Fade in effect for new entries
      if (index === 0) {
        entryText.setAlpha(0)
        this.scene.tweens.add({
          targets: entryText,
          alpha: 1,
          duration: 300,
          ease: 'Power2',
        })
      }
    })
  }

  private getColorForType(type: string): string {
    switch (type) {
      case 'success':
        return '#00ff00'
      case 'warning':
        return '#ffaa00'
      case 'error':
        return '#ff0000'
      default:
        return '#ffffff'
    }
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  clear() {
    this.logData = []
    this.entries.forEach((text) => {
      text.destroy()
    })
    this.entries = []
  }
}
