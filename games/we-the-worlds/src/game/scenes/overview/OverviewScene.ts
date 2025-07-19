import { PotatoScene } from '@potato-golem/ui'
import type Phaser from 'phaser'
import type { Dependencies } from '../../model/diConfig.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'

// Types
interface CharacterStats {
  name: string
  age: number
  health: number
  looks: number
  smarts: number
  energy: number
  emotional: number
  status: string
}
interface ActionMenuItem {
  label: string
  y: number
  actions: string[]
}
interface OverviewIcon {
  label: string
  y: number
}

export class OverviewScene extends PotatoScene {
  stats: CharacterStats
  timeLeft: number
  actionMenus: Record<string, Phaser.GameObjects.GameObject[] | null>
  eventCard!: Phaser.GameObjects.Rectangle
  eventText!: Phaser.GameObjects.Text
  cardCloseBtn!: Phaser.GameObjects.Text
  timeText!: Phaser.GameObjects.Text
  endRoundBtn!: Phaser.GameObjects.Rectangle
  endRoundText!: Phaser.GameObjects.Text

  constructor({ globalSceneEventEmitter }: Dependencies) {
    super(globalSceneEventEmitter, sceneRegistry.OVERVIEW_SCENE)
    this.stats = {
      name: 'Alex Kim',
      age: 21,
      health: 80,
      looks: 70,
      smarts: 85,
      energy: 60,
      emotional: 50,
      status: 'Student',
    }
    this.timeLeft = 10
    this.actionMenus = {}
  }

  preload(): void {
    // Load assets if needed
  }

  create(): void {
    this.createStatsPanel()
    this.createActionButtons()
    this.createOverviewIcons()
    this.createEventCards()
    this.createEndRoundButton()
    this.updateTimeDisplay()
  }

  createStatsPanel(): void {
    // Wider, taller, and with larger font
    const panelWidth = 480,
      panelHeight = 250
    this.add.rectangle(32, 32, panelWidth, panelHeight, 0x222244, 0.94).setOrigin(0)

    const statY = (row: number) => 48 + row * 36
    const leftCol = 48,
      rightCol = 280

    const { name, age, health, looks, smarts, energy, emotional, status } = this.stats

    this.add.text(leftCol, statY(0), `Name:`, { fontSize: '28px', color: '#bbb' })
    this.add.text(leftCol + 120, statY(0), name, { fontSize: '28px', color: '#fff' })

    this.add.text(leftCol, statY(1), `Age:`, { fontSize: '24px', color: '#bbb' })
    this.add.text(leftCol + 120, statY(1), String(age), { fontSize: '24px', color: '#fff' })

    this.add.text(leftCol, statY(2), `Status:`, { fontSize: '24px', color: '#bbb' })
    this.add.text(leftCol + 120, statY(2), status, { fontSize: '24px', color: '#fff' })

    this.add.text(leftCol, statY(3), `Health:`, { fontSize: '24px', color: '#84fa9d' })
    this.add.text(leftCol + 120, statY(3), String(health), { fontSize: '24px', color: '#84fa9d' })

    this.add.text(rightCol, statY(3), `Looks:`, { fontSize: '24px', color: '#ffd580' })
    this.add.text(rightCol + 110, statY(3), String(looks), { fontSize: '24px', color: '#ffd580' })

    this.add.text(leftCol, statY(4), `Smarts:`, { fontSize: '24px', color: '#80bfff' })
    this.add.text(leftCol + 120, statY(4), String(smarts), { fontSize: '24px', color: '#80bfff' })

    this.add.text(rightCol, statY(4), `Energy:`, { fontSize: '24px', color: '#ffd6e0' })
    this.add.text(rightCol + 110, statY(4), String(energy), { fontSize: '24px', color: '#ffd6e0' })

    this.add.text(leftCol, statY(5), `Emotional:`, { fontSize: '24px', color: '#ffb7b2' })
    this.add.text(leftCol + 120, statY(5), String(emotional), {
      fontSize: '24px',
      color: '#ffb7b2',
    })
  }

  createActionButtons(): void {
    // Bigger buttons, more vertical space
    const startY = 320
    const buttonHeight = 64,
      buttonSpacing = 20,
      buttonWidth = 340
    const actions: ActionMenuItem[] = [
      {
        label: 'Social',
        y: startY + 0 * (buttonHeight + buttonSpacing),
        actions: ['See a Friend', 'Call Family'],
      },
      {
        label: 'Hobby',
        y: startY + 1 * (buttonHeight + buttonSpacing),
        actions: ['Watch Movie', 'Paint'],
      },
      {
        label: 'Self-Improvement',
        y: startY + 2 * (buttonHeight + buttonSpacing),
        actions: ['Dance Class', 'Read Book'],
      },
      {
        label: 'Work',
        y: startY + 3 * (buttonHeight + buttonSpacing),
        actions: ['Search Job', 'Work Overtime'],
      },
      {
        label: 'Studies',
        y: startY + 4 * (buttonHeight + buttonSpacing),
        actions: ['Study', 'Do Homework'],
      },
      {
        label: 'Shopping',
        y: startY + 5 * (buttonHeight + buttonSpacing),
        actions: ['Buy Furniture', 'Shop Clothes'],
      },
    ]

    this.actionMenus = {}

    actions.forEach((action) => {
      const btn = this.add
        .rectangle(240, action.y, buttonWidth, buttonHeight, 0x333366, 0.98)
        .setOrigin(0.5)
      const txt = this.add
        .text(240, action.y, action.label, { fontSize: '32px', color: '#fff', fontStyle: 'bold' })
        .setOrigin(0.5)
      btn
        .setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () =>
          this.toggleActionMenu(action.label, action.actions, action.y + buttonHeight / 2 + 12),
        )
      this.actionMenus[action.label] = null
    })
  }

  toggleActionMenu(label: string, actions: string[], y: number): void {
    if (this.actionMenus[label]) {
      this.actionMenus[label]?.forEach((item) => item.destroy())
      this.actionMenus[label] = null
      return
    }
    Object.values(this.actionMenus).forEach((menu) => menu?.forEach((item) => item.destroy()))
    Object.keys(this.actionMenus).forEach((k) => {
      this.actionMenus[k] = null
    })

    const menuItems: Phaser.GameObjects.GameObject[] = []
    actions.forEach((act, i) => {
      const btnY = y + i * 70
      const btn = this.add.rectangle(540, btnY, 320, 54, 0x444477, 0.98).setOrigin(0.5)
      const txt = this.add.text(540, btnY, act, { fontSize: '26px', color: '#fff' }).setOrigin(0.5)
      btn.setInteractive({ cursor: 'pointer' }).on('pointerdown', () => {
        this.handleAction(act)
        this.toggleActionMenu(label, actions, y)
      })
      menuItems.push(btn, txt)
    })
    this.actionMenus[label] = menuItems
  }

  handleAction(action: string): void {
    if (this.timeLeft <= 0) return
    this.timeLeft--
    this.updateTimeDisplay()
    this.showEventCard(`You chose to "${action}"!`)
  }

  createOverviewIcons(): void {
    // Large icons, spaced apart, right edge of screen
    const baseY = 64,
      spacing = 80,
      iconRadius = 36,
      labelOffset = 48
    const x = 1080
    const icons: OverviewIcon[] = [
      { label: 'Social', y: baseY + 0 * spacing },
      { label: 'Pets', y: baseY + 1 * spacing },
      { label: 'Belongings', y: baseY + 2 * spacing },
      { label: 'Job', y: baseY + 3 * spacing },
      { label: 'Studies', y: baseY + 4 * spacing },
      { label: 'Skills', y: baseY + 5 * spacing },
      { label: 'Health', y: baseY + 6 * spacing },
    ]
    icons.forEach((icon) => {
      // Add icon (circle)
      const circle = this.add.circle(x, icon.y, iconRadius, 0x92c9ff).setStrokeStyle(3, 0x446688)
      circle
        .setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () => this.showEventCard(`${icon.label} Overview (TODO)`))

      // Add label text
      const txt = this.add
        .text(x + labelOffset, icon.y, icon.label, { fontSize: '26px', color: '#fff' })
        .setOrigin(0, 0.5)
      txt
        .setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () => this.showEventCard(`${icon.label} Overview (TODO)`))
    })
  }

  createEventCards(): void {
    // Large card, higher position
    this.eventCard = this.add
      .rectangle(640, 170, 700, 170, 0x11112a, 0.98)
      .setOrigin(0.5)
      .setVisible(false)
    this.eventText = this.add
      .text(640, 170, '', { fontSize: '30px', color: '#fff', wordWrap: { width: 600 } })
      .setOrigin(0.5)
      .setVisible(false)
    this.cardCloseBtn = this.add
      .text(970, 100, '✖', { fontSize: '48px', color: '#ff9b9b' })
      .setInteractive({ cursor: 'pointer' })
      .setVisible(false)
      .on('pointerdown', () => this.hideEventCard())
  }

  showEventCard(text: string): void {
    this.eventCard.setVisible(true)
    this.eventText.setText(text).setVisible(true)
    this.cardCloseBtn.setVisible(true)
  }

  hideEventCard(): void {
    this.eventCard.setVisible(false)
    this.eventText.setVisible(false)
    this.cardCloseBtn.setVisible(false)
  }

  createEndRoundButton(): void {
    this.timeText = this.add.text(64, 700, '', { fontSize: '32px', color: '#fff' })
    this.endRoundBtn = this.add
      .rectangle(640, 650, 360, 64, 0x334a2c, 0.98)
      .setOrigin(0.5)
      .setVisible(false)
    this.endRoundText = this.add
      .text(640, 650, 'Conclude Life Round', { fontSize: '34px', color: '#fff' })
      .setOrigin(0.5)
      .setVisible(false)

    this.endRoundBtn
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => this.handleEndRound())
  }

  updateTimeDisplay(): void {
    this.timeText.setText(`Time left this round: ${this.timeLeft}`)
    const show = this.timeLeft === 0
    this.endRoundBtn.setVisible(show)
    this.endRoundText.setVisible(show)
  }

  handleEndRound(): void {
    this.timeLeft = 10
    this.updateTimeDisplay()
    this.showEventCard('A new round begins! Make the most of your time.')
  }
}
