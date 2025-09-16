import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import { GameObjects } from 'phaser'
import type { ArmsStockModel } from '../../../../model/entities/ArmsStockModel.ts'
import { ArmsBranch } from '../../../../model/enums/ArmsBranches.ts'
import { ArmsCondition } from '../../../../model/enums/ArmsStockEnums.ts'
import { DepthRegistry } from '../../../../registries/depthRegistry.ts'
import { Colors, Typography } from '../../../../registries/styleRegistry.ts'
import { FilterSortManager, type SortConfig } from '../../../../utils/FilterSortManager.ts'
import { ArmsDetailView } from './ArmsDetailView.ts'

export enum SortBy {
  NAME = 'name',
  QUANTITY = 'quantity',
  VALUE = 'value',
  CONDITION = 'condition',
  BRANCH = 'branch',
}

export class StockInventoryView extends GameObjects.Container {
  private background: GameObjects.Graphics
  private titleText: GameObjects.Text
  private stockItems: ArmsStockModel[] = []
  private displayedItems: ArmsStockModel[] = []
  private itemContainers: GameObjects.Container[] = []
  private filterContainer: GameObjects.Container | null = null
  private detailView: ArmsDetailView | null = null
  private filterSortManager: FilterSortManager<SortBy> | null = null

  // UI elements
  private scrollBar: GameObjects.Graphics | null = null
  private totalValueText: GameObjects.Text | null = null
  private itemCountText: GameObjects.Text | null = null

  // State
  private scrollOffset = 0
  private maxScroll = 0
  private availableBranches: Set<ArmsBranch> = new Set()
  private maxVisibleItems = 12
  private filterSectionHeight = 150 // Track actual filter section height

  constructor(scene: PotatoScene, x: number, y: number) {
    super(scene, x, y)

    // Create main background - dynamically sized window
    this.background = scene.add.graphics()
    this.add(this.background)

    // Title will be positioned after background is sized
    this.titleText = scene.add.text(0, 0, 'ARMS INVENTORY', {
      fontSize: Typography.fontSize.h1,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.inventory.title,
      fontStyle: Typography.fontStyle.bold,
    })
    this.titleText.setOrigin(0.5)
    this.add(this.titleText)

    // Create summary section that will be positioned later
    this.createSummarySection(scene)
    this.createScrollBar(scene)

    // Setup mouse wheel scrolling and right-click to close
    this.setupScrolling(scene)
    this.setupRightClickClose(scene)

    // Create detail view overlay
    this.detailView = new ArmsDetailView(
      scene,
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2,
    )
    this.detailView.on('detail-closed', () => {
      // Optional: handle detail view close event
    })

    scene.add.existing(this)
    this.setDepth(DepthRegistry.STOCK_INVENTORY)
  }

  private createFilterSortSection() {
    // Clean up old filter/sort manager if exists
    if (this.filterSortManager) {
      this.filterSortManager.destroy()
      this.filterSortManager = null
    }

    const scene = this.scene as PotatoScene
    const windowHeight = (this.background as any).currentHeight || 800
    const halfHeight = windowHeight / 2

    // Position filter section relative to window top
    const filterY = -halfHeight + 70 // 70px from top (after title)

    // Create sort configurations
    const sortConfigs: SortConfig<SortBy>[] = [
      {
        key: SortBy.NAME,
        label: 'Name',
        compareFunction: (a: ArmsStockModel, b: ArmsStockModel) => a.getName().localeCompare(b.getName())
      },
      {
        key: SortBy.QUANTITY,
        label: 'Qty',
        compareFunction: (a: ArmsStockModel, b: ArmsStockModel) => a.quantity - b.quantity
      },
      {
        key: SortBy.VALUE,
        label: 'Value',
        compareFunction: (a: ArmsStockModel, b: ArmsStockModel) => a.getCurrentMarketValue() - b.getCurrentMarketValue()
      },
      {
        key: SortBy.CONDITION,
        label: 'Cond',
        compareFunction: (a: ArmsStockModel, b: ArmsStockModel) => {
          const conditions = Object.values(ArmsCondition)
          return conditions.indexOf(a.condition) - conditions.indexOf(b.condition)
        }
      },
      {
        key: SortBy.BRANCH,
        label: 'Branch',
        compareFunction: (a: ArmsStockModel, b: ArmsStockModel) => {
          const aDef = a.getDefinition()
          const bDef = b.getDefinition()
          if (aDef && bDef) {
            return aDef.branch.localeCompare(bDef.branch)
          }
          return 0
        }
      }
    ]

    // Only show available branches and common conditions
    const branchesArray = Array.from(this.availableBranches)
    const conditions = [
      ArmsCondition.NEW,
      ArmsCondition.GOOD,
      ArmsCondition.FAIR,
      ArmsCondition.POOR
    ]

    // Create filter/sort manager
    this.filterSortManager = new FilterSortManager(
      scene,
      0,
      filterY,
      {
        branches: branchesArray,
        conditions: conditions,
        showClearButton: true,
        layout: 'horizontal'
      },
      sortConfigs,
      {
        onFiltersChanged: () => this.applyFiltersAndSort(),
        onSortChanged: () => this.applyFiltersAndSort()
      }
    )
    this.add(this.filterSortManager)
  }

  // Note: Sort section is now handled by FilterSortManager

  private createSummarySection(scene: PotatoScene) {
    // Total value - will be repositioned dynamically
    this.totalValueText = scene.add.text(-780, 0, 'Total Value: $0', {
      fontSize: Typography.fontSize.h4,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.inventory.profit,
      fontStyle: Typography.fontStyle.bold,
    })
    this.add(this.totalValueText)

    // Item count
    this.itemCountText = scene.add.text(300, 0, 'Items: 0', {
      fontSize: Typography.fontSize.h4,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.text.primary,
    })
    this.add(this.itemCountText)
  }

  // Filter and sort buttons are now handled by FilterSortManager

  private createScrollBar(scene: PotatoScene) {
    this.scrollBar = scene.add.graphics()
    this.add(this.scrollBar)
  }

  private setupScrolling(scene: PotatoScene) {
    // Mouse wheel scrolling
    scene.input.on('wheel', (pointer: any, gameObjects: any[], deltaX: number, deltaY: number) => {
      if (this.visible) {
        this.scroll(deltaY > 0 ? 1 : -1)
      }
    })
  }

  private setupRightClickClose(scene: PotatoScene) {
    // Right-click to close the inventory view
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Check if right mouse button and inventory is visible
      if (pointer.rightButtonDown() && this.visible) {
        this.hide()
        this.emit('inventory-closed')
      }
    })
  }

  private scroll(direction: number) {
    this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset + direction))
    this.updateDisplay()
  }

  // Data management
  public setStockItems(items: ArmsStockModel[]) {
    this.stockItems = items

    // Analyze available branches in stock
    this.availableBranches.clear()
    items.forEach((item) => {
      const def = item.getDefinition()
      if (def) {
        this.availableBranches.add(def.branch)
      }
    })

    // Calculate filter section height for multi-row layout
    // Each filter row is 40px (35px height + 5px spacing)
    let filterRows = 0
    if (this.availableBranches.size > 0) filterRows++ // Branch row
    if (items.length > 0) filterRows++ // Conditions row (assuming we have items with conditions)
    filterRows++ // Sort row
    filterRows++ // Clear button row

    // Title: 70px, Filter rows: filterRows * 40px, Bottom padding: 20px
    const calculatedFilterHeight = 70 + (filterRows * 40) + 20

    // Calculate window height based on number of items (show all without scrolling if possible)
    const itemHeight = 75
    const headerHeight = calculatedFilterHeight + 80 // Filter section + sort section (with more padding)
    const footerHeight = 60 // Summary
    const maxHeight = 900 // Max window height
    const minHeight = 800 // Min window height

    // Calculate needed height for all items
    const neededItemsHeight = items.length * itemHeight
    const totalNeededHeight = headerHeight + neededItemsHeight + footerHeight

    // Determine actual window height and visible items
    let windowHeight: number
    if (totalNeededHeight <= maxHeight) {
      windowHeight = Math.max(minHeight, totalNeededHeight)
      this.maxVisibleItems = items.length
    } else {
      windowHeight = maxHeight
      this.maxVisibleItems = Math.floor((maxHeight - headerHeight - footerHeight) / itemHeight)
    }

    // Redraw background with new height
    const halfHeight = windowHeight / 2
    this.background.clear()
    this.background.fillStyle(Colors.inventory.background, 0.95)
    this.background.fillRoundedRect(-800, -halfHeight, 1600, windowHeight, 10)
    this.background.lineStyle(2, Colors.inventory.backgroundBorder, 1)
    this.background.strokeRoundedRect(-800, -halfHeight, 1600, windowHeight, 10)
    // Store height for later reference
    ;(this.background as any).currentHeight = windowHeight

    // Reposition title
    this.titleText.setY(-halfHeight + 30)

    // Create filter/sort section with dynamic branches
    this.createFilterSortSection()

    // Use the calculated filter height directly (already includes all rows)
    this.filterSectionHeight = calculatedFilterHeight

    // Reposition summary at bottom
    const summaryY = halfHeight - 40
    if (this.totalValueText) this.totalValueText.setY(summaryY)
    if (this.itemCountText) this.itemCountText.setY(summaryY)

    this.applyFiltersAndSort()
  }

  // Filter and sort state is now managed by FilterSortManager

  private applyFiltersAndSort() {
    if (!this.filterSortManager) {
      this.displayedItems = [...this.stockItems]
      this.scrollOffset = 0
      this.maxScroll = Math.max(0, this.displayedItems.length - this.maxVisibleItems)
      this.updateDisplay()
      this.updateSummary()
      return
    }

    // Define filter functions for each filter type
    const filterFunctions = new Map<string, (item: ArmsStockModel, filterValue: any) => boolean>()

    filterFunctions.set('branch_filter', (item: ArmsStockModel, branch: ArmsBranch) => {
      const def = item.getDefinition()
      return def ? def.branch === branch : false
    })

    filterFunctions.set('condition_filter', (item: ArmsStockModel, condition: ArmsCondition) => {
      return item.condition === condition
    })

    // Apply filters using FilterSortManager
    this.displayedItems = this.filterSortManager.applyFilters(this.stockItems, filterFunctions)

    // Apply sorting using FilterSortManager
    this.displayedItems = this.filterSortManager.applySort(this.displayedItems)

    this.scrollOffset = 0
    this.maxScroll = Math.max(0, this.displayedItems.length - this.maxVisibleItems)
    this.updateDisplay()
    this.updateSummary()
  }

  private updateDisplay() {
    // Clear existing item displays
    this.itemContainers.forEach((container) => container.destroy())
    this.itemContainers = []

    // Display visible items based on calculated max
    const startIndex = this.scrollOffset
    const endIndex = Math.min(startIndex + this.maxVisibleItems, this.displayedItems.length)

    // Calculate starting Y position based on window height
    const windowHeight = (this.background as any).currentHeight || 800
    const halfHeight = windowHeight / 2
    // Items start after filter section and sort section with extra padding
    const itemsStartY = -halfHeight + this.filterSectionHeight + 80

    for (let i = startIndex; i < endIndex; i++) {
      const item = this.displayedItems[i]
      const yPos = itemsStartY + (i - startIndex) * 75
      const itemContainer = this.createItemDisplay(item, yPos)
      this.itemContainers.push(itemContainer)
    }

    // Update scrollbar
    this.updateScrollBar()
  }

  private createItemDisplay(item: ArmsStockModel, yPos: number): GameObjects.Container {
    const scene = this.scene as PotatoScene
    const container = scene.add.container(-770, yPos)

    // Item background
    const bg = scene.add.graphics()
    bg.fillStyle(Colors.inventory.itemBackground, 0.6)
    bg.fillRoundedRect(0, 0, 1140, 70, 5)
    bg.lineStyle(1, Colors.inventory.itemBorder, 0.8)
    bg.strokeRoundedRect(0, 0, 1140, 70, 5)
    container.add(bg)

    const def = item.getDefinition()
    if (!def) return container

    // Name
    const nameText = scene.add.text(15, 20, def.name, {
      fontSize: Typography.fontSize.h5,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    container.add(nameText)

    // Branch
    const branchText = scene.add.text(15, 45, def.branch, {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.text.muted,
    })
    container.add(branchText)

    // Quantity
    const qtyText = scene.add.text(500, 20, `Qty: ${item.quantity}`, {
      fontSize: Typography.fontSize.h5,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.inventory.value,
    })
    container.add(qtyText)

    // Condition
    const conditionColor = this.getConditionColor(item.condition)
    const conditionText = scene.add.text(500, 45, item.condition, {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.monospace,
      color: conditionColor,
    })
    container.add(conditionText)

    // Value
    const valueText = scene.add.text(700, 20, `$${item.getCurrentMarketValue().toLocaleString()}`, {
      fontSize: Typography.fontSize.h5,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.inventory.profit,
    })
    container.add(valueText)

    // Profit/Loss
    const profit = item.getPotentialProfit()
    const profitColor = profit >= 0 ? Colors.inventory.profit : Colors.inventory.loss
    const profitSymbol = profit >= 0 ? '+' : ''
    const profitText = scene.add.text(
      700,
      45,
      `${profitSymbol}$${Math.abs(profit).toLocaleString()}`,
      {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.monospace,
        color: profitColor,
      },
    )
    container.add(profitText)

    // Action buttons
    const sellButton = this.createActionButton(scene, 'SELL', 950, 20, () => {
      this.sellItem(item)
    })
    container.add(sellButton)

    const detailButton = this.createActionButton(scene, 'INFO', 1040, 20, () => {
      this.showItemDetails(item)
    })
    container.add(detailButton)

    this.add(container)
    return container
  }

  private createActionButton(
    scene: PotatoScene,
    label: string,
    x: number,
    y: number,
    onClick: () => void,
  ): GameObjects.Container {
    const container = scene.add.container(x, y)

    const bg = scene.add.graphics()
    bg.fillStyle(Colors.inventory.sellButton, 0.8)
    bg.fillRoundedRect(0, 0, 70, 30, 3)
    bg.lineStyle(1, Colors.inventory.sellBorder, 0.5)
    bg.strokeRoundedRect(0, 0, 70, 30, 3)

    const text = scene.add.text(35, 15, label, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.inventory.profit,
    })
    text.setOrigin(0.5)

    container.add([bg, text])

    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 70, 30), Phaser.Geom.Rectangle.Contains)
    bg.on('pointerdown', onClick)
    bg.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(Colors.inventory.sellButtonHover, 1)
      bg.fillRoundedRect(0, 0, 70, 30, 3)
      bg.lineStyle(1, Colors.inventory.sellBorder, 1)
      bg.strokeRoundedRect(0, 0, 70, 30, 3)
    })
    bg.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(Colors.inventory.sellButton, 0.8)
      bg.fillRoundedRect(0, 0, 70, 30, 3)
      bg.lineStyle(1, Colors.inventory.sellBorder, 0.5)
      bg.strokeRoundedRect(0, 0, 70, 30, 3)
    })

    return container
  }

  private updateScrollBar() {
    if (!this.scrollBar) return

    this.scrollBar.clear()

    if (this.maxScroll > 0) {
      const windowHeight = (this.background as any).currentHeight || 800
      const halfHeight = windowHeight / 2
      // Scroll track height accounts for filter section, sort section, and footer
      const scrollTrackHeight = windowHeight - (this.filterSectionHeight + 80 + 60)
      // Scroll starts at the same position as items
      const scrollStartY = -halfHeight + this.filterSectionHeight + 80

      // Draw scrollbar track
      this.scrollBar.fillStyle(Colors.inventory.scrollTrack, 0.5)
      this.scrollBar.fillRoundedRect(580, scrollStartY, 10, scrollTrackHeight, 5)

      // Draw scrollbar thumb
      const thumbHeight = Math.max(
        30,
        scrollTrackHeight / (this.displayedItems.length / this.maxVisibleItems),
      )
      const thumbY =
        scrollStartY + (this.scrollOffset / this.maxScroll) * (scrollTrackHeight - thumbHeight)

      this.scrollBar.fillStyle(Colors.inventory.scrollThumb, 0.8)
      this.scrollBar.fillRoundedRect(580, thumbY, 10, thumbHeight, 5)
    }
  }

  private updateSummary() {
    const totalValue = this.displayedItems.reduce(
      (sum, item) => sum + item.getCurrentMarketValue(),
      0,
    )
    const totalItems = this.displayedItems.reduce((sum, item) => sum + item.quantity, 0)

    if (this.totalValueText) {
      this.totalValueText.setText(`Total Value: $${totalValue.toLocaleString()}`)
    }

    if (this.itemCountText) {
      this.itemCountText.setText(`Items: ${totalItems.toLocaleString()}`)
    }

    // Filter and sort button states are now handled by FilterSortManager
  }

  private getConditionColor(condition: ArmsCondition): string {
    switch (condition) {
      case ArmsCondition.NEW:
        return Colors.inventory.profit
      case ArmsCondition.EXCELLENT:
        return '#88ff00'
      case ArmsCondition.GOOD:
        return Colors.money.neutral
      case ArmsCondition.FAIR:
        return '#ff8800'
      case ArmsCondition.POOR:
        return '#ff4400'
      case ArmsCondition.SALVAGE:
        return Colors.inventory.loss
      default:
        return Colors.text.primary
    }
  }

  private sellItem(item: ArmsStockModel) {
    // TODO: Implement selling logic
    console.log('Selling item:', item.getName())
    this.emit('item-sold', item)
  }

  private showItemDetails(item: ArmsStockModel) {
    if (this.detailView) {
      this.detailView.showItemDetails(item)
    }
    this.emit('item-details', item)
  }

  public show() {
    this.setVisible(true)
    this.updateDisplay()
  }

  public hide() {
    this.setVisible(false)
  }
}
