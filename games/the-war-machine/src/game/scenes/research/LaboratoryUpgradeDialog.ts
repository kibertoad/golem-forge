import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'
import type { ResearchFacilityModel } from '../../model/entities/ResearchFacilityModel.ts'
import { formatMoney } from '../../utils/FormatUtils.ts'

interface TechLevelInfo {
  level: number
  name: string
  description: string
  upgradeCost: number
  upgradeMonths: number
  monthlyMaintenanceDuringUpgrade: number
}

export class LaboratoryUpgradeDialog extends GameObjects.Container {
  private background: GameObjects.Rectangle
  private overlay: GameObjects.Rectangle
  private titleText: GameObjects.Text
  private facility: ResearchFacilityModel
  private currentMoney: number
  private selectedLevel: number | null = null
  private levelCards: GameObjects.Container[] = []
  private onConfirm: (targetLevel: number) => void

  private readonly techLevels: TechLevelInfo[] = [
    { level: 1, name: 'Basic Laboratory', description: 'Basic research capabilities, simple experiments', upgradeCost: 0, upgradeMonths: 0, monthlyMaintenanceDuringUpgrade: 0 },
    { level: 2, name: 'Standard Laboratory', description: 'Improved equipment, can handle moderate complexity', upgradeCost: 200000, upgradeMonths: 3, monthlyMaintenanceDuringUpgrade: 20000 },
    { level: 3, name: 'Advanced Laboratory', description: 'Professional-grade facilities, complex research', upgradeCost: 500000, upgradeMonths: 4, monthlyMaintenanceDuringUpgrade: 30000 },
    { level: 4, name: 'State-of-the-Art Facility', description: 'Cutting-edge equipment, breakthrough potential', upgradeCost: 1000000, upgradeMonths: 5, monthlyMaintenanceDuringUpgrade: 50000 },
    { level: 5, name: 'World-Class Research Center', description: 'Top-tier facilities, attracts best researchers', upgradeCost: 2000000, upgradeMonths: 6, monthlyMaintenanceDuringUpgrade: 75000 },
    { level: 6, name: 'Elite Innovation Hub', description: 'Revolutionary capabilities, pushes boundaries', upgradeCost: 4000000, upgradeMonths: 7, monthlyMaintenanceDuringUpgrade: 100000 },
    { level: 7, name: 'Experimental Frontier Lab', description: 'Exotic technologies, theoretical breakthroughs', upgradeCost: 8000000, upgradeMonths: 8, monthlyMaintenanceDuringUpgrade: 150000 },
    { level: 8, name: 'Quantum Research Complex', description: 'Quantum-level experiments, reality manipulation', upgradeCost: 15000000, upgradeMonths: 9, monthlyMaintenanceDuringUpgrade: 200000 },
    { level: 9, name: 'Transcendent Science Nexus', description: 'Beyond current understanding, paradigm shifts', upgradeCost: 30000000, upgradeMonths: 10, monthlyMaintenanceDuringUpgrade: 300000 },
    { level: 10, name: 'Omniscience Laboratory', description: 'Ultimate research facility, limitless potential', upgradeCost: 60000000, upgradeMonths: 12, monthlyMaintenanceDuringUpgrade: 500000 },
  ]

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    facility: ResearchFacilityModel,
    currentMoney: number,
    onConfirm: (targetLevel: number) => void,
  ) {
    super(scene, x, y)

    this.facility = facility
    this.currentMoney = currentMoney
    this.onConfirm = onConfirm

    this.createUI()
    scene.add.existing(this)
    this.setDepth(3000)
  }

  private createUI() {
    // Dark overlay
    this.overlay = this.scene.add.rectangle(0, 0, 2560, 1440, 0x000000, 0.8)
    this.overlay.setInteractive() // Block clicks
    this.add(this.overlay)

    // Main window - increased height to fit all levels
    this.background = this.scene.add.rectangle(0, 0, 1500, 1100, 0x1a1a1a, 0.98)
    this.background.setStrokeStyle(3, 0x4a4a4a)
    this.add(this.background)

    // Title
    this.titleText = this.scene.add.text(0, -500, 'LABORATORY UPGRADE', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    this.titleText.setOrigin(0.5)
    this.add(this.titleText)

    // Current level info
    const currentLevelText = this.scene.add.text(
      0,
      -440,
      `Current Level: ${this.facility.techLevel} - ${this.techLevels[this.facility.techLevel - 1].name}`,
      {
        fontSize: '28px',
        color: '#88aaff',
      },
    )
    currentLevelText.setOrigin(0.5)
    this.add(currentLevelText)

    // Available funds
    const fundsText = this.scene.add.text(
      0,
      -400,
      `Available Funds: ${formatMoney(this.currentMoney)}`,
      {
        fontSize: '24px',
        color: '#88ff88',
      },
    )
    fundsText.setOrigin(0.5)
    this.add(fundsText)

    // Create level cards for upgradeable levels - adjusted spacing
    let yOffset = -330
    for (let i = this.facility.techLevel; i < this.techLevels.length; i++) {
      const levelInfo = this.techLevels[i]
      if (levelInfo.level > this.facility.techLevel) {
        const card = this.createLevelCard(levelInfo, 0, yOffset)
        this.levelCards.push(card)
        this.add(card)
        yOffset += 95
      }
    }

    // Buttons
    this.createButtons()
  }

  private createLevelCard(levelInfo: TechLevelInfo, x: number, y: number): GameObjects.Container {
    const card = this.scene.add.container(x, y)
    const isSelected = this.selectedLevel === levelInfo.level
    const canAfford = this.currentMoney >= levelInfo.upgradeCost

    // Card background - slightly taller
    const cardBg = this.scene.add.rectangle(0, 0, 1400, 85, isSelected ? 0x2a3a4a : 0x2a2a2a, 0.95)

    if (!canAfford) {
      cardBg.setAlpha(0.5)
    }

    cardBg.setStrokeStyle(2, isSelected ? 0x4a6a8a : 0x3a3a3a)
    if (canAfford) {
      cardBg.setInteractive()
    }
    card.add(cardBg)

    // Level number
    const levelText = this.scene.add.text(-650, -22, `Level ${levelInfo.level}`, {
      fontSize: '28px',
      color: '#ffaa00',
      fontStyle: 'bold',
    })
    card.add(levelText)

    // Level name - moved further right to avoid overlap
    const nameText = this.scene.add.text(-480, -22, levelInfo.name, {
      fontSize: '26px',
      color: canAfford ? '#ffffff' : '#666666',
    })
    card.add(nameText)

    // Description
    const descText = this.scene.add.text(-650, 8, levelInfo.description, {
      fontSize: '18px',
      color: '#aaaaaa',
    })
    card.add(descText)

    // Upgrade cost - renamed to Upfront cost, using compressed format
    const costText = this.scene.add.text(250, -22, `Upfront: ${formatMoney(levelInfo.upgradeCost)}`, {
      fontSize: '20px',
      color: canAfford ? '#88ff88' : '#ff8888',
    })
    card.add(costText)

    // Upgrade time - adjusted position to match upfront cost
    const timeText = this.scene.add.text(250, 8, `Time: ${levelInfo.upgradeMonths} months`, {
      fontSize: '18px',
      color: '#ffaa00',
    })
    card.add(timeText)

    // Monthly maintenance during upgrade
    const maintenanceText = this.scene.add.text(480, -22, `Monthly: ${formatMoney(levelInfo.monthlyMaintenanceDuringUpgrade)}`, {
      fontSize: '18px',
      color: '#ff8888',
    })
    card.add(maintenanceText)

    // Total cost indicator
    const totalCost = levelInfo.upgradeCost + (levelInfo.monthlyMaintenanceDuringUpgrade * levelInfo.upgradeMonths)
    const totalText = this.scene.add.text(480, 8, `Total: ${formatMoney(totalCost)}`, {
      fontSize: '16px',
      color: '#888888',
    })
    card.add(totalText)

    // Selection interaction
    if (canAfford) {
      cardBg.on('pointerover', () => {
        if (!isSelected) {
          cardBg.setFillStyle(0x3a3a3a, 1)
        }
      })

      cardBg.on('pointerout', () => {
        if (!isSelected) {
          cardBg.setFillStyle(0x2a2a2a, 0.95)
        }
      })

      cardBg.on('pointerdown', () => {
        this.selectLevel(levelInfo.level)
      })
    }

    return card
  }

  private selectLevel(level: number) {
    this.selectedLevel = level
    this.refreshCards()
  }

  private refreshCards() {
    // Destroy and recreate cards to update selection state
    this.levelCards.forEach((card) => card.destroy())
    this.levelCards = []

    let yOffset = -330
    for (let i = this.facility.techLevel; i < this.techLevels.length; i++) {
      const levelInfo = this.techLevels[i]
      if (levelInfo.level > this.facility.techLevel) {
        const card = this.createLevelCard(levelInfo, 0, yOffset)
        this.levelCards.push(card)
        this.add(card)
        yOffset += 95
      }
    }
  }

  private createButtons() {
    // Start Upgrade button - adjusted position for larger dialog
    const startButton = this.scene.add.container(150, 500)
    const startBg = this.scene.add.rectangle(0, 0, 250, 50, 0x2a5a2a, 0.9)
    startBg.setStrokeStyle(2, 0x4a8a4a)
    startBg.setInteractive()
    startButton.add(startBg)

    const startText = this.scene.add.text(0, 0, 'Start Upgrade', {
      fontSize: '22px',
      color: '#ffffff',
    })
    startText.setOrigin(0.5)
    startButton.add(startText)

    startBg.on('pointerover', () => {
      startBg.setFillStyle(0x3a6a3a, 1)
    })

    startBg.on('pointerout', () => {
      startBg.setFillStyle(0x2a5a2a, 0.9)
    })

    startBg.on('pointerdown', () => {
      if (this.selectedLevel) {
        this.onConfirm(this.selectedLevel)
        this.destroy()
      }
    })

    this.add(startButton)

    // Cancel button - adjusted position
    const cancelButton = this.scene.add.container(-150, 500)
    const cancelBg = this.scene.add.rectangle(0, 0, 200, 50, 0x5a3a3a, 0.9)
    cancelBg.setStrokeStyle(2, 0x7a5a5a)
    cancelBg.setInteractive()
    cancelButton.add(cancelBg)

    const cancelText = this.scene.add.text(0, 0, 'Cancel', {
      fontSize: '22px',
      color: '#ffffff',
    })
    cancelText.setOrigin(0.5)
    cancelButton.add(cancelText)

    cancelBg.on('pointerover', () => {
      cancelBg.setFillStyle(0x6a4a4a, 1)
    })

    cancelBg.on('pointerout', () => {
      cancelBg.setFillStyle(0x5a3a3a, 0.9)
    })

    cancelBg.on('pointerdown', () => {
      this.destroy()
    })

    this.add(cancelButton)
  }
}