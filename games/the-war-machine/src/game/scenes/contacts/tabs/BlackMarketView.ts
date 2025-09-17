import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import { FilterSortManager, type SortConfig } from '../../../components/FilterSortManager.ts'
import { StockListDisplay, type StockListItem } from '../../../components/StockListDisplay.ts'
import type { ArmsId } from '../../../model/definitions/armsDefinitions.ts'
import { ArmsStockModel } from '../../../model/entities/ArmsStockModel.ts'
import type { WarehouseModel } from '../../../model/entities/locations/WarehouseModel.ts'
import type { WorldModel } from '../../../model/entities/WorldModel.ts'
import type { ArmsBranch } from '../../../model/enums/ArmsBranches.ts'
import { ArmsCondition, ArmsGrade } from '../../../model/enums/ArmsStockEnums.ts'
import { CountryCities } from '../../../model/enums/Cities.ts'
import { type Country, CountryNames } from '../../../model/enums/Countries.ts'
import { armsRegistry } from '../../../registries/armsRegistry.ts'
import { Colors, Typography } from '../../../registries/styleRegistry.ts'

export enum BlackMarketSortBy {
  NAME = 'name',
  PRICE = 'price',
  QUANTITY = 'quantity',
  CONDITION = 'condition',
  LOCATION = 'location',
}

export interface BlackMarketOffer extends StockListItem {
  id: string
  armsId: ArmsId
  // quantity and condition are inherited from StockListItem
  price: number // Total price for the quantity
  country: Country
  city: string
}

export class BlackMarketView extends Phaser.GameObjects.Container {
  private worldModel: WorldModel
  private offers: BlackMarketOffer[] = []
  private displayedOffers: BlackMarketOffer[] = []
  private selectedOfferId?: string
  private warehouseSelectionOverlay?: Phaser.GameObjects.Container
  private filterSortManager?: FilterSortManager<BlackMarketSortBy>
  private stockListDisplay?: StockListDisplay<BlackMarketOffer>
  private titleText?: Phaser.GameObjects.Text

  constructor(scene: PotatoScene, worldModel: WorldModel) {
    super(scene, 0, 0)
    this.worldModel = worldModel

    this.generateMarketOffers()
    this.displayedOffers = [...this.offers]
    this.createView()
  }

  private generateMarketOffers() {
    // Generate 10 random black market offers
    const numOffers = 10
    const allArmsDefinitions = armsRegistry.getAllDefinitions()

    // Filter arms by black market eligible grades (obsolete, legacy, or modern with poor condition)
    const blackMarketArms = allArmsDefinitions.filter((armsDef) => {
      return (
        armsDef.grade === ArmsGrade.OBSOLETE ||
        armsDef.grade === ArmsGrade.LEGACY ||
        armsDef.grade === ArmsGrade.MODERN
      )
    })

    const allCountries = Object.keys(CountryCities) as Country[]

    for (let i = 0; i < numOffers; i++) {
      // Random arms from black market eligible list
      const armsDef = blackMarketArms[Math.floor(Math.random() * blackMarketArms.length)]

      // Random country with cities
      let country: Country
      let cities: any[]
      do {
        country = allCountries[Math.floor(Math.random() * allCountries.length)]
        cities = CountryCities[country] || []
      } while (cities.length === 0)

      const city = cities[Math.floor(Math.random() * cities.length)]

      // Determine condition based on grade
      let condition: ArmsCondition
      if (armsDef.grade === ArmsGrade.OBSOLETE) {
        // Obsolete: mostly poor to fair condition
        const obsoleteConditions = [
          ArmsCondition.SALVAGE,
          ArmsCondition.SALVAGE,
          ArmsCondition.POOR,
          ArmsCondition.POOR,
          ArmsCondition.POOR,
          ArmsCondition.FAIR,
          ArmsCondition.FAIR,
          ArmsCondition.GOOD,
        ]
        condition = obsoleteConditions[Math.floor(Math.random() * obsoleteConditions.length)]
      } else if (armsDef.grade === ArmsGrade.LEGACY) {
        // Legacy: poor to good condition
        const legacyConditions = [
          ArmsCondition.POOR,
          ArmsCondition.POOR,
          ArmsCondition.FAIR,
          ArmsCondition.FAIR,
          ArmsCondition.FAIR,
          ArmsCondition.GOOD,
          ArmsCondition.GOOD,
          ArmsCondition.EXCELLENT,
        ]
        condition = legacyConditions[Math.floor(Math.random() * legacyConditions.length)]
      } else {
        // Modern: only fair or below on black market
        const modernConditions = [
          ArmsCondition.SALVAGE,
          ArmsCondition.POOR,
          ArmsCondition.POOR,
          ArmsCondition.FAIR,
          ArmsCondition.FAIR,
          ArmsCondition.FAIR,
        ]
        condition = modernConditions[Math.floor(Math.random() * modernConditions.length)]
      }

      // Random quantity (1-100)
      const quantity = Math.floor(Math.random() * 100) + 1

      // Calculate price based on base price, condition, and some randomness
      const conditionMultiplier = {
        [ArmsCondition.NEW]: 1.2,
        [ArmsCondition.EXCELLENT]: 1.0,
        [ArmsCondition.GOOD]: 0.8,
        [ArmsCondition.FAIR]: 0.6,
        [ArmsCondition.POOR]: 0.4,
        [ArmsCondition.SALVAGE]: 0.2,
      }

      const basePrice = armsDef.basePrice * quantity * (conditionMultiplier[condition] || 0.5)
      // Add 10-30% markup for black market
      const price = Math.floor(basePrice * (1.1 + Math.random() * 0.2))

      this.offers.push({
        id: `offer-${i}`,
        armsId: armsDef.id,
        quantity,
        condition,
        price,
        country,
        city: city.name,
      })
    }

    // Sort by price
    this.offers.sort((a, b) => a.price - b.price)
  }

  private createView() {
    this.titleText = this.scene.add.text(0, -230, `Black Market Offers (${this.offers.length})`, {
      fontSize: Typography.fontSize.h3,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    this.titleText.setOrigin(0.5)
    this.add(this.titleText)

    // Create filter and sort manager
    this.createFilterSortManager()

    // Apply initial filters and sorting
    this.applyFiltersAndSort()
  }

  private createFilterSortManager() {
    // Collect actual branches, conditions, and grades from offers
    const availableBranches = new Set<ArmsBranch>()
    const availableConditions = new Set<ArmsCondition>()
    const availableGrades = new Set<ArmsGrade>()

    this.offers.forEach((offer) => {
      const armsDef = armsRegistry.getDefinition(offer.armsId)
      if (armsDef) {
        availableBranches.add(armsDef.branch)
        if (armsDef.grade) {
          availableGrades.add(armsDef.grade)
        }
      }
      availableConditions.add(offer.condition)
    })

    // Define sort configurations
    const sortConfigs: SortConfig<BlackMarketSortBy>[] = [
      {
        key: BlackMarketSortBy.PRICE,
        label: 'Price',
        compareFunction: (a: BlackMarketOffer, b: BlackMarketOffer) => a.price - b.price,
      },
      {
        key: BlackMarketSortBy.NAME,
        label: 'Name',
        compareFunction: (a: BlackMarketOffer, b: BlackMarketOffer) => {
          const aName = armsRegistry.getDefinition(a.armsId)?.name || ''
          const bName = armsRegistry.getDefinition(b.armsId)?.name || ''
          return aName.localeCompare(bName)
        },
      },
      {
        key: BlackMarketSortBy.QUANTITY,
        label: 'Qty',
        compareFunction: (a: BlackMarketOffer, b: BlackMarketOffer) => a.quantity - b.quantity,
      },
      {
        key: BlackMarketSortBy.CONDITION,
        label: 'Cond',
        compareFunction: (a: BlackMarketOffer, b: BlackMarketOffer) => {
          const conditions = Object.values(ArmsCondition)
          return conditions.indexOf(a.condition) - conditions.indexOf(b.condition)
        },
      },
      {
        key: BlackMarketSortBy.LOCATION,
        label: 'Location',
        compareFunction: (a: BlackMarketOffer, b: BlackMarketOffer) => {
          return `${a.city}, ${a.country}`.localeCompare(`${b.city}, ${b.country}`)
        },
      },
    ]

    // Sort conditions in quality order (best to worst)
    const conditionOrder = [
      ArmsCondition.NEW,
      ArmsCondition.GOOD,
      ArmsCondition.FAIR,
      ArmsCondition.POOR,
      ArmsCondition.SALVAGE,
    ]
    const sortedConditions = Array.from(availableConditions).sort(
      (a, b) => conditionOrder.indexOf(a) - conditionOrder.indexOf(b),
    )

    // Sort grades in quality order (obsolete to experimental)
    const gradeOrder = [
      ArmsGrade.OBSOLETE,
      ArmsGrade.LEGACY,
      ArmsGrade.MODERN,
      ArmsGrade.NEXTGEN,
      ArmsGrade.EXPERIMENTAL,
    ]
    const sortedGrades = Array.from(availableGrades).sort(
      (a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b),
    )

    // Create filter sort manager with actual available options
    this.filterSortManager = new FilterSortManager(
      this.scene as PotatoScene,
      0,
      -180,
      {
        branches: Array.from(availableBranches).sort(),
        conditions: sortedConditions,
        grades: sortedGrades,
      },
      sortConfigs,
      {
        onFiltersChanged: () => this.applyFiltersAndSort(),
        onSortChanged: () => this.applyFiltersAndSort(),
      },
    )

    this.add(this.filterSortManager)
  }

  private displayOffers() {
    // Remove old stock list display if exists
    if (this.stockListDisplay) {
      this.stockListDisplay.destroy()
      this.stockListDisplay = undefined
    }

    // Create new stock list display
    const scene = this.scene as PotatoScene
    this.stockListDisplay = new StockListDisplay<BlackMarketOffer>(
      scene,
      -650,
      20, // Moved even lower to give more space after filters
      {
        width: 1300,
        height: 40,
        spacing: 5,
        showQuantity: true,
        showCondition: true,
        showValue: false, // We'll use custom column for price
        showProfit: false, // No profit/loss for black market
        showActions: true,
        actions: [
          {
            label: 'BUY',
            onClick: (offer) => this.handleBuyClick(offer),
            color: Colors.status.success,
            hoverColor: Colors.status.successHover,
          },
        ],
        columns: [
          {
            key: 'price',
            label: 'Price',
            x: 750,
            getValue: (offer) => `$${offer.price.toLocaleString()}`,
            getColor: () => Colors.money.neutral,
            fontSize: Typography.fontSize.regular,
          },
          {
            key: 'location',
            label: 'Location',
            x: 750,
            getValue: (offer) => {
              const countryName = CountryNames[offer.country] || offer.country
              return `${offer.city}, ${countryName}`
            },
            getColor: () => Colors.text.muted,
            fontSize: Typography.fontSize.small,
          },
        ],
        getItemName: (offer) => {
          const armsDef = armsRegistry.getDefinition(offer.armsId)
          return armsDef?.name || 'Unknown'
        },
        getItemBranch: (offer) => {
          const armsDef = armsRegistry.getDefinition(offer.armsId)
          return armsDef?.branch || ''
        },
      },
      {
        onItemClick: (offer) => this.selectOffer(offer.id),
      },
    )

    // Set items (show max 10)
    this.stockListDisplay.setItems(this.displayedOffers, 10)
    this.add(this.stockListDisplay)
  }

  private applyFiltersAndSort() {
    if (!this.filterSortManager) return

    // Define filter functions
    const filterFunctions = new Map<
      string,
      (offer: BlackMarketOffer, filterValue: any) => boolean
    >()

    filterFunctions.set('branch_filter', (offer, branch: ArmsBranch) => {
      const armsDef = armsRegistry.getDefinition(offer.armsId)
      return armsDef ? armsDef.branch === branch : false
    })

    filterFunctions.set('condition_filter', (offer, condition: ArmsCondition) => {
      return offer.condition === condition
    })

    filterFunctions.set('grade_filter', (offer, grade: ArmsGrade) => {
      const armsDef = armsRegistry.getDefinition(offer.armsId)
      return armsDef ? armsDef.grade === grade : false
    })

    // Apply filters
    this.displayedOffers = this.filterSortManager.applyFilters(this.offers, filterFunctions)

    // Apply sorting
    this.displayedOffers = this.filterSortManager.applySort(this.displayedOffers)

    // Update info text

    // Redisplay offers
    this.displayOffers()
  }

  private selectOffer(offerId: string) {
    this.selectedOfferId = offerId
    // Visual selection is now handled by StockListDisplay's hover effects
  }

  private handleBuyClick(offer: BlackMarketOffer) {
    // Get warehouses with enough space
    const warehouses = this.worldModel.playerLocations.filter(
      (loc) => loc.type === 'warehouse',
    ) as WarehouseModel[]

    const availableWarehouses = warehouses.filter((w) => w.getAvailableStorage() >= offer.quantity)

    if (availableWarehouses.length === 0) {
      // Show no space message
      this.showMessage('No warehouse has enough space for this purchase!', Colors.status.dangerText)
      return
    }

    // Show warehouse selection overlay
    this.showWarehouseSelection(offer, availableWarehouses)
  }

  private showWarehouseSelection(offer: BlackMarketOffer, warehouses: WarehouseModel[]) {
    // Create overlay
    this.warehouseSelectionOverlay = this.scene.add.container(0, 0)

    // Semi-transparent background
    const overlay = this.scene.add.rectangle(0, 0, 1400, 500, 0x000000, 0.7)
    overlay.setInteractive() // Block clicks
    this.warehouseSelectionOverlay.add(overlay)

    // Modal
    const modal = this.scene.add.container(0, 0)

    const modalBg = this.scene.add.rectangle(0, 0, 800, 400, Colors.background.primary)
    modalBg.setStrokeStyle(3, Colors.ui.border)
    modal.add(modalBg)

    // Title
    const title = this.scene.add.text(0, -150, 'Select Warehouse for Delivery', {
      fontSize: Typography.fontSize.h4,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    title.setOrigin(0.5)
    modal.add(title)

    // List warehouses
    warehouses.forEach((warehouse, index) => {
      const y = -80 + index * 60

      const warehouseBtn = this.scene.add.container(0, y)

      const btnBg = this.scene.add.rectangle(0, 0, 700, 50, Colors.background.card)
      btnBg.setStrokeStyle(2, Colors.ui.divider)
      btnBg.setInteractive()
      warehouseBtn.add(btnBg)

      const locationText = this.scene.add.text(
        -330,
        0,
        `${warehouse.city}, ${CountryNames[warehouse.country] || warehouse.country}`,
        {
          fontSize: Typography.fontSize.regular,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.text.primary,
        },
      )
      locationText.setOrigin(0, 0.5)
      warehouseBtn.add(locationText)

      const spaceText = this.scene.add.text(
        200,
        0,
        `Space: ${warehouse.getAvailableStorage()}/${warehouse.maxStorage}`,
        {
          fontSize: Typography.fontSize.small,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.text.secondary,
        },
      )
      spaceText.setOrigin(0, 0.5)
      warehouseBtn.add(spaceText)

      btnBg.on('pointerover', () => btnBg.setFillStyle(Colors.background.cardHover))
      btnBg.on('pointerout', () => btnBg.setFillStyle(Colors.background.card))
      btnBg.on('pointerdown', () => {
        this.completePurchase(offer, warehouse)
      })

      modal.add(warehouseBtn)
    })

    // Cancel button
    const cancelBtn = this.scene.add.container(0, 150)

    const cancelBg = this.scene.add.rectangle(0, 0, 150, 40, Colors.background.cardHover)
    cancelBg.setInteractive()
    cancelBtn.add(cancelBg)

    const cancelText = this.scene.add.text(0, 0, 'CANCEL', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    cancelText.setOrigin(0.5)
    cancelBtn.add(cancelText)

    cancelBg.on('pointerover', () => cancelBg.setFillStyle(Colors.background.card))
    cancelBg.on('pointerout', () => cancelBg.setFillStyle(Colors.background.cardHover))
    cancelBg.on('pointerdown', () => {
      this.warehouseSelectionOverlay?.destroy()
      this.warehouseSelectionOverlay = undefined
    })

    modal.add(cancelBtn)

    this.warehouseSelectionOverlay.add(modal)
    this.add(this.warehouseSelectionOverlay)
  }

  private completePurchase(offer: BlackMarketOffer, warehouse: WarehouseModel) {
    // Create the stock item
    const stock = new ArmsStockModel({
      armsId: offer.armsId,
      quantity: offer.quantity,
      purchasePrice: offer.price / offer.quantity, // Price per unit
      condition: offer.condition,
      acquiredFrom: `Black Market - ${offer.city}`,
    })

    // Add to warehouse
    const success = warehouse.addArmsStock(stock)

    if (success) {
      // Deduct money
      this.worldModel.deductMoney(offer.price)

      // Remove the offer
      const index = this.offers.findIndex((o) => o.id === offer.id)
      if (index !== -1) {
        this.offers.splice(index, 1)
        // Update the stock list display
        this.displayedOffers = [...this.offers]
        this.applyFiltersAndSort()
      }

      // Money display auto-updates via StatusBar event listener

      this.showMessage('Purchase successful!', Colors.status.successText)
    } else {
      this.showMessage('Failed to add to warehouse!', Colors.status.dangerText)
    }

    // Close overlay
    this.warehouseSelectionOverlay?.destroy()
    this.warehouseSelectionOverlay = undefined
  }

  private showMessage(message: string, color: string) {
    const messageText = this.scene.add.text(0, -50, message, {
      fontSize: Typography.fontSize.h5,
      fontFamily: Typography.fontFamily.primary,
      color: color,
      fontStyle: Typography.fontStyle.bold,
    })
    messageText.setOrigin(0.5)
    this.add(messageText)

    // Fade out and destroy
    this.scene.tweens.add({
      targets: messageText,
      alpha: 0,
      y: -100,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => messageText.destroy(),
    })
  }

  private getConditionColor(condition: ArmsCondition): string {
    switch (condition) {
      case ArmsCondition.NEW:
        return Colors.status.successText
      case ArmsCondition.EXCELLENT:
        return '#88ff00'
      case ArmsCondition.GOOD:
        return Colors.money.neutral
      case ArmsCondition.FAIR:
        return Colors.status.warningText
      case ArmsCondition.POOR:
        return '#ff8800'
      case ArmsCondition.SALVAGE:
        return Colors.status.dangerText
      default:
        return Colors.text.secondary
    }
  }
}
