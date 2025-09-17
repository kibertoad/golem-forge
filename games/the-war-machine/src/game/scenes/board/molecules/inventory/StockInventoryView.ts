import type { PotatoScene } from '@potato-golem/ui'
import type * as Phaser from 'phaser'
import { GameObjects } from 'phaser'
import { FilterSortManager, type SortConfig } from '../../../../components/FilterSortManager.ts'
import { StockListDisplay } from '../../../../components/StockListDisplay.ts'
import type { ArmsStockModel } from '../../../../model/entities/ArmsStockModel.ts'
import type { ArmsBranch } from '../../../../model/enums/ArmsBranches.ts'
import { ArmsCondition } from '../../../../model/enums/ArmsStockEnums.ts'
import { DepthRegistry } from '../../../../registries/depthRegistry.ts'
import { Colors, Typography } from '../../../../registries/styleRegistry.ts'
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
  private detailView: ArmsDetailView | null = null
  private filterSortManager: FilterSortManager<SortBy> | null = null
  private stockListDisplay: StockListDisplay<ArmsStockModel> | null = null

  // UI elements
  private totalValueText: GameObjects.Text | null = null
  private itemCountText: GameObjects.Text | null = null

  // State
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

    // Setup right-click to close
    this.setupRightClickClose(scene)

    // Setup mouse wheel scrolling
    scene.input.on('wheel', (pointer: any, gameObjects: any[], deltaX: number, deltaY: number) => {
      if (this.visible && this.stockListDisplay) {
        this.stockListDisplay.scroll(deltaY > 0 ? 1 : -1)
      }
    })

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
        compareFunction: (a: ArmsStockModel, b: ArmsStockModel) =>
          a.getName().localeCompare(b.getName()),
      },
      {
        key: SortBy.QUANTITY,
        label: 'Qty',
        compareFunction: (a: ArmsStockModel, b: ArmsStockModel) => a.quantity - b.quantity,
      },
      {
        key: SortBy.VALUE,
        label: 'Value',
        compareFunction: (a: ArmsStockModel, b: ArmsStockModel) =>
          a.getCurrentMarketValue() - b.getCurrentMarketValue(),
      },
      {
        key: SortBy.CONDITION,
        label: 'Cond',
        compareFunction: (a: ArmsStockModel, b: ArmsStockModel) => {
          const conditions = Object.values(ArmsCondition)
          return conditions.indexOf(a.condition) - conditions.indexOf(b.condition)
        },
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
        },
      },
    ]

    // Only show available branches and common conditions
    const branchesArray = Array.from(this.availableBranches)
    const conditions = [
      ArmsCondition.NEW,
      ArmsCondition.GOOD,
      ArmsCondition.FAIR,
      ArmsCondition.POOR,
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
        layout: 'horizontal',
      },
      sortConfigs,
      {
        onFiltersChanged: () => this.applyFiltersAndSort(),
        onSortChanged: () => this.applyFiltersAndSort(),
      },
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

  // Scrolling is now handled by StockListDisplay

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
    const calculatedFilterHeight = 70 + filterRows * 40 + 20

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

    this.updateDisplay()
    this.updateSummary()
  }

  private updateDisplay() {
    // Remove old stock list display if exists
    if (this.stockListDisplay) {
      this.stockListDisplay.destroy()
      this.stockListDisplay = null
    }

    // Calculate starting Y position based on window height
    const windowHeight = (this.background as any).currentHeight || 800
    const halfHeight = windowHeight / 2
    // Items start after filter section and sort section with extra padding
    const itemsStartY = -halfHeight + this.filterSectionHeight + 80

    // Create new stock list display
    const scene = this.scene as PotatoScene
    this.stockListDisplay = new StockListDisplay<ArmsStockModel>(
      scene,
      -770,
      itemsStartY,
      {
        width: 1140,
        height: 70,
        spacing: 5,
        showQuantity: true,
        showCondition: true,
        showValue: true,
        showProfit: true,
        showActions: true,
        actions: [
          {
            label: 'SELL',
            onClick: (item) => this.sellItem(item),
          },
          {
            label: 'INFO',
            onClick: (item) => this.showItemDetails(item),
          },
        ],
      },
      {
        onItemHover: (item) => {
          // Optional: Add hover effects
        },
      },
    )

    // Set items and max visible based on window size
    if (this.stockListDisplay) {
      this.stockListDisplay.setItems(this.displayedItems, this.maxVisibleItems)

      // Listen to stock list events
      this.stockListDisplay.on('item-sell', (item: ArmsStockModel) => this.sellItem(item))
      this.stockListDisplay.on('item-info', (item: ArmsStockModel) => this.showItemDetails(item))

      this.add(this.stockListDisplay)
    }
  }

  // Item display and scrollbar are now handled by StockListDisplay

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

  // Condition color logic is now in StockListDisplay

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
