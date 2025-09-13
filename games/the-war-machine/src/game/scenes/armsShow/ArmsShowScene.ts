import { GameObjects } from 'phaser'
import { PotatoScene } from '@potato-golem/ui'
import type { EventEmitter } from 'emitix'
import type { GlobalSceneEvents } from '@potato-golem/core'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import type { BusinessAgentModel } from '../../model/entities/BusinessAgentModel.ts'
import type { ArmsShowDefinition } from '../../model/definitions/armsShowsDefinitions.ts'
import type { Dependencies } from '../../model/diConfig.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { AgentStatus } from '../../model/enums/AgentEnums.ts'
import { ArmsManufacturer, manufacturerDetails } from '../../model/enums/ArmsManufacturer.ts'
import { VendorContactSelection } from './VendorContactSelection.ts'

export interface ArmsShowSceneData {
  agent: BusinessAgentModel
  armsShow: ArmsShowDefinition
}

export class ArmsShowScene extends PotatoScene {
  private worldModel: WorldModel
  private agent: BusinessAgentModel | null = null
  private armsShow: ArmsShowDefinition | null = null
  private actionPoints: number = 0
  private maxActionPoints: number = 0
  private actionButtons: GameObjects.Container[] = []
  private actionPointsText: GameObjects.Text | null = null
  private background: GameObjects.Graphics | null = null
  private sceneData: ArmsShowSceneData | null = null

  constructor({ worldModel, globalSceneEventEmitter }: Pick<Dependencies, 'worldModel' | 'globalSceneEventEmitter'>) {
    super(globalSceneEventEmitter, sceneRegistry.ARMS_SHOW_SCENE)
    this.worldModel = worldModel
  }

  init(data?: ArmsShowSceneData) {
    // Store the data passed from scene transition
    if (data) {
      this.sceneData = data
      this.agent = this.sceneData.agent
      this.armsShow = this.sceneData.armsShow
      // Base action points based on networking skill (1-10 skill = 2-6 action points)
      this.maxActionPoints = Math.floor(2 + (this.agent.skills.networking / 10) * 4)
      this.actionPoints = this.maxActionPoints
    }
  }

  create() {
    // Create background
    this.background = this.add.graphics()
    this.background.fillStyle(0x001122, 1)
    this.background.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height)

    // Title panel
    this.createTitlePanel()

    // Agent info panel
    this.createAgentInfoPanel()

    // Action points display
    this.createActionPointsDisplay()

    // Action menu
    this.createActionMenu()

    // Show details panel
    this.createShowDetailsPanel()
  }

  private createTitlePanel() {
    const titleBg = this.add.graphics()
    titleBg.fillStyle(0x002244, 0.9)
    titleBg.fillRoundedRect(50, 20, this.cameras.main.width - 100, 80, 10)
    titleBg.lineStyle(3, 0x00ffff, 1)
    titleBg.strokeRoundedRect(50, 20, this.cameras.main.width - 100, 80, 10)

    const titleText = this.add.text(this.cameras.main.width / 2, 60,
      `${this.armsShow?.name || 'ARMS SHOW'}`, {
      fontSize: '36px',
      fontFamily: 'Courier',
      color: '#ffff00',
      fontStyle: 'bold',
    })
    titleText.setOrigin(0.5)
  }

  private createAgentInfoPanel() {
    const panel = this.add.container(50, 120)

    const bg = this.add.graphics()
    bg.fillStyle(0x003366, 0.8)
    bg.fillRoundedRect(0, 0, 350, 150, 5)
    bg.lineStyle(2, 0x00ffff, 0.8)
    bg.strokeRoundedRect(0, 0, 350, 150, 5)
    panel.add(bg)

    const agentName = this.add.text(175, 20, `Agent: ${this.agent?.name}`, {
      fontSize: '22px',
      fontFamily: 'Courier',
      color: '#ffffff',
    })
    agentName.setOrigin(0.5)
    panel.add(agentName)

    const skills = [
      `Negotiation: ${this.agent?.skills.negotiation}/10`,
      `Networking: ${this.agent?.skills.networking}/10`,
      `Languages: ${this.agent?.skills.languages}/10`,
      `Finance: ${this.agent?.skills.finance}/10`,
    ]

    skills.forEach((skill, index) => {
      const skillText = this.add.text(20, 50 + index * 25, skill, {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: '#00ffff',
      })
      panel.add(skillText)
    })
  }

  private createActionPointsDisplay() {
    const panel = this.add.container(this.cameras.main.width - 250, 120)

    const bg = this.add.graphics()
    bg.fillStyle(0x440044, 0.8)
    bg.fillRoundedRect(0, 0, 200, 80, 5)
    bg.lineStyle(2, 0xff00ff, 0.8)
    bg.strokeRoundedRect(0, 0, 200, 80, 5)
    panel.add(bg)

    const apTitle = this.add.text(100, 20, 'ACTION POINTS', {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#ff00ff',
      fontStyle: 'bold',
    })
    apTitle.setOrigin(0.5)
    panel.add(apTitle)

    this.actionPointsText = this.add.text(100, 50, `${this.actionPoints} / ${this.maxActionPoints}`, {
      fontSize: '28px',
      fontFamily: 'Courier',
      color: '#ffffff',
    })
    this.actionPointsText.setOrigin(0.5)
    panel.add(this.actionPointsText)
  }

  private createActionMenu() {
    const menuX = this.cameras.main.width / 2
    const menuY = 350
    const buttonWidth = 700
    const buttonHeight = 50
    const buttonSpacing = 10

    const actions = [
      { id: 'vendors', label: '1. Establish connections with arms vendors', cost: 1 },
      { id: 'manufacturers', label: '2. Establish connections with manufacturers', cost: 1 },
      { id: 'buyers', label: '3. Search for potential buyers', cost: 1 },
      { id: 'intel', label: '4. Gather intel on vendors', cost: 1 },
      { id: 'mingle', label: '5. Mingle', cost: 1 },
      { id: 'espionage', label: '6. Industrial espionage', cost: 2 },
      { id: 'leave', label: '7. Leave the arms show', cost: 0 },
    ]

    actions.forEach((action, index) => {
      const button = this.add.container(menuX, menuY + index * (buttonHeight + buttonSpacing))

      const bg = this.add.graphics()
      const canAfford = this.actionPoints >= action.cost
      const isLeave = action.id === 'leave'

      bg.fillStyle(isLeave ? 0x660000 : (canAfford ? 0x004488 : 0x222222), 0.8)
      bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 5)
      bg.lineStyle(2, isLeave ? 0xff0000 : (canAfford ? 0x00ffff : 0x444444), 1)
      bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 5)
      button.add(bg)

      const labelText = this.add.text(-buttonWidth / 2 + 20, 0, action.label, {
        fontSize: '20px',
        fontFamily: 'Courier',
        color: canAfford || isLeave ? '#ffffff' : '#666666',
        align: 'left',
      })
      labelText.setOrigin(0, 0.5)
      button.add(labelText)

      if (action.cost > 0) {
        const costText = this.add.text(buttonWidth / 2 - 60, 0, `[${action.cost} AP]`, {
          fontSize: '18px',
          fontFamily: 'Courier',
          color: canAfford ? '#00ff00' : '#ff0000',
        })
        costText.setOrigin(0.5)
        button.add(costText)
      }

      if (canAfford || isLeave) {
        bg.setInteractive(
          new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight),
          Phaser.Geom.Rectangle.Contains
        )

        bg.on('pointerover', () => {
          bg.clear()
          bg.fillStyle(isLeave ? 0x880000 : 0x0066aa, 1)
          bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 5)
          bg.lineStyle(3, isLeave ? 0xff0000 : 0x00ffff, 1)
          bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 5)
        })

        bg.on('pointerout', () => {
          bg.clear()
          bg.fillStyle(isLeave ? 0x660000 : 0x004488, 0.8)
          bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 5)
          bg.lineStyle(2, isLeave ? 0xff0000 : 0x00ffff, 1)
          bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 5)
        })

        bg.on('pointerdown', () => {
          this.handleAction(action.id, action.cost)
        })
      }

      this.actionButtons.push(button)
      button.setData('action', action)
      button.setData('bg', bg)
    })
  }

  private createShowDetailsPanel() {
    const panel = this.add.container(50, this.cameras.main.height - 200)

    const bg = this.add.graphics()
    bg.fillStyle(0x002244, 0.8)
    bg.fillRoundedRect(0, 0, this.cameras.main.width - 100, 150, 5)
    bg.lineStyle(2, 0x00ffff, 0.5)
    bg.strokeRoundedRect(0, 0, this.cameras.main.width - 100, 150, 5)
    panel.add(bg)

    const showDetails = [
      `Location: ${this.armsShow?.country}`,
      `Prestige Level: ${this.armsShow?.prestigeLevel}/10`,
      `Entry Fee Paid: $${this.armsShow?.entranceFee.toLocaleString()}`,
      `Arms Branches Present: ${this.armsShow?.armsBranches.join(', ')}`,
    ]

    showDetails.forEach((detail, index) => {
      const detailText = this.add.text(20, 20 + index * 30, detail, {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: '#ffffff',
      })
      panel.add(detailText)
    })
  }

  private handleAction(actionId: string, cost: number) {
    if (actionId === 'leave') {
      this.returnToBoard()
      return
    }

    if (this.actionPoints < cost) {
      return
    }

    // Deduct action points
    this.actionPoints -= cost
    this.updateActionPointsDisplay()

    // Execute action
    this.executeAction(actionId)

    // Check if out of action points
    if (this.actionPoints === 0) {
      this.time.delayedCall(1000, () => {
        this.showOutOfActionsMessage()
      })
    }

    // Update button states
    this.updateActionButtons()
  }

  private executeAction(actionId: string) {
    // Show result message
    let message = ''
    switch (actionId) {
      case 'vendors':
        this.handleVendorConnection()
        return // Vendor connection has its own flow
      break
      case 'manufacturers':
        message = 'You made contact with component manufacturers.'
        // TODO: Add manufacturer connections
        break
      case 'buyers':
        message = 'You identified potential buyers for your inventory.'
        // TODO: Add buyer leads
        break
      case 'intel':
        message = 'You gathered valuable intelligence on vendor operations.'
        // TODO: Add intel to world model
        break
      case 'mingle':
        message = 'You mingled with other attendees, improving your reputation.'
        // TODO: Increase reputation
        break
      case 'espionage':
        message = 'You conducted covert intelligence gathering...'
        // TODO: Add special intel or risk consequences
        break
    }

    this.showActionResult(message)
  }

  private showActionResult(message: string) {
    const resultBg = this.add.graphics()
    resultBg.fillStyle(0x000000, 0.9)
    resultBg.fillRoundedRect(
      this.cameras.main.width / 2 - 400,
      this.cameras.main.height / 2 - 50,
      800, 100, 10
    )
    resultBg.lineStyle(2, 0x00ff00, 1)
    resultBg.strokeRoundedRect(
      this.cameras.main.width / 2 - 400,
      this.cameras.main.height / 2 - 50,
      800, 100, 10
    )
    resultBg.setDepth(DepthRegistry.TOAST)

    const resultText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      message, {
      fontSize: '24px',
      fontFamily: 'Courier',
      color: '#00ff00',
      align: 'center',
      wordWrap: { width: 750 },
    })
    resultText.setOrigin(0.5)
    resultText.setDepth(DepthRegistry.TOAST)

    this.time.delayedCall(2000, () => {
      resultBg.destroy()
      resultText.destroy()
    })
  }

  private showOutOfActionsMessage() {
    // Disable all action buttons except leave
    this.updateActionButtons()

    // Create semi-transparent overlay
    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.7)
    overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height)
    overlay.setDepth(DepthRegistry.MODAL - 1)

    const modal = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2)

    const bg = this.add.graphics()
    bg.fillStyle(0x000000, 0.95)
    bg.fillRoundedRect(-350, -120, 700, 240, 10)
    bg.lineStyle(3, 0xff0000, 1)
    bg.strokeRoundedRect(-350, -120, 700, 240, 10)
    modal.add(bg)

    const title = this.add.text(0, -70, 'OUT OF ACTION POINTS', {
      fontSize: '32px',
      fontFamily: 'Courier',
      color: '#ff0000',
      fontStyle: 'bold',
    })
    title.setOrigin(0.5)
    modal.add(title)

    const message = this.add.text(0, -20, 'You have exhausted your actions at the arms show.', {
      fontSize: '20px',
      fontFamily: 'Courier',
      color: '#ffffff',
      align: 'center',
    })
    message.setOrigin(0.5)
    modal.add(message)

    const submessage = this.add.text(0, 20, 'You must leave the arms show now.', {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#ffaa00',
      align: 'center',
    })
    submessage.setOrigin(0.5)
    modal.add(submessage)

    const returnButton = this.add.container(0, 80)
    const btnBg = this.add.graphics()
    btnBg.fillStyle(0x660000, 0.8)
    btnBg.fillRoundedRect(-100, -20, 200, 40, 5)
    btnBg.lineStyle(2, 0xff0000, 1)
    btnBg.strokeRoundedRect(-100, -20, 200, 40, 5)
    returnButton.add(btnBg)

    const btnText = this.add.text(0, 0, 'LEAVE ARMS SHOW', {
      fontSize: '20px',
      fontFamily: 'Courier',
      color: '#ffffff',
    })
    btnText.setOrigin(0.5)
    returnButton.add(btnText)

    modal.add(returnButton)
    modal.setDepth(DepthRegistry.MODAL)

    btnBg.setInteractive(
      new Phaser.Geom.Rectangle(-100, -20, 200, 40),
      Phaser.Geom.Rectangle.Contains
    )

    btnBg.on('pointerover', () => {
      btnBg.clear()
      btnBg.fillStyle(0x880000, 1)
      btnBg.fillRoundedRect(-100, -20, 200, 40, 5)
      btnBg.lineStyle(3, 0xff0000, 1)
      btnBg.strokeRoundedRect(-100, -20, 200, 40, 5)
    })

    btnBg.on('pointerout', () => {
      btnBg.clear()
      btnBg.fillStyle(0x660000, 0.8)
      btnBg.fillRoundedRect(-100, -20, 200, 40, 5)
      btnBg.lineStyle(2, 0xff0000, 1)
      btnBg.strokeRoundedRect(-100, -20, 200, 40, 5)
    })

    btnBg.on('pointerdown', () => {
      this.returnToBoard()
    })
  }

  private updateActionPointsDisplay() {
    if (this.actionPointsText) {
      this.actionPointsText.setText(`${this.actionPoints} / ${this.maxActionPoints}`)

      // Change color based on remaining points
      if (this.actionPoints === 0) {
        this.actionPointsText.setColor('#ff0000')
      } else if (this.actionPoints <= 2) {
        this.actionPointsText.setColor('#ffff00')
      }
    }
  }

  private updateActionButtons(forceDisableActions: boolean = false) {
    this.actionButtons.forEach(button => {
      const action = button.getData('action')
      const bg = button.getData('bg') as GameObjects.Graphics

      if (action && bg) {
        const canAfford = this.actionPoints >= action.cost && !forceDisableActions
        const isLeave = action.id === 'leave'
        const buttonWidth = 700

        // Clear and redraw based on new state
        bg.clear()
        bg.fillStyle(isLeave ? 0x660000 : (canAfford ? 0x004488 : 0x222222), 0.8)
        bg.fillRoundedRect(-buttonWidth / 2, -25, buttonWidth, 50, 5)
        bg.lineStyle(2, isLeave ? 0xff0000 : (canAfford ? 0x00ffff : 0x444444), 1)
        bg.strokeRoundedRect(-buttonWidth / 2, -25, buttonWidth, 50, 5)

        // Update interactivity
        if (!canAfford && !isLeave) {
          bg.removeInteractive()
          bg.removeAllListeners()
        }

        // Update text colors
        const texts = button.list.filter(item => item instanceof GameObjects.Text) as GameObjects.Text[]
        texts.forEach(text => {
          if (text.text.includes('AP]')) {
            text.setColor(canAfford ? '#00ff00' : '#ff0000')
          } else {
            text.setColor(canAfford || isLeave ? '#ffffff' : '#666666')
          }
        })
      }
    })
  }

  private handleVendorConnection() {
    if (!this.armsShow) return

    // Hide action buttons during selection
    this.actionButtons.forEach(button => button.setVisible(false))

    // Get eligible manufacturers based on prestige level
    const eligibleManufacturers = this.getEligibleManufacturers()

    // Filter out already known contacts
    const newManufacturers = eligibleManufacturers.filter(
      m => !this.worldModel.hasVendorContact(m)
    )

    // Pick 3 random manufacturers from the eligible list
    const selectedVendors = this.selectRandomVendors(newManufacturers, 3)

    // Show selection UI
    const selection = new VendorContactSelection(
      this,
      selectedVendors,
      (manufacturer) => {
        // Show action buttons again
        this.actionButtons.forEach(button => button.setVisible(true))

        if (manufacturer) {
          const added = this.worldModel.addVendorContact(manufacturer)
          if (added) {
            const info = manufacturerDetails[manufacturer]
            this.showActionResult(`You established contact with ${info.displayName}!\nPrestige: ${'★'.repeat(info.prestigeLevel)}`)
          }
        } else {
          this.showActionResult('You failed to establish any new vendor contacts.')
        }
      }
    )
  }

  private getEligibleManufacturers(): ArmsManufacturer[] {
    if (!this.armsShow || !this.agent) return []

    const showPrestige = this.armsShow.prestigeLevel
    const networkingSkill = this.agent.skills.networking
    const eligible: ArmsManufacturer[] = []

    // Calculate chance for higher level vendor (based on networking skill)
    const higherLevelChance = 0.05 + (networkingSkill / 10) * 0.15 // 5% to 20% based on skill
    const rollHigher = Math.random() < higherLevelChance

    Object.values(ArmsManufacturer).forEach(manufacturer => {
      const info = manufacturerDetails[manufacturer]

      // Include manufacturers at show prestige level or one below
      if (info.prestigeLevel === showPrestige || info.prestigeLevel === showPrestige - 1) {
        eligible.push(manufacturer)
      }

      // Rarely include one level higher
      if (rollHigher && info.prestigeLevel === showPrestige + 1) {
        eligible.push(manufacturer)
      }
    })

    return eligible
  }

  private selectRandomVendors(vendors: ArmsManufacturer[], count: number): ArmsManufacturer[] {
    if (vendors.length <= count) return vendors

    const selected: ArmsManufacturer[] = []
    const available = [...vendors]

    for (let i = 0; i < count && available.length > 0; i++) {
      const index = Math.floor(Math.random() * available.length)
      selected.push(available[index])
      available.splice(index, 1)
    }

    return selected
  }

  private returnToBoard() {
    // Mark agent as available again after attending the show
    if (this.agent) {
      this.agent.status = AgentStatus.AVAILABLE
    }

    // Stop this scene and wake the sleeping BoardScene
    this.scene.stop()
    this.scene.wake(sceneRegistry.BOARD_SCENE)
  }
}