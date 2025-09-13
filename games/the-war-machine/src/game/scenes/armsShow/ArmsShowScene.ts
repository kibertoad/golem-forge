import { PotatoScene } from '@potato-golem/ui'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import type { BusinessAgentModel } from '../../model/entities/BusinessAgentModel.ts'
import type { ArmsShowDefinition } from '../../model/definitions/armsShowsDefinitions.ts'
import type { Dependencies } from '../../model/diConfig.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { AgentStatus } from '../../model/enums/AgentEnums.ts'
import { ArmsManufacturer, manufacturerDetails } from '../../model/enums/ArmsManufacturer.ts'

// Molecules
import { VendorContactSelection } from './molecules/VendorContactSelection.ts'
import { AgentInfoPanel } from './molecules/AgentInfoPanel.ts'
import { ActionPointsDisplay } from './molecules/ActionPointsDisplay.ts'
import { ShowDetailsPanel } from './molecules/ShowDetailsPanel.ts'
import { ArmsShowActionMenu, type ArmsShowAction } from './molecules/ArmsShowActionMenu.ts'
import * as Phaser from 'phaser'

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
  private sceneData: ArmsShowSceneData | null = null

  // UI Molecules
  private agentInfoPanel: AgentInfoPanel | null = null
  private actionPointsDisplay: ActionPointsDisplay | null = null
  private showDetailsPanel: ShowDetailsPanel | null = null
  private actionMenu: ArmsShowActionMenu | null = null

  constructor({ worldModel, globalSceneEventEmitter }: Pick<Dependencies, 'worldModel' | 'globalSceneEventEmitter'>) {
    super(globalSceneEventEmitter, sceneRegistry.ARMS_SHOW_SCENE)
    this.worldModel = worldModel
  }

  init(data?: ArmsShowSceneData) {
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
    if (!this.agent || !this.armsShow) return

    // Create background
    const bg = this.add.graphics()
    bg.fillStyle(0x001122, 1)
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height)

    // Title panel
    this.createTitlePanel()

    // Create UI molecules
    this.agentInfoPanel = new AgentInfoPanel(this, 50, 120, this.agent)

    this.actionPointsDisplay = new ActionPointsDisplay(
      this,
      this.cameras.main.width - 250,
      120,
      this.actionPoints,
      this.maxActionPoints
    )

    const actions: ArmsShowAction[] = [
      { id: 'vendors', label: '1. Establish connections with arms vendors', cost: 1 },
      { id: 'manufacturers', label: '2. Establish connections with manufacturers', cost: 1 },
      { id: 'buyers', label: '3. Search for potential buyers', cost: 1 },
      { id: 'intel', label: '4. Gather intel on vendors', cost: 1 },
      { id: 'mingle', label: '5. Mingle', cost: 1 },
      { id: 'espionage', label: '6. Industrial espionage', cost: 2 },
      { id: 'leave', label: '7. Leave the arms show', cost: 0 },
    ]

    this.actionMenu = new ArmsShowActionMenu(
      this,
      this.cameras.main.width / 2,
      350,
      actions,
      (actionId, cost) => this.handleAction(actionId, cost)
    )

    this.showDetailsPanel = new ShowDetailsPanel(
      this,
      50,
      this.cameras.main.height - 200,
      this.cameras.main.width - 100,
      this.armsShow
    )
  }

  private createTitlePanel() {
    const titleBg = this.add.graphics()
    titleBg.fillStyle(0x002244, 0.9)
    titleBg.fillRoundedRect(50, 20, this.cameras.main.width - 100, 80, 10)
    titleBg.lineStyle(3, 0x00ffff, 1)
    titleBg.strokeRoundedRect(50, 20, this.cameras.main.width - 100, 80, 10)

    const titleText = this.add.text(
      this.cameras.main.width / 2,
      60,
      `${this.armsShow?.name || 'ARMS SHOW'}`,
      {
        fontSize: '36px',
        fontFamily: 'Courier',
        color: '#ffff00',
        fontStyle: 'bold',
      }
    )
    titleText.setOrigin(0.5)
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
    let message = ''
    switch (actionId) {
      case 'vendors':
        this.handleVendorConnection()
        return // Vendor connection has its own flow
      case 'manufacturers':
        message = 'You made contact with component manufacturers.'
        break
      case 'buyers':
        message = 'You identified potential buyers for your inventory.'
        break
      case 'intel':
        message = 'You gathered valuable intelligence on vendor operations.'
        break
      case 'mingle':
        message = 'You mingled with other attendees, improving your reputation.'
        break
      case 'espionage':
        message = 'You conducted covert intelligence gathering...'
        break
    }

    this.showActionResult(message)
  }

  private handleVendorConnection() {
    if (!this.armsShow) return

    // Hide action menu during selection
    if (this.actionMenu) {
      this.actionMenu.hideButtons()
    }

    // Get eligible manufacturers
    const eligibleManufacturers = this.getEligibleManufacturers()
    const newManufacturers = eligibleManufacturers.filter(
      m => !this.worldModel.hasVendorContact(m)
    )
    const selectedVendors = this.selectRandomVendors(newManufacturers, 3)

    // Show selection UI
    const selection = new VendorContactSelection(
      this,
      selectedVendors,
      (manufacturer: ArmsManufacturer | null) => {
        // Show action menu again
        if (this.actionMenu) {
          this.actionMenu.showButtons()
        }

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

    // Calculate chance for higher level vendor
    const higherLevelChance = 0.05 + (networkingSkill / 10) * 0.15 // 5% to 20%
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
    this.updateActionButtons(true)

    // Create overlay
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
    if (this.actionPointsDisplay) {
      this.actionPointsDisplay.updatePoints(this.actionPoints)
    }
  }

  private updateActionButtons(forceDisableActions: boolean = false) {
    if (this.actionMenu) {
      this.actionMenu.updateButtonStates(this.actionPoints, forceDisableActions)
    }
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
