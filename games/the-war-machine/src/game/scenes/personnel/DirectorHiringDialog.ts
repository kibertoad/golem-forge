import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'
import {
  type DirectorStats,
  ResearchDirectorModel,
} from '../../model/entities/ResearchDirectorModel.ts'
import { Country, CountryNames } from '../../model/enums/Countries.ts'
import { DirectorTrait } from '../../model/enums/ResearchDirectorEnums.ts'

export interface HiringOption {
  director: ResearchDirectorModel
  isPremium: boolean
}

export class DirectorHiringDialog extends GameObjects.Container {
  private background: GameObjects.Rectangle
  private overlay: GameObjects.Rectangle
  private titleText: GameObjects.Text
  private options: HiringOption[] = []
  private optionContainers: GameObjects.Container[] = []
  private selectedOption: HiringOption | null = null
  private onConfirm: (director: ResearchDirectorModel | null) => void
  private standardFee: number
  private premiumFee: number
  private isPremiumMode: boolean

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    isPremium: boolean,
    onConfirm: (director: ResearchDirectorModel | null) => void,
  ) {
    super(scene, x, y)

    this.isPremiumMode = isPremium
    this.standardFee = 50000
    this.premiumFee = 150000
    this.onConfirm = onConfirm

    // Generate 3 random directors
    this.generateDirectorOptions()

    // Create UI
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
    this.background = this.scene.add.rectangle(0, 0, 1400, 900, 0x1a1a1a, 0.98)
    this.background.setStrokeStyle(3, 0x4a4a4a)
    this.add(this.background)

    // Title
    const titleText = this.isPremiumMode ? 'PREMIUM AGENCY SELECTION' : 'STANDARD AGENCY SELECTION'
    this.titleText = this.scene.add.text(0, -400, titleText, {
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    this.titleText.setOrigin(0.5)
    this.add(this.titleText)

    // Fee info
    const fee = this.isPremiumMode ? this.premiumFee : this.standardFee
    const feeText = this.scene.add.text(0, -360, `Agency Fee: $${fee.toLocaleString()}`, {
      fontSize: '24px',
      color: '#ffaa00',
    })
    feeText.setOrigin(0.5)
    this.add(feeText)

    // Info text
    const infoText = this.isPremiumMode
      ? 'All traits and stats visible'
      : 'Stats visible, traits hidden for 3 months'
    const info = this.scene.add.text(0, -325, infoText, {
      fontSize: '18px',
      color: '#aaaaaa',
      fontStyle: 'italic',
    })
    info.setOrigin(0.5)
    this.add(info)

    // Create option cards
    this.options.forEach((option, index) => {
      const xPos = -450 + index * 450
      const optionCard = this.createOptionCard(option, xPos, 0)
      this.optionContainers.push(optionCard)
      this.add(optionCard)
    })

    // Buttons
    this.createButtons()
  }

  private generateDirectorOptions() {
    const names = [
      'Dr. Elena Volkov',
      'Prof. Zhang Wei',
      'Dr. Ahmed Farouk',
      'Dr. Sofia Martinez',
      'Prof. Sven Larsson',
      'Dr. Priya Mehta',
      'Dr. Carlos Silva',
      'Prof. Otto Krause',
      'Dr. Aisha Okonkwo',
      'Dr. Robert Clarke',
      'Prof. Natasha Petrov',
      'Dr. Hiroshi Yamamoto',
    ]

    const countries = [
      Country.USA,
      Country.RUSSIA,
      Country.CHINA,
      Country.UK,
      Country.GERMANY,
      Country.INDIA,
      Country.JAPAN,
      Country.FRANCE,
      Country.ISRAEL,
      Country.BRAZIL,
      Country.EGYPT,
      Country.SOUTH_AFRICA,
    ]

    for (let i = 0; i < 3; i++) {
      const stats: DirectorStats = {
        talent: 1 + Math.floor(Math.random() * 5), // 1-5 stars
        morality: 1 + Math.floor(Math.random() * 5), // 1-5 stars
        expertise: 1 + Math.floor(Math.random() * 5), // 1-5 stars
        management: 1 + Math.floor(Math.random() * 5), // 1-5 stars
      }

      // Generate traits
      const allTraits = Object.values(DirectorTrait)
      const numTraits = 1 + Math.floor(Math.random() * 3)
      const traits: DirectorTrait[] = []

      for (let j = 0; j < numTraits; j++) {
        const trait = allTraits[Math.floor(Math.random() * allTraits.length)]
        if (!traits.includes(trait)) {
          traits.push(trait)
        }
      }

      // Calculate salary based on stats and traits (adjusted for 5-star scale)
      const baseSalary =
        5000 + stats.talent * 2000 + stats.expertise * 1600 + stats.management * 1200
      let salaryModifier = 1

      if (traits.includes(DirectorTrait.STINGY)) salaryModifier *= 0.8
      if (traits.includes(DirectorTrait.FRUGAL)) salaryModifier *= 0.85
      if (traits.includes(DirectorTrait.PERFECTIONIST)) salaryModifier *= 1.2
      if (traits.includes(DirectorTrait.INNOVATIVE)) salaryModifier *= 1.15

      const director = new ResearchDirectorModel({
        name: names[Math.floor(Math.random() * names.length)],
        nationality: countries[Math.floor(Math.random() * countries.length)],
        traits,
        stats,
        salary: Math.floor(baseSalary * salaryModifier),
        traitsRevealed: this.isPremiumMode,
      })

      this.options.push({
        director,
        isPremium: this.isPremiumMode,
      })
    }
  }

  private createOptionCard(option: HiringOption, x: number, y: number): GameObjects.Container {
    const card = this.scene.add.container(x, y)
    const isSelected = this.selectedOption === option

    // Card background
    const cardBg = this.scene.add.rectangle(0, 0, 400, 500, isSelected ? 0x2a3a4a : 0x2a2a2a, 0.95)
    cardBg.setStrokeStyle(2, isSelected ? 0x4a6a8a : 0x3a3a3a)
    cardBg.setInteractive()
    card.add(cardBg)

    const director = option.director

    // Name
    const nameText = this.scene.add.text(0, -220, director.name, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    nameText.setOrigin(0.5)
    card.add(nameText)

    // Nationality
    const natText = this.scene.add.text(0, -190, `📍 ${CountryNames[director.nationality]}`, {
      fontSize: '18px',
      color: '#888888',
    })
    natText.setOrigin(0.5)
    card.add(natText)

    // Salary
    const salaryText = this.scene.add.text(
      0,
      -160,
      `Salary: $${director.salary.toLocaleString()}/mo`,
      {
        fontSize: '18px',
        color: '#ffaa00',
      },
    )
    salaryText.setOrigin(0.5)
    card.add(salaryText)

    // Stats section
    const statsTitle = this.scene.add.text(-180, -120, 'STATS:', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    card.add(statsTitle)

    const statNames = ['Talent', 'Morality', 'Expertise', 'Management']
    const statValues = [
      director.stats.talent,
      director.stats.morality,
      director.stats.expertise,
      director.stats.management,
    ]

    statNames.forEach((statName, index) => {
      const yPos = -85 + index * 38

      // Stat name
      const statText = this.scene.add.text(-180, yPos, statName, {
        fontSize: '16px',
        color: '#aaaaaa',
      })
      card.add(statText)

      // Stat value as stars
      const stars = '★'.repeat(statValues[index]) + '☆'.repeat(5 - statValues[index])
      const valueText = this.scene.add.text(-50, yPos, stars, {
        fontSize: '20px',
        color: '#ffcc00',
        fontStyle: 'bold',
      })
      card.add(valueText)
    })

    // Traits section
    const traitsTitle = this.scene.add.text(-180, 70, 'TRAITS:', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    card.add(traitsTitle)

    if (director.traitsRevealed) {
      director.traits.forEach((trait, index) => {
        const yPos = 105 + index * 38
        const traitBadge = this.scene.add.container(0, yPos)

        const badgeBg = this.scene.add.rectangle(0, 0, 360, 34, 0x2a4a2a, 0.9)
        badgeBg.setStrokeStyle(1, 0x4a6a4a)
        traitBadge.add(badgeBg)

        const traitText = this.scene.add.text(0, 0, trait, {
          fontSize: '16px',
          color: '#88ff88',
        })
        traitText.setOrigin(0.5)
        traitBadge.add(traitText)

        card.add(traitBadge)
      })
    } else {
      // Show ??? for hidden traits
      for (let i = 0; i < director.traits.length; i++) {
        const yPos = 105 + i * 38
        const traitBadge = this.scene.add.container(0, yPos)

        const badgeBg = this.scene.add.rectangle(0, 0, 360, 34, 0x2a2a2a, 0.9)
        badgeBg.setStrokeStyle(1, 0x3a3a3a)
        traitBadge.add(badgeBg)

        const traitText = this.scene.add.text(0, 0, '???', {
          fontSize: '16px',
          color: '#666666',
          fontStyle: 'italic',
        })
        traitText.setOrigin(0.5)
        traitBadge.add(traitText)

        card.add(traitBadge)
      }

      // Info about reveal
      const revealText = this.scene.add.text(0, 210, 'Traits revealed after 3 months', {
        fontSize: '14px',
        color: '#888888',
        fontStyle: 'italic',
      })
      revealText.setOrigin(0.5)
      card.add(revealText)
    }

    // Selection interaction
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
      this.selectOption(option)
    })

    return card
  }

  private selectOption(option: HiringOption) {
    this.selectedOption = option
    this.refreshCards()
  }

  private refreshCards() {
    // Destroy and recreate cards to update selection state
    this.optionContainers.forEach((container) => container.destroy())
    this.optionContainers = []

    this.options.forEach((option, index) => {
      const xPos = -450 + index * 450
      const optionCard = this.createOptionCard(option, xPos, 0)
      this.optionContainers.push(optionCard)
      this.add(optionCard)
    })
  }

  private createButtons() {
    // Hire button (on the left)
    const hireButton = this.scene.add.container(-150, 380)
    const hireBg = this.scene.add.rectangle(0, 0, 200, 50, 0x2a5a2a, 0.9)
    hireBg.setStrokeStyle(2, 0x4a8a4a)
    hireBg.setInteractive()
    hireButton.add(hireBg)

    const hireText = this.scene.add.text(0, 0, 'Hire Selected', {
      fontSize: '20px',
      color: '#ffffff',
    })
    hireText.setOrigin(0.5)
    hireButton.add(hireText)

    hireBg.on('pointerover', () => {
      hireBg.setFillStyle(0x3a6a3a, 1)
    })

    hireBg.on('pointerout', () => {
      hireBg.setFillStyle(0x2a5a2a, 0.9)
    })

    hireBg.on('pointerdown', () => {
      if (this.selectedOption) {
        this.onConfirm(this.selectedOption.director)
        this.destroy()
      }
    })

    this.add(hireButton)

    // Skip button (on the right)
    const skipButton = this.scene.add.container(150, 380)
    const skipBg = this.scene.add.rectangle(0, 0, 200, 50, 0x3a3a3a, 0.9)
    skipBg.setStrokeStyle(2, 0x5a5a5a)
    skipBg.setInteractive()
    skipButton.add(skipBg)

    const skipText = this.scene.add.text(0, 0, 'Skip (Lose Fee)', {
      fontSize: '20px',
      color: '#ffaaaa',
    })
    skipText.setOrigin(0.5)
    skipButton.add(skipText)

    skipBg.on('pointerover', () => {
      skipBg.setFillStyle(0x4a4a4a, 1)
    })

    skipBg.on('pointerout', () => {
      skipBg.setFillStyle(0x3a3a3a, 0.9)
    })

    skipBg.on('pointerdown', () => {
      this.onConfirm(null)
      this.destroy()
    })

    this.add(skipButton)
  }
}
