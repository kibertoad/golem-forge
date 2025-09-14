import { PotatoScene } from '@potato-golem/ui'
import Phaser from 'phaser'
import type { Dependencies } from '../../diConfig.ts'
import type { CargoItem, ConcealedCompartment, ShipModel } from '../../model/entities/ShipModel.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import type { SystemData } from '../system-visit/SystemVisitScene.ts'

// Trade goods available at starports
interface TradeGood extends CargoItem {
  basePrice: number
  available: number
  description?: string
  category?: 'food' | 'industrial' | 'electronics' | 'minerals' | 'weapons' | 'illegal'
}

export class StarportTradeScene extends PotatoScene {
  private readonly worldModel: WorldModel
  private playerShip!: ShipModel
  private systemData?: SystemData

  // UI Elements
  private backgroundRect!: Phaser.GameObjects.Rectangle
  private titleText!: Phaser.GameObjects.Text
  private creditsText!: Phaser.GameObjects.Text

  // Ship cargo display (left side)
  private shipCargoContainer!: Phaser.GameObjects.Container
  private cargoCompartments: Phaser.GameObjects.Container[] = []

  // Trade goods display (right side)
  private tradeGoodsContainer!: Phaser.GameObjects.Container
  private tradeGoodSlots: Phaser.GameObjects.Container[] = []

  // Filter buttons
  private filterContainer!: Phaser.GameObjects.Container
  private activeFilter: 'all' | 'legal' | 'illegal' | 'specialty' | 'demand' = 'all'

  // Selection
  private selectedCompartment: string | null = null
  private selectedGood: TradeGood | null = null
  private selectedCargoItem: { compartmentId: string; item: CargoItem } | null = null
  private selectedCargoSlot: Phaser.GameObjects.Rectangle | null = null

  // Trade goods data
  private allTradeGoods: TradeGood[] = []
  private filteredTradeGoods: TradeGood[] = []
  private playerCredits = 5000 // Starting credits

  constructor(dependencies: Dependencies) {
    super(dependencies.globalSceneEventEmitter, { key: sceneRegistry.STARPORT_TRADE_SCENE })
    this.worldModel = dependencies.worldModel
  }

  init(data?: { systemData?: SystemData }) {
    this.playerShip = this.worldModel.playerShip
    this.systemData = data?.systemData
    this.generateTradeGoods()
  }

  create() {
    const { width, height } = this.scale

    // Create background
    this.backgroundRect = this.add.rectangle(0, 0, width, height, 0x1a1a2e, 1).setOrigin(0, 0)

    // Title
    this.titleText = this.add
      .text(width / 2, 30, 'STARPORT TRADING POST', {
        fontSize: '36px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)

    // Credits display
    this.creditsText = this.add
      .text(width / 2, 70, `Credits: ${this.playerCredits}`, {
        fontSize: '24px',
        fontFamily: 'monospace',
        color: '#ffff00',
      })
      .setOrigin(0.5, 0)

    // Create filter buttons
    this.createFilterButtons()

    // Create left panel (ship cargo)
    this.createShipCargoPanel()

    // Create right panel (trade goods)
    this.createTradeGoodsPanel()

    // Create action buttons
    this.createActionButtons()

    // ESC to return
    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToSystemVisit()
    })
  }

  private generateTradeGoods() {
    // Generate trade goods based on system type
    const isIndustrial = this.systemData?.economicType === 'industrial'
    const isMining = this.systemData?.economicType === 'mining'
    const isAgricultural = this.systemData?.economicType === 'agricultural'
    const isScientific = this.systemData?.economicType === 'scientific'

    // Generate random trade goods based on system
    const goodsDatabase: TradeGood[] = [
      // Food category
      {
        id: 'food-rations',
        name: 'Food Rations',
        quantity: 1,
        spacePerUnit: 1,
        basePrice: isAgricultural ? 5 : 15, // Cheap in agricultural systems
        available: isAgricultural ? 200 : 50,
        description: 'Standard preserved food',
        illegal: false,
        category: 'food',
      },
      {
        id: 'luxury-food',
        name: 'Luxury Cuisine',
        quantity: 1,
        spacePerUnit: 2,
        basePrice: isAgricultural ? 30 : 80,
        available: isAgricultural ? 50 : 10,
        description: 'Exotic delicacies',
        illegal: false,
        category: 'food',
      },
      // Industrial category
      {
        id: 'machinery',
        name: 'Industrial Machinery',
        quantity: 1,
        spacePerUnit: 5,
        basePrice: isIndustrial ? 100 : 300,
        available: isIndustrial ? 30 : 5,
        description: 'Heavy industrial equipment',
        illegal: false,
        category: 'industrial',
      },
      {
        id: 'components',
        name: 'Ship Components',
        quantity: 1,
        spacePerUnit: 3,
        basePrice: isIndustrial ? 150 : 400,
        available: isIndustrial ? 20 : 8,
        description: 'Spare ship parts',
        illegal: false,
        category: 'industrial',
      },
      // Electronics category
      {
        id: 'electronics',
        name: 'Electronics',
        quantity: 1,
        spacePerUnit: 1,
        basePrice: isScientific ? 50 : 150,
        available: isScientific ? 40 : 15,
        description: 'Consumer electronics',
        illegal: false,
        category: 'electronics',
      },
      {
        id: 'computers',
        name: 'Quantum Computers',
        quantity: 1,
        spacePerUnit: 2,
        basePrice: isScientific ? 200 : 500,
        available: isScientific ? 15 : 3,
        description: 'Advanced computing systems',
        illegal: false,
        category: 'electronics',
      },
      // Minerals category
      {
        id: 'raw-ore',
        name: 'Raw Ore',
        quantity: 1,
        spacePerUnit: 4,
        basePrice: isMining ? 20 : 60,
        available: isMining ? 100 : 20,
        description: 'Unprocessed minerals',
        illegal: false,
        category: 'minerals',
      },
      {
        id: 'rare-minerals',
        name: 'Rare Minerals',
        quantity: 1,
        spacePerUnit: 3,
        basePrice: isMining ? 150 : 400,
        available: isMining ? 30 : 8,
        description: 'Valuable mining products',
        illegal: false,
        category: 'minerals',
      },
      // Medical supplies
      {
        id: 'medical-supplies',
        name: 'Medical Supplies',
        quantity: 1,
        spacePerUnit: 2,
        basePrice: 50,
        available: 30,
        description: 'Basic medical equipment',
        illegal: false,
        category: 'industrial',
      },
      // Illegal goods (higher profit margins)
      {
        id: 'weapons',
        name: 'Military Weapons',
        quantity: 1,
        spacePerUnit: 3,
        basePrice: 500,
        available: 5,
        description: 'Restricted military hardware',
        illegal: true,
        category: 'weapons',
      },
      {
        id: 'narcotics',
        name: 'Narcotics',
        quantity: 1,
        spacePerUnit: 1,
        basePrice: 800,
        available: 8,
        description: 'Highly illegal substances',
        illegal: true,
        category: 'illegal',
      },
      {
        id: 'stolen-data',
        name: 'Stolen Data Cores',
        quantity: 1,
        spacePerUnit: 1,
        basePrice: 1000,
        available: 3,
        description: 'Encrypted corporate secrets',
        illegal: true,
        category: 'illegal',
      },
    ]

    // Randomly select 6-10 goods for this starport
    const numGoods = Phaser.Math.Between(6, 10)
    this.allTradeGoods = []
    const shuffled = Phaser.Utils.Array.Shuffle([...goodsDatabase])
    for (let i = 0; i < numGoods && i < shuffled.length; i++) {
      // Apply additional price variation
      const good = { ...shuffled[i] }
      good.basePrice = Math.floor(good.basePrice * Phaser.Math.FloatBetween(0.9, 1.1))
      good.available = Math.floor(good.available * Phaser.Math.FloatBetween(0.8, 1.2))
      this.allTradeGoods.push(good)
    }

    this.filteredTradeGoods = [...this.allTradeGoods]
  }

  private createFilterButtons() {
    const { width } = this.scale
    const buttonY = 110
    const buttonWidth = 120
    const buttonSpacing = 10
    const startX = width / 2 + 50

    this.filterContainer = this.add.container(startX, buttonY)

    const filters = [
      { key: 'all', label: 'All' },
      { key: 'legal', label: 'Legal' },
      { key: 'illegal', label: 'Illegal' },
      { key: 'specialty', label: 'Specialty' },
      { key: 'demand', label: 'In Demand' },
    ]

    filters.forEach((filter, index) => {
      const x = index * (buttonWidth + buttonSpacing)
      const button = this.add
        .text(x, 0, filter.label, {
          fontSize: '18px',  // Increased from 16px
          fontFamily: 'Arial',
          color: this.activeFilter === filter.key ? '#000000' : '#ffffff',
          backgroundColor: this.activeFilter === filter.key ? '#ffff00' : '#333333',
          padding: { x: 10, y: 5 },
          fixedWidth: buttonWidth,
          align: 'center',
        })
        .setOrigin(0, 0)
        .setInteractive()

      button.on('pointerdown', () => {
        this.setFilter(filter.key as typeof this.activeFilter)
        this.updateFilterButtons()
      })

      button.on('pointerover', () => {
        if (this.activeFilter !== filter.key) {
          button.setBackgroundColor('#555555')
        }
      })

      button.on('pointerout', () => {
        if (this.activeFilter !== filter.key) {
          button.setBackgroundColor('#333333')
        }
      })

      button.setData('filterKey', filter.key)
      this.filterContainer.add(button)
    })
  }

  private setFilter(filter: typeof this.activeFilter) {
    this.activeFilter = filter

    switch (filter) {
      case 'all':
        this.filteredTradeGoods = [...this.allTradeGoods]
        break
      case 'legal':
        this.filteredTradeGoods = this.allTradeGoods.filter(g => !g.illegal)
        break
      case 'illegal':
        this.filteredTradeGoods = this.allTradeGoods.filter(g => g.illegal)
        break
      case 'specialty':
        // Show items that are cheap in this system type
        this.filteredTradeGoods = this.allTradeGoods.filter(g => {
          const systemType = this.systemData?.economicType
          if (systemType === 'agricultural' && g.category === 'food') return true
          if (systemType === 'industrial' && g.category === 'industrial') return true
          if (systemType === 'mining' && g.category === 'minerals') return true
          if (systemType === 'scientific' && g.category === 'electronics') return true
          return false
        })
        break
      case 'demand':
        // Show items that are expensive in this system type (high demand)
        this.filteredTradeGoods = this.allTradeGoods.filter(g => {
          const systemType = this.systemData?.economicType
          if (!systemType || systemType === 'agricultural') {
            return g.category === 'industrial' || g.category === 'electronics'
          }
          if (systemType === 'industrial') {
            return g.category === 'minerals' || g.category === 'food'
          }
          if (systemType === 'mining') {
            return g.category === 'food' || g.category === 'electronics'
          }
          if (systemType === 'scientific') {
            return g.category === 'food' || g.category === 'minerals'
          }
          return false
        })
        break
    }

    this.refreshGoodsDisplay()
  }

  private updateFilterButtons() {
    this.filterContainer.each((child: Phaser.GameObjects.GameObject) => {
      if (child instanceof Phaser.GameObjects.Text) {
        const filterKey = child.getData('filterKey')
        if (filterKey === this.activeFilter) {
          child.setColor('#000000')
          child.setBackgroundColor('#ffff00')
        } else {
          child.setColor('#ffffff')
          child.setBackgroundColor('#333333')
        }
      }
    })
  }

  private createShipCargoPanel() {
    const { width, height } = this.scale
    const panelX = 50
    const panelY = 150
    const panelWidth = width / 2 - 350  // Further reduced for wider detail panel
    const panelHeight = height - 250

    // Create fixed item detail panel area
    const detailPanelX = panelX + panelWidth + 20
    const detailPanelY = panelY
    const detailPanelWidth = 280  // Wider detail panel
    const detailPanelHeight = 400  // Extended to fit all content including illegal goods

    // Panel background
    this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0x2a2a3e, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4444ff)

    // Panel title
    this.add
      .text(panelX + panelWidth / 2, panelY + 20, 'SHIP CARGO HOLDS', {
        fontSize: '28px',  // Increased from 24px
        fontFamily: 'Arial',
        color: '#88ff88',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)

    // Item detail panel background (initially hidden)
    this.itemDetailBackground = this.add
      .rectangle(detailPanelX, detailPanelY, detailPanelWidth, detailPanelHeight, 0x1a1a2e, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x666666)
      .setVisible(false)

    // Item detail panel title (initially hidden)
    this.itemDetailTitle = this.add
      .text(detailPanelX + detailPanelWidth / 2, detailPanelY + 20, 'ITEM DETAILS', {
        fontSize: '20px',  // Increased from 16px
        fontFamily: 'Arial',
        color: '#aaaaaa',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)
      .setVisible(false)

    // Create the item detail container (initially empty)
    this.itemDetailPanel = this.add.container(detailPanelX + 10, detailPanelY + 50)

    this.shipCargoContainer = this.add.container(panelX, panelY + 60)

    let yOffset = 0

    // Public cargo hold
    const publicCompartment = this.createCompartmentDisplay(
      'public',
      'Public Cargo Hold',
      this.playerShip.maxPublicSpace,
      this.playerShip.currentPublicSpace,
      this.playerShip.publicCargo,
      false,
      yOffset,
    )
    this.shipCargoContainer.add(publicCompartment)
    this.cargoCompartments.push(publicCompartment)
    yOffset += 140

    // Concealed compartments
    this.playerShip.concealedSpaceSlots.forEach((compartment) => {
      const concealedDisplay = this.createCompartmentDisplay(
        compartment.id,
        compartment.name,
        compartment.maxSpace,
        compartment.currentSpace,
        compartment.contents || [],
        true,
        yOffset,
        compartment,
      )
      this.shipCargoContainer.add(concealedDisplay)
      this.cargoCompartments.push(concealedDisplay)
      yOffset += 140
    })
  }

  private createCompartmentDisplay(
    id: string,
    name: string,
    maxSpace: number,
    currentSpace: number,
    contents: CargoItem[],
    isConcealed: boolean,
    y: number,
    compartment?: ConcealedCompartment,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(10, y)
    container.setData('compartmentId', id)

    // Store cargo icons separately to add them outside container
    const cargoIcons: Phaser.GameObjects.Image[] = []

    // Background - make it interactive but at lower depth (reduced width)
    const bg = this.add
      .rectangle(0, 0, 320, 120, isConcealed ? 0x3a2a2a : 0x2a3a2a, 0.8)
      .setOrigin(0, 0)
      .setInteractive()
      .setStrokeStyle(2, this.selectedCompartment === id ? 0xffff00 : 0x666666)
      .setDepth(-1)

    // Name
    const nameText = this.add
      .text(10, 10, name, {
        fontSize: '20px',  // Increased from 18px
        fontFamily: 'monospace',
        color: isConcealed ? '#ff8888' : '#88ff88',
      })
      .setOrigin(0, 0)

    // Concealment info
    let scannerInfoY = 30
    if (isConcealed && compartment) {
      const concealmentText = this.add
        .text(
          10,
          30,
          `Concealment: ${'★'.repeat(compartment.concealmentLevel)}${'☆'.repeat(10 - compartment.concealmentLevel)}`,
          {
            fontSize: '16px',  // Increased from 14px
            fontFamily: 'monospace',
            color: '#ffaa00',
          },
        )
        .setOrigin(0, 0)
      container.add(concealmentText)

      // Show best scanner protection
      const bestProtection = Object.entries(compartment.scannerProofing)
        .sort(([, a], [, b]) => (b || 0) - (a || 0))
        .slice(0, 2)
        .map(([type, value]) => `${type}: ${value}%`)
        .join(', ')

      const protectionText = this.add
        .text(10, 50, `Protection: ${bestProtection}`, {
          fontSize: '14px',  // Increased from 12px
          fontFamily: 'monospace',
          color: '#888888',
        })
        .setOrigin(0, 0)
      container.add(protectionText)
      scannerInfoY = 68
    }

    // Space indicator - now shows used/max
    const usedSpace = maxSpace - currentSpace
    const spaceText = this.add
      .text(10, scannerInfoY, `Space: ${usedSpace}/${maxSpace} units taken`, {
        fontSize: '18px',  // Increased from 16px
        fontFamily: 'monospace',
        color: '#ffffff',
      })
      .setOrigin(0, 0)

    // Cargo slots display
    const slotStartX = 10
    const slotStartY = scannerInfoY + 25
    const slotSize = 30
    const slotSpacing = 5
    const slotsPerRow = 12

    // Calculate base world position for this container
    const panelX = 50  // from createShipCargoPanel
    const panelY = 150 // from createShipCargoPanel
    const containerX = panelX + 10 // container x position
    const containerY = panelY + 60 + y // container y position in shipCargoContainer

    // Create cargo item slots
    contents.forEach((item, index) => {
      const row = Math.floor(index / slotsPerRow)
      const col = index % slotsPerRow
      const slotX = slotStartX + col * (slotSize + slotSpacing)
      const slotY = slotStartY + row * (slotSize + slotSpacing)

      // Calculate absolute world position for the icon
      const worldX = containerX + slotX + slotSize / 2
      const worldY = containerY + slotY + slotSize / 2

      // Calculate profit margin for visual indicator
      let bgColor = item.illegal ? 0x553333 : 0x335533
      if (item.purchasedAtPrice !== undefined) {
        const salePrice = Math.floor((item.value || 0) * 0.8)
        const profit = salePrice - item.purchasedAtPrice
        if (profit > 0) {
          bgColor = item.illegal ? 0x665533 : 0x336633  // Green tint for profit
        } else if (profit < 0) {
          bgColor = item.illegal ? 0x663333 : 0x553333  // Red tint for loss
        }
      }

      // Slot background - non-interactive visual only
      const slotBg = this.add
        .rectangle(slotX, slotY, slotSize, slotSize, bgColor, 0.8)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x666666)
        .setDepth(0)

      // Create icon at world position (not relative to container)
      const icon = this.add
        .image(worldX, worldY, imageRegistry.ROCKET)
        .setDisplaySize(20, 20)
        .setTint(item.illegal ? 0xff6666 : 0xffffff)
        .setDepth(1000) // Very high depth to ensure it's on top
        .setInteractive({ useHandCursor: true })

      // Store reference to icon
      cargoIcons.push(icon)


      // Quantity text at world position
      if (item.quantity > 1) {
        const qtyText = this.add
          .text(worldX + slotSize/2 - 2, worldY + slotSize/2 - 2, `${item.quantity}`, {
            fontSize: '12px',  // Increased from 10px
            fontFamily: 'monospace',
            color: '#ffff00',
          })
          .setOrigin(1, 1)
          .setDepth(1001) // Above icon
      }

      // Click handler for selling - on the icon
      icon.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation()

        // Clear previous selection
        if (this.selectedCargoSlot) {
          this.selectedCargoSlot.setStrokeStyle(1, 0x666666)
        }

        // Set new selection
        this.selectedCargoItem = { compartmentId: id, item }
        this.selectedCargoSlot = slotBg
        slotBg.setStrokeStyle(3, 0xffff00)

        // Show item details in fixed panel
        this.showItemDetails(item, true)
      })

      icon.on('pointerover', () => {
        // Only show hover details if this item isn't already selected
        if (this.selectedCargoItem?.item !== item) {
          slotBg.setStrokeStyle(2, 0xaaaaff)
          // Show item details in fixed panel
          this.showItemDetails(item, false)
        } else {
          // If selected, just highlight more
          slotBg.setStrokeStyle(3, 0xffff00)
        }
      })

      icon.on('pointerout', () => {
        // Keep selection highlight if this item is selected
        if (this.selectedCargoItem?.item === item) {
          slotBg.setStrokeStyle(3, 0xffff00)
          // Keep showing selected item details
        } else {
          slotBg.setStrokeStyle(1, 0x666666)
          // Clear hover details if nothing is selected
          if (!this.selectedCargoItem) {
            this.clearItemDetails()
          } else {
            // Show selected item details again
            this.showItemDetails(this.selectedCargoItem.item, true)
          }
        }
      })

      // Store reference for selection highlighting
      slotBg.setData('cargoItem', item)
      slotBg.setData('compartmentId', id)
      icon.setData('slotBg', slotBg)

      // Only add slot background to container
      container.add(slotBg)
      // Icon is already added to the scene directly, not the container
    })

    // Add all elements to container with background at the back
    container.add([bg, nameText, spaceText])

    // Store icons reference in container for cleanup
    container.setData('cargoIcons', cargoIcons)

    // Click handler for compartment selection
    bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Get local position within the container
      const localX = pointer.x - (50 + 10) // panelX + container.x
      const localY = pointer.y - (150 + 60 + y) // panelY + shipCargoContainer.y + container.y

      // Check if click is in the cargo slots area
      const isInCargoArea = localX >= slotStartX &&
                           localX <= slotStartX + (12 * 35) && // 12 slots * (30 + 5 spacing)
                           localY >= slotStartY &&
                           localY <= slotStartY + 35 // one row of slots

      if (!isInCargoArea) {
        this.selectCompartment(id)
      }
    })

    bg.on('pointerover', () => {
      bg.setStrokeStyle(2, 0xaaaaff)
    })

    bg.on('pointerout', () => {
      bg.setStrokeStyle(2, this.selectedCompartment === id ? 0xffff00 : 0x666666)
    })

    return container
  }

  private itemDetailPanel?: Phaser.GameObjects.Container

  private itemDetailBackground?: Phaser.GameObjects.Rectangle
  private itemDetailTitle?: Phaser.GameObjects.Text

  private showItemDetails(item: CargoItem, isSelected: boolean) {
    // Clear existing details
    this.clearItemDetails()

    if (!this.itemDetailPanel) return

    // Show the detail panel background and title
    if (this.itemDetailBackground) {
      this.itemDetailBackground.setVisible(true)
    }
    if (this.itemDetailTitle) {
      this.itemDetailTitle.setVisible(true)
    }

    let yOffset = 0
    const lineHeight = 20

    // Helper function to add text with custom color
    const addLine = (text: string, color: string = '#ffffff') => {
      const textObj = this.add
        .text(0, yOffset, text, {
          fontSize: '16px',
          fontFamily: 'monospace',
          color: color,
          lineSpacing: 4,
        })
        .setOrigin(0, 0)
      this.itemDetailPanel.add(textObj)
      yOffset += lineHeight
    }

    if (isSelected) {
      addLine('SELECTED FOR SALE', '#ffff00')
      addLine('─────────────────────────', '#666666')
    }

    addLine(item.name, '#ffffff')
    yOffset += 10 // Extra spacing
    addLine(`Current Market: ${item.value}¢`, '#aaaaaa')

    // Calculate profit/loss margin with color coding
    if (item.purchasedAtPrice !== undefined) {
      const purchasePrice = item.purchasedAtPrice
      const currentPrice = item.value || 0
      const salePrice = Math.floor(currentPrice * 0.8) // Sell at 80% of market value
      const profitPerUnit = salePrice - purchasePrice
      const profitPercent = purchasePrice > 0 ? Math.round((profitPerUnit / purchasePrice) * 100) : 100

      addLine(`Purchased At: ${purchasePrice}¢`, '#aaaaaa')
      addLine(`Sale Price: ${salePrice}¢ (80% market)`, '#ffff00')

      // Color-coded profit/loss
      if (profitPerUnit > 0) {
        const profitColor = profitPercent >= 50 ? '#00ff00' : (profitPercent >= 20 ? '#88ff88' : '#ccffcc')
        addLine(`Profit: +${profitPerUnit}¢ (+${profitPercent}%)`, profitColor)
      } else if (profitPerUnit < 0) {
        const lossColor = profitPercent <= -50 ? '#ff0000' : (profitPercent <= -20 ? '#ff8888' : '#ffcccc')
        addLine(`Loss: ${profitPerUnit}¢ (${profitPercent}%)`, lossColor)
      } else {
        addLine(`Break Even: 0¢ (0%)`, '#ffffff')
      }
    }

    yOffset += 10 // Extra spacing
    addLine(`Size: ${item.spacePerUnit} units`, '#aaaaaa')
    addLine(`Quantity: ${item.quantity}`, '#aaaaaa')
    yOffset += 10 // Extra spacing
    addLine(`Total Value: ${(item.value || 0) * item.quantity}¢`, '#ffff00')
    addLine(`Total Size: ${item.spacePerUnit * item.quantity} units`, '#aaaaaa')

    if (item.purchasedAtPrice !== undefined && item.purchasedAtPrice > 0) {
      const totalProfit = (Math.floor((item.value || 0) * 0.8) - item.purchasedAtPrice) * item.quantity
      if (totalProfit !== 0) {
        const profitColor = totalProfit > 0 ? '#00ff00' : '#ff6666'
        addLine(`Total ${totalProfit > 0 ? 'Profit' : 'Loss'}: ${totalProfit > 0 ? '+' : ''}${totalProfit}¢`, profitColor)
      }
    }

    if (item.illegal) {
      yOffset += 10 // Extra spacing
      addLine('[ILLEGAL GOODS]', '#ff4444')
      addLine('Risk of confiscation', '#ff8888')
      addLine('Higher profit margin', '#88ff88')
    }
  }

  private clearItemDetails() {
    if (this.itemDetailPanel) {
      this.itemDetailPanel.removeAll(true)
    }
    // Hide the detail panel background and title when clearing
    if (this.itemDetailBackground) {
      this.itemDetailBackground.setVisible(false)
    }
    if (this.itemDetailTitle) {
      this.itemDetailTitle.setVisible(false)
    }
  }

  private clearCargoSelectionHighlights() {
    // Clear all cargo slot highlights
    this.cargoCompartments.forEach((compartment) => {
      compartment.each((child: Phaser.GameObjects.GameObject) => {
        if (child instanceof Phaser.GameObjects.Rectangle && child.getData('cargoItem')) {
          const item = child.getData('cargoItem')
          if (this.selectedCargoItem?.item !== item) {
            child.setStrokeStyle(1, 0x666666)
          }
        }
      })
    })
  }

  private clearCargoSelection() {
    // Clear selected cargo item
    this.selectedCargoItem = null

    // Clear slot highlight
    if (this.selectedCargoSlot) {
      this.selectedCargoSlot.setStrokeStyle(1, 0x666666)
      this.selectedCargoSlot = null
    }

    // Clear item details
    this.clearItemDetails()
  }

  private createTradeGoodsPanel() {
    const { width, height } = this.scale
    const panelX = width / 2 + 50
    const panelY = 150
    const panelWidth = width / 2 - 100
    const panelHeight = height - 250

    // Panel background
    this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0x2a2a3e, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4444ff)

    // Panel title
    this.add
      .text(panelX + panelWidth / 2, panelY + 20, 'AVAILABLE GOODS', {
        fontSize: '28px',  // Increased from 24px
        fontFamily: 'Arial',
        color: '#88ff88',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)

    this.tradeGoodsContainer = this.add.container(panelX, panelY + 60)

    this.refreshGoodsDisplay()
  }

  private refreshGoodsDisplay() {
    // Clear existing display
    this.tradeGoodsContainer.removeAll(true)
    this.tradeGoodSlots = []

    // Create scrollable list of goods
    let yOffset = 0
    this.filteredTradeGoods.forEach((good) => {
      const goodDisplay = this.createGoodDisplay(good, yOffset)
      this.tradeGoodsContainer.add(goodDisplay)
      this.tradeGoodSlots.push(goodDisplay)
      yOffset += 80
    })
  }

  private createGoodDisplay(good: TradeGood, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(10, y)
    container.setData('good', good)

    // Background
    const bg = this.add
      .rectangle(0, 0, 480, 70, good.illegal ? 0x4a2a2a : 0x2a3a4a, 0.8)
      .setOrigin(0, 0)
      .setInteractive()
      .setStrokeStyle(2, this.selectedGood?.id === good.id ? 0xffff00 : 0x666666)

    // Icon
    const icon = this.add
      .image(25, 35, imageRegistry.ROCKET)
      .setDisplaySize(30, 30)
      .setTint(good.illegal ? 0xff6666 : 0xffffff)

    // Name
    const nameText = this.add
      .text(60, 5, good.name + (good.illegal ? ' [ILLEGAL]' : ''), {
        fontSize: '18px',  // Increased from 16px
        fontFamily: 'monospace',
        color: good.illegal ? '#ff4444' : '#ffffff',
      })
      .setOrigin(0, 0)

    // Description
    if (good.description) {
      const descText = this.add
        .text(60, 25, good.description, {
          fontSize: '14px',  // Increased from 12px
          fontFamily: 'monospace',
          color: '#aaaaaa',
        })
        .setOrigin(0, 0)
      container.add(descText)
    }

    // Price and stats
    const statsText = this.add
      .text(
        60,
        45,
        `Price: ${good.basePrice}¢  Size: ${good.spacePerUnit}u  Stock: ${good.available}`,
        {
          fontSize: '16px',  // Increased from 14px
          fontFamily: 'monospace',
          color: '#ffff00',
        },
      )
      .setOrigin(0, 0)

    container.add([bg, icon, nameText, statsText])

    // Click handler
    bg.on('pointerdown', () => {
      this.selectGood(good)
    })

    bg.on('pointerover', () => {
      bg.setStrokeStyle(2, 0xaaaaff)
    })

    bg.on('pointerout', () => {
      bg.setStrokeStyle(2, this.selectedGood?.id === good.id ? 0xffff00 : 0x666666)
    })

    return container
  }

  private createActionButtons() {
    const { width, height } = this.scale
    const buttonY = height - 80

    // Buy button
    const buyButton = this.add
      .text(width / 2 - 250, buttonY, 'BUY SELECTED', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#00ff00',
        backgroundColor: '#003300',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5, 0.5)
      .setInteractive()

    buyButton.on('pointerdown', () => {
      this.buyGood()
    })

    buyButton.on('pointerover', () => {
      buyButton.setBackgroundColor('#005500')
    })

    buyButton.on('pointerout', () => {
      buyButton.setBackgroundColor('#003300')
    })

    // Sell button
    const sellButton = this.add
      .text(width / 2, buttonY, 'SELL SELECTED', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ff8800',
        backgroundColor: '#332200',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5, 0.5)
      .setInteractive()

    sellButton.on('pointerdown', () => {
      this.sellGood()
    })

    sellButton.on('pointerover', () => {
      sellButton.setBackgroundColor('#553300')
    })

    sellButton.on('pointerout', () => {
      sellButton.setBackgroundColor('#332200')
    })

    // Return button
    const returnButton = this.add
      .text(width / 2 + 250, buttonY, 'LEAVE STARPORT', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5, 0.5)
      .setInteractive()

    returnButton.on('pointerdown', () => {
      this.returnToSystemVisit()
    })

    returnButton.on('pointerover', () => {
      returnButton.setBackgroundColor('#555555')
    })

    returnButton.on('pointerout', () => {
      returnButton.setBackgroundColor('#333333')
    })
  }

  private selectCompartment(id: string) {
    this.selectedCompartment = id
    // Update visual selection
    this.cargoCompartments.forEach((comp) => {
      const bg = comp.getAt(0)
      if (bg instanceof Phaser.GameObjects.Rectangle) {
        bg.setStrokeStyle(2, comp.getData('compartmentId') === id ? 0xffff00 : 0x666666)
      }
    })

    // Clear cargo selection when selecting a compartment
    this.clearCargoSelection()
  }

  private selectGood(good: TradeGood) {
    this.selectedGood = good
    // Update visual selection
    this.tradeGoodSlots.forEach((slot) => {
      const bg = slot.getAt(0) as Phaser.GameObjects.Rectangle
      const slotGood = slot.getData('good') as TradeGood
      bg.setStrokeStyle(2, slotGood.id === good.id ? 0xffff00 : 0x666666)
    })
  }

  private buyGood() {
    if (!this.selectedGood || !this.selectedCompartment) {
      this.showMessage('Select both a cargo hold and a good to buy!', '#ff0000')
      return
    }

    const good = this.selectedGood
    const price = good.basePrice

    // Check credits
    if (this.playerCredits < price) {
      this.showMessage('Insufficient credits!', '#ff0000')
      return
    }

    // Check stock
    if (good.available <= 0) {
      this.showMessage('Out of stock!', '#ff0000')
      return
    }

    // Create cargo item with purchase price
    const cargoItem: CargoItem = {
      id: `${good.id}-${Date.now()}`,
      name: good.name,
      quantity: 1,
      spacePerUnit: good.spacePerUnit,
      illegal: good.illegal,
      value: good.basePrice,
      purchasedAtPrice: good.basePrice,  // Track the price we paid
    }

    // Try to add to selected compartment
    let success = false
    if (this.selectedCompartment === 'public') {
      success = this.playerShip.addPublicCargo(cargoItem)
    } else {
      success = this.playerShip.addConcealedCargo(this.selectedCompartment, cargoItem)
    }

    if (success) {
      // Deduct credits and stock
      this.playerCredits -= price
      good.available--
      this.creditsText.setText(`Credits: ${this.playerCredits}`)

      // Refresh displays
      this.refreshCargoDisplay()
      this.refreshGoodsDisplayAfterPurchase()

      this.showMessage(`Purchased ${good.name} for ${price}¢`, '#00ff00')
    } else {
      this.showMessage('Not enough space in selected hold!', '#ff0000')
    }
  }

  private sellGood() {
    if (!this.selectedCargoItem) {
      this.showMessage('Select a cargo item to sell!', '#ff0000')
      return
    }

    const { compartmentId, item } = this.selectedCargoItem
    const salePrice = Math.floor((item.value || 50) * 0.8) // Sell at 80% of value

    // Calculate profit/loss
    const purchasePrice = item.purchasedAtPrice || 0
    const profit = salePrice - purchasePrice
    const profitText = profit > 0 ? `+${profit}¢ profit` : profit < 0 ? `${profit}¢ loss` : 'break even'

    // Remove from compartment
    let removed: CargoItem | null = null
    if (compartmentId === 'public') {
      removed = this.playerShip.removePublicCargo(item.id)
    } else {
      removed = this.playerShip.removeConcealedCargo(compartmentId, item.id)
    }

    if (removed) {
      // Add credits
      this.playerCredits += salePrice
      this.creditsText.setText(`Credits: ${this.playerCredits}`)

      // Clear selection
      this.clearCargoSelection()

      // Refresh display
      this.refreshCargoDisplay()

      // Show message with profit/loss info
      const messageColor = profit > 0 ? '#00ff00' : profit < 0 ? '#ff8800' : '#ffff00'
      this.showMessage(`Sold ${item.name} for ${salePrice}¢ (${profitText})`, messageColor)
    } else {
      this.showMessage('Failed to sell item!', '#ff0000')
    }
  }

  private refreshCargoDisplay() {
    // Clean up any cargo icons that were added to the scene
    this.cargoCompartments.forEach(comp => {
      const icons = comp.getData('cargoIcons') as Phaser.GameObjects.Image[]
      if (icons) {
        icons.forEach(icon => icon.destroy())
      }
    })

    // Update cargo compartment displays
    this.shipCargoContainer.removeAll(true)
    this.cargoCompartments = []

    let yOffset = 0

    // Public cargo hold
    const publicCompartment = this.createCompartmentDisplay(
      'public',
      'Public Cargo Hold',
      this.playerShip.maxPublicSpace,
      this.playerShip.currentPublicSpace,
      this.playerShip.publicCargo,
      false,
      yOffset,
    )
    this.shipCargoContainer.add(publicCompartment)
    this.cargoCompartments.push(publicCompartment)
    yOffset += 140

    // Concealed compartments
    this.playerShip.concealedSpaceSlots.forEach((compartment) => {
      const concealedDisplay = this.createCompartmentDisplay(
        compartment.id,
        compartment.name,
        compartment.maxSpace,
        compartment.currentSpace,
        compartment.contents || [],
        true,
        yOffset,
        compartment,
      )
      this.shipCargoContainer.add(concealedDisplay)
      this.cargoCompartments.push(concealedDisplay)
      yOffset += 140
    })
  }

  private refreshGoodsDisplayAfterPurchase() {
    // Update goods display stock counts
    this.tradeGoodSlots.forEach((slot) => {
      const good = slot.getData('good') as TradeGood
      const statsText = slot.getByName('stats') as Phaser.GameObjects.Text
      if (statsText) {
        statsText.setText(
          `Price: ${good.basePrice}¢  Size: ${good.spacePerUnit}u  Stock: ${good.available}`,
        )
      } else {
        // Find the stats text (last text object in container)
        const texts = slot.getAll().filter(obj => obj instanceof Phaser.GameObjects.Text)
        const lastText = texts[texts.length - 1] as Phaser.GameObjects.Text
        if (lastText) {
          lastText.setText(
            `Price: ${good.basePrice}¢  Size: ${good.spacePerUnit}u  Stock: ${good.available}`,
          )
        }
      }
    })
  }

  private showMessage(text: string, color: string) {
    const { width, height } = this.scale
    const message = this.add
      .text(width / 2, height / 2, text, {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: color,
        backgroundColor: '#000000',
        padding: { x: 30, y: 15 },
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
      .setDepth(2000)

    this.tweens.add({
      targets: message,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 1500,
      onComplete: () => {
        message.destroy()
      },
    })
  }

  private returnToSystemVisit() {
    // Return to system visit scene
    this.scene.stop()
    this.scene.start(sceneRegistry.SYSTEM_VISIT_SCENE, this.systemData)
  }
}