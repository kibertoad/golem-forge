import type Phaser from 'phaser'

export type EventLogEntry = {
  id: string
  timestamp: number
  source: 'player' | 'enemy'
  weaponName: string
  slotSide: string
  result?: string
  message: string
}

export class EventLog {
  private entries: EventLogEntry[] = []
  private displayContainer?: Phaser.GameObjects.Container
  private scene: Phaser.Scene
  private maxDisplayEntries = 10
  private entryHeight = 32 // Increased for larger font
  private logWidth = 1800 // 3x wider (600 * 3)
  private logHeight = 390 // 50% taller (260 * 1.5)

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  addEvent(event: Omit<EventLogEntry, 'id' | 'timestamp'>) {
    const entry: EventLogEntry = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }

    this.entries.push(entry)
    console.log(`[EVENT LOG] Added: ${entry.message}`)

    // Update display
    this.updateDisplay()
  }

  createDisplay(x: number, y: number): Phaser.GameObjects.Container {
    this.displayContainer = this.scene.add.container(x, y)
    this.displayContainer.setDepth(500)

    // Background
    const background = this.scene.add.rectangle(0, 0, this.logWidth, this.logHeight, 0x000000, 0.8)
    background.setStrokeStyle(2, 0x444444)
    this.displayContainer.add(background)

    // Title
    const title = this.scene.add
      .text(0, -this.logHeight / 2 + 25, 'COMBAT LOG', {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5, 0.5)
    this.displayContainer.add(title)

    this.updateDisplay()
    return this.displayContainer
  }

  private updateDisplay() {
    if (!this.displayContainer) return

    // Remove existing entry texts (keep background and title)
    const entriesToRemove = this.displayContainer.list.slice(2) // Skip background and title
    entriesToRemove.forEach((entry) => {
      this.displayContainer!.remove(entry as Phaser.GameObjects.GameObject)
      entry.destroy()
    })

    // Get last N entries for display
    const displayEntries = this.entries.slice(-this.maxDisplayEntries)

    displayEntries.forEach((entry, index) => {
      const yPos = -this.logHeight / 2 + 65 + index * this.entryHeight
      const color = entry.source === 'player' ? '#4a9eff' : '#ff4a4a' // Blue for player, red for enemy

      const text = this.scene.add
        .text(-this.logWidth / 2 + 20, yPos, entry.message, {
          fontSize: '20px', // Increased from 16px to 20px
          color: color,
          fontFamily: 'monospace',
          wordWrap: { width: this.logWidth - 40 },
        })
        .setOrigin(0, 0.5)

      this.displayContainer!.add(text)
    })

    console.log(
      `[EVENT LOG] Display updated: ${displayEntries.length} entries shown, ${this.entries.length} total stored`,
    )
  }

  getFullHistory(): EventLogEntry[] {
    return [...this.entries]
  }

  clearLog() {
    this.entries = []
    this.updateDisplay()
    console.log('[EVENT LOG] Log cleared')
  }

  destroy() {
    if (this.displayContainer) {
      this.displayContainer.destroy()
      this.displayContainer = undefined
    }
  }
}
