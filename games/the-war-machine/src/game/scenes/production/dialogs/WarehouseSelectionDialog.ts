import { GameObjects } from 'phaser'
import type { PotatoScene } from '@potato-golem/ui'
import type { WorldModel } from '../../../model/entities/WorldModel.ts'
import type { WarehouseModel } from '../../../model/entities/locations/WarehouseModel.ts'
import type { ProductionFacilityModel } from '../../../model/entities/ProductionFacilityModel.ts'
import { Colors, Typography, Borders, Spacing } from '../../../registries/styleRegistry.ts'
import { CountryNames } from '../../../model/enums/Countries.ts'
import { DepthRegistry } from '../../../registries/depthRegistry.ts'

interface WarehouseSelectionCallbacks {
  onWarehouseSelected: (warehouseId: string) => void
  onCancel: () => void
}

export class WarehouseSelectionDialog extends GameObjects.Container {
  private worldModel: WorldModel
  private facility: ProductionFacilityModel
  private callbacks: WarehouseSelectionCallbacks
  private warehouses: WarehouseModel[] = []
  private scrollIndex = 0
  private maxVisibleItems = 6
  private listContainer?: GameObjects.Container
  private scrollbar?: GameObjects.Graphics
  private scrollThumb?: GameObjects.Rectangle

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    worldModel: WorldModel,
    facility: ProductionFacilityModel,
    callbacks: WarehouseSelectionCallbacks
  ) {
    super(scene, x, y)
    this.worldModel = worldModel
    this.facility = facility
    this.callbacks = callbacks

    this.setDepth(DepthRegistry.RESEARCH_DIALOG)
    this.loadWarehouses()
    this.createDialog()
    scene.add.existing(this)
  }

  private loadWarehouses() {
    // Get all warehouses
    const allWarehouses = this.worldModel.playerLocations.filter(
      loc => loc.type === 'warehouse'
    ) as WarehouseModel[]

    // Sort warehouses by distance priority
    this.warehouses = this.sortWarehousesByDistance(allWarehouses)
  }

  private sortWarehousesByDistance(warehouses: WarehouseModel[]): WarehouseModel[] {
    return warehouses.sort((a, b) => {
      // Same city comes first
      if (a.city === this.facility.city && b.city !== this.facility.city) return -1
      if (b.city === this.facility.city && a.city !== this.facility.city) return 1

      // Same country comes next
      if (a.country === this.facility.country && b.country !== this.facility.country) return -1
      if (b.country === this.facility.country && a.country !== this.facility.country) return 1

      // TODO: Add continent comparison when continent data is available

      // Otherwise maintain original order
      return 0
    })
  }

  private createDialog() {
    const dialogWidth = 900
    const dialogHeight = 600

    // Semi-transparent overlay
    const overlay = this.scene.add.rectangle(0, 0, 2000, 2000, 0x000000, 0.7)
    overlay.setInteractive()
    this.add(overlay)

    // Dialog background
    const bg = this.scene.add.rectangle(0, 0, dialogWidth, dialogHeight, Colors.background.secondary, 0.95)
    bg.setStrokeStyle(Borders.width.thick, Colors.ui.border)
    this.add(bg)

    // Title
    const title = this.scene.add.text(0, -dialogHeight / 2 + 40, 'SELECT OUTPUT WAREHOUSE', {
      fontSize: Typography.fontSize.h3,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    title.setOrigin(0.5)
    this.add(title)

    // Subtitle
    const subtitle = this.scene.add.text(0, -dialogHeight / 2 + 75,
      `For facility in ${this.facility.city}, ${CountryNames[this.facility.country]}`, {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.secondary,
    })
    subtitle.setOrigin(0.5)
    this.add(subtitle)

    // Column headers
    this.createColumnHeaders(-dialogHeight / 2 + 120)

    // Create list container
    this.listContainer = this.scene.add.container(0, 0)
    this.add(this.listContainer)

    // Create scrollbar
    this.createScrollbar(dialogWidth / 2 - 40, -dialogHeight / 2 + 160)

    // Render initial warehouse list
    this.renderWarehouses()

    // Cancel button
    this.createCancelButton(0, dialogHeight / 2 - 50)

    // Setup mouse wheel scrolling
    this.setupScrolling()
  }

  private createColumnHeaders(y: number) {
    const headers = [
      { text: 'LOCATION', x: -380 },
      { text: 'CAPACITY', x: -50 },
      { text: 'USED', x: 50 },
      { text: 'AVAILABLE', x: 150 },
      { text: 'DISTANCE', x: 280 },
    ]

    headers.forEach(header => {
      const text = this.scene.add.text(header.x, y, header.text, {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.muted,
        fontStyle: Typography.fontStyle.bold,
      })
      text.setOrigin(0, 0.5)
      this.add(text)
    })

    // Divider line
    const divider = this.scene.add.rectangle(0, y + 20, 850, 1, Colors.ui.divider)
    this.add(divider)
  }

  private renderWarehouses() {
    if (!this.listContainer) return

    // Clear existing items
    this.listContainer.removeAll(true)

    const itemHeight = 70
    const startY = -160
    const visibleCount = Math.min(this.maxVisibleItems, this.warehouses.length - this.scrollIndex)

    for (let i = 0; i < visibleCount; i++) {
      const warehouse = this.warehouses[this.scrollIndex + i]
      const y = startY + i * itemHeight

      this.createWarehouseItem(warehouse, y, i)
    }

    this.updateScrollbar()
  }

  private createWarehouseItem(warehouse: WarehouseModel, y: number, index: number) {
    if (!this.listContainer) return

    const itemWidth = 850
    const itemHeight = 65

    // Determine if this is the currently selected warehouse
    const isSelected = warehouse.id === this.facility.outputWarehouseId

    // Item background
    const bg = this.scene.add.rectangle(
      0, y, itemWidth, itemHeight,
      isSelected ? Colors.primary.main : Colors.background.card,
      isSelected ? 0.3 : 0.5
    )
    bg.setStrokeStyle(
      Borders.width.thin,
      isSelected ? Colors.primary.light : Colors.ui.divider
    )
    bg.setInteractive()
    this.listContainer.add(bg)

    // Location text
    const locationText = this.scene.add.text(-380, y,
      `${warehouse.city}, ${CountryNames[warehouse.country]}`, {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    locationText.setOrigin(0, 0.5)
    this.listContainer.add(locationText)

    // Capacity
    const capacity = warehouse.maxStorage
    const capacityText = this.scene.add.text(-50, y, capacity.toString(), {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.secondary,
    })
    capacityText.setOrigin(0, 0.5)
    this.listContainer.add(capacityText)

    // Used storage
    const used = warehouse.getUsedStorage()
    const usedText = this.scene.add.text(50, y, used.toString(), {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.secondary,
    })
    usedText.setOrigin(0, 0.5)
    this.listContainer.add(usedText)

    // Available storage
    const available = warehouse.getAvailableStorage()
    const availableText = this.scene.add.text(150, y, available.toString(), {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.primary,
      color: available > 0 ? Colors.text.accent : Colors.text.danger,
    })
    availableText.setOrigin(0, 0.5)
    this.listContainer.add(availableText)

    // Distance indicator
    const distance = this.getDistanceText(warehouse)
    const distanceText = this.scene.add.text(280, y, distance, {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.primary,
      color: this.getDistanceColor(distance),
    })
    distanceText.setOrigin(0, 0.5)
    this.listContainer.add(distanceText)

    // Select button
    const buttonText = isSelected ? 'SELECTED' : 'SELECT'
    const buttonColor = isSelected ? Colors.status.success : Colors.primary.main
    const button = this.createSelectButton(380, y, buttonText, buttonColor, () => {
      if (!isSelected) {
        this.callbacks.onWarehouseSelected(warehouse.id)
        this.destroy()
      }
    })
    this.listContainer.add(button)

    // Hover effects
    bg.on('pointerover', () => {
      if (!isSelected) {
        bg.setFillStyle(Colors.background.cardHover, 0.7)
      }
    })

    bg.on('pointerout', () => {
      if (!isSelected) {
        bg.setFillStyle(Colors.background.card, 0.5)
      }
    })
  }

  private getDistanceText(warehouse: WarehouseModel): string {
    if (warehouse.city === this.facility.city) return 'Same City'
    if (warehouse.country === this.facility.country) return 'Same Country'
    // TODO: Add continent check
    return 'Remote'
  }

  private getDistanceColor(distance: string): string {
    switch (distance) {
      case 'Same City': return Colors.text.accent
      case 'Same Country': return Colors.text.primary
      default: return Colors.text.muted
    }
  }

  private createSelectButton(x: number, y: number, text: string, color: number, onClick: () => void): GameObjects.Container {
    const button = this.scene.add.container(x, y)

    const bg = this.scene.add.rectangle(0, 0, 90, 35, color, 0.9)
    bg.setStrokeStyle(Borders.width.thin, color)
    bg.setInteractive()
    button.add(bg)

    const buttonText = this.scene.add.text(0, 0, text, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    buttonText.setOrigin(0.5)
    button.add(buttonText)

    bg.on('pointerover', () => {
      bg.setFillStyle(color, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(color, 0.9)
    })

    bg.on('pointerdown', onClick)

    return button
  }

  private createScrollbar(x: number, y: number) {
    const scrollbarHeight = 350
    const thumbHeight = Math.max(30, (this.maxVisibleItems / Math.max(1, this.warehouses.length)) * scrollbarHeight)

    // Scrollbar track
    this.scrollbar = this.scene.add.graphics()
    this.scrollbar.fillStyle(Colors.ui.divider, 0.3)
    this.scrollbar.fillRoundedRect(x - 5, y, 10, scrollbarHeight, 5)
    this.add(this.scrollbar)

    // Scrollbar thumb
    this.scrollThumb = this.scene.add.rectangle(x, y + thumbHeight / 2, 8, thumbHeight, Colors.primary.main, 0.8)
    this.scrollThumb.setInteractive()
    this.add(this.scrollThumb)

    // Make thumb draggable
    this.scene.input.setDraggable(this.scrollThumb)

    this.scrollThumb.on('drag', (pointer: any, dragX: number, dragY: number) => {
      const minY = y + thumbHeight / 2
      const maxY = y + scrollbarHeight - thumbHeight / 2
      const clampedY = Math.max(minY, Math.min(maxY, dragY))

      this.scrollThumb!.y = clampedY

      // Calculate scroll index from thumb position
      const scrollProgress = (clampedY - minY) / (maxY - minY)
      const maxScroll = Math.max(0, this.warehouses.length - this.maxVisibleItems)
      this.scrollIndex = Math.round(scrollProgress * maxScroll)

      this.renderWarehouses()
    })
  }

  private updateScrollbar() {
    if (!this.scrollThumb || !this.scrollbar) return

    const maxScroll = Math.max(0, this.warehouses.length - this.maxVisibleItems)
    if (maxScroll === 0) {
      this.scrollThumb.setVisible(false)
      return
    }

    this.scrollThumb.setVisible(true)

    const scrollbarHeight = 350
    const thumbHeight = Math.max(30, (this.maxVisibleItems / this.warehouses.length) * scrollbarHeight)
    const scrollProgress = this.scrollIndex / maxScroll
    const y = -160 + thumbHeight / 2 + scrollProgress * (scrollbarHeight - thumbHeight)

    this.scrollThumb.setSize(8, thumbHeight)
    this.scrollThumb.y = y
  }

  private setupScrolling() {
    this.scene.input.on('wheel', (pointer: any, gameObjects: any[], deltaX: number, deltaY: number) => {
      if (!this.visible) return

      const scrollDirection = deltaY > 0 ? 1 : -1
      const maxScroll = Math.max(0, this.warehouses.length - this.maxVisibleItems)

      this.scrollIndex = Math.max(0, Math.min(maxScroll, this.scrollIndex + scrollDirection))
      this.renderWarehouses()
    })
  }

  private createCancelButton(x: number, y: number) {
    const button = this.scene.add.container(x, y)

    const bg = this.scene.add.rectangle(0, 0, 150, 40, Colors.background.cardHover, 0.9)
    bg.setStrokeStyle(Borders.width.normal, Colors.ui.border)
    bg.setInteractive()
    button.add(bg)

    const text = this.scene.add.text(0, 0, 'Cancel', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    text.setOrigin(0.5)
    button.add(text)

    bg.on('pointerover', () => {
      bg.setFillStyle(Colors.background.card, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(Colors.background.cardHover, 0.9)
    })

    bg.on('pointerdown', () => {
      this.callbacks.onCancel()
      this.destroy()
    })

    this.add(button)

    // Also close on right-click
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown() && this.visible) {
        this.callbacks.onCancel()
        this.destroy()
      }
    })
  }
}