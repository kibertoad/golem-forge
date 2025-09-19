import { PotatoScene } from '@potato-golem/ui'
import type { GameObjects } from 'phaser'
import { StatusBar } from '../../components/StatusBar.ts'
import type { Dependencies } from '../../model/diConfig.ts'
import type { ResearchDirectorModel } from '../../model/entities/ResearchDirectorModel.ts'
import type { ResearchFacilityModel } from '../../model/entities/ResearchFacilityModel.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { CountryNames } from '../../model/enums/Countries.ts'
import type { ResearchProject } from '../../model/enums/ResearchEnums.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { showDirectorHiringDialog } from '../../utils/DirectorHiringUtils.ts'
import { formatMoney } from '../../utils/FormatUtils.ts'
import {
  GenericPersonSelector,
  type PersonData,
  type PersonSelectionContext,
} from '../board/molecules/ui/GenericPersonSelector.ts'
import { LaboratoryUpgradeDialog } from './LaboratoryUpgradeDialog.ts'
import { ResearchProjectDialog } from './ResearchProjectDialog.ts'

export interface ResearchSceneData {
  selectedFacilityId?: string
}

export class ResearchScene extends PotatoScene {
  private readonly worldModel: WorldModel
  private background!: GameObjects.Rectangle
  private titleText!: GameObjects.Text
  private backButton!: GameObjects.Container
  private facilitiesPanel!: GameObjects.Container
  private detailsPanel!: GameObjects.Container
  private selectedFacility: ResearchFacilityModel | null = null
  private statusContainer!: GameObjects.Container
  private moneyStatusBar!: StatusBar

  constructor({ worldModel, globalSceneEventEmitter }: Dependencies) {
    super(globalSceneEventEmitter, sceneRegistry.RESEARCH_SCENE)
    this.worldModel = worldModel
  }

  init(data?: ResearchSceneData) {
    if (data?.selectedFacilityId) {
      this.selectedFacility = this.worldModel.getResearchFacility(data.selectedFacilityId) || null
    }
  }

  create() {
    const { width, height } = this.cameras.main

    // Dark background
    this.background = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0a, 1)

    // Title
    this.titleText = this.add.text(width / 2, 40, 'RESEARCH & DEVELOPMENT', {
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    this.titleText.setOrigin(0.5)

    // Back button
    this.createBackButton()

    // Status bar at top
    this.createStatusBar()

    // Facilities panel on left
    this.createFacilitiesPanel()

    // Details panel on right
    this.createDetailsPanel()

    // Update initial display
    if (this.selectedFacility) {
      this.updateDetailsPanel(this.selectedFacility)
    }

    // Add right-click to go back
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.goBack()
      }
    })
  }

  private goBack() {
    this.scene.stop()
    this.scene.wake(sceneRegistry.BOARD_SCENE)
  }

  private createBackButton() {
    const { width } = this.cameras.main

    this.backButton = this.add.container(width - 100, 170)

    const bg = this.add.rectangle(0, 0, 120, 40, 0x3a3a3a, 0.9)
    bg.setStrokeStyle(2, 0x5a5a5a)
    bg.setInteractive()
    this.backButton.add(bg)

    const text = this.add.text(0, 0, 'Back', {
      fontSize: '18px',
      color: '#ffffff',
    })
    text.setOrigin(0.5)
    this.backButton.add(text)

    bg.on('pointerover', () => {
      bg.setFillStyle(0x4a4a4a, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(0x3a3a3a, 0.9)
    })

    bg.on('pointerdown', () => {
      this.goBack()
    })
  }

  private createStatusBar() {
    const { width } = this.cameras.main

    this.statusContainer = this.add.container(width / 2, 100)

    const bg = this.add.rectangle(0, 0, width - 100, 60, 0x1a1a1a, 0.9)
    bg.setStrokeStyle(1, 0x3a3a3a)
    this.statusContainer.add(bg)

    // Calculate total research costs
    let totalMonthlyCost = 0
    let activeProjects = 0
    let availableDirectors = 0

    this.worldModel.researchFacilities.forEach((facility) => {
      totalMonthlyCost += facility.getTotalMonthlyCost()
      if (facility.currentProject) activeProjects++
    })

    availableDirectors = this.worldModel.getAvailableDirectors().length

    // Display stats
    const stats = [
      `Facilities: ${this.worldModel.researchFacilities.length}`,
      `Active Projects: ${activeProjects}`,
      `Monthly Cost: ${formatMoney(totalMonthlyCost)}`,
      `Available Directors: ${availableDirectors}`,
    ]

    stats.forEach((stat, index) => {
      const xPos = -300 + index * 150
      const statText = this.add.text(xPos, 0, stat, {
        fontSize: '16px',
        color: '#aaaaaa',
      })
      statText.setOrigin(0.5)
      this.statusContainer.add(statText)
    })

    // Add money display using StatusBar
    this.moneyStatusBar = new StatusBar(this, this.worldModel)
    this.moneyStatusBar.setDepth(DepthRegistry.RESEARCH_DIALOG + 100)
  }

  private createFacilitiesPanel() {
    const { height } = this.cameras.main

    this.facilitiesPanel = this.add.container(250, height / 2)

    const panelBg = this.add.rectangle(0, 0, 400, height - 200, 0x1a1a1a, 0.95)
    panelBg.setStrokeStyle(2, 0x3a3a3a)
    this.facilitiesPanel.add(panelBg)

    const panelTitle = this.add.text(0, -height / 2 + 150, 'RESEARCH FACILITIES', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    panelTitle.setOrigin(0.5)
    this.facilitiesPanel.add(panelTitle)

    // List facilities
    let yOffset = -height / 2 + 200
    this.worldModel.researchFacilities.forEach((facility) => {
      const facilityCard = this.createFacilityCard(facility, 0, yOffset)
      this.facilitiesPanel.add(facilityCard)
      yOffset += 140
    })

    // Add new facility button
    const addButton = this.createAddFacilityButton(0, yOffset)
    this.facilitiesPanel.add(addButton)
  }

  private createFacilityCard(
    facility: ResearchFacilityModel,
    x: number,
    y: number,
  ): GameObjects.Container {
    const card = this.add.container(x, y)

    const isSelected = this.selectedFacility?.id === facility.id
    const cardBg = this.add.rectangle(0, 0, 360, 120, isSelected ? 0x2a3a4a : 0x2a2a2a, 0.9)
    cardBg.setStrokeStyle(2, isSelected ? 0x4a6a8a : 0x3a3a3a)
    cardBg.setInteractive()
    card.add(cardBg)

    // Facility name
    const nameText = this.add.text(-160, -40, facility.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    card.add(nameText)

    // Location
    const locationText = this.add.text(-160, -15, `📍 ${CountryNames[facility.location]}`, {
      fontSize: '14px',
      color: '#888888',
    })
    card.add(locationText)

    // Type
    const typeText = this.add.text(-160, 5, `Type: ${facility.facilityType}`, {
      fontSize: '14px',
      color: '#aaaaaa',
    })
    card.add(typeText)

    // Status
    let statusText = 'Idle'
    let statusColor = '#888888'
    if (facility.isUpgrading) {
      statusText = `Upgrading to L${facility.targetTechLevel} (${facility.upgradeMonthsRemaining}m)`
      statusColor = '#00aaff'
    } else if (facility.isRetooling) {
      statusText = `Retooling (${facility.retoolingMonthsRemaining} months)`
      statusColor = '#ffaa00'
    } else if (facility.currentProject) {
      statusText = facility.getProgressEstimate()
      statusColor = '#00ff00'
    } else if (!facility.director) {
      statusText = 'No Director'
      statusColor = '#ff4444'
    }

    const status = this.add.text(-160, 30, statusText, {
      fontSize: '14px',
      color: statusColor,
    })
    card.add(status)

    // Progress bar if project active
    if (facility.currentProject) {
      const progressBg = this.add.rectangle(0, 55, 340, 8, 0x333333, 0.8)
      card.add(progressBg)

      const progressBar = this.add.rectangle(
        -170,
        55,
        (340 * facility.currentProject.progress) / 100,
        8,
        0x00ff00,
        1,
      )
      progressBar.setOrigin(0, 0.5)
      card.add(progressBar)
    }

    cardBg.on('pointerover', () => {
      if (!isSelected) {
        cardBg.setFillStyle(0x3a3a3a, 1)
      }
    })

    cardBg.on('pointerout', () => {
      if (!isSelected) {
        cardBg.setFillStyle(0x2a2a2a, 0.9)
      }
    })

    cardBg.on('pointerdown', () => {
      this.selectedFacility = facility
      this.updateDetailsPanel(facility)
      this.refreshFacilitiesPanel()
    })

    return card
  }

  private createAddFacilityButton(x: number, y: number): GameObjects.Container {
    const button = this.add.container(x, y)

    const bg = this.add.rectangle(0, 0, 360, 60, 0x1a3a1a, 0.9)
    bg.setStrokeStyle(2, 0x2a5a2a)
    bg.setInteractive()
    button.add(bg)

    const text = this.add.text(0, 0, '+ Build New Facility', {
      fontSize: '18px',
      color: '#88ff88',
    })
    text.setOrigin(0.5)
    button.add(text)

    bg.on('pointerover', () => {
      bg.setFillStyle(0x2a4a2a, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(0x1a3a1a, 0.9)
    })

    bg.on('pointerdown', () => {
      // TODO: Open facility building dialog
      console.log('Build new facility')
    })

    return button
  }

  private createDetailsPanel() {
    const { width, height } = this.cameras.main

    this.detailsPanel = this.add.container(width - 450, height / 2)

    const panelBg = this.add.rectangle(0, 0, 700, height - 200, 0x1a1a1a, 0.95)
    panelBg.setStrokeStyle(2, 0x3a3a3a)
    this.detailsPanel.add(panelBg)
  }

  private updateDetailsPanel(facility: ResearchFacilityModel) {
    // Clear existing details
    this.detailsPanel.removeAll(true)

    const { height } = this.cameras.main

    // Re-add background
    const panelBg = this.add.rectangle(0, 0, 700, height - 200, 0x1a1a1a, 0.95)
    panelBg.setStrokeStyle(2, 0x3a3a3a)
    this.detailsPanel.add(panelBg)

    // Facility name
    const titleText = this.add.text(0, -height / 2 + 150, facility.name, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    titleText.setOrigin(0.5)
    this.detailsPanel.add(titleText)

    // Facility info
    const info = [
      `Type: ${facility.facilityType}`,
      `Tech Level: ${facility.techLevel}/10`,
      `Location: ${CountryNames[facility.location]}`,
      `Monthly Upkeep: ${formatMoney(facility.monthlyUpkeep)}`,
      `Director: ${facility.director ? facility.director.name : 'None'}`,
    ]

    info.forEach((text, index) => {
      const infoText = this.add.text(-320, -height / 2 + 200 + index * 25, text, {
        fontSize: '16px',
        color: '#aaaaaa',
      })
      this.detailsPanel.add(infoText)
    })

    // Director section
    if (!facility.director) {
      const assignButton = this.createAssignDirectorButton(facility)
      assignButton.setPosition(0, -height / 2 + 320)
      this.detailsPanel.add(assignButton)
    } else {
      this.addDirectorInfo(facility.director, -height / 2 + 320)
    }

    // Current project or start new project
    if (facility.isUpgrading) {
      this.addUpgradeInfo(facility, 0)
    } else if (facility.isRetooling) {
      this.addRetoolingInfo(facility, 0)
    } else if (facility.currentProject) {
      this.addProjectInfo(facility, 0)
    } else {
      // Create button container for side-by-side buttons
      const buttonContainer = this.add.container(0, 50)

      // Start project button (only if director assigned)
      if (facility.director) {
        const startButton = this.createStartProjectButton(facility)
        startButton.setPosition(-160, 0)
        buttonContainer.add(startButton)
      }

      // Upgrade button (always available if not at max level)
      if (facility.techLevel < 10) {
        const upgradeButton = this.createUpgradeButton(facility)
        // Position based on whether start button exists
        upgradeButton.setPosition(facility.director ? 160 : 0, 0)
        buttonContainer.add(upgradeButton)
      }

      this.detailsPanel.add(buttonContainer)
    }

    // Retool button (if no active project or upgrade)
    if (!facility.currentProject && !facility.isRetooling && !facility.isUpgrading) {
      const retoolButton = this.createRetoolButton(facility)
      retoolButton.setPosition(0, height / 2 - 250)
      this.detailsPanel.add(retoolButton)
    }
  }

  private createAssignDirectorButton(facility: ResearchFacilityModel): GameObjects.Container {
    const button = this.add.container(0, 0)

    const bg = this.add.rectangle(0, 0, 250, 50, 0x3a3a5a, 0.9)
    bg.setStrokeStyle(2, 0x5a5a8a)
    bg.setInteractive()
    button.add(bg)

    const text = this.add.text(0, 0, 'Assign Director', {
      fontSize: '18px',
      color: '#ffffff',
    })
    text.setOrigin(0.5)
    button.add(text)

    bg.on('pointerover', () => {
      bg.setFillStyle(0x4a4a6a, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(0x3a3a5a, 0.9)
    })

    bg.on('pointerdown', () => {
      this.openDirectorSelector(facility)
    })

    return button
  }

  private addDirectorInfo(director: ResearchDirectorModel, yPos: number) {
    const directorContainer = this.add.container(0, yPos)

    // Director header
    const headerText = this.add.text(-320, 0, 'RESEARCH DIRECTOR', {
      fontSize: '18px',
      color: '#ffaa00',
      fontStyle: 'bold',
    })
    directorContainer.add(headerText)

    // Director details
    const details = [
      director.name,
      `Salary: ${formatMoney(director.salary)}/month`,
      `Experience: ${director.getExperienceLevel()}`,
      `Projects Completed: ${director.projectsCompleted}`,
    ]

    details.forEach((text, index) => {
      const detailText = this.add.text(-320, 30 + index * 22, text, {
        fontSize: '14px',
        color: '#cccccc',
      })
      directorContainer.add(detailText)
    })

    // Traits
    const traitsText = this.add.text(-320, 140, 'Traits:', {
      fontSize: '14px',
      color: '#aaaaaa',
    })
    directorContainer.add(traitsText)

    director.traits.forEach((trait, index) => {
      const traitBadge = this.add.container(-250 + index * 150, 165)

      const badgeBg = this.add.rectangle(0, 0, 140, 30, 0x2a4a2a, 0.9)
      badgeBg.setStrokeStyle(1, 0x4a6a4a)
      traitBadge.add(badgeBg)

      const traitText = this.add.text(0, 0, trait, {
        fontSize: '12px',
        color: '#88ff88',
      })
      traitText.setOrigin(0.5)
      traitBadge.add(traitText)

      directorContainer.add(traitBadge)
    })

    this.detailsPanel.add(directorContainer)
  }

  private addProjectInfo(facility: ResearchFacilityModel, yPos: number) {
    if (!facility.currentProject) return

    const projectContainer = this.add.container(0, yPos)
    const project = facility.currentProject

    // Project header
    const headerText = this.add.text(0, -50, 'CURRENT PROJECT', {
      fontSize: '22px',
      color: '#00ff00',
      fontStyle: 'bold',
    })
    headerText.setOrigin(0.5)
    projectContainer.add(headerText)

    // Project name
    const nameText = this.add.text(0, -20, project.projectName, {
      fontSize: '20px',
      color: '#ffffff',
    })
    nameText.setOrigin(0.5)
    projectContainer.add(nameText)

    // Progress
    const progressText = this.add.text(0, 10, facility.getProgressEstimate(), {
      fontSize: '16px',
      color: '#aaaaaa',
    })
    progressText.setOrigin(0.5)
    projectContainer.add(progressText)

    // Progress bar
    const progressBg = this.add.rectangle(0, 40, 500, 30, 0x333333, 0.8)
    progressBg.setStrokeStyle(2, 0x555555)
    projectContainer.add(progressBg)

    const progressBar = this.add.rectangle(
      -250,
      40,
      (500 * project.progress) / 100,
      30,
      0x00ff00,
      0.9,
    )
    progressBar.setOrigin(0, 0.5)
    projectContainer.add(progressBar)

    const percentText = this.add.text(0, 40, `${Math.floor(project.progress)}%`, {
      fontSize: '16px',
      color: '#ffffff',
    })
    percentText.setOrigin(0.5)
    projectContainer.add(percentText)

    // Time estimate (if director has Strong Planner trait)
    const timeEstimate = facility.getTimeEstimate()
    if (timeEstimate) {
      const estimateText = this.add.text(
        0,
        80,
        `Estimated completion: ${timeEstimate.min}-${timeEstimate.max} months`,
        {
          fontSize: '14px',
          color: '#88aaff',
        },
      )
      estimateText.setOrigin(0.5)
      projectContainer.add(estimateText)
    }

    // Costs
    const costsText = this.add.text(0, 110, `Monthly Cost: ${formatMoney(project.monthlyCost)}`, {
      fontSize: '14px',
      color: '#ffaa00',
    })
    costsText.setOrigin(0.5)
    projectContainer.add(costsText)

    // Complexity and Unpredictability indicators
    const complexityText = this.add.text(
      -150,
      140,
      `Complexity: ${'★'.repeat(project.complexity)}`,
      {
        fontSize: '14px',
        color: '#ffff00',
      },
    )
    projectContainer.add(complexityText)

    const unpredictabilityText = this.add.text(
      50,
      140,
      `Unpredictability: ${'⚡'.repeat(project.unpredictability)}`,
      {
        fontSize: '14px',
        color: '#ff8800',
      },
    )
    projectContainer.add(unpredictabilityText)

    this.detailsPanel.add(projectContainer)
  }

  private addUpgradeInfo(facility: ResearchFacilityModel, yPos: number) {
    const upgradeContainer = this.add.container(0, yPos)

    const headerText = this.add.text(0, 0, 'LABORATORY UPGRADE IN PROGRESS', {
      fontSize: '22px',
      color: '#00aaff',
      fontStyle: 'bold',
    })
    headerText.setOrigin(0.5)
    upgradeContainer.add(headerText)

    const fromText = this.add.text(0, 40, `Current Level: ${facility.techLevel}`, {
      fontSize: '16px',
      color: '#aaaaaa',
    })
    fromText.setOrigin(0.5)
    upgradeContainer.add(fromText)

    const toText = this.add.text(0, 65, `Target Level: ${facility.targetTechLevel}`, {
      fontSize: '16px',
      color: '#ffffff',
    })
    toText.setOrigin(0.5)
    upgradeContainer.add(toText)

    const remainingText = this.add.text(
      0,
      100,
      `${facility.upgradeMonthsRemaining} months remaining`,
      {
        fontSize: '18px',
        color: '#00aaff',
      },
    )
    remainingText.setOrigin(0.5)
    upgradeContainer.add(remainingText)

    const maintenanceText = this.add.text(
      0,
      130,
      `Monthly Maintenance: ${formatMoney(facility.upgradeMonthlyMaintenance)}`,
      {
        fontSize: '16px',
        color: '#ff8888',
      },
    )
    maintenanceText.setOrigin(0.5)
    upgradeContainer.add(maintenanceText)

    // Progress bar
    const progressBg = this.add.rectangle(0, 170, 400, 12, 0x333333, 0.8)
    upgradeContainer.add(progressBg)

    const totalMonths = facility.targetTechLevel! - facility.techLevel + 2
    const monthsCompleted = totalMonths - facility.upgradeMonthsRemaining
    const progress = (monthsCompleted / totalMonths) * 100

    const progressBar = this.add.rectangle(-200, 170, (400 * progress) / 100, 12, 0x00aaff, 1)
    progressBar.setOrigin(0, 0.5)
    upgradeContainer.add(progressBar)

    this.detailsPanel.add(upgradeContainer)
  }

  private addRetoolingInfo(facility: ResearchFacilityModel, yPos: number) {
    const retoolContainer = this.add.container(0, yPos)

    const headerText = this.add.text(0, 0, 'FACILITY RETOOLING', {
      fontSize: '22px',
      color: '#ffaa00',
      fontStyle: 'bold',
    })
    headerText.setOrigin(0.5)
    retoolContainer.add(headerText)

    const fromText = this.add.text(0, 40, `From: ${facility.facilityType}`, {
      fontSize: '16px',
      color: '#aaaaaa',
    })
    fromText.setOrigin(0.5)
    retoolContainer.add(fromText)

    const toText = this.add.text(0, 65, `To: ${facility.targetFacilityType}`, {
      fontSize: '16px',
      color: '#ffffff',
    })
    toText.setOrigin(0.5)
    retoolContainer.add(toText)

    const remainingText = this.add.text(
      0,
      100,
      `${facility.retoolingMonthsRemaining} months remaining`,
      {
        fontSize: '18px',
        color: '#ffaa00',
      },
    )
    remainingText.setOrigin(0.5)
    retoolContainer.add(remainingText)

    this.detailsPanel.add(retoolContainer)
  }

  private createStartProjectButton(facility: ResearchFacilityModel): GameObjects.Container {
    const button = this.add.container(0, 0)

    const bg = this.add.rectangle(0, 0, 280, 60, 0x2a5a2a, 0.9)
    bg.setStrokeStyle(2, 0x4a8a4a)
    bg.setInteractive()
    button.add(bg)

    const text = this.add.text(0, 0, 'Start New Project', {
      fontSize: '20px',
      color: '#ffffff',
    })
    text.setOrigin(0.5)
    button.add(text)

    bg.on('pointerover', () => {
      bg.setFillStyle(0x3a6a3a, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(0x2a5a2a, 0.9)
    })

    bg.on('pointerdown', () => {
      this.openProjectSelectionDialog(facility)
    })

    return button
  }

  private createUpgradeButton(facility: ResearchFacilityModel): GameObjects.Container {
    const button = this.add.container(0, 0)

    const bg = this.add.rectangle(0, 0, 280, 60, 0x2a4a6a, 0.9)
    bg.setStrokeStyle(2, 0x4a6a8a)
    bg.setInteractive()
    button.add(bg)

    const text = this.add.text(0, -10, 'Upgrade Laboratory', {
      fontSize: '20px',
      color: '#ffffff',
    })
    text.setOrigin(0.5)
    button.add(text)

    const levelText = this.add.text(
      0,
      12,
      `Level ${facility.techLevel} → ${facility.techLevel + 1}+`,
      {
        fontSize: '14px',
        color: '#88ccff',
      },
    )
    levelText.setOrigin(0.5)
    button.add(levelText)

    bg.on('pointerover', () => {
      bg.setFillStyle(0x3a5a7a, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(0x2a4a6a, 0.9)
    })

    bg.on('pointerdown', () => {
      this.openUpgradeDialog(facility)
    })

    return button
  }

  private createRetoolButton(facility: ResearchFacilityModel): GameObjects.Container {
    const button = this.add.container(0, 0)

    const bg = this.add.rectangle(0, 0, 200, 45, 0x4a3a2a, 0.9)
    bg.setStrokeStyle(2, 0x6a5a4a)
    bg.setInteractive()
    button.add(bg)

    const text = this.add.text(0, 0, 'Retool Facility', {
      fontSize: '16px',
      color: '#ffaa88',
    })
    text.setOrigin(0.5)
    button.add(text)

    bg.on('pointerover', () => {
      bg.setFillStyle(0x5a4a3a, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(0x4a3a2a, 0.9)
    })

    bg.on('pointerdown', () => {
      // TODO: Open retool dialog
      console.log('Retool facility', facility.name)
    })

    return button
  }

  private refreshFacilitiesPanel() {
    // Recreate the facilities panel to update selection
    this.facilitiesPanel.destroy()
    this.createFacilitiesPanel()
  }

  private openDirectorSelector(facility: ResearchFacilityModel) {
    // Convert directors to PersonData format
    const availableDirectors: PersonData[] = this.worldModel
      .getAvailableDirectors()
      .map((director) => ({
        id: director.id,
        name: director.name,
        nationality: CountryNames[director.nationality],
        traits: director.traits,
        salary: director.salary,
        experience: director.getExperienceLevel(),
        isAvailable: director.isAvailable,
      }))

    const context: PersonSelectionContext = {
      title: `SELECT DIRECTOR FOR ${facility.name.toUpperCase()}`,
      detailsPanel: (scene, person) => this.createDirectorDetailsPanel(scene, person),
      canSelectValidator: (person, currentMoney) => {
        const monthlyCost = (person.salary || 0) + facility.monthlyUpkeep
        if (monthlyCost > currentMoney) {
          return { canSelect: false, reason: 'Cannot afford monthly costs' }
        }
        return { canSelect: true }
      },
      confirmButtonText: 'Assign Director',
      showAddNewButton: true,
      addNewButtonText: '+ Hire New Director',
      onAddNew: () => {
        showDirectorHiringDialog(this, this.worldModel, (directorName) => {
          if (directorName) {
            // Refresh the facilities panel after hiring
            this.refreshFacilitiesPanel()
            this.createStatusBar()
            // Re-open the director selector with the newly hired director
            this.openDirectorSelector(facility)
          }
        })
      },
    }

    const selector = new GenericPersonSelector(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      availableDirectors,
      context,
      this.worldModel.gameStatus.money,
      (person) => {
        // Find the actual director model
        const director = this.worldModel.getDirector(person.id)
        if (director) {
          facility.assignDirector(director, this.worldModel.gameStatus.turn)
          this.updateDetailsPanel(facility)
          this.refreshFacilitiesPanel()
        }
      },
    )
  }

  private createDirectorDetailsPanel(
    scene: PotatoScene,
    person: PersonData,
  ): GameObjects.Container {
    const panel = scene.add.container(0, 0)

    const panelBg = scene.add.rectangle(0, 0, 500, 650, 0x0a0a0a, 0.9)
    panelBg.setStrokeStyle(1, 0x3a3a3a)
    panel.add(panelBg)

    // Director name
    const nameText = scene.add.text(0, -280, person.name, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    nameText.setOrigin(0.5)
    panel.add(nameText)

    // Basic info
    const info = [
      `Nationality: ${person.nationality}`,
      `Experience: ${person.experience}`,
      `Salary: ${formatMoney(person.salary || 0)}/month`,
    ]

    info.forEach((text, index) => {
      const infoText = scene.add.text(-220, -230 + index * 25, text, {
        fontSize: '16px',
        color: '#aaaaaa',
      })
      panel.add(infoText)
    })

    // Traits section
    if (person.traits && person.traits.length > 0) {
      const traitsHeader = scene.add.text(-220, -100, 'TRAITS & EFFECTS:', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      panel.add(traitsHeader)

      const traitEffects: Record<string, string> = {
        Stingy: '15% longer, 30% cheaper',
        Disciplined: 'Reduced unpredictability',
        'Strong Planner': 'Shows time estimates',
        Innovative: '20% breakthrough chance',
        Methodical: 'Steady progress',
        'Risk Taker': 'Can skip prerequisites',
        Perfectionist: '25% longer, better results',
        Networked: '15% launch discount',
        Ambitious: '2 projects at 70% efficiency',
        Frugal: '25% monthly cost reduction',
      }

      person.traits.forEach((trait, index) => {
        const yPos = -60 + index * 60

        // Trait name badge
        const traitBadge = scene.add.container(-100, yPos)
        const badgeBg = scene.add.rectangle(0, 0, 200, 35, 0x2a4a2a, 0.9)
        badgeBg.setStrokeStyle(1, 0x4a6a4a)
        traitBadge.add(badgeBg)

        const traitText = scene.add.text(0, 0, trait, {
          fontSize: '14px',
          color: '#88ff88',
        })
        traitText.setOrigin(0.5)
        traitBadge.add(traitText)
        panel.add(traitBadge)

        // Effect description
        const effect = traitEffects[trait]
        if (effect) {
          const effectText = scene.add.text(-220, yPos + 25, effect, {
            fontSize: '12px',
            color: '#cccccc',
            fontStyle: 'italic',
          })
          panel.add(effectText)
        }
      })
    }

    return panel
  }

  private openProjectSelectionDialog(facility: ResearchFacilityModel) {
    if (!facility.director) {
      console.error('No director assigned to facility')
      return
    }

    const projectDialog = new ResearchProjectDialog(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      facility,
      facility.director,
      facility.completedProjects.map((p) => (typeof p === 'string' ? p : p.id)),
      this.worldModel.gameStatus.money,
      (project: ResearchProject) => {
        // Start the research project
        facility.startProject(
          project,
          project.complexity,
          project.unpredictability,
          project.estimatedMonths,
        )

        // Deduct the launch cost
        this.worldModel.deductMoney(project.cost)

        // Refresh the UI
        this.updateDetailsPanel(facility)
        this.refreshFacilitiesPanel()
      },
    )
  }

  private openUpgradeDialog(facility: ResearchFacilityModel) {
    const upgradeDialog = new LaboratoryUpgradeDialog(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      facility,
      this.worldModel.gameStatus.money,
      (targetLevel) => {
        // Get the upgrade cost and details
        const techLevels = [
          { level: 2, upgradeCost: 200000, upgradeMonths: 3, monthlyMaintenance: 20000 },
          { level: 3, upgradeCost: 500000, upgradeMonths: 4, monthlyMaintenance: 30000 },
          { level: 4, upgradeCost: 1000000, upgradeMonths: 5, monthlyMaintenance: 50000 },
          { level: 5, upgradeCost: 2000000, upgradeMonths: 6, monthlyMaintenance: 75000 },
          { level: 6, upgradeCost: 4000000, upgradeMonths: 7, monthlyMaintenance: 100000 },
          { level: 7, upgradeCost: 8000000, upgradeMonths: 8, monthlyMaintenance: 150000 },
          { level: 8, upgradeCost: 15000000, upgradeMonths: 9, monthlyMaintenance: 200000 },
          { level: 9, upgradeCost: 30000000, upgradeMonths: 10, monthlyMaintenance: 300000 },
          { level: 10, upgradeCost: 60000000, upgradeMonths: 12, monthlyMaintenance: 500000 },
        ]

        const upgradeInfo = techLevels.find((info) => info.level === targetLevel)
        if (!upgradeInfo) return

        // Start the upgrade
        facility.startUpgrade(
          targetLevel,
          upgradeInfo.upgradeMonths,
          upgradeInfo.monthlyMaintenance,
        )

        // Deduct the upgrade cost
        this.worldModel.deductMoney(upgradeInfo.upgradeCost)

        // Refresh the UI
        this.updateDetailsPanel(facility)
        this.refreshFacilitiesPanel()
        this.createStatusBar()
      },
    )
  }
}
