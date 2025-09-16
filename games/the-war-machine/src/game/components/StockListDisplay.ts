import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import type { ArmsStockModel } from '../model/entities/ArmsStockModel.ts'
import type { ArmsDefinition } from '../model/definitions/armsDefinitions.ts'
import { ArmsCondition } from '../model/enums/ArmsStockEnums.ts'
import { Colors, Typography } from '../registries/styleRegistry.ts'

// Generic item interface that both ArmsStockModel and BlackMarketOffer can satisfy
export interface StockListItem {
  quantity: number
  condition: ArmsCondition
  getName?: () => string
  getDefinition?: () => ArmsDefinition | undefined
  getCurrentMarketValue?: () => number
  getPotentialProfit?: () => number
  [key: string]: any // Allow additional properties
}

// Configuration for stock list display
export interface StockListConfig<T extends StockListItem = StockListItem> {
  width?: number // Width of each item (default: 1140)
  height?: number // Height of each item (default: 70)
  spacing?: number // Spacing between items (default: 5)
  showQuantity?: boolean // Show quantity column (default: true)
  showCondition?: boolean // Show condition column (default: true)
  showValue?: boolean // Show value column (default: true)
  showProfit?: boolean // Show profit/loss column (default: true)
  showActions?: boolean // Show action buttons (default: true)
  actions?: StockItemAction<T>[] // Custom actions for items
  columns?: ColumnConfig<T>[] // Custom column configuration
  // Frame options
  showFrame?: boolean // Show background frame (default: false)
  frameMaxHeight?: number // Max height before scrolling (default: 500)
  framePadding?: number // Padding inside frame (default: 20)
  // Custom renderers for standard columns
  getItemName?: (item: T) => string
  getItemBranch?: (item: T) => string
  getItemValue?: (item: T) => number
  getItemProfit?: (item: T) => number | undefined
}

export interface StockItemAction<T extends StockListItem = StockListItem> {
  label: string
  onClick: (item: T) => void
  color?: number // Button color
  hoverColor?: number // Button hover color
}

export interface ColumnConfig<T extends StockListItem = StockListItem> {
  key: string
  label: string
  x: number
  getValue: (item: T) => string
  getColor?: (item: T) => string
  fontSize?: string
  fontStyle?: string
}

export interface StockListCallbacks<T extends StockListItem = StockListItem> {
  onItemClick?: (item: T) => void
  onItemHover?: (item: T) => void
  onItemOut?: (item: T) => void
}

/**
 * Reusable component for displaying a list of stock items
 */
export class StockListDisplay<T extends StockListItem = StockListItem> extends Phaser.GameObjects.Container {
  private config: Required<StockListConfig<T>>
  private callbacks: StockListCallbacks<T>
  private items: T[] = []
  private itemContainers: Phaser.GameObjects.Container[] = []
  private scrollOffset = 0
  private maxScroll = 0
  private maxVisibleItems = 10
  private scrollBar: Phaser.GameObjects.Graphics | null = null
  private frame: Phaser.GameObjects.Graphics | null = null
  private itemsContainer: Phaser.GameObjects.Container | null = null
  private clipMask: Phaser.GameObjects.Graphics | null = null

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    config: StockListConfig<T> = {},
    callbacks: StockListCallbacks<T> = {}
  ) {
    super(scene, x, y)

    // Set default configuration
    this.config = {
      width: config.width ?? 1140,
      height: config.height ?? 70,
      spacing: config.spacing ?? 5,
      showQuantity: config.showQuantity ?? true,
      showCondition: config.showCondition ?? true,
      showValue: config.showValue ?? true,
      showProfit: config.showProfit ?? true,
      showActions: config.showActions ?? true,
      actions: config.actions ?? this.getDefaultActions(),
      columns: config.columns ?? [],
      showFrame: config.showFrame ?? false,
      frameMaxHeight: config.frameMaxHeight ?? 500,
      framePadding: config.framePadding ?? 20,
      getItemName: config.getItemName ?? ((item) => item.getName?.() ?? 'Unknown'),
      getItemBranch: config.getItemBranch ?? ((item) => item.getDefinition?.()?.branch ?? ''),
      getItemValue: config.getItemValue ?? ((item) => item.getCurrentMarketValue?.() ?? 0),
      getItemProfit: config.getItemProfit ?? ((item) => item.getPotentialProfit?.()),
    } as Required<StockListConfig<T>>

    this.callbacks = callbacks

    // Create items container for masking
    this.itemsContainer = scene.add.container(0, 0)
    this.add(this.itemsContainer)

    // Create frame if enabled
    if (this.config.showFrame) {
      this.frame = scene.add.graphics()
      this.add(this.frame)
    }

    // Create scrollbar
    this.scrollBar = scene.add.graphics()
    this.add(this.scrollBar)

    scene.add.existing(this)
  }

  private getDefaultActions(): StockItemAction<T>[] {
    return [
      {
        label: 'SELL',
        onClick: (item) => this.emit('item-sell', item),
        color: Colors.inventory.sellButton,
        hoverColor: Colors.inventory.sellButtonHover,
      },
      {
        label: 'INFO',
        onClick: (item) => this.emit('item-info', item),
        color: Colors.inventory.sellButton,
        hoverColor: Colors.inventory.sellButtonHover,
      },
    ]
  }

  /**
   * Set the items to display
   */
  public setItems(items: T[], maxVisible?: number) {
    this.items = items
    this.maxVisibleItems = maxVisible ?? 10
    this.scrollOffset = 0
    this.maxScroll = Math.max(0, items.length - this.maxVisibleItems)
    this.updateDisplay()
  }

  /**
   * Update the visible items based on scroll offset
   */
  private updateDisplay() {
    // Clear existing item displays
    this.itemContainers.forEach(container => container.destroy())
    this.itemContainers = []

    // Clear items container
    if (this.itemsContainer) {
      this.itemsContainer.removeAll(true)
    }

    const startIndex = this.scrollOffset
    const endIndex = Math.min(startIndex + this.maxVisibleItems, this.items.length)

    for (let i = startIndex; i < endIndex; i++) {
      const item = this.items[i]
      const yPos = (i - startIndex) * (this.config.height + this.config.spacing)
      const itemContainer = this.createItemDisplay(item, yPos)
      this.itemContainers.push(itemContainer)
      if (this.itemsContainer) {
        this.itemsContainer.add(itemContainer)
      }
    }

    this.updateScrollBar()
  }

  /**
   * Create display for a single item
   */
  private createItemDisplay(item: T, yPos: number): Phaser.GameObjects.Container {
    const scene = this.scene as PotatoScene
    const container = scene.add.container(0, yPos)

    // Item background
    const bg = scene.add.graphics()
    bg.fillStyle(Colors.inventory.itemBackground, 0.6)
    bg.fillRoundedRect(0, 0, this.config.width, this.config.height, 5)
    bg.lineStyle(1, Colors.inventory.itemBorder, 0.8)
    bg.strokeRoundedRect(0, 0, this.config.width, this.config.height, 5)
    container.add(bg)

    // Make background interactive if callback provided
    if (this.callbacks.onItemClick) {
      bg.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, this.config.width, this.config.height),
        Phaser.Geom.Rectangle.Contains
      )
      bg.on('pointerdown', () => this.callbacks.onItemClick?.(item))
    }

    if (this.callbacks.onItemHover) {
      bg.on('pointerover', () => {
        bg.clear()
        bg.fillStyle(Colors.inventory.itemHover, 0.8)
        bg.fillRoundedRect(0, 0, this.config.width, this.config.height, 5)
        bg.lineStyle(1, Colors.inventory.itemHoverBorder, 1)
        bg.strokeRoundedRect(0, 0, this.config.width, this.config.height, 5)
        this.callbacks.onItemHover?.(item)
      })
    }

    if (this.callbacks.onItemOut) {
      bg.on('pointerout', () => {
        bg.clear()
        bg.fillStyle(Colors.inventory.itemBackground, 0.6)
        bg.fillRoundedRect(0, 0, this.config.width, this.config.height, 5)
        bg.lineStyle(1, Colors.inventory.itemBorder, 0.8)
        bg.strokeRoundedRect(0, 0, this.config.width, this.config.height, 5)
        this.callbacks.onItemOut?.(item)
      })
    }

    // Calculate vertical positions based on item height
    const itemCenterY = this.config.height / 2
    const itemBranch = this.config.getItemBranch(item)
    const hasBranch = itemBranch && this.config.height > 35

    // If showing branch, split vertical space. Otherwise center the name.
    const nameY = hasBranch
      ? (this.config.height > 50 ? itemCenterY - 10 : 10)  // With branch: name near top
      : itemCenterY  // No branch: center the name
    const branchY = this.config.height > 50 ? itemCenterY + 10 : 30  // Branch near bottom

    // Name (always shown)
    const itemName = this.config.getItemName(item)
    const nameText = scene.add.text(15, nameY, itemName, {
      fontSize: Typography.fontSize.h5,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    nameText.setOrigin(0, 0.5)  // Center vertically
    container.add(nameText)

    // Branch (if available and there's space)
    if (hasBranch) {
      const branchText = scene.add.text(15, branchY, itemBranch, {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.monospace,
        color: Colors.text.muted,
      })
      branchText.setOrigin(0, 0.5)  // Center vertically
      container.add(branchText)
    }

    // Optional columns
    let columnX = 450

    if (this.config.showQuantity) {
      const qtyText = scene.add.text(columnX, nameY, `Qty: ${item.quantity}`, {
        fontSize: Typography.fontSize.h5,
        fontFamily: Typography.fontFamily.monospace,
        color: Colors.inventory.value,
      })
      qtyText.setOrigin(0, 0.5)
      container.add(qtyText)
    }

    if (this.config.showCondition && hasBranch) {
      const conditionColor = this.getConditionColor(item.condition)
      const conditionText = scene.add.text(columnX, branchY, item.condition, {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.monospace,
        color: conditionColor,
      })
      conditionText.setOrigin(0, 0.5)
      container.add(conditionText)
    }

    columnX = 600

    if (this.config.showValue) {
      const value = this.config.getItemValue(item)
      const valueText = scene.add.text(columnX, nameY, `$${value.toLocaleString()}`, {
        fontSize: Typography.fontSize.h5,
        fontFamily: Typography.fontFamily.monospace,
        color: Colors.inventory.profit,
      })
      valueText.setOrigin(0, 0.5)
      container.add(valueText)
    }

    if (this.config.showProfit && hasBranch) {
      const profit = this.config.getItemProfit(item)
      if (profit !== undefined) {
        const profitColor = profit >= 0 ? Colors.inventory.profit : Colors.inventory.loss
        const profitSymbol = profit >= 0 ? '+' : ''
        const profitText = scene.add.text(
          columnX,
          branchY,
          `${profitSymbol}$${Math.abs(profit).toLocaleString()}`,
          {
            fontSize: Typography.fontSize.regular,
            fontFamily: Typography.fontFamily.monospace,
            color: profitColor,
          },
        )
        profitText.setOrigin(0, 0.5)
        container.add(profitText)
      }
    }

    // Custom columns
    this.config.columns.forEach((column, idx) => {
      const value = column.getValue(item)
      const color = column.getColor?.(item) ?? Colors.text.primary
      // Location goes on second line if we have branch, otherwise same line
      const yPos = (column.label === 'Location' && hasBranch) ? branchY : nameY
      const text = scene.add.text(column.x, yPos, value, {
        fontSize: column.fontSize ?? Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.monospace,
        color: color,
        fontStyle: column.fontStyle,
      })
      text.setOrigin(0, 0.5)  // Center vertically
      container.add(text)
    })

    // Action buttons
    if (this.config.showActions) {
      let buttonX = 1000
      this.config.actions.forEach(action => {
        const button = this.createActionButton(
          scene,
          action.label,
          buttonX,
          itemCenterY,  // Center button vertically
          () => action.onClick(item),
          action.color,
          action.hoverColor
        )
        container.add(button)
        buttonX += 90
      })
    }

    this.add(container)
    return container
  }

  /**
   * Create an action button
   */
  private createActionButton(
    scene: PotatoScene,
    label: string,
    x: number,
    y: number,
    onClick: () => void,
    color?: number,
    hoverColor?: number
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y)

    const bgColor = color ?? Colors.inventory.sellButton
    const bgHoverColor = hoverColor ?? Colors.inventory.sellButtonHover

    // Center the button vertically around its container position
    const buttonHeight = 30
    const bg = scene.add.graphics()
    bg.fillStyle(bgColor, 0.8)
    bg.fillRoundedRect(0, -buttonHeight/2, 70, buttonHeight, 3)  // Center vertically
    bg.lineStyle(1, Colors.inventory.sellBorder, 0.5)
    bg.strokeRoundedRect(0, -buttonHeight/2, 70, buttonHeight, 3)

    const text = scene.add.text(35, 0, label, {  // Text at y:0 since button is centered
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.inventory.profit,
    })
    text.setOrigin(0.5)

    container.add([bg, text])

    bg.setInteractive(new Phaser.Geom.Rectangle(0, -15, 70, 30), Phaser.Geom.Rectangle.Contains)
    bg.on('pointerdown', onClick)
    bg.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(bgHoverColor, 1)
      bg.fillRoundedRect(0, -15, 70, 30, 3)  // Keep centered
      bg.lineStyle(1, Colors.inventory.sellBorder, 1)
      bg.strokeRoundedRect(0, -15, 70, 30, 3)
    })
    bg.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(bgColor, 0.8)
      bg.fillRoundedRect(0, -15, 70, 30, 3)  // Keep centered
      bg.lineStyle(1, Colors.inventory.sellBorder, 0.5)
      bg.strokeRoundedRect(0, -15, 70, 30, 3)
    })

    return container
  }

  /**
   * Update scrollbar display
   */
  private updateScrollBar() {
    if (!this.scrollBar) return

    this.scrollBar.clear()

    if (this.maxScroll > 0) {
      const scrollHeight = this.maxVisibleItems * (this.config.height + this.config.spacing)

      // Draw scrollbar track
      this.scrollBar.fillStyle(Colors.inventory.scrollTrack, 0.5)
      this.scrollBar.fillRoundedRect(this.config.width + 10, 0, 10, scrollHeight, 5)

      // Draw scrollbar thumb
      const thumbHeight = Math.max(30, scrollHeight / (this.items.length / this.maxVisibleItems))
      const thumbY = (this.scrollOffset / this.maxScroll) * (scrollHeight - thumbHeight)

      this.scrollBar.fillStyle(Colors.inventory.scrollThumb, 0.8)
      this.scrollBar.fillRoundedRect(this.config.width + 10, thumbY, 10, thumbHeight, 5)
    }
  }

  /**
   * Scroll the list
   */
  public scroll(direction: number) {
    this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset + direction))
    this.updateDisplay()
  }

  /**
   * Get condition color
   */
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

  /**
   * Get currently visible items
   */
  public getVisibleItems(): T[] {
    const startIndex = this.scrollOffset
    const endIndex = Math.min(startIndex + this.maxVisibleItems, this.items.length)
    return this.items.slice(startIndex, endIndex)
  }

  /**
   * Clear all items
   */
  public clear() {
    this.items = []
    this.itemContainers.forEach(container => container.destroy())
    this.itemContainers = []
    this.scrollOffset = 0
    this.maxScroll = 0
    this.scrollBar?.clear()
  }
}
