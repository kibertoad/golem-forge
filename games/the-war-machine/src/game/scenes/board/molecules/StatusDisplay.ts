import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'

export interface StatusData {
  date: Date
  week: number
  money: number
  turn: number
}

export class StatusDisplay extends GameObjects.Container {
  private background: GameObjects.Rectangle
  private dateText: GameObjects.Text
  private weekText: GameObjects.Text
  private moneyText: GameObjects.Text
  private turnText: GameObjects.Text
  private statusData: StatusData

  constructor(scene: PotatoScene, x: number, y: number, initialData: StatusData) {
    super(scene, x, y)
    this.statusData = initialData

    this.background = scene.add.rectangle(0, 0, 250, 120, 0x1a1a1a, 0.9)
    this.background.setStrokeStyle(2, 0x3a3a3a)
    this.add(this.background)

    const dateLabel = scene.add.text(-110, -45, 'Date:', {
      fontSize: '14px',
      color: '#888888',
    })
    this.add(dateLabel)

    this.dateText = scene.add.text(-60, -45, this.formatDate(initialData.date), {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    this.add(this.dateText)

    const weekLabel = scene.add.text(-110, -20, 'Week:', {
      fontSize: '14px',
      color: '#888888',
    })
    this.add(weekLabel)

    this.weekText = scene.add.text(-60, -20, `Week ${initialData.week}`, {
      fontSize: '14px',
      color: '#ffffff',
    })
    this.add(this.weekText)

    const moneyIcon = scene.add.text(-110, 5, '💰', {
      fontSize: '16px',
    })
    this.add(moneyIcon)

    this.moneyText = scene.add.text(-80, 5, this.formatMoney(initialData.money), {
      fontSize: '16px',
      color: '#00ff00',
      fontStyle: 'bold',
    })
    this.add(this.moneyText)

    const turnLabel = scene.add.text(-110, 35, 'Turn:', {
      fontSize: '14px',
      color: '#888888',
    })
    this.add(turnLabel)

    this.turnText = scene.add.text(-60, 35, initialData.turn.toString(), {
      fontSize: '14px',
      color: '#ffffff',
    })
    this.add(this.turnText)

    scene.add.existing(this)
  }

  private formatDate(date: Date): string {
    const months = [
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
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  private formatMoney(amount: number): string {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  updateStatus(data: Partial<StatusData>) {
    if (data.date !== undefined) {
      this.statusData.date = data.date
      this.dateText.setText(this.formatDate(data.date))
    }

    if (data.week !== undefined) {
      this.statusData.week = data.week
      this.weekText.setText(`Week ${data.week}`)
    }

    if (data.money !== undefined) {
      const oldMoney = this.statusData.money
      this.statusData.money = data.money
      this.moneyText.setText(this.formatMoney(data.money))

      if (data.money > oldMoney) {
        this.moneyText.setColor('#00ff00')
        this.flashText(this.moneyText, '#00ff00')
      } else if (data.money < oldMoney) {
        this.moneyText.setColor('#ff0000')
        this.flashText(this.moneyText, '#ff0000')
      }
    }

    if (data.turn !== undefined) {
      this.statusData.turn = data.turn
      this.turnText.setText(data.turn.toString())
      this.flashText(this.turnText, '#ffff00')
    }
  }

  private flashText(text: GameObjects.Text, color: string) {
    const originalColor = text.style.color
    this.scene.tweens.add({
      targets: text,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        text.setColor(color === '#ff0000' ? '#ff8888' : (originalColor as string))
      },
    })
  }

  getStatus(): StatusData {
    return { ...this.statusData }
  }
}
