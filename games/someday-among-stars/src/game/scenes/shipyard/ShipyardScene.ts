import { PotatoScene } from '@potato-golem/ui'
import Phaser from 'phaser'
import type { Dependencies } from '../../diConfig.ts'
import type { ShipSystem, ShipSystemTemplate, SystemType } from '../../model/entities/ShipModel.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { generateUUID } from '../../utils/uuid.ts'

export class ShipyardScene extends PotatoScene {
  private readonly worldModel: WorldModel

  // UI Elements
  private backgroundRect!: Phaser.GameObjects.Rectangle
  private shipContainer!: Phaser.GameObjects.Container
  private slotsContainer!: Phaser.GameObjects.Container
  private shopContainer!: Phaser.GameObjects.Container
  private storageContainer!: Phaser.GameObjects.Container
  private infoPanel!: Phaser.GameObjects.Container

  // System shop data
  private availableSystems: ShipSystemTemplate[] = [] // Shop shows templates
  private selectedSystem: ShipSystem | ShipSystemTemplate | null = null // Can select either
  private hoveredSystem: ShipSystem | ShipSystemTemplate | null = null
  private selectedSlotType: SystemType | null = 'weapon' // Default to weapon filter
  private storageFilterType: SystemType | 'all' | null = 'all' // Storage filter
  private creditsText!: Phaser.GameObjects.Text
  private shopItemBackgrounds: Map<string, Phaser.GameObjects.Rectangle> = new Map()
  private storageItemBackgrounds: Map<string, Phaser.GameObjects.Rectangle> = new Map()

  constructor(dependencies: Dependencies) {
    super(dependencies.globalSceneEventEmitter, { key: sceneRegistry.SHIPYARD_SCENE })
    this.worldModel = dependencies.worldModel
  }

  create() {
    const { width, height } = this.scale

    // Create fullscreen background
    this.backgroundRect = this.add.rectangle(0, 0, width, height, 0x0a0a0f, 1).setOrigin(0, 0)

    // Add decorative grid pattern
    this.createBackgroundGrid()

    // Create main sections
    this.createShipDisplay()
    this.createSlotsPanel()
    this.createShopPanel()
    this.createStoragePanel()
    this.createInfoPanel()
    this.createControlButtons()
    this.createCreditsDisplay()

    // Initialize available systems for shop
    this.initializeShopSystems()

    // Apply default filter
    this.updateShopDisplay()

    // Add ESC key handler
    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToSystemVisit()
    })
  }

  private createBackgroundGrid() {
    const { width, height } = this.scale
    const gridSize = 50
    const graphics = this.add.graphics()
    graphics.lineStyle(1, 0x1a1a2e, 0.3)

    for (let x = 0; x <= width; x += gridSize) {
      graphics.moveTo(x, 0)
      graphics.lineTo(x, height)
    }
    for (let y = 0; y <= height; y += gridSize) {
      graphics.moveTo(0, y)
      graphics.lineTo(width, y)
    }
    graphics.strokePath()
  }

  private createShipDisplay() {
    const { width, height } = this.scale

    // Ship display area on the left
    const shipX = 50
    const shipY = 100
    const shipWidth = 400
    const shipHeight = height - 200

    // Panel background
    this.add
      .rectangle(shipX, shipY, shipWidth, shipHeight, 0x1a1a2e, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4444ff, 0.6)

    // Title
    this.add
      .text(shipX + shipWidth / 2, shipY + 30, 'YOUR SHIP', {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#88aaff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)

    // Ship container
    this.shipContainer = this.add.container(shipX + shipWidth / 2, shipY + shipHeight / 2)

    // Ship image (scaled up rocket for now)
    const shipImage = this.add.image(0, 0, imageRegistry.ROCKET).setScale(4).setTint(0xaaaaff)

    this.shipContainer.add(shipImage)

    // Ship stats
    const statsY = shipY + shipHeight - 150
    const ship = this.worldModel.playerShip
    const statsText = `Hull: ${ship.currentHull}/${ship.maxHull}
Shield: ${ship.currentShield}/${ship.maxShield}
Energy: ${ship.maxEnergy}
Cargo: ${ship.getTotalUsedSpace()}/${ship.getTotalCargoCapacity()}`

    this.add.text(shipX + 20, statsY, statsText, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
      lineSpacing: 5,
    })
  }

  private createSlotsPanel() {
    const { height } = this.scale

    // Slots panel in the center-left
    const slotsX = 480
    const slotsY = 100
    const slotsWidth = 350
    const slotsHeight = height - 200

    // Panel background
    this.add
      .rectangle(slotsX, slotsY, slotsWidth, slotsHeight, 0x1a1a2e, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4444ff, 0.6)

    // Title
    this.add
      .text(slotsX + slotsWidth / 2, slotsY + 30, 'SYSTEM SLOTS', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#88aaff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)

    this.slotsContainer = this.add.container(slotsX, slotsY + 80)

    // Create slot sections
    this.createSlotSection('Weapons', 'weapon', 0)
    this.createSlotSection('Engines', 'engine', 150)
    this.createSlotSection('Special Systems', 'special', 250)
    this.createSlotSection('Extensions', 'extension', 400)
  }

  private createSlotSection(label: string, type: SystemType, yOffset: number) {
    const ship = this.worldModel.playerShip
    const maxSlots = ship.getMaxSlotsByType(type)
    const installedSystems = ship.getSystemsByType(type, true)

    // Section label
    this.slotsContainer.add(
      this.add.text(20, yOffset, label, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffff88',
      }),
    )

    // Create slot buttons
    for (let i = 0; i < maxSlots; i++) {
      const slotX = 20 + (i % 3) * 110
      const slotY = yOffset + 35 + Math.floor(i / 3) * 50

      const installedSystem = installedSystems.find((s) => s.slotIndex === i)

      const slotBg = this.add
        .rectangle(slotX, slotY, 100, 40, installedSystem ? 0x3a5a3a : 0x2a2a3e, 0.9)
        .setOrigin(0, 0)
        .setStrokeStyle(1, installedSystem ? 0x88ff88 : 0x666666)
        .setInteractive({ cursor: 'pointer' })

      const slotText = this.add
        .text(
          slotX + 50,
          slotY + 20,
          installedSystem ? installedSystem.name.substring(0, 10) : `Slot ${i + 1}`,
          {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: installedSystem ? '#88ff88' : '#888888',
          },
        )
        .setOrigin(0.5, 0.5)

      this.slotsContainer.add([slotBg, slotText])

      // Click handler
      slotBg.on('pointerdown', () => {
        if (installedSystem) {
          // Uninstall system
          const uninstalledSystem = ship.uninstallSystem(installedSystem.id)
          if (uninstalledSystem) {
            // Select the uninstalled system so it stays highlighted
            this.selectedSystem = uninstalledSystem
            this.refreshDisplay()
          }
        } else if (
          this.selectedSystem &&
          'id' in this.selectedSystem &&
          this.selectedSystem.type === type
        ) {
          // Install selected system (only if it's an owned instance, not a shop template)
          if (ship.installSystem(this.selectedSystem, i)) {
            this.selectedSystem = null
            this.refreshDisplay()
          }
        }
      })

      slotBg.on('pointerover', () => {
        slotBg.setFillStyle(installedSystem ? 0x4a6a4a : 0x3a3a4e)
      })

      slotBg.on('pointerout', () => {
        slotBg.setFillStyle(installedSystem ? 0x3a5a3a : 0x2a2a3e)
      })
    }
  }

  private createShopPanel() {
    const { width, height } = this.scale

    // Shop panel on the right
    const shopX = 860
    const shopY = 100
    const shopWidth = width - shopX - 350
    const shopHeight = (height - 250) / 2

    // Panel background
    this.add
      .rectangle(shopX, shopY, shopWidth, shopHeight, 0x1a1a2e, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4444ff, 0.6)

    // Title
    this.add
      .text(shopX + shopWidth / 2, shopY + 30, 'SYSTEMS SHOP', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#88aaff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)

    this.shopContainer = this.add.container(shopX, shopY + 80)

    // Filter buttons
    const filterTypes: SystemType[] = ['weapon', 'engine', 'special', 'extension']
    filterTypes.forEach((type, index) => {
      const filterBtn = this.add
        .text(20 + index * 120, 0, type.toUpperCase(), {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#aaaaaa',
          backgroundColor: '#2a2a3e',
          padding: { x: 10, y: 5 },
        })
        .setInteractive({ cursor: 'pointer' })

      filterBtn.on('pointerdown', () => {
        this.selectedSlotType = type
        this.updateShopDisplay()
      })

      this.shopContainer.add(filterBtn)
    })

    // Shop items area
    this.updateShopDisplay()
  }

  private createStoragePanel() {
    const { width, height } = this.scale

    // Storage panel below shop
    const storageX = 860
    const storageY = 100 + (height - 250) / 2 + 30
    const storageWidth = width - storageX - 350
    const storageHeight = (height - 250) / 2 - 30

    // Panel background
    this.add
      .rectangle(storageX, storageY, storageWidth, storageHeight, 0x1a1a2e, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4444ff, 0.6)

    // Title
    this.add
      .text(storageX + storageWidth / 2, storageY + 30, 'STORAGE', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#88aaff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)

    this.storageContainer = this.add.container(storageX, storageY + 80)

    // Create storage filter buttons
    this.createStorageFilters()

    this.updateStorageDisplay()
  }

  private createStorageFilters() {
    // Remove existing filter buttons first
    const existingFilters: Phaser.GameObjects.GameObject[] = []
    this.storageContainer.list.forEach((item) => {
      if (item instanceof Phaser.GameObjects.Text && item.y === 0) {
        existingFilters.push(item)
      }
    })
    existingFilters.forEach((btn) => {
      this.storageContainer.remove(btn)
      btn.destroy()
    })

    // Filter buttons for storage
    const filterTypes: Array<SystemType | 'all'> = [
      'all',
      'weapon',
      'engine',
      'special',
      'extension',
    ]
    filterTypes.forEach((type, index) => {
      const filterBtn = this.add
        .text(20 + index * 85, 0, type === 'all' ? 'ALL' : type.toUpperCase().substring(0, 3), {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: this.storageFilterType === type ? '#ffff88' : '#aaaaaa',
          backgroundColor: this.storageFilterType === type ? '#3a3a5e' : '#2a2a3e',
          padding: { x: 8, y: 4 },
        })
        .setInteractive({ cursor: 'pointer' })

      filterBtn.on('pointerdown', () => {
        this.storageFilterType = type
        this.updateStorageDisplay()
        this.createStorageFilters() // Recreate to update colors
      })

      this.storageContainer.add(filterBtn)
    })
  }

  private createInfoPanel() {
    const { width, height } = this.scale

    // Info panel on far right
    const infoX = width - 330
    const infoY = 100
    const infoWidth = 280
    const infoHeight = height - 200

    // Panel background
    this.add
      .rectangle(infoX, infoY, infoWidth, infoHeight, 0x1a1a2e, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4444ff, 0.6)

    // Title
    this.add
      .text(infoX + infoWidth / 2, infoY + 30, 'SYSTEM INFO', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#88aaff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)

    this.infoPanel = this.add.container(infoX + 20, infoY + 80)
  }

  private createCreditsDisplay() {
    const { width } = this.scale

    // Credits display at top right
    this.creditsText = this.add
      .text(width - 250, 30, `Credits: ${this.worldModel.playerCredits.toLocaleString()}¢`, {
        fontSize: '28px',
        fontFamily: 'monospace',
        color: '#00ff00',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0.5)
  }

  private updateCreditsDisplay() {
    this.creditsText.setText(`Credits: ${this.worldModel.playerCredits.toLocaleString()}¢`)
  }

  private createControlButtons() {
    const { width, height } = this.scale

    // Exit button
    const exitBtn = this.add
      .text(width - 150, height - 50, 'Exit Shipyard', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffff88',
        backgroundColor: '#2a2a3e',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5, 0.5)
      .setInteractive({ cursor: 'pointer' })

    exitBtn.on('pointerdown', () => this.returnToSystemVisit())
    exitBtn.on('pointerover', () => exitBtn.setBackgroundColor('#3a3a5e'))
    exitBtn.on('pointerout', () => exitBtn.setBackgroundColor('#2a2a3e'))
  }

  private initializeShopSystems() {
    // Create sample system templates for the shop
    this.availableSystems = [
      // Weapons
      {
        templateId: 'laser-mk2',
        name: 'Laser MK2',
        type: 'weapon' as SystemType,
        description: 'Improved laser weapon with higher damage output',
        powerRequirement: 2,
        stats: { damage: 15, range: 100 },
        price: 5000,
      },
      {
        templateId: 'plasma-cannon',
        name: 'Plasma Cannon',
        type: 'weapon' as SystemType,
        description: 'High-energy plasma weapon',
        powerRequirement: 3,
        stats: { damage: 25, range: 80 },
        price: 12000,
      },
      {
        templateId: 'missile-launcher',
        name: 'Missile Launcher',
        type: 'weapon' as SystemType,
        description: 'Guided missile system',
        powerRequirement: 2,
        stats: { damage: 30, range: 150 },
        price: 8000,
      },

      // Engines
      {
        templateId: 'fusion-drive',
        name: 'Fusion Drive',
        type: 'engine' as SystemType,
        description: 'Standard fusion propulsion system',
        powerRequirement: 2,
        stats: { speed: 100, efficiency: 80 },
        price: 7000,
      },
      {
        templateId: 'antimatter-engine',
        name: 'Antimatter Engine',
        type: 'engine' as SystemType,
        description: 'Advanced antimatter propulsion',
        powerRequirement: 4,
        stats: { speed: 150, efficiency: 90 },
        price: 25000,
      },

      // Special Systems
      {
        templateId: 'signal-scrambler',
        name: 'Signal Scrambler',
        type: 'special' as SystemType,
        description: 'Disrupts enemy targeting systems',
        powerRequirement: 1,
        stats: { jamming: 50 },
        price: 6000,
      },
      {
        templateId: 'shield-booster',
        name: 'Shield Booster',
        type: 'special' as SystemType,
        description: 'Increases shield regeneration rate',
        powerRequirement: 2,
        stats: { regenRate: 2 },
        price: 10000,
      },
      {
        templateId: 'cloaking-device',
        name: 'Cloaking Device',
        type: 'special' as SystemType,
        description: 'Renders ship invisible to sensors',
        powerRequirement: 3,
        stats: { cloakDuration: 30 },
        price: 35000,
      },

      // Extensions
      {
        templateId: 'science-bay',
        name: 'Science Bay',
        type: 'extension' as SystemType,
        description: 'Research and analysis facility',
        powerRequirement: 1,
        stats: { researchBonus: 20 },
        price: 15000,
      },
      {
        templateId: 'containment-cell',
        name: 'Containment Cell',
        type: 'extension' as SystemType,
        description: 'Secure holding facility',
        powerRequirement: 1,
        stats: { capacity: 5 },
        price: 8000,
      },
      {
        templateId: 'cargo-extension',
        name: 'Cargo Extension',
        type: 'extension' as SystemType,
        description: 'Additional cargo space',
        powerRequirement: 0,
        stats: { extraSpace: 50 },
        price: 5000,
      },
      {
        templateId: 'weapon-slot-extension',
        name: 'Weapon Mount',
        type: 'extension' as SystemType,
        description: 'Adds an extra weapon slot',
        powerRequirement: 1,
        stats: { extraSlots: 1 },
        price: 20000,
      },
    ]
  }

  private updateShopDisplay() {
    // Clear existing shop items
    this.shopContainer.removeAll(true)
    this.shopItemBackgrounds.clear()

    // Re-add filter buttons
    const filterTypes: SystemType[] = ['weapon', 'engine', 'special', 'extension']
    filterTypes.forEach((type, index) => {
      const filterBtn = this.add
        .text(20 + index * 120, 0, type.toUpperCase(), {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: this.selectedSlotType === type ? '#ffff88' : '#aaaaaa',
          backgroundColor: this.selectedSlotType === type ? '#3a3a5e' : '#2a2a3e',
          padding: { x: 10, y: 5 },
        })
        .setInteractive({ cursor: 'pointer' })

      filterBtn.on('pointerdown', () => {
        this.selectedSlotType = type
        this.updateShopDisplay()
      })

      this.shopContainer.add(filterBtn)
    })

    // Display filtered systems
    const filteredSystems = this.selectedSlotType
      ? this.availableSystems.filter((s) => s.type === this.selectedSlotType)
      : this.availableSystems

    filteredSystems.forEach((system, index) => {
      const itemY = 50 + index * 45

      // Check if this shop template is selected (only if selected item is also a template)
      const isSelected =
        this.selectedSystem &&
        !('id' in this.selectedSystem) && // Selected item must be a template (not instance)
        this.selectedSystem.templateId === system.templateId
      const itemBg = this.add
        .rectangle(20, itemY, 400, 40, isSelected ? 0x3a4a3a : 0x2a2a3e, 0.8)
        .setOrigin(0, 0)
        .setStrokeStyle(2, isSelected ? 0xffff00 : 0x666666)
        .setInteractive({ cursor: 'pointer' })

      // Store reference for later updates
      this.shopItemBackgrounds.set(system.templateId, itemBg)

      const itemText = this.add
        .text(30, itemY + 20, system.name, {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#aaaaaa',
        })
        .setOrigin(0, 0.5)

      const priceText = this.add
        .text(380, itemY + 20, `${(system.price || 0).toLocaleString()}¢`, {
          fontSize: '16px',
          fontFamily: 'monospace',
          color:
            system.price && system.price > this.worldModel.playerCredits ? '#ff8888' : '#88ff88',
        })
        .setOrigin(1, 0.5)

      this.shopContainer.add([itemBg, itemText, priceText])

      // Click handler
      itemBg.on('pointerdown', () => {
        this.selectSystem(system)
      })

      itemBg.on('pointerover', () => {
        if (!isSelected) {
          itemBg.setFillStyle(0x3a3a4e)
        }
        itemText.setColor('#ffffff')
        // Always show info on hover
        this.hoveredSystem = system
        this.updateInfoPanel(system)
      })

      itemBg.on('pointerout', () => {
        // Re-check selection state to ensure correct text color
        const isStillSelected =
          this.selectedSystem &&
          !('id' in this.selectedSystem) &&
          this.selectedSystem.templateId === system.templateId
        if (!isStillSelected) {
          itemBg.setFillStyle(0x2a2a3e)
          itemText.setColor('#aaaaaa')
        }
        // Clear hover info and restore selected info
        if (
          this.hoveredSystem &&
          !('id' in this.hoveredSystem) &&
          this.hoveredSystem.templateId === system.templateId
        ) {
          this.hoveredSystem = null
          if (this.selectedSystem) {
            this.updateInfoPanel(this.selectedSystem)
          } else {
            this.clearInfoPanel()
          }
        }
      })
    })
  }

  private updateStorageDisplay() {
    // Clear existing storage items (but not filter buttons)
    const itemsToRemove: Phaser.GameObjects.GameObject[] = []
    this.storageContainer.list.forEach((item) => {
      // Keep filter buttons (they're at y=0), remove everything else
      if (!(item instanceof Phaser.GameObjects.Text && item.y === 0)) {
        itemsToRemove.push(item)
      }
    })

    itemsToRemove.forEach((item) => {
      this.storageContainer.remove(item)
      item.destroy()
    })

    this.storageItemBackgrounds.clear()

    // Filter stored systems
    let storedSystems = this.worldModel.playerShip.storedSystems
    if (this.storageFilterType !== 'all') {
      storedSystems = storedSystems.filter((s) => s.type === this.storageFilterType)
    }

    if (storedSystems.length === 0) {
      this.storageContainer.add(
        this.add.text(
          20,
          40,
          this.storageFilterType === 'all'
            ? 'No systems in storage'
            : `No ${this.storageFilterType} systems in storage`,
          {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#666666',
          },
        ),
      )
      return
    }

    storedSystems.forEach((system, index) => {
      const itemY = 40 + index * 35

      // Check if this storage instance is selected (compare by unique ID)
      const isSelected =
        this.selectedSystem &&
        'id' in this.selectedSystem && // Selected item must be an instance
        this.selectedSystem.id === system.id
      const itemBg = this.add
        .rectangle(20, itemY, 380, 30, isSelected ? 0x3a4a3a : 0x2a2a3e, 0.8)
        .setOrigin(0, 0)
        .setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0xffff00 : 0x666666)
        .setInteractive({ cursor: 'pointer' })

      // Store reference for later updates
      this.storageItemBackgrounds.set(system.id, itemBg)

      const itemText = this.add
        .text(30, itemY + 15, system.name, {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#aaaaaa',
        })
        .setOrigin(0, 0.5)

      const typeText = this.add
        .text(350, itemY + 15, system.type, {
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#888888',
        })
        .setOrigin(1, 0.5)

      this.storageContainer.add([itemBg, itemText, typeText])

      // Click handler
      itemBg.on('pointerdown', () => {
        this.selectSystem(system)
      })

      itemBg.on('pointerover', () => {
        if (
          !this.selectedSystem ||
          !('id' in this.selectedSystem) ||
          this.selectedSystem.id !== system.id
        ) {
          itemBg.setFillStyle(0x3a3a4e)
        }
        itemText.setColor('#ffffff')
        // Always show info on hover
        this.hoveredSystem = system
        this.updateInfoPanel(system)
      })

      itemBg.on('pointerout', () => {
        // Re-check selection state for this specific storage item
        const isStillSelected =
          this.selectedSystem && 'id' in this.selectedSystem && this.selectedSystem.id === system.id
        if (!isStillSelected) {
          itemBg.setFillStyle(0x2a2a3e)
          itemText.setColor('#aaaaaa')
        }
        // Clear hover info and restore selected info
        if (
          this.hoveredSystem &&
          'id' in this.hoveredSystem &&
          this.hoveredSystem.id === system.id
        ) {
          this.hoveredSystem = null
          if (this.selectedSystem) {
            this.updateInfoPanel(this.selectedSystem)
          } else {
            this.clearInfoPanel()
          }
        }
      })
    })
  }

  private updateInfoPanel(system: ShipSystem | ShipSystemTemplate) {
    // Clear existing info
    this.infoPanel.removeAll(true)

    // System name
    this.infoPanel.add(
      this.add.text(0, 0, system.name, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffff88',
        fontStyle: 'bold',
      }),
    )

    // System type
    this.infoPanel.add(
      this.add.text(0, 30, `Type: ${system.type}`, {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#aaaaaa',
      }),
    )

    // Description
    if (system.description) {
      this.infoPanel.add(
        this.add.text(0, 60, system.description, {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#888888',
          wordWrap: { width: 240 },
        }),
      )
    }

    // If it's an instance, show condition
    if ('id' in system && system.condition !== undefined) {
      const conditionColor =
        system.condition >= 80 ? '#00ff00' : system.condition >= 50 ? '#ffff00' : '#ff8888'
      this.infoPanel.add(
        this.add.text(0, 90, `Condition: ${system.condition}%`, {
          fontSize: '16px',
          fontFamily: 'monospace',
          color: conditionColor,
        }),
      )
    }

    // Price (only for templates)
    if (system.price !== undefined) {
      const canAfford = system.price <= this.worldModel.playerCredits
      this.infoPanel.add(
        this.add.text(0, 100, `Price: ${system.price.toLocaleString()}¢`, {
          fontSize: '18px',
          fontFamily: 'monospace',
          color: canAfford ? '#00ff00' : '#ff8888',
          fontStyle: 'bold',
        }),
      )
    }

    // Power requirement
    if (system.powerRequirement !== undefined) {
      this.infoPanel.add(
        this.add.text(0, 130, `Power: ${system.powerRequirement}`, {
          fontSize: '16px',
          fontFamily: 'monospace',
          color: '#ff8888',
        }),
      )
    }

    // Stats
    if (system.stats) {
      const statsY = 160
      this.infoPanel.add(
        this.add.text(0, statsY, 'Stats:', {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#88aaff',
        }),
      )

      Object.entries(system.stats).forEach(([key, value], index) => {
        this.infoPanel.add(
          this.add.text(10, statsY + 25 + index * 20, `${key}: ${value}`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#aaaaaa',
          }),
        )
      })
    }

    // Action buttons
    const buttonY = 350

    // Check if this is a shop template (not an owned instance)
    if (!('id' in system)) {
      // Buy button for shop items
      const canAfford = !system.price || system.price <= this.worldModel.playerCredits
      const buyBtn = this.add
        .text(0, buttonY, canAfford ? 'Buy System' : 'Insufficient Credits', {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#ffffff',
          backgroundColor: canAfford ? '#3a5a3a' : '#5a3a3a',
          padding: { x: 15, y: 8 },
        })
        .setInteractive({ cursor: canAfford ? 'pointer' : 'not-allowed' })

      if (canAfford) {
        buyBtn.on('pointerdown', () => {
          // Deduct credits
          if (system.price) {
            this.worldModel.playerCredits -= system.price
            this.updateCreditsDisplay()
          }
          // Create a new instance with unique ID
          const newSystem: ShipSystem = {
            ...system,
            id: generateUUID(), // Unique instance ID
            templateId: system.templateId,
            installed: false,
            condition: 100, // Brand new condition
            upgrades: [],
          }
          this.worldModel.playerShip.addSystemToStorage(newSystem)

          // Clear selection (don't auto-select the new item)
          this.selectSystem(null)

          this.updateStorageDisplay()
          this.updateShopDisplay() // Refresh shop to update affordability colors

          // Show purchase message
          this.showMessage(`Purchased ${system.name} for ${system.price?.toLocaleString()}¢`)
        })
      }

      this.infoPanel.add(buyBtn)
    } else if ('id' in system && !system.installed) {
      // Install button for stored systems
      const installBtn = this.add.text(0, buttonY, 'Select to Install', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#3a3a5e',
        padding: { x: 15, y: 8 },
      })

      this.infoPanel.add(installBtn)

      // Instruction text
      this.infoPanel.add(
        this.add.text(0, buttonY + 40, 'Click a slot to install', {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#666666',
        }),
      )
    }
  }

  private refreshDisplay() {
    // Refresh all displays
    this.slotsContainer.removeAll(true)
    this.createSlotSection('Weapons', 'weapon', 0)
    this.createSlotSection('Engines', 'engine', 150)
    this.createSlotSection('Special Systems', 'special', 250)
    this.createSlotSection('Extensions', 'extension', 400)

    this.updateStorageDisplay()

    if (this.selectedSystem) {
      this.updateInfoPanel(this.selectedSystem)
    }
  }

  private showMessage(text: string, color = '#00ff00') {
    const { width, height } = this.scale
    const message = this.add
      .text(width / 2, height - 100, text, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: color,
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
      .setDepth(1000)

    this.tweens.add({
      targets: message,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 2000,
      onComplete: () => {
        message.destroy()
      },
    })
  }

  private selectSystem(system: ShipSystem | ShipSystemTemplate | null) {
    const previousSelected = this.selectedSystem

    // Get the ID for comparison (either instance ID or template ID)
    const getSystemId = (sys: ShipSystem | ShipSystemTemplate) => {
      return 'id' in sys ? sys.id : sys.templateId
    }

    // Check if we're clicking the same actual item (not just same template)
    const isSameItem = (a: ShipSystem | ShipSystemTemplate, b: ShipSystem | ShipSystemTemplate) => {
      // Both are instances - compare by unique ID
      if ('id' in a && 'id' in b) {
        return a.id === b.id
      }
      // Both are templates - compare by templateId
      if (!('id' in a) && !('id' in b)) {
        return a.templateId === b.templateId
      }
      // One is instance, one is template - they're different items
      return false
    }

    // If clicking the same system, deselect it
    if (system && this.selectedSystem && isSameItem(system, this.selectedSystem)) {
      this.selectedSystem = null
      system = null
    } else {
      this.selectedSystem = system
    }

    // Only refresh the display that needs updating
    const isShopItem = system && !('id' in system)
    const isStorageItem = system && 'id' in system
    const wasShopItem = previousSelected && !('id' in previousSelected)
    const wasStorageItem = previousSelected && 'id' in previousSelected

    // Update displays only if needed
    if (isShopItem || wasShopItem || !system) {
      this.updateShopDisplay()
    }
    if (isStorageItem || wasStorageItem || !system) {
      this.updateStorageDisplay()
    }

    // Update info panel
    if (system) {
      this.updateInfoPanel(system)
    } else {
      this.clearInfoPanel()
    }
  }

  private clearInfoPanel() {
    this.infoPanel.removeAll(true)
    this.infoPanel.add(
      this.add.text(0, 0, 'Select a system', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#666666',
      }),
    )
  }

  private returnToSystemVisit() {
    // Return to system visit scene
    this.scene.start(sceneRegistry.SYSTEM_VISIT_SCENE)
  }
}
