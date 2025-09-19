import { GameObjects } from 'phaser'
import type { PotatoScene } from '@potato-golem/ui'
import type { WorldModel } from '../../../model/entities/WorldModel.ts'
import type { WarSystem, War } from '../../../model/WarSystem.ts'
import { CountryNames } from '../../../model/enums/Countries.ts'
import { Colors, Typography, Borders } from '../../../registries/styleRegistry.ts'

export class WarsView extends GameObjects.Container {
  private worldModel: WorldModel
  private warSystem: WarSystem
  private listContainer: GameObjects.Container
  private scrollbar?: GameObjects.Rectangle
  private scrollbarBg?: GameObjects.Rectangle
  private countText?: GameObjects.Text
  private wars: War[] = []
  private scrollIndex = 0
  private maxVisibleItems = 10
  private itemHeight = 55
  private isDraggingScrollbar = false
  private scrollbarDragStartY = 0
  private scrollbarDragStartIndex = 0

  constructor(scene: PotatoScene, x: number, y: number, worldModel: WorldModel, warSystem: WarSystem) {
    super(scene, x, y)
    this.worldModel = worldModel
    this.warSystem = warSystem

    this.createView()
    this.setupScrolling()
    scene.add.existing(this)
  }

  private createView() {
    // Title
    const title = this.scene.add.text(0, -200, 'ACTIVE CONFLICTS', {
      fontSize: Typography.fontSize.h3,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    title.setOrigin(0.5)
    this.add(title)

    // Subtitle
    const subtitle = this.scene.add.text(0, -170, 'Current wars and military conflicts', {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.secondary,
    })
    subtitle.setOrigin(0.5)
    this.add(subtitle)

    // Create list container
    this.listContainer = this.scene.add.container(0, -120)
    this.add(this.listContainer)

    // Get all active wars
    this.wars = this.warSystem.activeWars
    console.log('[WarsView] Active wars:', this.wars)
    console.log('[WarsView] Number of wars:', this.wars.length)

    // Sort wars by start date (assuming newer wars are more relevant)
    // For now, we'll keep the order as-is since we don't have start dates

    // Add count indicator
    const totalWars = this.wars.length

    if (totalWars === 0) {
      // Show "no wars" message
      const noWarsText = this.scene.add.text(0, 50, 'No active conflicts at this time', {
        fontSize: Typography.fontSize.h4,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.muted,
      })
      noWarsText.setOrigin(0.5)
      this.listContainer.add(noWarsText)
      return
    }

    const displayCount = Math.min(this.maxVisibleItems, totalWars)
    this.countText = this.scene.add.text(550, -140, `Showing 1-${displayCount} of ${totalWars} conflicts`, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.muted,
    })
    this.countText.setOrigin(1, 0.5)
    this.add(this.countText)

    // Create scrollbar if needed
    if (this.wars.length > this.maxVisibleItems) {
      this.createScrollbar()
    }

    // Render initial visible items
    this.renderVisibleItems()
  }

  private renderVisibleItems() {
    // Clear existing items
    this.listContainer.removeAll(true)

    if (this.wars.length === 0) return

    const startIndex = this.scrollIndex
    const endIndex = Math.min(startIndex + this.maxVisibleItems, this.wars.length)

    // Create list items for visible range only
    for (let i = startIndex; i < endIndex; i++) {
      const war = this.wars[i]
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

      // War icon
      const warIcon = this.scene.add.text(-580, y, '⚔️', {
        fontSize: Typography.fontSize.h3,
        fontFamily: Typography.fontFamily.primary,
      })
      warIcon.setOrigin(0, 0.5)
      this.listContainer.add(warIcon)

      // Aggressor name
      const aggressorName = CountryNames[war.aggressor] || war.aggressor
      const aggressorCountry = this.worldModel.countries.get(war.aggressor)
      const aggressorText = this.scene.add.text(-520, y, aggressorName, {
        fontSize: Typography.fontSize.button,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.danger, // Red for aggressor
      })
      aggressorText.setOrigin(0, 0.5)
      this.listContainer.add(aggressorText)

      // VS text
      const vsText = this.scene.add.text(-250, y, 'VS', {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.muted,
        fontStyle: Typography.fontStyle.bold,
      })
      vsText.setOrigin(0.5, 0.5)
      this.listContainer.add(vsText)

      // Defender name
      const defenderName = CountryNames[war.defender] || war.defender
      const defenderCountry = this.worldModel.countries.get(war.defender)
      const defenderText = this.scene.add.text(-150, y, defenderName, {
        fontSize: Typography.fontSize.button,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.accent, // Light blue for defender
      })
      defenderText.setOrigin(0, 0.5)
      this.listContainer.add(defenderText)

      // Military strength comparison
      if (aggressorCountry && defenderCountry) {
        const aggressorPower = this.calculateMilitaryPower(aggressorCountry)
        const defenderPower = this.calculateMilitaryPower(defenderCountry)

        // Aggressor strength
        const aggressorStrength = this.scene.add.text(200, y - 10, `Power: ${aggressorPower.toFixed(0)}`, {
          fontSize: Typography.fontSize.small,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.text.secondary,
        })
        aggressorStrength.setOrigin(0, 0.5)
        this.listContainer.add(aggressorStrength)

        // Defender strength
        const defenderStrength = this.scene.add.text(200, y + 10, `Power: ${defenderPower.toFixed(0)}`, {
          fontSize: Typography.fontSize.small,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.text.secondary,
        })
        defenderStrength.setOrigin(0, 0.5)
        this.listContainer.add(defenderStrength)

        // Power balance bar
        this.createPowerBalanceBar(350, y, aggressorPower, defenderPower)

        // Advantage indicator
        const advantage = aggressorPower > defenderPower ? 'Aggressor' : 'Defender'
        const advantageRatio = Math.max(aggressorPower, defenderPower) / Math.min(aggressorPower, defenderPower)
        const advantageText = this.scene.add.text(550, y,
          `${advantage} +${((advantageRatio - 1) * 100).toFixed(0)}%`,
          {
            fontSize: Typography.fontSize.small,
            fontFamily: Typography.fontFamily.primary,
            color: advantage === 'Aggressor' ? Colors.text.danger : Colors.text.accent,
            fontStyle: Typography.fontStyle.bold,
          }
        )
        advantageText.setOrigin(0, 0.5)
        this.listContainer.add(advantageText)
      }
    }

    // Update scrollbar position
    this.updateScrollbar()

    // Update count text
    if (this.countText) {
      const startNum = this.scrollIndex + 1
      const endNum = Math.min(this.scrollIndex + this.maxVisibleItems, this.wars.length)
      this.countText.setText(`Showing ${startNum}-${endNum} of ${this.wars.length} conflicts`)
    }
  }

  private calculateMilitaryPower(country: any): number {
    // Calculate military power based on various factors
    // This matches the formula in WarSystem
    const avgStrength = (country.armyStrength + country.navyStrength + country.airforceStrength) / 3
    const avgProduction = (country.armyProduction + country.navyProduction + country.airforceProduction) / 3
    const avgTech = (country.armyTech + country.navyTech + country.airforceTech) / 3

    return country.militaryBudget * 2 + avgStrength * 1.5 + avgProduction + avgTech * 0.5
  }

  private createPowerBalanceBar(x: number, y: number, aggressorPower: number, defenderPower: number) {
    const barWidth = 150
    const barHeight = 20

    // Background
    const bgBar = this.scene.add.rectangle(
      x,
      y,
      barWidth,
      barHeight,
      Colors.background.tertiary
    )
    bgBar.setOrigin(0, 0.5)
    bgBar.setStrokeStyle(1, Colors.background.card)
    this.listContainer.add(bgBar)

    // Calculate balance
    const total = aggressorPower + defenderPower
    const aggressorPercent = (aggressorPower / total) * 100
    const defenderPercent = (defenderPower / total) * 100

    // Aggressor bar (left side, red)
    const aggressorWidth = (aggressorPercent / 100) * barWidth
    const aggressorBar = this.scene.add.rectangle(
      x,
      y,
      aggressorWidth,
      barHeight,
      Phaser.Display.Color.HexStringToColor('#ef4444').color
    )
    aggressorBar.setOrigin(0, 0.5)
    this.listContainer.add(aggressorBar)

    // Defender bar (right side, blue)
    const defenderWidth = (defenderPercent / 100) * barWidth
    const defenderBar = this.scene.add.rectangle(
      x + aggressorWidth,
      y,
      defenderWidth,
      barHeight,
      Colors.primary.main
    )
    defenderBar.setOrigin(0, 0.5)
    this.listContainer.add(defenderBar)

    // Center line
    const centerLine = this.scene.add.rectangle(
      x + barWidth / 2,
      y,
      2,
      barHeight + 4,
      0x94a3b8  // Muted color for center line
    )
    centerLine.setOrigin(0.5, 0.5)
    this.listContainer.add(centerLine)
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
    const thumbHeight = Math.max(30, (this.maxVisibleItems / this.wars.length) * scrollbarHeight)

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
    const maxScroll = Math.max(0, this.wars.length - this.maxVisibleItems)

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
      const maxScroll = Math.max(0, this.wars.length - this.maxVisibleItems)
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
      const maxScroll = Math.max(0, this.wars.length - this.maxVisibleItems)
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
      const maxScroll = Math.max(0, this.wars.length - this.maxVisibleItems)
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
    const maxScroll = Math.max(0, this.wars.length - this.maxVisibleItems)
    const newIndex = Math.max(0, Math.min(maxScroll, this.scrollIndex + direction))

    if (newIndex !== this.scrollIndex) {
      this.scrollIndex = newIndex
      this.renderVisibleItems()
    }
  }
}