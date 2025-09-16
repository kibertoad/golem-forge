import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import type { ArmsStockModel } from '../../model/entities/ArmsStockModel.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { Colors, Dimensions, Opacity, Typography } from '../../registries/styleRegistry.ts'

export interface StockListViewOptions {
  title?: string
  emptyMessage?: string
  showSellButton?: boolean
  onSell?: (item: ArmsStockModel) => void
  maxHeight?: number
  position?: { x: number; y: number }
}

export class StockListView extends Phaser.GameObjects.Container {
  private stockItems: ArmsStockModel[]
  private options: StockListViewOptions

  constructor(
    scene: PotatoScene,
    stockItems: ArmsStockModel[],
    options: StockListViewOptions = {},
  ) {
    const pos = options.position || { x: 740, y: 360 } // Center by default
    super(scene, pos.x, pos.y)

    this.stockItems = stockItems
    this.options = {
      title: options.title || 'Stock Inventory',
      emptyMessage: options.emptyMessage || 'No items in stock',
      showSellButton: options.showSellButton || false,
      onSell: options.onSell,
      maxHeight: options.maxHeight || 400,
      position: pos,
    }

    this.createView()
    scene.add.existing(this)
  }

  private createView() {
    const containerWidth = 1200
    const containerHeight = Math.min(this.options.maxHeight!, 500)

    // Background
    const bg = this.scene.add.rectangle(
      0,
      0,
      containerWidth,
      containerHeight,
      Colors.background.secondary,
    )
    bg.setStrokeStyle(3, Colors.ui.border)
    this.add(bg)

    // Title
    if (this.options.title) {
      const titleText = this.scene.add.text(0, -containerHeight / 2 + 30, this.options.title, {
        fontSize: Typography.fontSize.h4,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.primary,
        fontStyle: Typography.fontStyle.bold,
      })
      titleText.setOrigin(0.5)
      this.add(titleText)
    }

    // Scrollable container for items
    const itemsContainer = this.scene.add.container(0, -50)

    if (this.stockItems.length === 0) {
      const emptyText = this.scene.add.text(0, 0, this.options.emptyMessage!, {
        fontSize: Typography.fontSize.large,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.muted,
      })
      emptyText.setOrigin(0.5)
      itemsContainer.add(emptyText)
    } else {
      // Display stock items
      const itemHeight = 60
      const startY = -((Math.min(this.stockItems.length, 5) - 1) * itemHeight) / 2

      this.stockItems.forEach((item, index) => {
        if (index >= 5) return // Limit display to 5 items for now (TODO: add scrolling)

        const itemY = startY + index * itemHeight

        // Item background
        const itemBg = this.scene.add.rectangle(
          0,
          itemY,
          containerWidth - 100,
          50,
          Colors.background.card,
        )
        itemBg.setStrokeStyle(1, Colors.ui.divider)
        itemBg.setAlpha(0.5)
        itemsContainer.add(itemBg)

        // Item name and details
        const itemName = item.getName()
        const itemText = this.scene.add.text(
          -500,
          itemY,
          `${itemName} - Qty: ${item.quantity} - Condition: ${item.condition}`,
          {
            fontSize: Typography.fontSize.regular,
            fontFamily: Typography.fontFamily.primary,
            color: Colors.text.secondary,
          },
        )
        itemText.setOrigin(0, 0.5)
        itemsContainer.add(itemText)

        // Value text
        const valueText = this.scene.add.text(
          300,
          itemY,
          `$${item.getTotalValue().toLocaleString()}`,
          {
            fontSize: Typography.fontSize.regular,
            fontFamily: Typography.fontFamily.primary,
            color: Colors.money.positive,
          },
        )
        valueText.setOrigin(0, 0.5)
        itemsContainer.add(valueText)

        // Sell button if enabled
        if (this.options.showSellButton && this.options.onSell) {
          const sellBtn = this.scene.add.container(450, itemY)

          const sellBg = this.scene.add.rectangle(0, 0, 80, 30, Colors.status.warning)
          sellBg.setInteractive()
          sellBtn.add(sellBg)

          const sellText = this.scene.add.text(0, 0, 'SELL', {
            fontSize: Typography.fontSize.small,
            fontFamily: Typography.fontFamily.primary,
            color: Colors.text.primary,
            fontStyle: Typography.fontStyle.bold,
          })
          sellText.setOrigin(0.5)
          sellBtn.add(sellText)

          sellBg.on('pointerover', () => sellBg.setFillStyle(0xd97706)) // Darker orange
          sellBg.on('pointerout', () => sellBg.setFillStyle(Colors.status.warning))
          sellBg.on('pointerdown', () => {
            if (this.options.onSell) {
              this.options.onSell(item)
            }
          })

          itemsContainer.add(sellBtn)
        }
      })

      // Total value
      const totalValue = this.stockItems.reduce((sum, item) => sum + item.getTotalValue(), 0)
      const totalText = this.scene.add.text(
        0,
        containerHeight / 2 - 50,
        `Total Value: $${totalValue.toLocaleString()}`,
        {
          fontSize: Typography.fontSize.h5,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.money.positive,
          fontStyle: Typography.fontStyle.bold,
        },
      )
      totalText.setOrigin(0.5)
      itemsContainer.add(totalText)
    }

    this.add(itemsContainer)
  }

  public updateStock(stockItems: ArmsStockModel[]) {
    this.stockItems = stockItems
    this.removeAll(true) // Clear existing view
    this.createView() // Recreate with new items
  }
}

export class StockOverlay extends Phaser.GameObjects.Container {
  private stockListView: StockListView
  private onClose?: () => void

  constructor(
    scene: PotatoScene,
    stockItems: ArmsStockModel[],
    title: string,
    onClose?: () => void,
  ) {
    super(scene, 740, 360) // Center of screen
    this.onClose = onClose

    // Semi-transparent background
    const overlay = scene.add.rectangle(0, 0, 1480, 800, 0x000000, Opacity.overlay)
    overlay.setInteractive() // Block clicks behind
    this.add(overlay)

    // Modal container with proper centering
    const modal = scene.add.container(0, 0)

    // Modal background
    const modalBg = scene.add.rectangle(
      0,
      0,
      Dimensions.modal.default.width,
      Dimensions.modal.default.height,
      Colors.background.primary,
    )
    modalBg.setStrokeStyle(3, Colors.ui.border)
    modal.add(modalBg)

    // Stock list view
    this.stockListView = new StockListView(scene, stockItems, {
      title,
      emptyMessage: 'No items in this location',
      showSellButton: false,
      maxHeight: 350,
      position: { x: 0, y: -30 },
    })
    modal.add(this.stockListView)

    // Close button
    const closeButton = scene.add.container(0, 200)

    const closeBg = scene.add.rectangle(
      0,
      0,
      Dimensions.button.default.width,
      Dimensions.button.default.height,
      Colors.background.cardHover,
    )
    closeBg.setInteractive()
    closeButton.add(closeBg)

    const closeText = scene.add.text(0, 0, 'CLOSE', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    closeText.setOrigin(0.5)
    closeButton.add(closeText)

    closeBg.on('pointerover', () => closeBg.setFillStyle(Colors.background.card))
    closeBg.on('pointerout', () => closeBg.setFillStyle(Colors.background.cardHover))
    closeBg.on('pointerdown', () => this.close())

    modal.add(closeButton)

    // ESC key to close
    scene.input.keyboard?.on('keydown-ESC', () => this.close())

    this.add(modal)
    scene.add.existing(this)
    this.setDepth(DepthRegistry.STOCK_OVERLAY)
  }

  private close() {
    if (this.onClose) {
      this.onClose()
    }
    this.destroy()
  }
}
