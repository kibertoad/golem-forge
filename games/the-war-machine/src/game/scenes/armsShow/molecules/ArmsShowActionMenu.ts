import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'

export interface ArmsShowAction {
  id: string
  label: string
  cost: number
}

export class ArmsShowActionMenu extends GameObjects.Container {
  private actionButtons: GameObjects.Container[] = []
  private actions: ArmsShowAction[]
  private onActionCallback: (actionId: string, cost: number) => void

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    actions: ArmsShowAction[],
    onAction: (actionId: string, cost: number) => void,
  ) {
    super(scene, x, y)
    this.actions = actions
    this.onActionCallback = onAction

    this.createActionButtons(scene)
    scene.add.existing(this)
  }

  private createActionButtons(scene: PotatoScene) {
    const buttonWidth = 700
    const buttonHeight = 50
    const buttonSpacing = 10

    this.actions.forEach((action, index) => {
      const buttonY = index * (buttonHeight + buttonSpacing)
      const button = this.createButton(scene, 0, buttonY, action, buttonWidth, buttonHeight)
      this.actionButtons.push(button)
      this.add(button)
    })
  }

  private createButton(
    scene: PotatoScene,
    x: number,
    y: number,
    action: ArmsShowAction,
    width: number,
    height: number,
  ): GameObjects.Container {
    const button = scene.add.container(x, y)

    const bg = scene.add.graphics()
    const isLeave = action.id === 'leave'

    // Store action data
    button.setData('action', action)
    button.setData('bg', bg)
    button.setData('enabled', true)

    // Initial draw
    this.drawButton(bg, width, height, true, isLeave)

    // Label text
    const labelText = scene.add.text(-width / 2 + 20, 0, action.label, {
      fontSize: '20px',
      fontFamily: 'Courier',
      color: '#ffffff',
      align: 'left',
    })
    labelText.setOrigin(0, 0.5)
    button.add(labelText)
    button.setData('labelText', labelText)

    // Cost text
    if (action.cost > 0) {
      const costText = scene.add.text(width / 2 - 60, 0, `[${action.cost} AP]`, {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: '#00ff00',
      })
      costText.setOrigin(0.5)
      button.add(costText)
      button.setData('costText', costText)
    }

    // Make interactive
    this.setupButtonInteraction(bg, width, height, action, isLeave)

    button.add(bg)
    bg.setDepth(-1) // Put background behind text

    return button
  }

  private drawButton(
    bg: GameObjects.Graphics,
    width: number,
    height: number,
    enabled: boolean,
    isLeave: boolean,
    hover: boolean = false,
  ) {
    bg.clear()

    if (isLeave) {
      bg.fillStyle(hover ? 0x880000 : 0x660000, hover ? 1 : 0.8)
      bg.lineStyle(hover ? 3 : 2, 0xff0000, 1)
    } else if (enabled) {
      bg.fillStyle(hover ? 0x0066aa : 0x004488, hover ? 1 : 0.8)
      bg.lineStyle(hover ? 3 : 2, 0x00ffff, 1)
    } else {
      bg.fillStyle(0x222222, 0.8)
      bg.lineStyle(2, 0x444444, 1)
    }

    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 5)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 5)
  }

  private setupButtonInteraction(
    bg: GameObjects.Graphics,
    width: number,
    height: number,
    action: ArmsShowAction,
    isLeave: boolean,
  ) {
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains,
    )

    bg.on('pointerover', () => {
      const button = bg.parentContainer
      if (button?.getData('enabled')) {
        this.drawButton(bg, width, height, true, isLeave, true)
      }
    })

    bg.on('pointerout', () => {
      const button = bg.parentContainer
      if (button?.getData('enabled')) {
        this.drawButton(bg, width, height, true, isLeave, false)
      }
    })

    bg.on('pointerdown', () => {
      const button = bg.parentContainer
      if (button?.getData('enabled')) {
        this.onActionCallback(action.id, action.cost)
      }
    })
  }

  updateButtonStates(actionPoints: number, forceDisableActions: boolean = false) {
    this.actionButtons.forEach((button) => {
      const action = button.getData('action') as ArmsShowAction
      const bg = button.getData('bg') as GameObjects.Graphics
      const labelText = button.getData('labelText') as GameObjects.Text
      const costText = button.getData('costText') as GameObjects.Text

      if (action && bg) {
        const isLeave = action.id === 'leave'
        const canAfford = actionPoints >= action.cost && !forceDisableActions
        const enabled = canAfford || isLeave

        button.setData('enabled', enabled)

        // Redraw button
        this.drawButton(bg, 700, 50, enabled, isLeave)

        // Update interactivity
        if (!enabled) {
          bg.removeAllListeners('pointerover')
          bg.removeAllListeners('pointerout')
          bg.removeAllListeners('pointerdown')
        } else if (!bg.listenerCount('pointerdown')) {
          this.setupButtonInteraction(bg, 700, 50, action, isLeave)
        }

        // Update text colors
        if (labelText) {
          labelText.setColor(enabled ? '#ffffff' : '#666666')
        }
        if (costText) {
          costText.setColor(canAfford ? '#00ff00' : '#ff0000')
        }
      }
    })
  }

  showButtons() {
    this.setVisible(true)
  }

  hideButtons() {
    this.setVisible(false)
  }
}
