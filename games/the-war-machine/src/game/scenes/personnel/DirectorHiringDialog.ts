import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'
import {
  type DirectorStats,
  ResearchDirectorModel,
} from '../../model/entities/ResearchDirectorModel.ts'
import { Country, CountryNames } from '../../model/enums/Countries.ts'
import { DirectorTrait } from '../../model/enums/ResearchDirectorEnums.ts'
import { getScreenCenter, LayoutRegistry } from '../../registries/layoutRegistry.ts'
import { Borders, Colors, Typography } from '../../registries/styleRegistry.ts'

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
    // Use actual camera center instead of hardcoded values
    const center = getScreenCenter(scene)
    super(scene, center.x, center.y)

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
    // Dark overlay - use actual camera dimensions
    const center = getScreenCenter(this.scene)
    this.overlay = this.scene.add.rectangle(
      0,
      0,
      center.width,
      center.height,
      Colors.selection.overlayBg,
      Colors.selection.overlayAlpha,
    )
    this.overlay.setInteractive() // Block clicks
    this.add(this.overlay)

    // Main window
    this.background = this.scene.add.rectangle(
      0,
      0,
      LayoutRegistry.hiring.dialogWidth,
      LayoutRegistry.hiring.dialogHeight,
      Colors.selection.titleBg,
      0.98,
    )
    this.background.setStrokeStyle(Borders.width.thick, Colors.selection.cardBorderHover)
    this.add(this.background)

    // Title
    const titleText = this.isPremiumMode ? 'PREMIUM AGENCY SELECTION' : 'STANDARD AGENCY SELECTION'
    this.titleText = this.scene.add.text(0, LayoutRegistry.selection.title.y - 150, titleText, {
      fontSize: Typography.fontSize.h2,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    this.titleText.setOrigin(0.5)
    this.add(this.titleText)

    // Fee info
    const fee = this.isPremiumMode ? this.premiumFee : this.standardFee
    const feeText = this.scene.add.text(0, -360, `Agency Fee: $${fee.toLocaleString()}`, {
      fontSize: Typography.fontSize.h4,
      color: Colors.selection.salaryText,
    })
    feeText.setOrigin(0.5)
    this.add(feeText)

    // Info text
    const infoText = this.isPremiumMode
      ? 'All traits and stats visible'
      : 'Stats visible, traits hidden for 3 months'
    const info = this.scene.add.text(0, -325, infoText, {
      fontSize: Typography.fontSize.regular,
      color: Colors.text.muted,
      fontStyle: Typography.fontStyle.italic,
    })
    info.setOrigin(0.5)
    this.add(info)

    // Create option cards
    this.options.forEach((option, index) => {
      const xPos = LayoutRegistry.hiring.candidateCard.getXPosition(index)
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
    const cardBg = this.scene.add.rectangle(
      0,
      0,
      LayoutRegistry.hiring.candidateCard.width,
      LayoutRegistry.hiring.candidateCard.height,
      isSelected ? Colors.selection.cardBgSelected : Colors.selection.cardBg,
      0.95,
    )
    cardBg.setStrokeStyle(
      Borders.width.normal,
      isSelected ? Colors.selection.cardBorderSelected : Colors.selection.cardBorder,
    )
    cardBg.setInteractive()
    card.add(cardBg)

    const director = option.director

    // Name
    const nameText = this.scene.add.text(0, -220, director.name, {
      fontSize: Typography.fontSize.h4,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    nameText.setOrigin(0.5)
    card.add(nameText)

    // Nationality
    const natText = this.scene.add.text(0, -190, `📍 ${CountryNames[director.nationality]}`, {
      fontSize: Typography.fontSize.regular,
      color: Colors.text.muted,
    })
    natText.setOrigin(0.5)
    card.add(natText)

    // Salary
    const salaryText = this.scene.add.text(
      0,
      -160,
      `Salary: $${director.salary.toLocaleString()}/mo`,
      {
        fontSize: Typography.fontSize.regular,
        color: Colors.selection.salaryText,
      },
    )
    salaryText.setOrigin(0.5)
    card.add(salaryText)

    // Stats section
    const statsTitle = this.scene.add.text(-180, -120, 'STATS:', {
      fontSize: Typography.fontSize.regular,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
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
        fontSize: Typography.fontSize.small,
        color: Colors.text.secondary,
      })
      card.add(statText)

      // Stat value as stars
      const stars = '★'.repeat(statValues[index]) + '☆'.repeat(5 - statValues[index])
      const valueText = this.scene.add.text(-50, yPos, stars, {
        fontSize: Typography.fontSize.large,
        color: Colors.selection.starRating,
        fontStyle: Typography.fontStyle.bold,
      })
      card.add(valueText)
    })

    // Traits section
    const traitsTitle = this.scene.add.text(-180, 70, 'TRAITS:', {
      fontSize: Typography.fontSize.regular,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    card.add(traitsTitle)

    if (director.traitsRevealed) {
      director.traits.forEach((trait, index) => {
        const yPos = 105 + index * 38
        const traitBadge = this.scene.add.container(0, yPos)

        const badgeBg = this.scene.add.rectangle(0, 0, 360, 34, Colors.selection.traitBadge, 0.9)
        badgeBg.setStrokeStyle(Borders.width.thin, Colors.selection.cardBorderHover)
        traitBadge.add(badgeBg)

        const traitText = this.scene.add.text(0, 0, trait, {
          fontSize: Typography.fontSize.small,
          color: Colors.selection.traitPositive,
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

        const badgeBg = this.scene.add.rectangle(0, 0, 360, 34, Colors.selection.cardBg, 0.9)
        badgeBg.setStrokeStyle(Borders.width.thin, Colors.selection.cardBorder)
        traitBadge.add(badgeBg)

        const traitText = this.scene.add.text(0, 0, '???', {
          fontSize: Typography.fontSize.small,
          color: Colors.selection.traitHidden,
          fontStyle: Typography.fontStyle.italic,
        })
        traitText.setOrigin(0.5)
        traitBadge.add(traitText)

        card.add(traitBadge)
      }

      // Info about reveal
      const revealText = this.scene.add.text(0, 210, 'Traits revealed after 3 months', {
        fontSize: Typography.fontSize.tiny,
        color: Colors.text.muted,
        fontStyle: Typography.fontStyle.italic,
      })
      revealText.setOrigin(0.5)
      card.add(revealText)
    }

    // Selection interaction
    cardBg.on('pointerover', () => {
      if (!isSelected) {
        cardBg.setFillStyle(Colors.selection.cardBgHover, 1)
      }
    })

    cardBg.on('pointerout', () => {
      if (!isSelected) {
        cardBg.setFillStyle(Colors.selection.cardBg, 0.95)
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
      const xPos = LayoutRegistry.hiring.candidateCard.getXPosition(index)
      const optionCard = this.createOptionCard(option, xPos, 0)
      this.optionContainers.push(optionCard)
      this.add(optionCard)
    })
  }

  private createButtons() {
    // Hire button (on the left)
    const hireButton = this.scene.add.container(
      LayoutRegistry.hiring.buttons.hire.x,
      LayoutRegistry.hiring.buttons.hire.y,
    )
    const hireBg = this.scene.add.rectangle(
      0,
      0,
      LayoutRegistry.hiring.buttons.hire.width,
      LayoutRegistry.hiring.buttons.hire.height,
      Colors.selection.confirmButton,
      0.9,
    )
    hireBg.setStrokeStyle(Borders.width.normal, Colors.selection.confirmButtonHover)
    hireBg.setInteractive()
    hireButton.add(hireBg)

    const hireText = this.scene.add.text(0, 0, 'Hire Selected', {
      fontSize: Typography.fontSize.button,
      color: Colors.text.primary,
    })
    hireText.setOrigin(0.5)
    hireButton.add(hireText)

    hireBg.on('pointerover', () => {
      hireBg.setFillStyle(Colors.selection.confirmButtonHover, 1)
    })

    hireBg.on('pointerout', () => {
      hireBg.setFillStyle(Colors.selection.confirmButton, 0.9)
    })

    hireBg.on('pointerdown', () => {
      if (this.selectedOption) {
        this.onConfirm(this.selectedOption.director)
        this.destroy()
      }
    })

    this.add(hireButton)

    // Skip button (on the right)
    const skipButton = this.scene.add.container(
      LayoutRegistry.hiring.buttons.skip.x,
      LayoutRegistry.hiring.buttons.skip.y,
    )
    const skipBg = this.scene.add.rectangle(
      0,
      0,
      LayoutRegistry.hiring.buttons.skip.width,
      LayoutRegistry.hiring.buttons.skip.height,
      Colors.selection.skipButton,
      0.9,
    )
    skipBg.setStrokeStyle(Borders.width.normal, Colors.selection.skipButtonHover)
    skipBg.setInteractive()
    skipButton.add(skipBg)

    const skipText = this.scene.add.text(0, 0, 'Skip (Lose Fee)', {
      fontSize: Typography.fontSize.button,
      color: Colors.selection.skipButtonText,
    })
    skipText.setOrigin(0.5)
    skipButton.add(skipText)

    skipBg.on('pointerover', () => {
      skipBg.setFillStyle(Colors.selection.skipButtonHover, 1)
    })

    skipBg.on('pointerout', () => {
      skipBg.setFillStyle(Colors.selection.skipButton, 0.9)
    })

    skipBg.on('pointerdown', () => {
      this.onConfirm(null)
      this.destroy()
    })

    this.add(skipButton)
  }
}
