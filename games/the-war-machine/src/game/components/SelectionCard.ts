import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import { GameObjects } from 'phaser'
import { Borders, Colors, Typography } from '../registries/styleRegistry.ts'

/**
 * Configuration for the SelectionCard component
 */
export interface SelectionCardConfig {
  width: number
  height: number
  backgroundColor?: number
  backgroundAlpha?: number
  borderColor?: number
  borderWidth?: number
  borderRadius?: number
  hoverColor?: number
  hoverBorderColor?: number
  selectedColor?: number
  selectedBorderColor?: number
  glowColor?: number
  glowEnabled?: boolean
}

/**
 * Content sections for the card
 */
export interface CardSection {
  type: 'title' | 'subtitle' | 'text' | 'stars' | 'badge' | 'level' | 'custom'
  text?: string
  x?: number
  y: number
  style?: Phaser.Types.GameObjects.Text.TextStyle
  // For stars
  rating?: number
  maxRating?: number
  filledColor?: string
  emptyColor?: string
  // For badge
  badgeColor?: number
  badgeBorderColor?: number
  badgeAlpha?: number
  // For level indicators
  level?: number
  maxLevel?: number
  levelColor?: number
  // For custom renderer
  customRenderer?: (container: GameObjects.Container) => void
}

/**
 * Callbacks for the card
 */
export interface SelectionCardCallbacks {
  onHover?: () => void
  onHoverOut?: () => void
  onClick?: () => void
}

/**
 * A reusable card component for selection screens
 */
export class SelectionCard extends GameObjects.Container {
  private config: SelectionCardConfig
  private background: GameObjects.Graphics
  private glowBg?: GameObjects.Graphics
  private isSelected: boolean = false
  private sections: CardSection[] = []
  private callbacks: SelectionCardCallbacks

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    config: SelectionCardConfig,
    sections: CardSection[],
    callbacks: SelectionCardCallbacks = {},
  ) {
    super(scene, x, y)

    // Set default config values
    this.config = {
      backgroundColor: Colors.selection.cardBg,
      backgroundAlpha: 0.95,
      borderColor: Colors.selection.cardBorder,
      borderWidth: Borders.width.normal,
      borderRadius: Borders.radius.medium,
      hoverColor: Colors.selection.cardBgHover,
      hoverBorderColor: Colors.selection.cardBorderHover,
      selectedColor: Colors.selection.cardBgSelected,
      selectedBorderColor: Colors.selection.cardBorderSelected,
      glowColor: Colors.selection.vendorGlow,
      glowEnabled: false,
      ...config,
    }

    this.sections = sections
    this.callbacks = callbacks

    this.createCard()
    scene.add.existing(this)
  }

  private createCard(): void {
    const { width, height } = this.config

    // Create background
    this.background = this.scene.add.graphics()
    this.updateBackgroundStyle()
    this.add(this.background)

    // Create glow effect if enabled
    if (this.config.glowEnabled) {
      this.glowBg = this.scene.add.graphics()
      this.glowBg.lineStyle(Borders.width.heavy, this.config.glowColor!, 0)
      this.glowBg.strokeRoundedRect(
        -width / 2,
        -height / 2,
        width,
        height,
        this.config.borderRadius!,
      )
      this.glowBg.setVisible(false)
      this.add(this.glowBg)
    }

    // Add content sections
    this.sections.forEach((section) => {
      this.addSection(section)
    })

    // Make interactive
    this.background.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains,
    )

    // Set up interactions
    this.setupInteractions()
  }

  private updateBackgroundStyle(): void {
    const { width, height } = this.config
    const bgColor = this.isSelected ? this.config.selectedColor! : this.config.backgroundColor!
    const borderColor = this.isSelected
      ? this.config.selectedBorderColor!
      : this.config.borderColor!

    this.background.clear()
    this.background.fillStyle(bgColor, this.config.backgroundAlpha!)
    this.background.fillRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      this.config.borderRadius!,
    )
    this.background.lineStyle(this.config.borderWidth!, borderColor, 1)
    this.background.strokeRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      this.config.borderRadius!,
    )
  }

  private addSection(section: CardSection): void {
    const x = section.x || 0

    switch (section.type) {
      case 'title':
        this.addText(x, section.y, section.text!, {
          fontSize: Typography.fontSize.h4,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.text.primary,
          fontStyle: Typography.fontStyle.bold,
          ...section.style,
        })
        break

      case 'subtitle':
        this.addText(x, section.y, section.text!, {
          fontSize: Typography.fontSize.regular,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.text.secondary,
          ...section.style,
        })
        break

      case 'text':
        this.addText(x, section.y, section.text!, {
          fontSize: Typography.fontSize.small,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.text.muted,
          ...section.style,
        })
        break

      case 'stars':
        this.addStarRating(x, section.y, section)
        break

      case 'badge':
        this.addBadge(x, section.y, section)
        break

      case 'level':
        this.addLevelIndicators(x, section.y, section)
        break

      case 'custom':
        if (section.customRenderer) {
          section.customRenderer(this)
        }
        break
    }
  }

  private addText(
    x: number,
    y: number,
    text: string,
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ): void {
    const textObj = this.scene.add.text(x, y, text, style)
    textObj.setOrigin(0.5)
    this.add(textObj)
  }

  private addStarRating(x: number, y: number, section: CardSection): void {
    const rating = section.rating || 0
    const maxRating = section.maxRating || 5
    const filledColor = section.filledColor || Colors.selection.starRating
    const emptyColor = section.emptyColor || Colors.selection.starEmpty

    const stars = '★'.repeat(rating) + '☆'.repeat(maxRating - rating)

    const starText = this.scene.add.text(x, y, stars, {
      fontSize: Typography.fontSize.h4,
      fontFamily: Typography.fontFamily.primary,
      color: filledColor,
      ...section.style,
    })
    starText.setOrigin(0.5)

    // Color the empty stars differently
    if (rating < maxRating) {
      const gradient = this.scene.add.text(x, y, '★'.repeat(rating), {
        fontSize: Typography.fontSize.h4,
        fontFamily: Typography.fontFamily.primary,
        color: filledColor,
        ...section.style,
      })
      gradient.setOrigin(0.5)
      this.add(gradient)
    }

    this.add(starText)
  }

  private addBadge(x: number, y: number, section: CardSection): void {
    if (!section.text) return

    const badgeContainer = this.scene.add.container(x, y)
    const width = this.config.width - 40

    const badgeBg = this.scene.add.rectangle(
      0,
      0,
      width,
      34,
      section.badgeColor || Colors.selection.traitBadge,
      section.badgeAlpha || 0.9,
    )
    badgeBg.setStrokeStyle(
      Borders.width.thin,
      section.badgeBorderColor || Colors.selection.cardBorderHover,
    )
    badgeContainer.add(badgeBg)

    const badgeText = this.scene.add.text(0, 0, section.text, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.selection.traitPositive,
      ...section.style,
    })
    badgeText.setOrigin(0.5)
    badgeContainer.add(badgeText)

    this.add(badgeContainer)
  }

  private addLevelIndicators(x: number, y: number, section: CardSection): void {
    const level = section.level || 0
    const maxLevel = section.maxLevel || 5
    const color = section.levelColor || Colors.selection.techLevelFill
    const boxSize = 28
    const spacing = 6

    const container = this.scene.add.container(x, y)

    for (let i = 0; i < maxLevel; i++) {
      const boxX = i * (boxSize + spacing) - (maxLevel * (boxSize + spacing)) / 2 + boxSize / 2
      const box = this.scene.add.graphics()

      if (i < level) {
        // Filled box
        box.fillStyle(color, 0.9)
        box.fillRoundedRect(
          boxX - boxSize / 2,
          -boxSize / 2,
          boxSize,
          boxSize,
          Borders.radius.small,
        )
        box.lineStyle(Borders.width.thin, color, 1)
        box.strokeRoundedRect(
          boxX - boxSize / 2,
          -boxSize / 2,
          boxSize,
          boxSize,
          Borders.radius.small,
        )
      } else {
        // Empty box
        box.fillStyle(Colors.selection.emptyLevelBox, 0.4)
        box.fillRoundedRect(
          boxX - boxSize / 2,
          -boxSize / 2,
          boxSize,
          boxSize,
          Borders.radius.small,
        )
        box.lineStyle(Borders.width.thin, Colors.selection.emptyLevelBorder, 0.6)
        box.strokeRoundedRect(
          boxX - boxSize / 2,
          -boxSize / 2,
          boxSize,
          boxSize,
          Borders.radius.small,
        )
      }

      container.add(box)
    }

    this.add(container)
  }

  private setupInteractions(): void {
    this.background.on('pointerover', () => {
      if (!this.isSelected) {
        this.background.clear()
        this.background.fillStyle(this.config.hoverColor!, this.config.backgroundAlpha!)
        this.background.fillRoundedRect(
          -this.config.width / 2,
          -this.config.height / 2,
          this.config.width,
          this.config.height,
          this.config.borderRadius!,
        )
        this.background.lineStyle(this.config.borderWidth!, this.config.hoverBorderColor!, 1)
        this.background.strokeRoundedRect(
          -this.config.width / 2,
          -this.config.height / 2,
          this.config.width,
          this.config.height,
          this.config.borderRadius!,
        )

        if (this.glowBg) {
          this.glowBg.clear()
          this.glowBg.lineStyle(Borders.width.heavy, this.config.glowColor!, 0.8)
          this.glowBg.strokeRoundedRect(
            -this.config.width / 2,
            -this.config.height / 2,
            this.config.width,
            this.config.height,
            this.config.borderRadius!,
          )
          this.glowBg.setVisible(true)
        }

        if (this.config.glowEnabled) {
          this.setScale(1.05)
        }
      }

      this.callbacks.onHover?.()
    })

    this.background.on('pointerout', () => {
      if (!this.isSelected) {
        this.updateBackgroundStyle()

        if (this.glowBg) {
          this.glowBg.setVisible(false)
        }

        if (this.config.glowEnabled) {
          this.setScale(1)
        }
      }

      this.callbacks.onHoverOut?.()
    })

    this.background.on('pointerdown', () => {
      this.callbacks.onClick?.()
    })
  }

  /**
   * Set the selected state of the card
   */
  public setSelected(selected: boolean): void {
    this.isSelected = selected
    this.updateBackgroundStyle()

    if (this.glowBg) {
      if (selected) {
        this.glowBg.clear()
        this.glowBg.lineStyle(Borders.width.heavy, this.config.glowColor!, 0.5)
        this.glowBg.strokeRoundedRect(
          -this.config.width / 2,
          -this.config.height / 2,
          this.config.width,
          this.config.height,
          this.config.borderRadius!,
        )
        this.glowBg.setVisible(true)
      } else {
        this.glowBg.setVisible(false)
      }
    }
  }

  /**
   * Update a section's content
   */
  public updateSection(index: number, section: CardSection): void {
    // Clear and recreate (simple approach for now)
    this.removeAll(true)
    this.sections[index] = section
    this.createCard()
  }
}
