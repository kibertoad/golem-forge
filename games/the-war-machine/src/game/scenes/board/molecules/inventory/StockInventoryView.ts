import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import { GameObjects } from 'phaser'
import type { ArmsStockModel } from '../../../../model/entities/ArmsStockModel.ts'
import { ArmsBranch } from '../../../../model/enums/ArmsBranches.ts'
import { ArmsCondition } from '../../../../model/enums/ArmsStockEnums.ts'
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

  // UI elements
  private scrollBar: GameObjects.Graphics | null = null
  private filterButtons: Map<string, GameObjects.Container> = new Map()
  private sortButtons: Map<SortBy, GameObjects.Container> = new Map()
  private totalValueText: GameObjects.Text | null = null
  private itemCountText: GameObjects.Text | null = null

  // State
  private scrollOffset = 0
  private maxScroll = 0
  private selectedBranchFilter: ArmsBranch | null = null
  private selectedConditionFilter: ArmsCondition | null = null
  private currentSort: SortBy = SortBy.NAME
  private sortAscending = true
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
      fontSize: '36px',
      fontFamily: 'Courier',
      color: '#00ff00',
      fontStyle: 'bold',
    })
    this.titleText.setOrigin(0.5)
    this.add(this.titleText)

    // Create container for filters
    this.filterContainer = scene.add.container(0, 0)
    this.add(this.filterContainer)

    // Other UI sections will be created after analyzing stock
    this.createSortSection(scene)
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
    this.setDepth(3000) // Higher than continent zoom view (2000)
  }

  private createFilterSection(scene: PotatoScene) {
    // Clear existing filters
    this.filterContainer?.removeAll(true)
    this.filterButtons.clear()

    // Get window dimensions
    const windowHeight = (this.background as any).currentHeight || 800
    const halfHeight = windowHeight / 2

    // Position filter section relative to window top
    const filterLabelY = -halfHeight + 70 // 70px from top (after title)
    const baseX = -780

    // Filter label
    const filterLabel = scene.add.text(baseX, filterLabelY, 'FILTERS:', {
      fontSize: '22px',
      fontFamily: 'Courier',
      color: '#888888',
    })
    this.filterContainer?.add(filterLabel)

    // Dynamic branch filters based on available stock
    const branchLabels: Record<ArmsBranch, string> = {
      [ArmsBranch.SMALL_ARMS]: 'Small Arms',
      [ArmsBranch.MISSILES]: 'Missiles',
      [ArmsBranch.ARMORED_VEHICLES]: 'Vehicles',
      [ArmsBranch.AIRCRAFT]: 'Aircraft',
      [ArmsBranch.NAVAL]: 'Naval',
      [ArmsBranch.DRONES]: 'Drones',
      [ArmsBranch.ARTILLERY]: 'Artillery',
      [ArmsBranch.AMMUNITION]: 'Ammo',
      [ArmsBranch.ELECTRONIC_WARFARE]: 'E-War',
      [ArmsBranch.CYBER_WARFARE]: 'Cyber',
      [ArmsBranch.SURVEILLANCE]: 'Recon',
      [ArmsBranch.COMMUNICATIONS]: 'Comms',
      [ArmsBranch.SPACE]: 'Space',
      [ArmsBranch.LOGISTICS]: 'Logistics',
      [ArmsBranch.CBRN]: 'CBRN',
    }

    const branchesArray = Array.from(this.availableBranches)
    const buttonsPerRow = 6
    let currentRow = 0
    let currentCol = 0

    // Branch filters start 35px below filter label
    const branchStartY = filterLabelY + 35

    branchesArray.forEach((branch, index) => {
      if (index > 0 && index % buttonsPerRow === 0) {
        currentRow++
        currentCol = 0
      }

      const x = baseX + currentCol * 110
      const y = branchStartY + currentRow * 40

      const button = this.createFilterButton(scene, branchLabels[branch] || branch, x, y, () => {
        this.toggleBranchFilter(branch)
      })
      this.filterButtons.set(`branch_${branch}`, button)
      currentCol++
    })

    // Condition filters on next row after branches with proper spacing
    const conditionY = branchStartY + Math.ceil(branchesArray.length / buttonsPerRow) * 40 + 15
    const conditions = [
      { condition: ArmsCondition.NEW, label: 'New', x: baseX, y: conditionY },
      { condition: ArmsCondition.GOOD, label: 'Good', x: baseX + 100, y: conditionY },
      { condition: ArmsCondition.FAIR, label: 'Fair', x: baseX + 200, y: conditionY },
      { condition: ArmsCondition.POOR, label: 'Poor', x: baseX + 300, y: conditionY },
    ]

    conditions.forEach(({ condition, label, x, y }) => {
      const button = this.createFilterButton(scene, label, x, y, () => {
        this.toggleConditionFilter(condition)
      })
      this.filterButtons.set(`condition_${condition}`, button)
    })

    // Clear filters button
    const clearButton = this.createFilterButton(scene, 'Clear All', baseX + 420, conditionY, () => {
      this.clearFilters()
    })
    const clearBg = clearButton.getAt(0) as GameObjects.Graphics
    clearBg.clear()
    clearBg.fillStyle(0x660000, 0.8)
    clearBg.fillRoundedRect(0, 0, 100, 35, 4)
    clearBg.lineStyle(1, 0xaa0000, 1)
    clearBg.strokeRoundedRect(0, 0, 100, 35, 4)
    this.filterContainer?.add(clearButton)
  }

  private createSortSection(scene: PotatoScene) {
    // Sort label - will be repositioned after filter section
    const sortLabel = scene.add.text(200, -270, 'SORT BY:', {
      fontSize: '22px',
      fontFamily: 'Courier',
      color: '#888888',
    })
    this.add(sortLabel)
    sortLabel.setData('isSortLabel', true)

    const sortOptions = [
      { sort: SortBy.NAME, label: 'Name', x: 200, y: -235 },
      { sort: SortBy.QUANTITY, label: 'Qty', x: 300, y: -235 },
      { sort: SortBy.VALUE, label: 'Value', x: 380, y: -235 },
      { sort: SortBy.CONDITION, label: 'Cond', x: 470, y: -235 },
    ]

    sortOptions.forEach(({ sort, label, x, y }) => {
      const button = this.createSortButton(scene, label, x, y, sort)
      this.sortButtons.set(sort, button)
    })
  }

  private createSummarySection(scene: PotatoScene) {
    // Total value - will be repositioned dynamically
    this.totalValueText = scene.add.text(-780, 0, 'Total Value: $0', {
      fontSize: '24px',
      fontFamily: 'Courier',
      color: '#00ff00',
      fontStyle: 'bold',
    })
    this.add(this.totalValueText)

    // Item count
    this.itemCountText = scene.add.text(300, 0, 'Items: 0', {
      fontSize: '24px',
      fontFamily: 'Courier',
      color: '#ffffff',
    })
    this.add(this.itemCountText)
  }

  private createFilterButton(
    scene: PotatoScene,
    label: string,
    x: number,
    y: number,
    onClick: () => void,
  ): GameObjects.Container {
    const container = scene.add.container(x, y)

    const bg = scene.add.graphics()
    bg.fillStyle(0x2a2a2a, 0.8)
    bg.fillRoundedRect(0, 0, 100, 35, 4)
    bg.lineStyle(1, 0x444444, 1)
    bg.strokeRoundedRect(0, 0, 100, 35, 4)

    const text = scene.add.text(50, 17.5, label, {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#aaaaaa',
    })
    text.setOrigin(0.5)

    container.add([bg, text])

    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 100, 35), Phaser.Geom.Rectangle.Contains)
    bg.on('pointerdown', onClick)
    bg.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(0x3a3a3a, 1)
      bg.fillRoundedRect(0, 0, 100, 35, 4)
      bg.lineStyle(1, 0x666666, 1)
      bg.strokeRoundedRect(0, 0, 100, 35, 4)
    })
    bg.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(0x2a2a2a, 0.8)
      bg.fillRoundedRect(0, 0, 100, 35, 4)
      bg.lineStyle(1, 0x444444, 1)
      bg.strokeRoundedRect(0, 0, 100, 35, 4)
    })

    this.filterContainer?.add(container)
    return container
  }

  private createSortButton(
    scene: PotatoScene,
    label: string,
    x: number,
    y: number,
    sortType: SortBy,
  ): GameObjects.Container {
    const container = scene.add.container(x, y)

    const bg = scene.add.graphics()
    bg.fillStyle(0x2a2a2a, 0.8)
    bg.fillRoundedRect(0, 0, 80, 35, 4)
    bg.lineStyle(1, 0x444444, 1)
    bg.strokeRoundedRect(0, 0, 80, 35, 4)

    const text = scene.add.text(40, 17.5, label, {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#aaaaaa',
    })
    text.setOrigin(0.5)

    container.add([bg, text])

    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 80, 35), Phaser.Geom.Rectangle.Contains)
    bg.on('pointerdown', () => {
      this.setSortBy(sortType)
    })

    this.add(container)
    return container
  }

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

    // Calculate filter section height first
    const numBranchRows = Math.ceil(this.availableBranches.size / 6)
    // Title: 70px, Filter label: 35px, Branch rows: numBranchRows * 40px, spacing: 15px, Condition row: 40px, Bottom padding: 25px
    const calculatedFilterHeight = 70 + 35 + numBranchRows * 40 + 15 + 40 + 25

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
    this.background.fillStyle(0x1a1a1a, 0.95)
    this.background.fillRoundedRect(-800, -halfHeight, 1600, windowHeight, 10)
    this.background.lineStyle(2, 0x444444, 1)
    this.background.strokeRoundedRect(-800, -halfHeight, 1600, windowHeight, 10)
    // Store height for later reference
    ;(this.background as any).currentHeight = windowHeight

    // Reposition title
    this.titleText.setY(-halfHeight + 30)

    // Recreate filter section with dynamic branches
    const scene = this.scene as PotatoScene
    this.createFilterSection(scene)

    // Filter section height was already calculated above, just use it
    this.filterSectionHeight = calculatedFilterHeight

    // Reposition sort section right after filter section with padding
    const sortY = -halfHeight + this.filterSectionHeight + 10
    this.list.forEach((child) => {
      if (child.getData && child.getData('isSortLabel')) {
        ;(child as GameObjects.Text).setY(sortY)
      }
    })

    // Reposition sort buttons
    const sortButtonY = sortY + 30
    this.sortButtons.forEach((button) => {
      button.setY(sortButtonY)
    })

    // Reposition summary at bottom
    const summaryY = halfHeight - 40
    if (this.totalValueText) this.totalValueText.setY(summaryY)
    if (this.itemCountText) this.itemCountText.setY(summaryY)

    this.applyFiltersAndSort()
  }

  private toggleBranchFilter(branch: ArmsBranch) {
    if (this.selectedBranchFilter === branch) {
      this.selectedBranchFilter = null
    } else {
      this.selectedBranchFilter = branch
    }
    this.applyFiltersAndSort()
  }

  private toggleConditionFilter(condition: ArmsCondition) {
    if (this.selectedConditionFilter === condition) {
      this.selectedConditionFilter = null
    } else {
      this.selectedConditionFilter = condition
    }
    this.applyFiltersAndSort()
  }

  private clearFilters() {
    this.selectedBranchFilter = null
    this.selectedConditionFilter = null
    this.applyFiltersAndSort()
  }

  private setSortBy(sortBy: SortBy) {
    if (this.currentSort === sortBy) {
      this.sortAscending = !this.sortAscending
    } else {
      this.currentSort = sortBy
      this.sortAscending = true
    }
    this.applyFiltersAndSort()
  }

  private applyFiltersAndSort() {
    // Apply filters
    this.displayedItems = this.stockItems.filter((item) => {
      const def = item.getDefinition()
      if (!def) return false

      if (this.selectedBranchFilter && def.branch !== this.selectedBranchFilter) {
        return false
      }

      if (this.selectedConditionFilter && item.condition !== this.selectedConditionFilter) {
        return false
      }

      return true
    })

    // Apply sorting
    this.displayedItems.sort((a, b) => {
      let comparison = 0

      switch (this.currentSort) {
        case SortBy.NAME:
          comparison = a.getName().localeCompare(b.getName())
          break
        case SortBy.QUANTITY:
          comparison = a.quantity - b.quantity
          break
        case SortBy.VALUE:
          comparison = a.getCurrentMarketValue() - b.getCurrentMarketValue()
          break
        case SortBy.CONDITION: {
          const conditions = Object.values(ArmsCondition)
          comparison = conditions.indexOf(a.condition) - conditions.indexOf(b.condition)
          break
        }
        case SortBy.BRANCH: {
          const aDef = a.getDefinition()
          const bDef = b.getDefinition()
          if (aDef && bDef) {
            comparison = aDef.branch.localeCompare(bDef.branch)
          }
          break
        }
      }

      return this.sortAscending ? comparison : -comparison
    })

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
    bg.fillStyle(0x1a1a1a, 0.6)
    bg.fillRoundedRect(0, 0, 1140, 70, 5)
    bg.lineStyle(1, 0x333333, 0.8)
    bg.strokeRoundedRect(0, 0, 1140, 70, 5)
    container.add(bg)

    const def = item.getDefinition()
    if (!def) return container

    // Name
    const nameText = scene.add.text(15, 20, def.name, {
      fontSize: '22px',
      fontFamily: 'Courier',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    container.add(nameText)

    // Branch
    const branchText = scene.add.text(15, 45, def.branch, {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#888888',
    })
    container.add(branchText)

    // Quantity
    const qtyText = scene.add.text(500, 20, `Qty: ${item.quantity}`, {
      fontSize: '20px',
      fontFamily: 'Courier',
      color: '#00ffff',
    })
    container.add(qtyText)

    // Condition
    const conditionColor = this.getConditionColor(item.condition)
    const conditionText = scene.add.text(500, 45, item.condition, {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: conditionColor,
    })
    container.add(conditionText)

    // Value
    const valueText = scene.add.text(700, 20, `$${item.getCurrentMarketValue().toLocaleString()}`, {
      fontSize: '20px',
      fontFamily: 'Courier',
      color: '#00ff00',
    })
    container.add(valueText)

    // Profit/Loss
    const profit = item.getPotentialProfit()
    const profitColor = profit >= 0 ? '#00ff00' : '#ff0000'
    const profitSymbol = profit >= 0 ? '+' : ''
    const profitText = scene.add.text(
      700,
      45,
      `${profitSymbol}$${Math.abs(profit).toLocaleString()}`,
      {
        fontSize: '18px',
        fontFamily: 'Courier',
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
    bg.fillStyle(0x004400, 0.8)
    bg.fillRoundedRect(0, 0, 70, 30, 3)
    bg.lineStyle(1, 0x00ff00, 0.5)
    bg.strokeRoundedRect(0, 0, 70, 30, 3)

    const text = scene.add.text(35, 15, label, {
      fontSize: '16px',
      fontFamily: 'Courier',
      color: '#00ff00',
    })
    text.setOrigin(0.5)

    container.add([bg, text])

    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 70, 30), Phaser.Geom.Rectangle.Contains)
    bg.on('pointerdown', onClick)
    bg.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(0x006600, 1)
      bg.fillRoundedRect(0, 0, 70, 30, 3)
      bg.lineStyle(1, 0x00ff00, 1)
      bg.strokeRoundedRect(0, 0, 70, 30, 3)
    })
    bg.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(0x004400, 0.8)
      bg.fillRoundedRect(0, 0, 70, 30, 3)
      bg.lineStyle(1, 0x00ff00, 0.5)
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
      this.scrollBar.fillStyle(0x1a1a1a, 0.5)
      this.scrollBar.fillRoundedRect(580, scrollStartY, 10, scrollTrackHeight, 5)

      // Draw scrollbar thumb
      const thumbHeight = Math.max(
        30,
        scrollTrackHeight / (this.displayedItems.length / this.maxVisibleItems),
      )
      const thumbY =
        scrollStartY + (this.scrollOffset / this.maxScroll) * (scrollTrackHeight - thumbHeight)

      this.scrollBar.fillStyle(0x666666, 0.8)
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

    // Update filter button states
    this.filterButtons.forEach((button, key) => {
      const bg = button.getAt(0) as GameObjects.Graphics
      const text = button.getAt(1) as GameObjects.Text

      if (key.startsWith('branch_')) {
        const branch = key.replace('branch_', '') as ArmsBranch
        bg.clear()
        if (this.selectedBranchFilter === branch) {
          bg.fillStyle(0x00aa00, 0.8)
          bg.fillRoundedRect(0, 0, 100, 35, 4)
          bg.lineStyle(1, 0x00ff00, 1)
          bg.strokeRoundedRect(0, 0, 100, 35, 4)
          text.setColor('#ffffff')
        } else {
          bg.fillStyle(0x2a2a2a, 0.8)
          bg.fillRoundedRect(0, 0, 100, 35, 4)
          bg.lineStyle(1, 0x444444, 1)
          bg.strokeRoundedRect(0, 0, 100, 35, 4)
          text.setColor('#aaaaaa')
        }
      } else if (key.startsWith('condition_')) {
        const condition = key.replace('condition_', '') as ArmsCondition
        bg.clear()
        if (this.selectedConditionFilter === condition) {
          bg.fillStyle(0x00aa00, 0.8)
          bg.fillRoundedRect(0, 0, 100, 35, 4)
          bg.lineStyle(1, 0x00ff00, 1)
          bg.strokeRoundedRect(0, 0, 100, 35, 4)
          text.setColor('#ffffff')
        } else {
          bg.fillStyle(0x2a2a2a, 0.8)
          bg.fillRoundedRect(0, 0, 100, 35, 4)
          bg.lineStyle(1, 0x444444, 1)
          bg.strokeRoundedRect(0, 0, 100, 35, 4)
          text.setColor('#aaaaaa')
        }
      }
    })

    // Update sort button states
    this.sortButtons.forEach((button, sortType) => {
      const bg = button.getAt(0) as GameObjects.Graphics
      const text = button.getAt(1) as GameObjects.Text

      // Get original label without arrow
      let label = ''
      switch (sortType) {
        case SortBy.NAME:
          label = 'Name'
          break
        case SortBy.QUANTITY:
          label = 'Qty'
          break
        case SortBy.VALUE:
          label = 'Value'
          break
        case SortBy.CONDITION:
          label = 'Cond'
          break
      }

      bg.clear()
      if (this.currentSort === sortType) {
        bg.fillStyle(0x0066aa, 0.8)
        bg.fillRoundedRect(0, 0, 80, 35, 4)
        bg.lineStyle(1, 0x00aaff, 1)
        bg.strokeRoundedRect(0, 0, 80, 35, 4)
        text.setColor('#ffffff')
        text.setText(label + (this.sortAscending ? '↑' : '↓'))
      } else {
        bg.fillStyle(0x2a2a2a, 0.8)
        bg.fillRoundedRect(0, 0, 80, 35, 4)
        bg.lineStyle(1, 0x444444, 1)
        bg.strokeRoundedRect(0, 0, 80, 35, 4)
        text.setColor('#aaaaaa')
        text.setText(label)
      }
    })
  }

  private getConditionColor(condition: ArmsCondition): string {
    switch (condition) {
      case ArmsCondition.NEW:
        return '#00ff00'
      case ArmsCondition.EXCELLENT:
        return '#88ff00'
      case ArmsCondition.GOOD:
        return '#ffff00'
      case ArmsCondition.FAIR:
        return '#ff8800'
      case ArmsCondition.POOR:
        return '#ff4400'
      case ArmsCondition.SALVAGE:
        return '#ff0000'
      default:
        return '#ffffff'
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
