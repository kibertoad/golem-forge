import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'
import { RESEARCH_PROJECTS } from '../../model/data/ResearchProjects.ts'
import type { ResearchDirectorModel } from '../../model/entities/ResearchDirectorModel.ts'
import type { ResearchFacilityModel } from '../../model/entities/ResearchFacilityModel.ts'
import type { ResearchProject } from '../../model/enums/ResearchEnums.ts'

export class ResearchProjectDialog extends GameObjects.Container {
  private background: GameObjects.Rectangle
  private overlay: GameObjects.Rectangle
  private titleText: GameObjects.Text
  private projectContainers: GameObjects.Container[] = []
  private selectedProject: ResearchProject | null = null
  private facility: ResearchFacilityModel
  private director: ResearchDirectorModel
  private completedProjects: string[]
  private currentMoney: number
  private onConfirm: (project: ResearchProject) => void

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    facility: ResearchFacilityModel,
    director: ResearchDirectorModel,
    completedProjects: string[],
    currentMoney: number,
    onConfirm: (project: ResearchProject) => void,
  ) {
    super(scene, x, y)

    this.facility = facility
    this.director = director
    this.completedProjects = completedProjects
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

    // Main window
    this.background = this.scene.add.rectangle(0, 0, 1600, 950, 0x1a1a1a, 0.98)
    this.background.setStrokeStyle(3, 0x4a4a4a)
    this.add(this.background)

    // Title
    this.titleText = this.scene.add.text(0, -430, `SELECT RESEARCH PROJECT`, {
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    this.titleText.setOrigin(0.5)
    this.add(this.titleText)

    // Facility info
    const facilityInfo = this.scene.add.text(
      0,
      -385,
      `${this.facility.name} - ${this.facility.facilityType}`,
      {
        fontSize: '24px',
        color: '#aaaaaa',
      },
    )
    facilityInfo.setOrigin(0.5)
    this.add(facilityInfo)

    // Director info
    const directorInfo = this.scene.add.text(
      0,
      -350,
      `Director: ${this.director.name} (Expertise: ${'★'.repeat(this.director.stats.expertise)}${'☆'.repeat(5 - this.director.stats.expertise)})`,
      {
        fontSize: '22px',
        color: '#88aaff',
      },
    )
    directorInfo.setOrigin(0.5)
    this.add(directorInfo)

    // Get available projects for this facility type
    const availableProjects = this.getAvailableProjects()

    // Create scrollable project list
    let yOffset = -280
    availableProjects.forEach((project) => {
      const projectCard = this.createProjectCard(project, 0, yOffset)
      this.projectContainers.push(projectCard)
      this.add(projectCard)
      yOffset += 120
    })

    // Buttons
    this.createButtons()
  }

  private getAvailableProjects(): ResearchProject[] {
    return RESEARCH_PROJECTS.filter((project) => {
      // Must match facility type (or be a universal upgrade)
      if (project.facilityType !== this.facility.facilityType && project.facilityType !== 'ANY')
        return false

      // Check tech level requirement
      if (project.techLevel > this.facility.techLevel) return false

      // Check prerequisites
      if (project.prerequisites.length > 0) {
        const hasAllPrereqs = project.prerequisites.every((prereq) =>
          this.completedProjects.includes(prereq),
        )
        if (!hasAllPrereqs) return false
      }

      // Check if director has moral flexibility for questionable research
      if (
        project.maxMoralityAllowed &&
        !this.director.willAcceptProject(project.maxMoralityAllowed)
      ) {
        return false
      }

      // Check if already completed
      if (this.completedProjects.includes(project.id)) return false

      return true
    })
  }

  private createProjectCard(project: ResearchProject, x: number, y: number): GameObjects.Container {
    const card = this.scene.add.container(x, y)
    const isSelected = this.selectedProject?.id === project.id
    const canAfford = this.currentMoney >= project.cost
    const canHandle = this.director.canHandleComplexity(project.complexity)

    // Card background
    const cardBg = this.scene.add.rectangle(0, 0, 1500, 100, isSelected ? 0x2a3a4a : 0x2a2a2a, 0.95)

    if (!canAfford || !canHandle) {
      cardBg.setAlpha(0.5)
    }

    cardBg.setStrokeStyle(2, isSelected ? 0x4a6a8a : 0x3a3a3a)
    if (canAfford && canHandle) {
      cardBg.setInteractive()
    }
    card.add(cardBg)

    // Project name
    const nameText = this.scene.add.text(-700, -30, project.name, {
      fontSize: '24px',
      color: canAfford && canHandle ? '#ffffff' : '#666666',
      fontStyle: 'bold',
    })
    card.add(nameText)

    // Description
    const descText = this.scene.add.text(-700, 0, project.description, {
      fontSize: '16px',
      color: '#aaaaaa',
    })
    card.add(descText)

    // Complexity stars
    const complexityText = this.scene.add.text(
      -700,
      25,
      `Complexity: ${'★'.repeat(project.complexity)}${'☆'.repeat(5 - project.complexity)}`,
      {
        fontSize: '16px',
        color: canHandle ? '#88ff88' : '#ff8888',
      },
    )
    card.add(complexityText)

    // Unpredictability
    const unpredictText = this.scene.add.text(
      -400,
      25,
      `Unpredictability: ${'⚡'.repeat(project.unpredictability)}`,
      {
        fontSize: '16px',
        color: '#ffaa00',
      },
    )
    card.add(unpredictText)

    // Launch cost
    const launchCostText = this.scene.add.text(
      200,
      -30,
      `Launch: $${project.cost.toLocaleString()}`,
      {
        fontSize: '18px',
        color: canAfford ? '#88ff88' : '#ff8888',
      },
    )
    card.add(launchCostText)

    // Monthly cost
    const monthlyCost = Math.floor(project.cost / 10)
    const monthlyCostText = this.scene.add.text(
      200,
      -5,
      `Monthly: $${monthlyCost.toLocaleString()}`,
      {
        fontSize: '18px',
        color: '#ffaa00',
      },
    )
    card.add(monthlyCostText)

    // Estimated time
    const timeText = this.scene.add.text(200, 20, `Est: ${project.estimatedMonths} months`, {
      fontSize: '16px',
      color: '#aaaaaa',
    })
    card.add(timeText)

    // Category and Field
    const categoryText = this.scene.add.text(450, -30, project.category || 'Uncategorized', {
      fontSize: '14px',
      color: '#aa88ff',
    })
    card.add(categoryText)

    const fieldText = this.scene.add.text(450, -10, project.field, {
      fontSize: '14px',
      color: '#8888ff',
    })
    card.add(fieldText)

    // Warning messages
    if (!canHandle) {
      const warningText = this.scene.add.text(450, 20, '⚠ Too Complex', {
        fontSize: '16px',
        color: '#ff8888',
      })
      card.add(warningText)
    } else if (!canAfford) {
      const warningText = this.scene.add.text(450, 20, '⚠ Insufficient Funds', {
        fontSize: '16px',
        color: '#ff8888',
      })
      card.add(warningText)
    }

    // Selection interaction
    if (canAfford && canHandle) {
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
        this.selectProject(project)
      })
    }

    return card
  }

  private selectProject(project: ResearchProject) {
    this.selectedProject = project
    this.refreshCards()
  }

  private refreshCards() {
    // Destroy and recreate cards to update selection state
    this.projectContainers.forEach((container) => container.destroy())
    this.projectContainers = []

    const availableProjects = this.getAvailableProjects()
    let yOffset = -280
    availableProjects.forEach((project) => {
      const projectCard = this.createProjectCard(project, 0, yOffset)
      this.projectContainers.push(projectCard)
      this.add(projectCard)
      yOffset += 120
    })
  }

  private createButtons() {
    // Start Research button
    const startButton = this.scene.add.container(150, 420)
    const startBg = this.scene.add.rectangle(0, 0, 250, 50, 0x2a5a2a, 0.9)
    startBg.setStrokeStyle(2, 0x4a8a4a)
    startBg.setInteractive()
    startButton.add(startBg)

    const startText = this.scene.add.text(0, 0, 'Start Research', {
      fontSize: '20px',
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
      if (this.selectedProject) {
        this.onConfirm(this.selectedProject)
        this.destroy()
      }
    })

    this.add(startButton)

    // Cancel button
    const cancelButton = this.scene.add.container(-150, 420)
    const cancelBg = this.scene.add.rectangle(0, 0, 200, 50, 0x5a3a3a, 0.9)
    cancelBg.setStrokeStyle(2, 0x7a5a5a)
    cancelBg.setInteractive()
    cancelButton.add(cancelBg)

    const cancelText = this.scene.add.text(0, 0, 'Cancel', {
      fontSize: '20px',
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
