import { GameObjects } from 'phaser'
import type { PotatoScene } from '@potato-golem/ui'
import type { BusinessAgentModel } from '../../../../model/entities/BusinessAgentModel.ts'
import { imageRegistry } from '../../../../registries/imageRegistry.ts'

export interface AgentSelectionContext {
  title: string
  description?: string
  costCalculator?: (agent: BusinessAgentModel) => number
  canSelectValidator?: (agent: BusinessAgentModel, availableCash: number) => boolean
  detailsPanel?: GameObjects.Container // Optional custom details panel
}

export class BusinessAgentSelector extends GameObjects.Container {
  private background: GameObjects.Graphics
  private titleText: GameObjects.Text
  private closeButton: GameObjects.Text
  private portraitSlots: GameObjects.Container[] = []
  private selectedAgent: BusinessAgentModel | null = null
  private confirmButton: GameObjects.Container | null = null
  private agentDetailsPanel: GameObjects.Container | null = null
  private contextPanel: GameObjects.Container | null = null

  private context: AgentSelectionContext
  private availableCash: number
  private onConfirmCallback: (agent: BusinessAgentModel) => void
  private onCancelCallback?: () => void

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    agents: BusinessAgentModel[],
    context: AgentSelectionContext,
    availableCash: number,
    onConfirm: (agent: BusinessAgentModel) => void,
    onCancel?: () => void,
  ) {
    super(scene, x, y)
    this.context = context
    this.availableCash = availableCash
    this.onConfirmCallback = onConfirm
    this.onCancelCallback = onCancel

    // Create background
    this.background = scene.add.graphics()
    this.background.fillStyle(0x000000, 0.95)
    this.background.strokeRoundedRect(-400, -350, 800, 700, 10)
    this.background.fillRoundedRect(-400, -350, 800, 700, 10)
    this.background.lineStyle(3, 0x00ffff, 1)
    this.background.strokeRoundedRect(-400, -350, 800, 700, 10)
    this.add(this.background)

    // Title
    this.titleText = scene.add.text(0, -320, context.title || 'SELECT AGENT', {
      fontSize: '32px',
      fontFamily: 'Courier',
      color: '#00ffff',
      align: 'center',
    })
    this.titleText.setOrigin(0.5)
    this.add(this.titleText)

    // Close button
    this.closeButton = scene.add.text(370, -330, 'X', {
      fontSize: '32px',
      fontFamily: 'Courier',
      color: '#ff0000',
      padding: { x: 5, y: 5 },
    })
    this.closeButton.setInteractive({ useHandCursor: true })
    this.closeButton.on('pointerover', () => this.closeButton.setColor('#ff4444'))
    this.closeButton.on('pointerout', () => this.closeButton.setColor('#ff0000'))
    this.closeButton.on('pointerdown', () => this.close())
    this.add(this.closeButton)

    // Add context panel if provided - positioned higher to avoid overlap
    if (context.detailsPanel) {
      this.contextPanel = context.detailsPanel
      this.contextPanel.setPosition(0, -220)
      this.add(this.contextPanel)
    } else if (context.description) {
      // Create simple description panel
      this.createDescriptionPanel(scene, context.description)
    }

    // Create portrait slots
    this.createPortraitSlots(scene, agents)

    // Add to scene
    scene.add.existing(this)
    this.setDepth(2000)
  }

  private createDescriptionPanel(scene: PotatoScene, description: string) {
    this.contextPanel = scene.add.container(0, -220)

    const panelBg = scene.add.graphics()
    panelBg.fillStyle(0x002244, 0.8)
    panelBg.fillRoundedRect(-395, -40, 790, 80, 5)
    panelBg.lineStyle(2, 0x00ffff, 0.5)
    panelBg.strokeRoundedRect(-395, -40, 790, 80, 5)
    this.contextPanel.add(panelBg)

    const descText = scene.add.text(0, 0, description, {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 750 },
    })
    descText.setOrigin(0.5)
    this.contextPanel.add(descText)

    this.add(this.contextPanel)
  }

  private createPortraitSlots(scene: PotatoScene, agents: BusinessAgentModel[]) {
    const slotWidth = 120
    const slotHeight = 150
    const spacing = 10
    const startX = -250
    const startY = 50

    // Create 6 slots (max agents)
    for (let i = 0; i < 6; i++) {
      const slotX = startX + (i % 3) * (slotWidth + spacing)
      const slotY = startY + Math.floor(i / 3) * (slotHeight + spacing)

      const slot = scene.add.container(slotX, slotY)

      // Slot background
      const slotBg = scene.add.graphics()
      if (i < agents.length) {
        // Filled slot
        slotBg.fillStyle(0x004488, 0.6)
        slotBg.lineStyle(2, 0x00ffff, 1)
      } else {
        // Empty slot
        slotBg.fillStyle(0x222222, 0.3)
        slotBg.lineStyle(2, 0x444444, 0.5)
      }
      slotBg.fillRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 5)
      slotBg.strokeRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 5)
      slot.add(slotBg)

      if (i < agents.length) {
        const agent = agents[i]

        // Portrait (using rocket image as placeholder)
        const portrait = scene.add.sprite(0, -20, imageRegistry.ROCKET)
        portrait.setScale(0.8)
        portrait.setTint(agent.isPlayer ? 0xffff00 : 0xffffff)
        slot.add(portrait)

        // Agent name
        const nameText = scene.add.text(0, 40, agent.name, {
          fontSize: '14px',
          fontFamily: 'Courier',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: slotWidth - 10 },
        })
        nameText.setOrigin(0.5)
        slot.add(nameText)

        // Status indicator
        const statusText = scene.add.text(0, 58, agent.status.toUpperCase(), {
          fontSize: '12px',
          fontFamily: 'Courier',
          color: agent.status === 'available' ? '#00ff00' : '#ff0000',
          align: 'center',
        })
        statusText.setOrigin(0.5)
        slot.add(statusText)

        // Check if agent can be selected
        const canSelect = agent.status === 'available' &&
          (!this.context.canSelectValidator || this.context.canSelectValidator(agent, this.availableCash))

        // Make slot interactive if agent can be selected
        if (canSelect) {
          slotBg.setInteractive(
            new Phaser.Geom.Rectangle(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight),
            Phaser.Geom.Rectangle.Contains,
          )

          slotBg.on('pointerover', () => {
            slotBg.clear()
            slotBg.fillStyle(0x0066aa, 0.8)
            slotBg.lineStyle(3, 0x00ffff, 1)
            slotBg.fillRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 5)
            slotBg.strokeRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 5)
          })

          slotBg.on('pointerout', () => {
            if (this.selectedAgent !== agent) {
              slotBg.clear()
              slotBg.fillStyle(0x004488, 0.6)
              slotBg.lineStyle(2, 0x00ffff, 1)
              slotBg.fillRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 5)
              slotBg.strokeRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 5)
            }
          })

          slotBg.on('pointerdown', () => {
            this.selectAgent(agent, slot, slotBg, slotWidth, slotHeight, agents)
          })
        } else if (agent.status !== 'available') {
          // Show why agent can't be selected
          statusText.setColor('#ff0000')
        }
      } else {
        // Empty slot label
        const emptyText = scene.add.text(0, 0, 'LOCKED', {
          fontSize: '18px',
          fontFamily: 'Courier',
          color: '#666666',
          align: 'center',
        })
        emptyText.setOrigin(0.5)
        slot.add(emptyText)
      }

      this.portraitSlots.push(slot)
      this.add(slot)
    }
  }

  private selectAgent(
    agent: BusinessAgentModel,
    slot: GameObjects.Container,
    slotBg: GameObjects.Graphics,
    slotWidth: number,
    slotHeight: number,
    agents: BusinessAgentModel[],
  ) {
    // Clear previous selection
    this.portraitSlots.forEach((s, index) => {
      const bg = s.list[0] as GameObjects.Graphics
      if (bg && bg !== slotBg && index < agents.length) {
        const slotAgent = agents[index]
        if (slotAgent && slotAgent.status === 'available') {
          bg.clear()
          bg.fillStyle(0x004488, 0.6)
          bg.lineStyle(2, 0x00ffff, 1)
          bg.fillRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 5)
          bg.strokeRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 5)
        }
      }
    })

    // Highlight selected slot
    slotBg.clear()
    slotBg.fillStyle(0x00ff00, 0.4)
    slotBg.lineStyle(3, 0x00ff00, 1)
    slotBg.fillRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 5)
    slotBg.strokeRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 5)

    this.selectedAgent = agent

    // Show agent details
    this.showAgentDetails(agent)

    // Show confirm button if not already shown
    if (!this.confirmButton) {
      this.createConfirmButton()
    } else {
      this.updateConfirmButton()
    }
  }

  private showAgentDetails(agent: BusinessAgentModel) {
    const scene = this.scene

    // Remove existing details panel
    if (this.agentDetailsPanel) {
      this.agentDetailsPanel.destroy()
    }

    this.agentDetailsPanel = scene.add.container(250, 80)

    // Background
    const bg = scene.add.graphics()
    bg.fillStyle(0x003366, 0.9)
    bg.fillRoundedRect(-165, -120, 330, 240, 5)
    bg.lineStyle(2, 0x00ffff, 1)
    bg.strokeRoundedRect(-165, -120, 330, 240, 5)
    this.agentDetailsPanel.add(bg)

    // Agent name
    const nameText = scene.add.text(0, -100, agent.name, {
      fontSize: '22px',
      fontFamily: 'Courier',
      color: '#ffff00',
      align: 'center',
    })
    nameText.setOrigin(0.5)
    this.agentDetailsPanel.add(nameText)

    // Left column - Skills
    const skillsTitle = scene.add.text(-145, -70, 'SKILLS', {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#00ffff',
      fontStyle: 'bold',
    })
    this.agentDetailsPanel.add(skillsTitle)

    const skillsList = [
      `Negotiation: ${agent.skills.negotiation}/10`,
      `Networking: ${agent.skills.networking}/10`,
      `Languages: ${agent.skills.languages}/10`,
      `Finance: ${agent.skills.finance}/10`,
    ]

    skillsList.forEach((skill, index) => {
      const skillText = scene.add.text(-145, -40 + index * 25, skill, {
        fontSize: '16px',
        fontFamily: 'Courier',
        color: '#ffffff',
      })
      this.agentDetailsPanel!.add(skillText)
    })

    // Right column - Agent info
    const infoTitle = scene.add.text(40, -70, 'INFO', {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#00ffff',
      fontStyle: 'bold',
    })
    this.agentDetailsPanel.add(infoTitle)

    const infoList = [
      `Age: ${agent.age}`,
      `Nationality: ${agent.nationality}`,
      `Loyalty: ${agent.loyalty}%`,
      agent.isPlayer ? 'YOU' : `Salary: $${agent.salary.toLocaleString()}/yr`,
    ]

    infoList.forEach((info, index) => {
      const infoText = scene.add.text(40, -40 + index * 25, info, {
        fontSize: '16px',
        fontFamily: 'Courier',
        color: '#ffffff',
      })
      this.agentDetailsPanel!.add(infoText)
    })

    // Cost if calculator provided
    if (this.context.costCalculator) {
      const cost = this.context.costCalculator(agent)
      const costText = scene.add.text(0, 95, `Cost: $${cost.toLocaleString()}`, {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: this.availableCash >= cost ? '#00ff00' : '#ff0000',
        align: 'center',
      })
      costText.setOrigin(0.5)
      this.agentDetailsPanel.add(costText)
    }

    this.add(this.agentDetailsPanel)
  }

  private createConfirmButton() {
    const scene = this.scene
    this.confirmButton = scene.add.container(0, 310)

    const buttonBg = scene.add.graphics()
    this.confirmButton.add(buttonBg)

    const buttonText = scene.add.text(0, 0, 'CONFIRM', {
      fontSize: '20px',
      fontFamily: 'Courier',
      color: '#ffffff',
      align: 'center',
    })
    buttonText.setOrigin(0.5)
    this.confirmButton.add(buttonText)

    this.confirmButton.setData('bg', buttonBg)
    this.confirmButton.setData('text', buttonText)

    this.updateConfirmButton()
    this.add(this.confirmButton)
  }

  private updateConfirmButton() {
    if (!this.confirmButton || !this.selectedAgent) return

    const buttonBg = this.confirmButton.getData('bg') as GameObjects.Graphics
    const buttonText = this.confirmButton.getData('text') as GameObjects.Text

    const cost = this.context.costCalculator ? this.context.costCalculator(this.selectedAgent) : 0
    const canAfford = this.availableCash >= cost
    const canConfirm = canAfford && (!this.context.canSelectValidator ||
      this.context.canSelectValidator(this.selectedAgent, this.availableCash))

    buttonBg.clear()
    buttonBg.fillStyle(canConfirm ? 0x00aa00 : 0x444444, 0.8)
    buttonBg.fillRoundedRect(-100, -20, 200, 40, 5)
    buttonBg.lineStyle(2, canConfirm ? 0x00ff00 : 0x666666, 1)
    buttonBg.strokeRoundedRect(-100, -20, 200, 40, 5)

    buttonText.setColor(canConfirm ? '#ffffff' : '#666666')

    // Remove previous listeners
    buttonBg.removeAllListeners()

    if (canConfirm) {
      buttonBg.setInteractive(new Phaser.Geom.Rectangle(-100, -20, 200, 40), Phaser.Geom.Rectangle.Contains)

      buttonBg.on('pointerover', () => {
        buttonBg.clear()
        buttonBg.fillStyle(0x00cc00, 1)
        buttonBg.fillRoundedRect(-100, -20, 200, 40, 5)
        buttonBg.lineStyle(3, 0x00ff00, 1)
        buttonBg.strokeRoundedRect(-100, -20, 200, 40, 5)
      })

      buttonBg.on('pointerout', () => {
        buttonBg.clear()
        buttonBg.fillStyle(0x00aa00, 0.8)
        buttonBg.fillRoundedRect(-100, -20, 200, 40, 5)
        buttonBg.lineStyle(2, 0x00ff00, 1)
        buttonBg.strokeRoundedRect(-100, -20, 200, 40, 5)
      })

      buttonBg.on('pointerdown', () => {
        if (this.selectedAgent) {
          this.onConfirmCallback(this.selectedAgent)
          this.close()
        }
      })
    }
  }

  private close() {
    if (this.onCancelCallback) {
      this.onCancelCallback()
    }
    this.destroy()
  }
}