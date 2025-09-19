import { GameObjects } from 'phaser'
import type { PotatoScene } from '@potato-golem/ui'
import type { WorldModel } from '../../../model/entities/WorldModel.ts'
import type { CountryModel } from '../../../model/entities/CountryModel.ts'
import { CountryNames } from '../../../model/enums/Countries.ts'
import { Colors, Typography, Borders } from '../../../registries/styleRegistry.ts'

export class StabilityView extends GameObjects.Container {
  private worldModel: WorldModel
  private listContainer: GameObjects.Container
  private scrollbar?: GameObjects.Rectangle
  private scrollbarBg?: GameObjects.Rectangle
  private countText?: GameObjects.Text
  private countries: CountryModel[] = []
  private scrollIndex = 0
  private maxVisibleItems = 10
  private itemHeight = 55
  private isDraggingScrollbar = false
  private scrollbarDragStartY = 0
  private scrollbarDragStartIndex = 0

  constructor(scene: PotatoScene, x: number, y: number, worldModel: WorldModel) {
    super(scene, x, y)
    this.worldModel = worldModel

    this.createView()
    this.setupScrolling()
    scene.add.existing(this)
  }

  private createView() {
    // Title
    const title = this.scene.add.text(0, -200, 'LEAST STABLE COUNTRIES', {
      fontSize: Typography.fontSize.h3,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    title.setOrigin(0.5)
    this.add(title)

    // Subtitle
    const subtitle = this.scene.add.text(0, -170, 'Countries facing the greatest internal challenges', {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.secondary,
    })
    subtitle.setOrigin(0.5)
    this.add(subtitle)

    // Create list container
    this.listContainer = this.scene.add.container(0, -120)
    this.add(this.listContainer)

    // Get and sort ALL countries by stability (lowest first)
    this.countries = Array.from(this.worldModel.countries.values())
      .sort((a, b) => a.stability - b.stability)

    // Add count indicator
    const totalCountries = this.countries.length
    const displayCount = Math.min(this.maxVisibleItems, totalCountries)
    this.countText = this.scene.add.text(550, -140, `Showing 1-${displayCount} of ${totalCountries} countries`, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.muted,
    })
    this.countText.setOrigin(1, 0.5)
    this.add(this.countText)

    // Create scrollbar if needed
    if (this.countries.length > this.maxVisibleItems) {
      this.createScrollbar()
    }

    // Render initial visible items
    this.renderVisibleItems()
  }

  private renderVisibleItems() {
    // Clear existing items
    this.listContainer.removeAll(true)

    const startIndex = this.scrollIndex
    const endIndex = Math.min(startIndex + this.maxVisibleItems, this.countries.length)

    // Create list items for visible range only
    for (let i = startIndex; i < endIndex; i++) {
      const country = this.countries[i]
      const displayIndex = i - startIndex // Position relative to visible area
      const y = displayIndex * this.itemHeight

      // Background
      const bg = this.scene.add.rectangle(
        0,
        y,
        1200,
        50,
        displayIndex % 2 === 0 ? Colors.background.card : Colors.background.cardHover,
        0.3
      )
      this.listContainer.add(bg)

      // Rank (actual rank, not display position)
      const rank = this.scene.add.text(-580, y, `#${i + 1}`, {
        fontSize: Typography.fontSize.h4,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.muted,
        fontStyle: Typography.fontStyle.bold,
      })
      rank.setOrigin(0, 0.5)
      this.listContainer.add(rank)

      // Country name
      const name = this.scene.add.text(-480, y, CountryNames[country.country] || country.country, {
        fontSize: Typography.fontSize.button,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.primary,
      })
      name.setOrigin(0, 0.5)
      this.listContainer.add(name)

      // Regime type
      const regime = this.scene.add.text(-150, y, this.formatRegime(country.regime), {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.secondary,
      })
      regime.setOrigin(0, 0.5)
      this.listContainer.add(regime)

      // Stability score with color coding
      const stabilityColor = this.getStabilityColor(country.stability)
      const stability = this.scene.add.text(150, y, `${country.stability}/100`, {
        fontSize: Typography.fontSize.h4,
        fontFamily: Typography.fontFamily.primary,
        color: stabilityColor,
        fontStyle: Typography.fontStyle.bold,
      })
      stability.setOrigin(0, 0.5)
      this.listContainer.add(stability)

      // Stability bar
      this.createStabilityBar(300, y, country.stability)

      // Status indicators
      const statusText = this.getStatusText(country.stability)
      const status = this.scene.add.text(500, y, statusText, {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: stabilityColor,
      })
      status.setOrigin(0, 0.5)
      this.listContainer.add(status)
    }

    // Update scrollbar position
    this.updateScrollbar()

    // Update count text
    if (this.countText) {
      const startNum = this.scrollIndex + 1
      const endNum = Math.min(this.scrollIndex + this.maxVisibleItems, this.countries.length)
      this.countText.setText(`Showing ${startNum}-${endNum} of ${this.countries.length} countries`)
    }
  }

  private createScrollbar() {
    const scrollbarX = 650
    const scrollbarHeight = this.maxVisibleItems * this.itemHeight
    const scrollbarTop = -120

    // Background track (make it interactive for click-to-scroll)
    this.scrollbarBg = this.scene.add.rectangle(
      scrollbarX,
      scrollbarTop + scrollbarHeight / 2,
      12,  // Slightly wider for easier clicking
      scrollbarHeight,
      Colors.background.tertiary,
      0.3
    )
    this.scrollbarBg.setInteractive()
    this.add(this.scrollbarBg)

    // Calculate scrollbar thumb size
    const thumbHeight = Math.max(30, (this.maxVisibleItems / this.countries.length) * scrollbarHeight)

    // Scrollbar thumb (make it interactive for dragging)
    this.scrollbar = this.scene.add.rectangle(
      scrollbarX,
      scrollbarTop + thumbHeight / 2,
      12,  // Match width with track
      thumbHeight,
      Colors.primary.main,
      0.8
    )
    this.scrollbar.setInteractive({ draggable: true, cursor: 'pointer' })
    this.add(this.scrollbar)

    // Setup scrollbar dragging
    this.setupScrollbarDragging()

    // Setup click on track to jump scroll
    this.setupScrollbarTrackClick()
  }

  private updateScrollbar() {
    if (!this.scrollbar || !this.scrollbarBg) return

    const scrollbarHeight = this.maxVisibleItems * this.itemHeight
    const scrollbarTop = -120
    const maxScroll = Math.max(0, this.countries.length - this.maxVisibleItems)

    if (maxScroll > 0) {
      const scrollPercent = this.scrollIndex / maxScroll
      const thumbHeight = this.scrollbar.height
      const availableHeight = scrollbarHeight - thumbHeight
      const thumbY = scrollbarTop + thumbHeight / 2 + (availableHeight * scrollPercent)
      this.scrollbar.y = thumbY
    }
  }

  private setupScrolling() {
    // Mouse wheel scrolling
    this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any[], deltaX: number, deltaY: number) => {
      if (!this.visible || this.isDraggingScrollbar) return

      const scrollDirection = deltaY > 0 ? 1 : -1
      const maxScroll = Math.max(0, this.countries.length - this.maxVisibleItems)
      const newIndex = Math.max(0, Math.min(maxScroll, this.scrollIndex + scrollDirection))

      if (newIndex !== this.scrollIndex) {
        this.scrollIndex = newIndex
        this.renderVisibleItems()
      }
    })
  }

  private setupScrollbarDragging() {
    if (!this.scrollbar) return

    // Start dragging
    this.scrollbar.on('dragstart', (pointer: Phaser.Input.Pointer) => {
      this.isDraggingScrollbar = true
      this.scrollbarDragStartY = pointer.y
      this.scrollbarDragStartIndex = this.scrollIndex
      this.scrollbar?.setFillStyle(Colors.primary.light, 1) // Highlight when dragging
    })

    // During drag
    this.scrollbar.on('drag', (pointer: Phaser.Input.Pointer) => {
      if (!this.scrollbar || !this.scrollbarBg) return

      const scrollbarHeight = this.maxVisibleItems * this.itemHeight
      const thumbHeight = this.scrollbar.height
      const availableHeight = scrollbarHeight - thumbHeight

      // Calculate how much the mouse has moved as a percentage of scrollable area
      const deltaY = pointer.y - this.scrollbarDragStartY
      const scrollPercent = deltaY / availableHeight

      // Convert to index change
      const maxScroll = Math.max(0, this.countries.length - this.maxVisibleItems)
      const newIndex = Math.round(this.scrollbarDragStartIndex + (scrollPercent * maxScroll))
      const clampedIndex = Math.max(0, Math.min(maxScroll, newIndex))

      if (clampedIndex !== this.scrollIndex) {
        this.scrollIndex = clampedIndex
        this.renderVisibleItems()
      }
    })

    // End dragging
    this.scrollbar.on('dragend', () => {
      this.isDraggingScrollbar = false
      this.scrollbar?.setFillStyle(Colors.primary.main, 0.8) // Restore normal color
    })

    // Hover effects
    this.scrollbar.on('pointerover', () => {
      if (!this.isDraggingScrollbar) {
        this.scrollbar?.setFillStyle(Colors.primary.light, 0.9)
      }
    })

    this.scrollbar.on('pointerout', () => {
      if (!this.isDraggingScrollbar) {
        this.scrollbar?.setFillStyle(Colors.primary.main, 0.8)
      }
    })
  }

  private setupScrollbarTrackClick() {
    if (!this.scrollbarBg) return

    this.scrollbarBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.scrollbar || !this.scrollbarBg || this.isDraggingScrollbar) return

      // Get click position relative to track
      const scrollbarHeight = this.maxVisibleItems * this.itemHeight
      const scrollbarTop = -120
      const localY = pointer.y - this.y - scrollbarTop

      // Calculate target scroll position
      const clickPercent = localY / scrollbarHeight
      const maxScroll = Math.max(0, this.countries.length - this.maxVisibleItems)
      const targetIndex = Math.round(clickPercent * maxScroll)
      const clampedIndex = Math.max(0, Math.min(maxScroll, targetIndex))

      if (clampedIndex !== this.scrollIndex) {
        this.scrollIndex = clampedIndex
        this.renderVisibleItems()
      }
    })

    // Hover effect for track
    this.scrollbarBg.on('pointerover', () => {
      this.scrollbarBg?.setFillStyle(Colors.background.tertiary, 0.5)
    })

    this.scrollbarBg.on('pointerout', () => {
      this.scrollbarBg?.setFillStyle(Colors.background.tertiary, 0.3)
    })
  }

  public scroll(direction: number) {
    const maxScroll = Math.max(0, this.countries.length - this.maxVisibleItems)
    const newIndex = Math.max(0, Math.min(maxScroll, this.scrollIndex + direction))

    if (newIndex !== this.scrollIndex) {
      this.scrollIndex = newIndex
      this.renderVisibleItems()
    }
  }

  private createStabilityBar(x: number, y: number, stability: number) {
    // Background bar
    const bgBar = this.scene.add.rectangle(
      x,
      y,
      150,
      20,
      Colors.background.tertiary
    )
    bgBar.setOrigin(0, 0.5)
    bgBar.setStrokeStyle(1, Colors.background.card)
    this.listContainer.add(bgBar)

    // Filled bar
    const fillColor = this.getStabilityColor(stability)
    const fillWidth = (stability / 100) * 150
    const fillBar = this.scene.add.rectangle(
      x,
      y,
      fillWidth,
      20,
      Phaser.Display.Color.HexStringToColor(fillColor).color
    )
    fillBar.setOrigin(0, 0.5)
    this.listContainer.add(fillBar)
  }

  private getStabilityColor(stability: number): string {
    if (stability <= 20) return '#ef4444' // Red - Critical
    if (stability <= 40) return '#f97316' // Orange - Very Unstable
    if (stability <= 60) return '#eab308' // Yellow - Unstable
    if (stability <= 80) return '#84cc16' // Light Green - Moderate
    return '#22c55e' // Green - Stable
  }

  private getStatusText(stability: number): string {
    if (stability <= 20) return 'CRITICAL'
    if (stability <= 40) return 'VERY UNSTABLE'
    if (stability <= 60) return 'UNSTABLE'
    if (stability <= 80) return 'MODERATE'
    return 'STABLE'
  }

  private formatRegime(regime: string): string {
    return regime
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
}