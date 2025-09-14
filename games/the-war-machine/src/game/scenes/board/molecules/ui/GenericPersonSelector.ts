import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'

export interface PersonData {
  id: string
  name: string
  nationality: string
  traits?: string[]
  skills?: Record<string, number>
  salary?: number
  experience?: string
  isAvailable: boolean
}

export interface PersonSelectionContext {
  title: string
  detailsPanel?: (scene: PotatoScene, person: PersonData) => GameObjects.Container
  costCalculator?: (person: PersonData) => number
  canSelectValidator?: (
    person: PersonData,
    currentMoney: number,
  ) => { canSelect: boolean; reason?: string }
  confirmButtonText?: string
  showAddNewButton?: boolean
  addNewButtonText?: string
  onAddNew?: () => void
}

export class GenericPersonSelector extends GameObjects.Container {
  private background: GameObjects.Rectangle
  private titleText: GameObjects.Text
  private peopleList: GameObjects.Container
  private detailsPanel: GameObjects.Container | null = null
  private confirmButton: GameObjects.Container | null = null
  private cancelButton: GameObjects.Container
  private selectedPerson: PersonData | null = null
  private onConfirm: (person: PersonData) => void
  private people: PersonData[]
  private context: PersonSelectionContext
  private currentMoney: number

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    people: PersonData[],
    context: PersonSelectionContext,
    currentMoney: number,
    onConfirm: (person: PersonData) => void,
  ) {
    super(scene, x, y)

    this.people = people
    this.context = context
    this.currentMoney = currentMoney
    this.onConfirm = onConfirm

    // Semi-transparent overlay
    const overlay = scene.add.rectangle(0, 0, 2560, 1440, 0x000000, 0.7)
    overlay.setInteractive() // Block clicks to underlying scene
    this.add(overlay)

    // Main window
    this.background = scene.add.rectangle(0, 0, 1200, 800, 0x1a1a1a, 0.98)
    this.background.setStrokeStyle(3, 0x4a4a4a)
    this.add(this.background)

    // Title
    this.titleText = scene.add.text(0, -360, context.title, {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    this.titleText.setOrigin(0.5)
    this.add(this.titleText)

    // People list on left
    this.createPeopleList()

    // Cancel button
    this.cancelButton = this.createCancelButton()
    this.add(this.cancelButton)

    scene.add.existing(this)
    this.setDepth(2000)
  }

  private createPeopleList() {
    this.peopleList = this.scene.add.container(-300, 0)

    const listBg = this.scene.add.rectangle(0, 0, 500, 650, 0x0a0a0a, 0.9)
    listBg.setStrokeStyle(1, 0x3a3a3a)
    this.peopleList.add(listBg)

    // Header
    const headerText = this.scene.add.text(0, -300, 'AVAILABLE PERSONNEL', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontStyle: 'bold',
    })
    headerText.setOrigin(0.5)
    this.peopleList.add(headerText)

    // List available people
    const availablePeople = this.people.filter((p) => p.isAvailable)
    let yOffset = -250

    if (availablePeople.length === 0) {
      const noneText = this.scene.add.text(0, 0, 'No personnel available', {
        fontSize: '16px',
        color: '#666666',
      })
      noneText.setOrigin(0.5)
      this.peopleList.add(noneText)
      yOffset += 90
    } else {
      availablePeople.forEach((person, index) => {
        const personCard = this.createPersonCard(person, index)
        this.peopleList.add(personCard)
      })
      yOffset = -250 + availablePeople.length * 90
    }

    // Add "Hire new" button if configured
    if (this.context.showAddNewButton && this.context.onAddNew) {
      const addNewButton = this.createAddNewButton(yOffset)
      this.peopleList.add(addNewButton)
    }

    this.add(this.peopleList)
  }

  private createPersonCard(person: PersonData, index: number): GameObjects.Container {
    const card = this.scene.add.container(0, -250 + index * 90)

    const isSelected = this.selectedPerson?.id === person.id
    const cardBg = this.scene.add.rectangle(0, 0, 460, 80, isSelected ? 0x2a3a4a : 0x1a1a1a, 0.9)
    cardBg.setStrokeStyle(1, isSelected ? 0x4a6a8a : 0x2a2a2a)
    cardBg.setInteractive()
    card.add(cardBg)

    // Name
    const nameText = this.scene.add.text(-210, -25, person.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    card.add(nameText)

    // Nationality
    const nationalityText = this.scene.add.text(-210, -5, `📍 ${person.nationality}`, {
      fontSize: '14px',
      color: '#888888',
    })
    card.add(nationalityText)

    // Salary if available
    if (person.salary) {
      const salaryText = this.scene.add.text(
        -210,
        15,
        `Salary: $${person.salary.toLocaleString()}/month`,
        {
          fontSize: '14px',
          color: '#ffaa00',
        },
      )
      card.add(salaryText)
    }

    // Experience if available
    if (person.experience) {
      const expText = this.scene.add.text(100, 0, person.experience, {
        fontSize: '14px',
        color: '#88aaff',
      })
      expText.setOrigin(0.5)
      card.add(expText)
    }

    cardBg.on('pointerover', () => {
      if (!isSelected) {
        cardBg.setFillStyle(0x2a2a2a, 1)
      }
    })

    cardBg.on('pointerout', () => {
      if (!isSelected) {
        cardBg.setFillStyle(0x1a1a1a, 0.9)
      }
    })

    cardBg.on('pointerdown', () => {
      this.selectPerson(person)
    })

    return card
  }

  private selectPerson(person: PersonData) {
    this.selectedPerson = person

    // Recreate people list to update selection
    this.peopleList.destroy()
    this.createPeopleList()

    // Update or create details panel
    if (this.detailsPanel) {
      this.detailsPanel.destroy()
    }

    if (this.context.detailsPanel) {
      this.detailsPanel = this.context.detailsPanel(this.scene as PotatoScene, person)
      this.detailsPanel.setPosition(300, 0)
      this.add(this.detailsPanel)
    } else {
      // Default details panel
      this.detailsPanel = this.createDefaultDetailsPanel(person)
      this.add(this.detailsPanel)
    }

    // Update or create confirm button
    if (this.confirmButton) {
      this.confirmButton.destroy()
    }

    const validation = this.context.canSelectValidator
      ? this.context.canSelectValidator(person, this.currentMoney)
      : { canSelect: true }

    this.confirmButton = this.createConfirmButton(validation.canSelect, validation.reason)
    this.add(this.confirmButton)
  }

  private createDefaultDetailsPanel(person: PersonData): GameObjects.Container {
    const panel = this.scene.add.container(300, 0)

    const panelBg = this.scene.add.rectangle(0, 0, 500, 650, 0x0a0a0a, 0.9)
    panelBg.setStrokeStyle(1, 0x3a3a3a)
    panel.add(panelBg)

    // Person name
    const nameText = this.scene.add.text(0, -280, person.name, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    nameText.setOrigin(0.5)
    panel.add(nameText)

    // Details
    let yOffset = -230

    if (person.nationality) {
      const natText = this.scene.add.text(-220, yOffset, `Nationality: ${person.nationality}`, {
        fontSize: '16px',
        color: '#aaaaaa',
      })
      panel.add(natText)
      yOffset += 30
    }

    if (person.salary) {
      const salaryText = this.scene.add.text(
        -220,
        yOffset,
        `Salary: $${person.salary.toLocaleString()}/month`,
        {
          fontSize: '16px',
          color: '#ffaa00',
        },
      )
      panel.add(salaryText)
      yOffset += 30
    }

    if (person.experience) {
      const expText = this.scene.add.text(-220, yOffset, `Experience: ${person.experience}`, {
        fontSize: '16px',
        color: '#88aaff',
      })
      panel.add(expText)
      yOffset += 30
    }

    // Traits
    if (person.traits && person.traits.length > 0) {
      yOffset += 20
      const traitsHeader = this.scene.add.text(-220, yOffset, 'TRAITS:', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      panel.add(traitsHeader)
      yOffset += 35

      person.traits.forEach((trait) => {
        const traitBadge = this.scene.add.container(-100, yOffset)

        const badgeBg = this.scene.add.rectangle(0, 0, 200, 35, 0x2a4a2a, 0.9)
        badgeBg.setStrokeStyle(1, 0x4a6a4a)
        traitBadge.add(badgeBg)

        const traitText = this.scene.add.text(0, 0, trait, {
          fontSize: '14px',
          color: '#88ff88',
        })
        traitText.setOrigin(0.5)
        traitBadge.add(traitText)

        panel.add(traitBadge)
        yOffset += 45
      })
    }

    // Skills
    if (person.skills) {
      yOffset += 20
      const skillsHeader = this.scene.add.text(-220, yOffset, 'SKILLS:', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      panel.add(skillsHeader)
      yOffset += 35

      Object.entries(person.skills).forEach(([skill, value]) => {
        const skillText = this.scene.add.text(-220, yOffset, skill, {
          fontSize: '14px',
          color: '#aaaaaa',
        })
        panel.add(skillText)

        // Skill bar
        const barBg = this.scene.add.rectangle(-20, yOffset + 8, 200, 12, 0x333333, 0.8)
        barBg.setOrigin(0, 0.5)
        panel.add(barBg)

        const barFill = this.scene.add.rectangle(
          -20,
          yOffset + 8,
          (200 * value) / 10,
          12,
          0x4488ff,
          1,
        )
        barFill.setOrigin(0, 0.5)
        panel.add(barFill)

        yOffset += 30
      })
    }

    return panel
  }

  private createConfirmButton(canSelect: boolean, reason?: string): GameObjects.Container {
    const button = this.scene.add.container(300, 340)

    const bg = this.scene.add.rectangle(0, 0, 250, 50, canSelect ? 0x2a5a2a : 0x3a3a3a, 0.9)
    bg.setStrokeStyle(2, canSelect ? 0x4a8a4a : 0x5a5a5a)

    if (canSelect) {
      bg.setInteractive()
    }

    button.add(bg)

    const text = this.scene.add.text(0, 0, this.context.confirmButtonText || 'Confirm Selection', {
      fontSize: '18px',
      color: canSelect ? '#ffffff' : '#666666',
    })
    text.setOrigin(0.5)
    button.add(text)

    if (!canSelect && reason) {
      const reasonText = this.scene.add.text(0, 35, reason, {
        fontSize: '14px',
        color: '#ff6666',
      })
      reasonText.setOrigin(0.5)
      button.add(reasonText)
    }

    if (canSelect) {
      bg.on('pointerover', () => {
        bg.setFillStyle(0x3a6a3a, 1)
      })

      bg.on('pointerout', () => {
        bg.setFillStyle(0x2a5a2a, 0.9)
      })

      bg.on('pointerdown', () => {
        if (this.selectedPerson) {
          this.onConfirm(this.selectedPerson)
          this.destroy()
        }
      })
    }

    return button
  }

  private createCancelButton(): GameObjects.Container {
    const button = this.scene.add.container(-450, 340)

    const bg = this.scene.add.rectangle(0, 0, 150, 50, 0x3a3a3a, 0.9)
    bg.setStrokeStyle(2, 0x5a5a5a)
    bg.setInteractive()
    button.add(bg)

    const text = this.scene.add.text(0, 0, 'Cancel', {
      fontSize: '18px',
      color: '#ffffff',
    })
    text.setOrigin(0.5)
    button.add(text)

    bg.on('pointerover', () => {
      bg.setFillStyle(0x4a4a4a, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(0x3a3a3a, 0.9)
    })

    bg.on('pointerdown', () => {
      this.destroy()
    })

    return button
  }

  private createAddNewButton(yPosition: number): GameObjects.Container {
    const button = this.scene.add.container(0, yPosition)

    const bg = this.scene.add.rectangle(0, 0, 460, 60, 0x1a3a1a, 0.9)
    bg.setStrokeStyle(2, 0x2a5a2a)
    bg.setInteractive()
    button.add(bg)

    const text = this.scene.add.text(0, 0, this.context.addNewButtonText || '+ Hire New Director', {
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
      if (this.context.onAddNew) {
        this.destroy() // Close the selector
        this.context.onAddNew()
      }
    })

    return button
  }
}
