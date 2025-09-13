import { GameObjects } from 'phaser'
import type { PotatoScene } from '@potato-golem/ui'
import type { ArmsStockModel } from '../../../model/entities/ArmsStockModel.ts'
import { ArmsBranch } from '../../../model/enums/ArmsBranches.ts'
import { ArmsCondition } from '../../../model/enums/ArmsStockEnums.ts'

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

  constructor(scene: PotatoScene, x: number, y: number) {
    super(scene, x, y)

    // Create main background - larger window
    this.background = scene.add.graphics()
    this.background.fillStyle(0x1a1a1a, 0.95)
    this.background.fillRoundedRect(-600, -350, 1200, 700, 10)
    this.background.lineStyle(2, 0x444444, 1)
    this.background.strokeRoundedRect(-600, -350, 1200, 700, 10)
    this.add(this.background)

    // Title
    this.titleText = scene.add.text(0, -320, 'ARMS INVENTORY', {
      fontSize: '36px',
      fontFamily: 'Courier',
      color: '#00ff00',
      fontStyle: 'bold',
    })
    this.titleText.setOrigin(0.5)
    this.add(this.titleText)

    // Create UI sections
    this.createFilterSection(scene)
    this.createSortSection(scene)
    this.createSummarySection(scene)
    this.createScrollBar(scene)

    // Setup mouse wheel scrolling
    this.setupScrolling(scene)

    scene.add.existing(this)
    this.setDepth(1000)
  }

  private createFilterSection(scene: PotatoScene) {
    // Filter label
    const filterLabel = scene.add.text(-580, -270, 'FILTERS:', {
      fontSize: '22px',
      fontFamily: 'Courier',
      color: '#888888',
    })
    this.add(filterLabel)

    // Branch filters
    const branches = [
      { branch: ArmsBranch.SMALL_ARMS, label: 'Small Arms', x: -580, y: -235 },
      { branch: ArmsBranch.MISSILES, label: 'Missiles', x: -450, y: -235 },
      { branch: ArmsBranch.ARMORED_VEHICLES, label: 'Vehicles', x: -320, y: -235 },
      { branch: ArmsBranch.AIRCRAFT, label: 'Aircraft', x: -190, y: -235 },
    ]

    branches.forEach(({ branch, label, x, y }) => {
      const button = this.createFilterButton(scene, label, x, y, () => {
        this.toggleBranchFilter(branch)
      })
      this.filterButtons.set(`branch_${branch}`, button)
    })

    // Condition filters
    const conditions = [
      { condition: ArmsCondition.NEW, label: 'New', x: -580, y: -195 },
      { condition: ArmsCondition.GOOD, label: 'Good', x: -480, y: -195 },
      { condition: ArmsCondition.FAIR, label: 'Fair', x: -380, y: -195 },
      { condition: ArmsCondition.POOR, label: 'Poor', x: -280, y: -195 },
    ]

    conditions.forEach(({ condition, label, x, y }) => {
      const button = this.createFilterButton(scene, label, x, y, () => {
        this.toggleConditionFilter(condition)
      })
      this.filterButtons.set(`condition_${condition}`, button)
    })

    // Clear filters button
    const clearButton = this.createFilterButton(scene, 'Clear All', -100, -215, () => {
      this.clearFilters()
    })
    const clearBg = clearButton.getAt(0) as GameObjects.Graphics
    clearBg.clear()
    clearBg.fillStyle(0x660000, 0.8) // Red tint
    clearBg.fillRoundedRect(0, 0, 100, 35, 4)
    clearBg.lineStyle(1, 0xaa0000, 1)
    clearBg.strokeRoundedRect(0, 0, 100, 35, 4)
    this.add(clearButton)
  }

  private createSortSection(scene: PotatoScene) {
    // Sort label
    const sortLabel = scene.add.text(200, -270, 'SORT BY:', {
      fontSize: '22px',
      fontFamily: 'Courier',
      color: '#888888',
    })
    this.add(sortLabel)

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
    // Total value
    this.totalValueText = scene.add.text(-580, 310, 'Total Value: $0', {
      fontSize: '24px',
      fontFamily: 'Courier',
      color: '#00ff00',
      fontStyle: 'bold',
    })
    this.add(this.totalValueText)

    // Item count
    this.itemCountText = scene.add.text(300, 310, 'Items: 0', {
      fontSize: '24px',
      fontFamily: 'Courier',
      color: '#ffffff',
    })
    this.add(this.itemCountText)
  }

  private createFilterButton(scene: PotatoScene, label: string, x: number, y: number, onClick: () => void): GameObjects.Container {
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

    this.add(container)
    return container
  }

  private createSortButton(scene: PotatoScene, label: string, x: number, y: number, sortType: SortBy): GameObjects.Container {
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

  private scroll(direction: number) {
    this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset + direction))
    this.updateDisplay()
  }

  // Data management
  public setStockItems(items: ArmsStockModel[]) {
    this.stockItems = items
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
    this.displayedItems = this.stockItems.filter(item => {
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
        case SortBy.CONDITION:
          const conditions = Object.values(ArmsCondition)
          comparison = conditions.indexOf(a.condition) - conditions.indexOf(b.condition)
          break
        case SortBy.BRANCH:
          const aDef = a.getDefinition()
          const bDef = b.getDefinition()
          if (aDef && bDef) {
            comparison = aDef.branch.localeCompare(bDef.branch)
          }
          break
      }

      return this.sortAscending ? comparison : -comparison
    })

    this.scrollOffset = 0
    this.maxScroll = Math.max(0, this.displayedItems.length - 8)
    this.updateDisplay()
    this.updateSummary()
  }

  private updateDisplay() {
    // Clear existing item displays
    this.itemContainers.forEach(container => container.destroy())
    this.itemContainers = []

    // Display visible items (show 8 items with larger window)
    const startIndex = this.scrollOffset
    const endIndex = Math.min(startIndex + 8, this.displayedItems.length)

    for (let i = startIndex; i < endIndex; i++) {
      const item = this.displayedItems[i]
      const yPos = -150 + (i - startIndex) * 75
      const itemContainer = this.createItemDisplay(item, yPos)
      this.itemContainers.push(itemContainer)
    }

    // Update scrollbar
    this.updateScrollBar()
  }

  private createItemDisplay(item: ArmsStockModel, yPos: number): GameObjects.Container {
    const scene = this.scene
    const container = scene.add.container(-570, yPos)

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
    const profitText = scene.add.text(700, 45, `${profitSymbol}$${Math.abs(profit).toLocaleString()}`, {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: profitColor,
    })
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

  private createActionButton(scene: PotatoScene, label: string, x: number, y: number, onClick: () => void): GameObjects.Container {
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
      // Draw scrollbar track
      this.scrollBar.fillStyle(0x1a1a1a, 0.5)
      this.scrollBar.fillRoundedRect(580, -150, 10, 450, 5)

      // Draw scrollbar thumb
      const thumbHeight = Math.max(30, 450 / (this.displayedItems.length / 8))
      const thumbY = -150 + (this.scrollOffset / this.maxScroll) * (450 - thumbHeight)

      this.scrollBar.fillStyle(0x666666, 0.8)
      this.scrollBar.fillRoundedRect(580, thumbY, 10, thumbHeight, 5)
    }
  }

  private updateSummary() {
    const totalValue = this.displayedItems.reduce((sum, item) => sum + item.getCurrentMarketValue(), 0)
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
      switch(sortType) {
        case SortBy.NAME: label = 'Name'; break;
        case SortBy.QUANTITY: label = 'Qty'; break;
        case SortBy.VALUE: label = 'Value'; break;
        case SortBy.CONDITION: label = 'Cond'; break;
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
    // TODO: Implement detail view
    console.log('Showing details for:', item.getName())
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