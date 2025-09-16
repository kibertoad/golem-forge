import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import type { WarehouseModel } from '../../../model/entities/locations/WarehouseModel.ts'
import type { WorldModel } from '../../../model/entities/WorldModel.ts'
import { CountryNames } from '../../../model/enums/Countries.ts'
import {
  Borders,
  Colors,
  Dimensions,
  getHeatColor,
  Opacity,
  Spacing,
  Typography,
} from '../../../registries/styleRegistry.ts'
import { StockOverlay } from '../../components/StockListView.ts'

export class WarehouseView extends Phaser.GameObjects.Container {
  private worldModel: WorldModel
  private currentCommandBar?: Phaser.GameObjects.Container
  private stockOverlay?: Phaser.GameObjects.Container
  private selectedWarehouseId?: string
  private warehouseBackgrounds: Map<string, Phaser.GameObjects.Rectangle> = new Map()
  private assetsScene: any // Reference to parent AssetsScene

  constructor(scene: PotatoScene, worldModel: WorldModel) {
    super(scene, 0, 0)
    this.worldModel = worldModel
    this.assetsScene = scene // Store reference to parent scene

    this.createView()
  }

  private createView() {
    // Get all warehouses
    const warehouses = this.worldModel.playerLocations.filter(
      (loc) => loc.type === 'warehouse',
    ) as WarehouseModel[]

    const titleText = this.scene.add.text(0, -200, `Warehouses (${warehouses.length})`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    })
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
      return
    }

    // Display each warehouse
    warehouses.forEach((warehouse, index) => {
      const y = -140 + index * 140 // Increased spacing

      // Warehouse container
      const warehouseContainer = this.scene.add.container(-650, y)

      // Background - made wider
      const bg = this.scene.add.rectangle(350, 35, 1300, 120, 0x1e293b)
      bg.setStrokeStyle(2, 0x3b82f6)
      bg.setInteractive()
      warehouseContainer.add(bg)

      // Store background reference for selection highlighting
      this.warehouseBackgrounds.set(warehouse.id, bg)

      // Warehouse name and location
      const countryName = CountryNames[warehouse.country] || warehouse.country
      const nameText = this.scene.add.text(10, 10, `${warehouse.city}, ${countryName}`, {
        fontSize: '22px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      warehouseContainer.add(nameText)

      // Size and infrastructure
      const sizeText = this.scene.add.text(
        10,
        40,
        `Size: ${warehouse.size.toUpperCase()} | Infrastructure: ${warehouse.infrastructure}/5`,
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#94a3b8',
        },
      )
      warehouseContainer.add(sizeText)

      // Storage capacity
      const usedStorage = warehouse.getUsedStorage()
      const maxStorage = warehouse.maxStorage
      const percentage = Math.round((usedStorage / maxStorage) * 100)

      const storageText = this.scene.add.text(
        400,
        10,
        `Storage: ${usedStorage}/${maxStorage} (${percentage}%)`,
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#e2e8f0',
        },
      )
      warehouseContainer.add(storageText)

      // Storage bar
      const barBg = this.scene.add.rectangle(400, 40, 200, 20, 0x2d3748)
      barBg.setOrigin(0, 0.5)
      warehouseContainer.add(barBg)

      const barFill = this.scene.add.rectangle(
        400,
        40,
        (usedStorage / maxStorage) * 200,
        20,
        0x4ade80,
      )
      barFill.setOrigin(0, 0.5)
      warehouseContainer.add(barFill)

      // Status indicators
      const statusText = this.scene.add.text(650, 10, `Heat: ${warehouse.heat}/10`, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: warehouse.heat > 7 ? '#ef4444' : warehouse.heat > 4 ? '#f59e0b' : '#10b981',
      })
      warehouseContainer.add(statusText)

      const concealmentText = this.scene.add.text(
        650,
        40,
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
        25,
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
      const costText = this.scene.add.text(
        850,
        50,
        `Upkeep: $${maintenanceCost.toLocaleString()}/week`,
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
        this.showCommandBar(warehouse, warehouseContainer, y)
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

      this.add(warehouseContainer)
    })

    // Add new warehouse button
    const addButton = this.scene.add.container(0, 180)

    const addBg = this.scene.add.rectangle(0, 0, 250, 50, 0x10b981)
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
      // TODO: Implement warehouse purchase dialog
      console.log('Add new warehouse')
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
    yPos: number,
  ) {
    // Remove any existing command bar
    if (this.currentCommandBar) {
      this.currentCommandBar.destroy()
    }

    // Create command bar
    const commandBar = this.scene.add.container(550, yPos)
    this.currentCommandBar = commandBar

    const commands = [
      { text: 'See Stock', action: () => this.showStockOverlay(warehouse) },
      { text: 'Sell', action: () => this.sellLocation(warehouse) },
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

    // Hide the entire content container while overlay is shown
    if (this.assetsScene.contentContainer) {
      this.assetsScene.contentContainer.setVisible(false)
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
        // Show the content container again when overlay closes
        if (this.assetsScene.contentContainer) {
          this.assetsScene.contentContainer.setVisible(true)
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
}
