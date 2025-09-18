import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import { LocationSize } from '../../../model/entities/locations/AbstractLocationModel.ts'
import { WarehouseModel, WarehouseOwnershipType } from '../../../model/entities/locations/WarehouseModel.ts'
import type { WarehouseOption, WorldModel } from '../../../model/entities/WorldModel.ts'
import { CountryNames } from '../../../model/enums/Countries.ts'
import type { WarSystem } from '../../../model/WarSystem.ts'
import { LayoutRegistry } from '../../../registries/layoutRegistry.ts'
import { Colors, Typography } from '../../../registries/styleRegistry.ts'
import { StockOverlay } from '../../components/StockListView.ts'
import { WarehouseSelectionOverlay } from '../overlays/WarehouseSelectionOverlay.ts'

export class WarehouseView extends Phaser.GameObjects.Container {
  private worldModel: WorldModel
  private warSystem: WarSystem
  private currentCommandBar?: Phaser.GameObjects.Container
  private stockOverlay?: Phaser.GameObjects.Container
  private selectedWarehouseId?: string
  private warehouseBackgrounds: Map<string, Phaser.GameObjects.Rectangle> = new Map()
  private assetsScene: any // Reference to parent AssetsScene
  private warehouseSelectionOverlay?: WarehouseSelectionOverlay
  private scrollIndex: number = 0
  private warehouseContainers: Phaser.GameObjects.Container[] = []

  constructor(scene: PotatoScene, worldModel: WorldModel, warSystem: WarSystem) {
    super(scene, 0, 0)
    this.worldModel = worldModel
    this.warSystem = warSystem
    this.assetsScene = scene // Store reference to parent scene

    this.createView()
  }

  private createView() {
    // Clear existing containers
    this.warehouseContainers.forEach(container => container.destroy())
    this.warehouseContainers = []
    this.warehouseBackgrounds.clear()
    this.scrollIndex = 0

    // Get all warehouses
    const warehouses = this.worldModel.playerLocations.filter(
      (loc) => loc.type === 'warehouse',
    ) as WarehouseModel[]

    const titleText = this.scene.add.text(
      0,
      LayoutRegistry.assetsScene.warehouseList.titleY,
      `Warehouses (${warehouses.length})`,
      {
        fontSize: Typography.fontSize.h2,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.primary,
        fontStyle: Typography.fontStyle.bold,
      }
    )
    titleText.setOrigin(0.5)
    this.add(titleText)

    if (warehouses.length === 0) {
      const emptyText = this.scene.add.text(0, 0, 'No warehouses owned', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#64748b',
      })
      emptyText.setOrigin(0.5)
      this.add(emptyText)

      // Still show the Add button even with no warehouses
      this.createAddWarehouseButton()
      return
    }

    // Create scrollable container for warehouses using registry values
    const maxVisibleWarehouses = LayoutRegistry.assetsScene.warehouseList.maxVisibleItems
    const itemHeight = LayoutRegistry.assetsScene.warehouseList.itemHeight
    const listStartY = LayoutRegistry.assetsScene.warehouseList.startY

    // Create a mask for scrolling - limit to exactly 5 visible items
    const maskShape = this.scene.add.graphics()
    maskShape.fillStyle(0xffffff)
    const maskHeight = maxVisibleWarehouses * itemHeight
    console.log(`Creating mask: maxVisible=${maxVisibleWarehouses}, itemHeight=${itemHeight}, maskHeight=${maskHeight}`)
    // Make mask exact size without padding to ensure only 5 items show
    maskShape.fillRect(-700, listStartY, 1400, maskHeight)
    const mask = maskShape.createGeometryMask()
    maskShape.setVisible(false)
    this.add(maskShape)

    // Container for all warehouses
    const allWarehousesContainer = this.scene.add.container(0, 0)
    allWarehousesContainer.setMask(mask)
    this.add(allWarehousesContainer)

    // Function to render only visible warehouses
    const renderVisibleWarehouses = () => {
      // Clear all existing containers
      allWarehousesContainer.removeAll(true)
      this.warehouseContainers = []
      this.warehouseBackgrounds.clear()

      // Calculate which warehouses to display
      const startIndex = this.scrollIndex
      const endIndex = Math.min(startIndex + maxVisibleWarehouses, warehouses.length)

      // Only create containers for visible warehouses
      for (let i = startIndex; i < endIndex; i++) {
        const warehouse = warehouses[i]
        const displayIndex = i - startIndex // Position relative to visible area
        const y = listStartY + displayIndex * itemHeight

        // Warehouse container
        const warehouseContainer = this.scene.add.container(-650, y)

      // Background using registry values
      const bg = this.scene.add.rectangle(
        350,
        itemHeight / 2,  // Center the rectangle vertically within the item height
        LayoutRegistry.assetsScene.warehouseList.itemWidth,
        itemHeight - 20,  // Slightly smaller than itemHeight for spacing
        Colors.background.card
      )
      bg.setStrokeStyle(2, Colors.primary.main)
      bg.setInteractive()
      warehouseContainer.add(bg)

      // Store background reference for selection highlighting
      this.warehouseBackgrounds.set(warehouse.id, bg)

      // Warehouse name and location - adjusted for new positioning
      const countryName = CountryNames[warehouse.country] || warehouse.country
      const nameText = this.scene.add.text(10, 20, `${warehouse.city}, ${countryName}`, {
        fontSize: '22px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      warehouseContainer.add(nameText)

      // Ownership badge
      const isRented = warehouse.ownershipType === WarehouseOwnershipType.RENTED
      const ownershipBadge = this.scene.add.text(
        10 + nameText.width + 15,
        20,
        isRented ? 'RENTED' : 'OWNED',
        {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#ffffff',
          backgroundColor: isRented ? '#f59e0b' : '#10b981',
          padding: { x: 8, y: 4 },
        },
      )
      warehouseContainer.add(ownershipBadge)

      // Size and infrastructure
      const sizeText = this.scene.add.text(
        10,
        50,
        `Size: ${warehouse.size.toUpperCase()} | Infrastructure: ${warehouse.infrastructure}/5`,
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#94a3b8',
        },
      )
      warehouseContainer.add(sizeText)

      // Storage capacity - adjusted positioning
      const usedStorage = warehouse.getUsedStorage()
      const maxStorage = warehouse.maxStorage
      const percentage = Math.round((usedStorage / maxStorage) * 100)

      const storageText = this.scene.add.text(
        400,
        20,
        `Storage: ${usedStorage}/${maxStorage} (${percentage}%)`,
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#e2e8f0',
        },
      )
      warehouseContainer.add(storageText)

      // Storage bar
      const barBg = this.scene.add.rectangle(400, 50, 200, 20, 0x2d3748)
      barBg.setOrigin(0, 0.5)
      warehouseContainer.add(barBg)

      const barFill = this.scene.add.rectangle(
        400,
        50,
        (usedStorage / maxStorage) * 200,
        20,
        0x4ade80,
      )
      barFill.setOrigin(0, 0.5)
      warehouseContainer.add(barFill)

      // Status indicators - adjusted positioning
      const statusText = this.scene.add.text(650, 20, `Heat: ${warehouse.heat}/10`, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: warehouse.heat > 7 ? '#ef4444' : warehouse.heat > 4 ? '#f59e0b' : '#10b981',
      })
      warehouseContainer.add(statusText)

      const concealmentText = this.scene.add.text(
        650,
        50,
        `Concealment: ${warehouse.concealment}/5`,
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#94a3b8',
        },
      )
      warehouseContainer.add(concealmentText)

      // Items count
      const itemsCount = warehouse.armsStock.length
      const itemsText = this.scene.add.text(
        850,
        35,
        `${itemsCount} item type${itemsCount !== 1 ? 's' : ''} stored`,
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#64748b',
        },
      )
      warehouseContainer.add(itemsText)

      // Maintenance cost
      const maintenanceCost = warehouse.getMaintenanceCost()
      const upkeepText = `Upkeep: $${maintenanceCost.toLocaleString()}/week`
      const rentText = warehouse.monthlyRent ? ` | Rent: $${warehouse.monthlyRent.toLocaleString()}/month` : ''
      const costText = this.scene.add.text(
        850,
        60,
        upkeepText + rentText,
        {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#fbbf24',
        },
      )
      warehouseContainer.add(costText)

      // Click handler for showing command bar
      bg.on('pointerdown', () => {
        this.selectWarehouse(warehouse.id)
        this.showCommandBar(warehouse, warehouseContainer)
      })

      bg.on('pointerover', () => {
        if (this.selectedWarehouseId !== warehouse.id) {
          bg.setFillStyle(0x2d3748)
        }
      })

      bg.on('pointerout', () => {
        if (this.selectedWarehouseId !== warehouse.id) {
          bg.setFillStyle(0x1e293b)
        }
      })

        allWarehousesContainer.add(warehouseContainer)
        this.warehouseContainers.push(warehouseContainer)
      }
    }

    // Initial render
    renderVisibleWarehouses()

    // Note: updateDisplay function removed - we now re-render on scroll

    // Add scroll functionality if needed
    if (warehouses.length > maxVisibleWarehouses) {
      const maxScroll = warehouses.length - maxVisibleWarehouses

      // Create scrollbar first so it can be referenced
      const scrollbarHeight = (maxVisibleWarehouses / warehouses.length) * (maxVisibleWarehouses * itemHeight)
      const scrollbar = this.scene.add.rectangle(
        LayoutRegistry.assetsScene.warehouseList.scrollbarX,
        listStartY + scrollbarHeight / 2,
        10,
        scrollbarHeight,
        Colors.ui.scrollbar,
        0.8
      )

      // Mouse wheel scrolling
      this.scene.input.on('wheel', (pointer: any, gameObjects: any[], deltaX: number, deltaY: number) => {
        const scrollDirection = deltaY > 0 ? 1 : -1
        const newIndex = Math.max(0, Math.min(maxScroll, this.scrollIndex + scrollDirection))
        if (newIndex !== this.scrollIndex) {
          this.scrollIndex = newIndex
          renderVisibleWarehouses()

          // Update scrollbar position
          const scrollPercent = maxScroll > 0 ? this.scrollIndex / maxScroll : 0
          const scrollbarRange = maxVisibleWarehouses * itemHeight - scrollbarHeight
          scrollbar.y = listStartY + scrollbarHeight / 2 + scrollPercent * scrollbarRange
        }
      })

      // Add scrollbar background
      const scrollbarBg = this.scene.add.rectangle(
        LayoutRegistry.assetsScene.warehouseList.scrollbarX,
        listStartY + (maxVisibleWarehouses * itemHeight) / 2,
        10,
        maxVisibleWarehouses * itemHeight,
        Colors.ui.scrollbarBg,
        0.5
      )
      this.add(scrollbarBg)

      // Add scrollbar thumb
      this.add(scrollbar)
    }

    // Add new warehouse button below the list
    this.createAddWarehouseButton()
  }

  private createAddWarehouseButton() {
    // Position button below the list using common pattern
    const addButton = this.scene.add.container(0, LayoutRegistry.common.addNewButton.y)

    const addBg = this.scene.add.rectangle(
      0,
      0,
      LayoutRegistry.common.addNewButton.width,
      LayoutRegistry.common.addNewButton.height,
      Colors.status.success
    )
    addBg.setInteractive()
    addButton.add(addBg)

    const addText = this.scene.add.text(0, 0, '+ New Warehouse', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    addText.setOrigin(0.5)
    addButton.add(addText)

    addBg.on('pointerover', () => addBg.setFillStyle(0x059669))
    addBg.on('pointerout', () => addBg.setFillStyle(0x10b981))
    addBg.on('pointerdown', () => {
      this.showWarehouseSelectionOverlay()
    })

    this.add(addButton)
  }

  private selectWarehouse(warehouseId: string) {
    // Clear previous selection
    this.warehouseBackgrounds.forEach((bg, id) => {
      if (id === warehouseId) {
        // Highlight selected warehouse
        bg.setFillStyle(0x3b82f6, 0.3) // Blue tinted background
        bg.setStrokeStyle(3, 0x60a5fa) // Brighter blue border
      } else {
        // Reset non-selected warehouses
        bg.setFillStyle(0x1e293b)
        bg.setStrokeStyle(2, 0x3b82f6)
      }
    })

    this.selectedWarehouseId = warehouseId
  }

  private showCommandBar(
    warehouse: WarehouseModel,
    container: Phaser.GameObjects.Container,
  ) {
    // Remove any existing command bar
    if (this.currentCommandBar) {
      this.currentCommandBar.destroy()
    }

    // Create command bar - position relative to the warehouse container
    const worldPos = container.getWorldTransformMatrix()
    const commandBar = this.scene.add.container(550, worldPos.ty)
    this.currentCommandBar = commandBar

    // Different commands for owned vs rented warehouses
    const isRented = warehouse.ownershipType === WarehouseOwnershipType.RENTED
    const commands = [
      { text: 'See Stock', action: () => this.showStockOverlay(warehouse) },
      {
        text: isRented ? 'Cancel Rent' : 'Sell',
        action: () => (isRented ? this.cancelRent(warehouse) : this.sellLocation(warehouse)),
      },
      { text: 'Relocate', action: () => this.relocateLocation(warehouse) },
      { text: 'Upgrade', action: () => this.upgradeLocation(warehouse) },
      { text: 'Dismantle', action: () => this.dismantleLocation(warehouse) },
      { text: 'Freeze', action: () => this.freezeLocation(warehouse) },
    ]

    // Background for command bar
    const barBg = this.scene.add.rectangle(0, 0, 120, commands.length * 35 + 10, 0x0f172a)
    barBg.setStrokeStyle(2, 0x3b82f6)
    commandBar.add(barBg)

    // Add command buttons
    commands.forEach((cmd, index) => {
      const btnY = -((commands.length - 1) * 17.5) + index * 35

      const btnBg = this.scene.add.rectangle(0, btnY, 110, 30, 0x2d3748)
      btnBg.setInteractive()
      commandBar.add(btnBg)

      const btnText = this.scene.add.text(0, btnY, cmd.text, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ffffff',
      })
      btnText.setOrigin(0.5)
      commandBar.add(btnText)

      btnBg.on('pointerover', () => {
        btnBg.setFillStyle(0x4a5568)
      })

      btnBg.on('pointerout', () => {
        btnBg.setFillStyle(0x2d3748)
      })

      btnBg.on('pointerdown', () => {
        cmd.action()
        this.currentCommandBar?.destroy()
        this.currentCommandBar = undefined
      })
    })

    // Close button
    const closeBtn = this.scene.add.text(55, -((commands.length * 35) / 2) - 5, '✕', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ef4444',
    })
    closeBtn.setOrigin(0.5)
    closeBtn.setInteractive()
    commandBar.add(closeBtn)

    closeBtn.on('pointerdown', () => {
      this.currentCommandBar?.destroy()
      this.currentCommandBar = undefined
    })

    this.add(commandBar)
  }

  private showStockOverlay(warehouse: WarehouseModel) {
    // Remove any existing overlay
    if (this.stockOverlay) {
      this.stockOverlay.destroy()
      this.stockOverlay = undefined
    }

    // Hide the entire content container and background while overlay is shown
    if (this.assetsScene.contentContainer) {
      this.assetsScene.contentContainer.setVisible(false)
    }
    if (this.assetsScene.contentBg) {
      this.assetsScene.contentBg.setVisible(false)
    }

    // Create stock overlay using the shared component
    const countryName = CountryNames[warehouse.country] || warehouse.country
    const title = `Stock in ${warehouse.city}, ${countryName}`
    this.stockOverlay = new StockOverlay(
      this.scene as PotatoScene,
      warehouse.armsStock,
      title,
      () => {
        this.stockOverlay = undefined
        // Show the content container and background again when overlay closes
        if (this.assetsScene.contentContainer) {
          this.assetsScene.contentContainer.setVisible(true)
        }
        if (this.assetsScene.contentBg) {
          this.assetsScene.contentBg.setVisible(true)
        }
      },
    )
  }

  private sellLocation(warehouse: WarehouseModel) {
    console.log('Selling warehouse:', warehouse.id)
    // TODO: Implement selling logic
  }

  private relocateLocation(warehouse: WarehouseModel) {
    console.log('Relocating warehouse:', warehouse.id)
    // TODO: Implement relocation logic
  }

  private upgradeLocation(warehouse: WarehouseModel) {
    console.log('Upgrading warehouse:', warehouse.id)
    // TODO: Implement upgrade logic
  }

  private dismantleLocation(warehouse: WarehouseModel) {
    console.log('Dismantling warehouse:', warehouse.id)
    // TODO: Implement dismantle logic
  }

  private freezeLocation(warehouse: WarehouseModel) {
    console.log('Freezing warehouse:', warehouse.id)
    // TODO: Implement freeze logic
  }

  private cancelRent(warehouse: WarehouseModel) {
    // Check if warehouse has stock
    const hasStock = warehouse.armsStock.length > 0
    const totalItems = warehouse.getUsedStorage()

    if (!hasStock) {
      // No stock - simply remove the warehouse
      this.confirmCancelRent(warehouse)
      return
    }

    // Check available space in other warehouses
    const otherWarehouses = (this.worldModel.playerLocations.filter(
      (loc) => loc.type === 'warehouse' && loc.id !== warehouse.id
    ) as WarehouseModel[])

    if (otherWarehouses.length === 0) {
      // No other warehouses - confirm disposal of stock
      this.showStockDisposalConfirmation(warehouse, totalItems)
      return
    }

    // Calculate total available space
    const totalAvailableSpace = otherWarehouses.reduce(
      (sum, wh) => sum + wh.getAvailableStorage(),
      0
    )

    if (totalAvailableSpace < totalItems) {
      // Not enough space - confirm disposal of stock
      this.showStockDisposalConfirmation(warehouse, totalItems)
    } else {
      // Enough space - offer transfer option
      this.showStockTransferDialog(warehouse, otherWarehouses)
    }
  }

  private confirmCancelRent(warehouse: WarehouseModel) {
    // Remove warehouse from world model
    this.worldModel.removeLocation(warehouse.id)

    console.log(`Rental cancelled for warehouse in ${warehouse.city}, ${warehouse.country}`)

    // Refresh the view
    this.removeAll(true)
    this.createView()
  }

  private showStockDisposalConfirmation(warehouse: WarehouseModel, itemCount: number) {
    // TODO: Show confirmation dialog for stock disposal
    console.log(`Confirm disposal of ${itemCount} items in warehouse ${warehouse.id}`)

    // For now, just confirm the cancellation
    this.confirmCancelRent(warehouse)
  }

  private showStockTransferDialog(warehouse: WarehouseModel, otherWarehouses: WarehouseModel[]) {
    // TODO: Show transfer dialog with distance-based pricing
    console.log(`Show transfer options for ${warehouse.id} to ${otherWarehouses.length} warehouses`)

    // For now, just confirm the cancellation
    this.confirmCancelRent(warehouse)
  }

  private showWarehouseSelectionOverlay() {
    // Remove any existing overlay
    if (this.warehouseSelectionOverlay) {
      this.warehouseSelectionOverlay.destroy()
      this.warehouseSelectionOverlay = undefined
    }

    // Hide the assets scene content and background while overlay is shown
    if (this.assetsScene.contentContainer) {
      this.assetsScene.contentContainer.setVisible(false)
    }
    if (this.assetsScene.contentBg) {
      this.assetsScene.contentBg.setVisible(false)
    }

    // Create warehouse selection overlay
    this.warehouseSelectionOverlay = new WarehouseSelectionOverlay(
      this.scene as PotatoScene,
      this.worldModel,
      this.warSystem,
      {
        onWarehouseSelected: (warehouse: WarehouseOption) => {
          this.handleWarehouseSelection(warehouse)
        },
        onCancel: () => {
          this.warehouseSelectionOverlay = undefined
          // Show the content container and background again when overlay closes
          if (this.assetsScene.contentContainer) {
            this.assetsScene.contentContainer.setVisible(true)
          }
          if (this.assetsScene.contentBg) {
            this.assetsScene.contentBg.setVisible(true)
          }
        },
      },
    )
  }

  private handleWarehouseSelection(warehouseOption: WarehouseOption & { purchased?: boolean }) {
    // Check if player has enough money
    const cost = warehouseOption.purchased ? warehouseOption.buyPrice : warehouseOption.rentPrice

    // Use the deductMoney method which handles the money change event
    if (!this.worldModel.deductMoney(cost)) {
      console.log('Not enough money to acquire warehouse')
      // TODO: Show error message to player
      return
    }

    // Ensure we have a consistent ID
    const warehouseId = warehouseOption.id || `warehouse-${Date.now()}`

    // Create new warehouse model
    const warehouse = new WarehouseModel({
      id: warehouseId,
      country: warehouseOption.country,
      city: warehouseOption.city,
      concealment: warehouseOption.concealment,
      maxStorage: warehouseOption.storageSpace,
      legality: 3, // Default medium legality
      heat: 0, // Start with no heat
      infrastructure: 3, // Default medium infrastructure
      size: this.determineWarehouseSize(warehouseOption.storageSpace),
      ownershipType: warehouseOption.purchased
        ? WarehouseOwnershipType.OWNED
        : WarehouseOwnershipType.RENTED,
      monthlyRent: warehouseOption.purchased ? undefined : warehouseOption.rentPrice,
    })

    // Add warehouse to world model
    this.worldModel.addLocation(warehouse)

    // Mark this warehouse as purchased in the service order (use the same ID)
    this.worldModel.markWarehousePurchased(
      warehouseOption.country,
      warehouseOption.city,
      warehouseId
    )

    console.log(`Warehouse ${warehouseOption.purchased ? 'purchased' : 'rented'} in ${warehouseOption.city}, ${warehouseOption.country}`)
    console.log(`Warehouse ID: ${warehouseId}`)
    console.log(`Cost: $${cost.toLocaleString()}`)
    console.log(`Storage: ${warehouseOption.storageSpace} units`)
    console.log(`Concealment: ${warehouseOption.concealment}/5`)

    // Clear and recreate the view to show the new warehouse
    this.removeAll(true)
    this.createView()

    // Show the content container and background again
    if (this.assetsScene.contentContainer) {
      this.assetsScene.contentContainer.setVisible(true)
    }
    if (this.assetsScene.contentBg) {
      this.assetsScene.contentBg.setVisible(true)
    }
  }

  private determineWarehouseSize(storageSpace: number): LocationSize {
    if (storageSpace <= 500) return LocationSize.SMALL
    if (storageSpace <= 2000) return LocationSize.MEDIUM
    if (storageSpace <= 5000) return LocationSize.LARGE
    return LocationSize.HUGE
  }
}
