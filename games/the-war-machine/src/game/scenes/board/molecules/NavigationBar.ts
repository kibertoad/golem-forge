import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'

export enum NavigationState {
  STOCK = 'stock',
  RESEARCH = 'research',
  PRODUCTION = 'production',
  CONTACTS = 'contacts',
  BAZAAR = 'bazaar',
  PERSONNEL = 'personnel',
  ASSETS = 'assets',
}

interface NavButton {
  state: NavigationState
  label: string
  icon?: string
  y: number
  button: GameObjects.Container
}

export class NavigationBar extends GameObjects.Container {
  private background: GameObjects.Rectangle
  private buttons: Map<NavigationState, NavButton> = new Map()
  private activeState: NavigationState | null = null

  constructor(scene: PotatoScene, x: number, y: number) {
    super(scene, x, y)

    this.background = scene.add.rectangle(0, 0, 140, 600, 0x1a1a1a, 0.95)
    this.background.setStrokeStyle(2, 0x3a3a3a)
    this.add(this.background)

    const navItems = [
      { state: NavigationState.STOCK, label: 'Stock', icon: '📦' },
      { state: NavigationState.RESEARCH, label: 'Research', icon: '🔬' },
      { state: NavigationState.PRODUCTION, label: 'Production', icon: '🏭' },
      { state: NavigationState.CONTACTS, label: 'Contacts', icon: '📞' },
      { state: NavigationState.BAZAAR, label: 'Bazaar', icon: '🛒' },
      { state: NavigationState.PERSONNEL, label: 'Personnel', icon: '👥' },
      { state: NavigationState.ASSETS, label: 'Assets', icon: '💼' },
    ]

    navItems.forEach((item, index) => {
      const buttonY = -250 + index * 90
      const button = this.createNavButton(scene, item.state, item.label, item.icon, buttonY)
      this.buttons.set(item.state, {
        state: item.state,
        label: item.label,
        icon: item.icon,
        y: buttonY,
        button,
      })
    })

    scene.add.existing(this)
  }

  private createNavButton(
    scene: PotatoScene,
    state: NavigationState,
    label: string,
    icon: string | undefined,
    y: number,
  ): GameObjects.Container {
    const button = scene.add.container(0, y)

    const bg = scene.add.rectangle(0, 0, 120, 85, 0x2a2a2a, 0.8)
    bg.setStrokeStyle(1, 0x4a4a4a)
    bg.setInteractive()
    button.add(bg)

    if (icon) {
      const iconText = scene.add.text(0, -20, icon, {
        fontSize: '32px',
      })
      iconText.setOrigin(0.5)
      button.add(iconText)
    }

    const labelText = scene.add.text(0, 20, label, {
      fontSize: '18px',
      color: '#cccccc',
    })
    labelText.setOrigin(0.5)
    button.add(labelText)

    bg.on('pointerover', () => {
      if (this.activeState !== state) {
        bg.setFillStyle(0x3a3a3a, 0.9)
        labelText.setColor('#ffffff')
      }
    })

    bg.on('pointerout', () => {
      if (this.activeState !== state) {
        bg.setFillStyle(0x2a2a2a, 0.8)
        labelText.setColor('#cccccc')
      }
    })

    bg.on('pointerdown', () => {
      this.setActiveState(state)
      this.emit('navigation-changed', state)
    })

    this.add(button)
    return button
  }

  setActiveState(state: NavigationState) {
    this.buttons.forEach((navButton, navState) => {
      const bg = navButton.button.list[0] as GameObjects.Rectangle
      const labelText = navButton.button.list[navButton.button.list.length - 1] as GameObjects.Text

      if (navState === state) {
        bg.setFillStyle(0x4a4a4a, 1)
        bg.setStrokeStyle(2, 0x6a6a6a)
        labelText.setColor('#ffffff')
      } else {
        bg.setFillStyle(0x2a2a2a, 0.8)
        bg.setStrokeStyle(1, 0x4a4a4a)
        labelText.setColor('#cccccc')
      }
    })

    this.activeState = state
  }

  getActiveState(): NavigationState | null {
    return this.activeState
  }
}
