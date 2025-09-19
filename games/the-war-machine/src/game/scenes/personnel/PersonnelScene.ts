import { PotatoScene } from '@potato-golem/ui'
import type { GameObjects } from 'phaser'
import { StatusBar } from '../../components/StatusBar.ts'
import type { Dependencies } from '../../model/diConfig.ts'
import type { ResearchDirectorModel } from '../../model/entities/ResearchDirectorModel.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { CountryNames } from '../../model/enums/Countries.ts'
import { DirectorTrait } from '../../model/enums/ResearchDirectorEnums.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { showDirectorHiringDialog } from '../../utils/DirectorHiringUtils.ts'

export class PersonnelScene extends PotatoScene {
  private readonly worldModel: WorldModel
  private background!: GameObjects.Rectangle
  private titleText!: GameObjects.Text
  private backButton!: GameObjects.Container
  private directorsPanel!: GameObjects.Container
  private detailsPanel!: GameObjects.Container
  private selectedDirector: ResearchDirectorModel | null = null

  constructor({ worldModel, globalSceneEventEmitter }: Dependencies) {
    super(globalSceneEventEmitter, sceneRegistry.PERSONNEL_SCENE)
    this.worldModel = worldModel
  }

  create() {
    const { width, height } = this.cameras.main

    // Dark background
    this.background = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0a, 1)

    // Title
    this.titleText = this.add.text(width / 2, 40, 'PERSONNEL MANAGEMENT', {
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    this.titleText.setOrigin(0.5)

    // Back button
    this.createBackButton()

    // Add StatusBar for consistency with other scenes
    const statusBar = new StatusBar(this, this.worldModel)
    statusBar.setDepth(DepthRegistry.UI_TEXT)

    // Directors panel on left
    this.createDirectorsPanel()

    // Details panel on right
    this.createDetailsPanel()

    // Add right-click to return to BoardScene
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

  private createDirectorsPanel() {
    const { height } = this.cameras.main

    this.directorsPanel = this.add.container(300, height / 2)

    const panelBg = this.add.rectangle(0, 0, 500, height - 200, 0x1a1a1a, 0.95)
    panelBg.setStrokeStyle(2, 0x3a3a3a)
    this.directorsPanel.add(panelBg)

    const panelTitle = this.add.text(0, -height / 2 + 150, 'RESEARCH DIRECTORS', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    panelTitle.setOrigin(0.5)
    this.directorsPanel.add(panelTitle)

    // Statistics
    const totalDirectors = this.worldModel.researchDirectors.length
    const availableDirectors = this.worldModel.getAvailableDirectors().length
    const employedDirectors = totalDirectors - availableDirectors

    const stats = [
      `Total Directors: ${totalDirectors}`,
      `Employed: ${employedDirectors}`,
      `Available: ${availableDirectors}`,
    ]

    stats.forEach((stat, index) => {
      const statText = this.add.text(-200, -height / 2 + 200 + index * 25, stat, {
        fontSize: '16px',
        color: '#aaaaaa',
      })
      this.directorsPanel.add(statText)
    })

    // List directors
    let yOffset = -height / 2 + 300
    this.worldModel.researchDirectors.forEach((director) => {
      const directorCard = this.createDirectorCard(director, 0, yOffset)
      this.directorsPanel.add(directorCard)
      yOffset += 100
    })

    // Hire new director button
    const hireButton = this.createHireButton(0, yOffset)
    this.directorsPanel.add(hireButton)
  }

  private createDirectorCard(
    director: ResearchDirectorModel,
    x: number,
    y: number,
  ): GameObjects.Container {
    const card = this.add.container(x, y)

    const isSelected = this.selectedDirector?.id === director.id
    const cardBg = this.add.rectangle(0, 0, 460, 90, isSelected ? 0x2a3a4a : 0x2a2a2a, 0.9)
    cardBg.setStrokeStyle(2, isSelected ? 0x4a6a8a : 0x3a3a3a)
    cardBg.setInteractive()
    card.add(cardBg)

    // Director name
    const nameText = this.add.text(-210, -30, director.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    card.add(nameText)

    // Nationality
    const nationalityText = this.add.text(-210, -10, `📍 ${CountryNames[director.nationality]}`, {
      fontSize: '14px',
      color: '#888888',
    })
    card.add(nationalityText)

    // Experience and status
    const expText = this.add.text(-210, 10, director.getExperienceLevel(), {
      fontSize: '14px',
      color: '#88aaff',
    })
    card.add(expText)

    // Salary
    const salaryText = this.add.text(-210, 30, `$${director.salary.toLocaleString()}/mo`, {
      fontSize: '14px',
      color: '#ffaa00',
    })
    card.add(salaryText)

    // Status indicator
    const statusColor = director.isAvailable ? '#00ff00' : '#ff8800'
    const statusText = director.isAvailable ? 'Available' : 'Employed'
    const status = this.add.text(180, 0, statusText, {
      fontSize: '14px',
      color: statusColor,
    })
    status.setOrigin(0.5)
    card.add(status)

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
      this.selectedDirector = director
      this.updateDetailsPanel(director)
      this.refreshDirectorsPanel()
    })

    return card
  }

  private createHireButton(x: number, y: number): GameObjects.Container {
    const button = this.add.container(x, y)

    const bg = this.add.rectangle(0, 0, 460, 60, 0x1a3a1a, 0.9)
    bg.setStrokeStyle(2, 0x2a5a2a)
    bg.setInteractive()
    button.add(bg)

    const text = this.add.text(0, 0, '+ Hire New Director', {
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
      this.hireNewDirector()
    })

    return button
  }

  private createDetailsPanel() {
    const { width, height } = this.cameras.main

    this.detailsPanel = this.add.container(width - 500, height / 2)

    const panelBg = this.add.rectangle(0, 0, 800, height - 200, 0x1a1a1a, 0.95)
    panelBg.setStrokeStyle(2, 0x3a3a3a)
    this.detailsPanel.add(panelBg)

    // Default text
    const defaultText = this.add.text(0, 0, 'Select a director to view details', {
      fontSize: '18px',
      color: '#666666',
    })
    defaultText.setOrigin(0.5)
    this.detailsPanel.add(defaultText)
  }

  private updateDetailsPanel(director: ResearchDirectorModel) {
    // Clear existing details
    this.detailsPanel.removeAll(true)

    const { height } = this.cameras.main

    // Re-add background
    const panelBg = this.add.rectangle(0, 0, 800, height - 200, 0x1a1a1a, 0.95)
    panelBg.setStrokeStyle(2, 0x3a3a3a)
    this.detailsPanel.add(panelBg)

    // Director name
    const titleText = this.add.text(0, -height / 2 + 150, director.name, {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    titleText.setOrigin(0.5)
    this.detailsPanel.add(titleText)

    // Director info
    const info = [
      `Nationality: ${CountryNames[director.nationality]}`,
      `Experience Level: ${director.getExperienceLevel()}`,
      `Projects Completed: ${director.projectsCompleted}`,
      `Salary: $${director.salary.toLocaleString()}/month`,
      `Status: ${director.isAvailable ? 'Available' : `Employed at ${director.currentFacilityId}`}`,
    ]

    info.forEach((text, index) => {
      const infoText = this.add.text(-350, -height / 2 + 220 + index * 30, text, {
        fontSize: '18px',
        color: '#cccccc',
      })
      this.detailsPanel.add(infoText)
    })

    // Traits section
    const traitsTitle = this.add.text(-350, -height / 2 + 400, 'TRAITS:', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    this.detailsPanel.add(traitsTitle)

    const traitDescriptions: Record<string, string> = {
      [DirectorTrait.STINGY]: 'Projects take 15% longer but are 30% cheaper',
      [DirectorTrait.DISCIPLINED]: 'Effects of unpredictability reduced by 50%',
      [DirectorTrait.STRONG_PLANNER]: 'Shows estimated time range for completion',
      [DirectorTrait.INNOVATIVE]: '20% chance of breakthrough each month',
      [DirectorTrait.METHODICAL]: 'Very steady progress with low variance',
      [DirectorTrait.RISK_TAKER]: 'Can skip prerequisites but 30% chance of setback',
      [DirectorTrait.PERFECTIONIST]: 'Takes 25% longer but results are 30% better',
      [DirectorTrait.NETWORKED]: '15% discount on launch costs',
      [DirectorTrait.AMBITIOUS]: 'Can run 2 projects at 70% efficiency each',
      [DirectorTrait.FRUGAL]: 'Monthly costs reduced by 25%',
    }

    director.traits.forEach((trait, index) => {
      const yPos = -height / 2 + 450 + index * 80

      // Trait badge
      const traitBadge = this.add.container(-200, yPos)
      const badgeBg = this.add.rectangle(0, 0, 250, 40, 0x2a4a2a, 0.9)
      badgeBg.setStrokeStyle(1, 0x4a6a4a)
      traitBadge.add(badgeBg)

      const traitText = this.add.text(0, 0, trait, {
        fontSize: '16px',
        color: '#88ff88',
      })
      traitText.setOrigin(0.5)
      traitBadge.add(traitText)
      this.detailsPanel.add(traitBadge)

      // Description
      const desc = traitDescriptions[trait]
      if (desc) {
        const descText = this.add.text(-350, yPos + 30, desc, {
          fontSize: '14px',
          color: '#aaaaaa',
          wordWrap: { width: 700 },
        })
        this.detailsPanel.add(descText)
      }
    })

    // Actions
    if (director.isAvailable) {
      // Fire button (if not employed)
      const fireButton = this.createFireButton(director)
      fireButton.setPosition(0, height / 2 - 100)
      this.detailsPanel.add(fireButton)
    }
  }

  private createFireButton(director: ResearchDirectorModel): GameObjects.Container {
    const button = this.add.container(0, 0)

    const bg = this.add.rectangle(0, 0, 200, 50, 0x5a2a2a, 0.9)
    bg.setStrokeStyle(2, 0x8a4a4a)
    bg.setInteractive()
    button.add(bg)

    const text = this.add.text(0, 0, 'Dismiss Director', {
      fontSize: '16px',
      color: '#ffaaaa',
    })
    text.setOrigin(0.5)
    button.add(text)

    bg.on('pointerover', () => {
      bg.setFillStyle(0x6a3a3a, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(0x5a2a2a, 0.9)
    })

    bg.on('pointerdown', () => {
      this.worldModel.removeResearchDirector(director.id)
      this.selectedDirector = null
      this.refreshDirectorsPanel()
      this.createDetailsPanel() // Reset to default
    })

    return button
  }

  private refreshDirectorsPanel() {
    this.directorsPanel.destroy()
    this.createDirectorsPanel()
  }

  private hireNewDirector() {
    showDirectorHiringDialog(this, this.worldModel, () => {
      this.refreshDirectorsPanel()
    })
  }
}
