import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import type { WorldModel } from '../../../model/entities/WorldModel.ts'
import type { Country } from '../../../model/enums/Countries.ts'
import { ArmsStockModel } from '../../../model/entities/ArmsStockModel.ts'
import { ArmsCondition, ArmsGrade } from '../../../model/enums/ArmsStockEnums.ts'
import type { ArmsId } from '../../../model/definitions/armsDefinitions.ts'
import { armsRegistry } from '../../../registries/armsRegistry.ts'
import { WarehouseModel } from '../../../model/entities/locations/WarehouseModel.ts'
import { ArmsBranch } from '../../../model/enums/ArmsBranches.ts'
import { FilterSortManager, type SortConfig } from '../../../utils/FilterSortManager.ts'
import {
  Colors,
  Typography,
  Borders,
  Spacing,
  Dimensions,
} from '../../../registries/styleRegistry.ts'
import { CountryCities } from '../../../model/enums/Cities.ts'

export enum BlackMarketSortBy {
  NAME = 'name',
  PRICE = 'price',
  QUANTITY = 'quantity',
  CONDITION = 'condition',
  LOCATION = 'location',
}

export interface BlackMarketOffer {
  id: string
  armsId: ArmsId
  quantity: number
  condition: ArmsCondition
  price: number  // Total price for the quantity
  country: Country
  city: string
}

export class BlackMarketView extends Phaser.GameObjects.Container {
  private worldModel: WorldModel
  private offers: BlackMarketOffer[] = []
  private displayedOffers: BlackMarketOffer[] = []
  private offerContainers: Phaser.GameObjects.Container[] = []
  private selectedOfferId?: string
  private offerBackgrounds: Map<string, Phaser.GameObjects.Rectangle> = new Map()
  private warehouseSelectionOverlay?: Phaser.GameObjects.Container
  private filterSortManager?: FilterSortManager<BlackMarketSortBy>
  private titleText?: Phaser.GameObjects.Text
  private infoText?: Phaser.GameObjects.Text

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
    const blackMarketArms = allArmsDefinitions.filter(armsDef => {
      return armsDef.grade === ArmsGrade.OBSOLETE ||
             armsDef.grade === ArmsGrade.LEGACY ||
             armsDef.grade === ArmsGrade.MODERN
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
          ArmsCondition.SALVAGE, ArmsCondition.SALVAGE,
          ArmsCondition.POOR, ArmsCondition.POOR, ArmsCondition.POOR,
          ArmsCondition.FAIR, ArmsCondition.FAIR,
          ArmsCondition.GOOD
        ]
        condition = obsoleteConditions[Math.floor(Math.random() * obsoleteConditions.length)]
      } else if (armsDef.grade === ArmsGrade.LEGACY) {
        // Legacy: poor to good condition
        const legacyConditions = [
          ArmsCondition.POOR, ArmsCondition.POOR,
          ArmsCondition.FAIR, ArmsCondition.FAIR, ArmsCondition.FAIR,
          ArmsCondition.GOOD, ArmsCondition.GOOD,
          ArmsCondition.EXCELLENT
        ]
        condition = legacyConditions[Math.floor(Math.random() * legacyConditions.length)]
      } else {
        // Modern: only fair or below on black market
        const modernConditions = [
          ArmsCondition.SALVAGE,
          ArmsCondition.POOR, ArmsCondition.POOR,
          ArmsCondition.FAIR, ArmsCondition.FAIR, ArmsCondition.FAIR
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
    // Define sort configurations
    const sortConfigs: SortConfig<BlackMarketSortBy>[] = [
      {
        key: BlackMarketSortBy.PRICE,
        label: 'Price',
        compareFunction: (a: BlackMarketOffer, b: BlackMarketOffer) => a.price - b.price
      },
      {
        key: BlackMarketSortBy.NAME,
        label: 'Name',
        compareFunction: (a: BlackMarketOffer, b: BlackMarketOffer) => {
          const aName = armsRegistry.getDefinition(a.armsId)?.name || ''
          const bName = armsRegistry.getDefinition(b.armsId)?.name || ''
          return aName.localeCompare(bName)
        }
      },
      {
        key: BlackMarketSortBy.QUANTITY,
        label: 'Qty',
        compareFunction: (a: BlackMarketOffer, b: BlackMarketOffer) => a.quantity - b.quantity
      },
      {
        key: BlackMarketSortBy.CONDITION,
        label: 'Cond',
        compareFunction: (a: BlackMarketOffer, b: BlackMarketOffer) => {
          const conditions = Object.values(ArmsCondition)
          return conditions.indexOf(a.condition) - conditions.indexOf(b.condition)
        }
      },
      {
        key: BlackMarketSortBy.LOCATION,
        label: 'Location',
        compareFunction: (a: BlackMarketOffer, b: BlackMarketOffer) => {
          return `${a.city}, ${a.country}`.localeCompare(`${b.city}, ${b.country}`)
        }
      },
    ]

    // Create filter sort manager
    this.filterSortManager = new FilterSortManager(
      this.scene as PotatoScene,
      0,
      -180,
      {
        branches: [ArmsBranch.MISSILES, ArmsBranch.SMALL_ARMS, ArmsBranch.ARMORED_VEHICLES],
        conditions: [ArmsCondition.GOOD, ArmsCondition.FAIR, ArmsCondition.POOR],
        grades: [ArmsGrade.OBSOLETE, ArmsGrade.LEGACY, ArmsGrade.MODERN],
      },
      sortConfigs,
      {
        onFiltersChanged: () => this.applyFiltersAndSort(),
        onSortChanged: () => this.applyFiltersAndSort(),
      }
    )

    this.add(this.filterSortManager)
  }

  private displayOffers() {
    // Clear existing offer containers
    this.offerContainers.forEach(container => container.destroy())
    this.offerContainers = []
    this.offerBackgrounds.clear()

    // Create offer listings (limit to 10 visible offers to prevent overflow)
    const visibleOffers = this.displayedOffers.slice(0, 10)
    visibleOffers.forEach((offer, index) => {
      const y = -90 + index * 45  // Compact spacing, adjusted for filters

      const offerContainer = this.scene.add.container(-650, y)

      // Background
      const bg = this.scene.add.rectangle(
        350,
        20,
        1300,
        40,
        Colors.background.card,
      )
      bg.setStrokeStyle(Borders.width.thin, Colors.ui.divider)
      bg.setInteractive()
      offerContainer.add(bg)

      // Store background reference
      this.offerBackgrounds.set(offer.id, bg)

      // Get arms definition
      const armsDef = armsRegistry.getDefinition(offer.armsId)
      if (!armsDef) return

      // Item name
      const nameText = this.scene.add.text(10, 10, armsDef.name, {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.primary,
        fontStyle: Typography.fontStyle.bold,
      })
      offerContainer.add(nameText)

      // Quantity
      const qtyText = this.scene.add.text(250, 10, `Qty: ${offer.quantity}`, {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.secondary,
      })
      offerContainer.add(qtyText)

      // Condition
      const conditionColor = this.getConditionColor(offer.condition)
      const conditionText = this.scene.add.text(350, 10, offer.condition, {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: conditionColor,
      })
      offerContainer.add(conditionText)

      // Location
      const locationText = this.scene.add.text(500, 10, `${offer.city}, ${offer.country}`, {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.muted,
      })
      offerContainer.add(locationText)

      // Price
      const priceText = this.scene.add.text(800, 10, `$${offer.price.toLocaleString()}`, {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.money.neutral,
      })
      offerContainer.add(priceText)

      // Buy button
      const canAfford = this.worldModel.gameStatus.money >= offer.price
      const buyButton = this.scene.add.container(1000, 10)

      const buyBg = this.scene.add.rectangle(
        0,
        0,
        80,
        30,
        canAfford ? Colors.status.success : Colors.background.cardHover,
      )
      buyBg.setInteractive()
      buyButton.add(buyBg)

      const buyText = this.scene.add.text(0, 0, 'BUY', {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: canAfford ? Colors.text.primary : Colors.text.disabled,
        fontStyle: Typography.fontStyle.bold,
      })
      buyText.setOrigin(0.5)
      buyButton.add(buyText)

      if (canAfford) {
        buyBg.on('pointerover', () => buyBg.setFillStyle(Colors.status.successHover))
        buyBg.on('pointerout', () => buyBg.setFillStyle(Colors.status.success))
        buyBg.on('pointerdown', () => {
          this.handleBuyClick(offer)
        })
      }

      offerContainer.add(buyButton)

      bg.on('pointerover', () => {
        if (this.selectedOfferId !== offer.id) {
          bg.setFillStyle(Colors.background.cardHover)
        }
      })

      bg.on('pointerout', () => {
        if (this.selectedOfferId !== offer.id) {
          bg.setFillStyle(Colors.background.card)
        }
      })

      bg.on('pointerdown', () => {
        this.selectOffer(offer.id)
      })

      this.add(offerContainer)
      this.offerContainers.push(offerContainer)
    })

    // Info text at bottom
    this.infoText = this.scene.add.text(0, 200, `Showing ${this.displayedOffers.length}/${this.offers.length} offers | Refresh monthly`, {
      fontSize: Typography.fontSize.caption,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.muted,
      fontStyle: Typography.fontStyle.italic,
    })
    this.infoText.setOrigin(0.5)
    this.add(this.infoText)
  }

  private applyFiltersAndSort() {
    if (!this.filterSortManager) return

    // Define filter functions
    const filterFunctions = new Map<string, (offer: BlackMarketOffer, filterValue: any) => boolean>()

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
    if (this.infoText) {
      this.infoText.setText(`Showing ${this.displayedOffers.length}/${this.offers.length} offers | Refresh monthly`)
    }

    // Redisplay offers
    this.displayOffers()
  }

  private selectOffer(offerId: string) {
    this.selectedOfferId = offerId

    // Update visual selection
    this.offerBackgrounds.forEach((bg, id) => {
      if (id === offerId) {
        bg.setFillStyle(Colors.primary.main, 0.2)
        bg.setStrokeStyle(Borders.width.normal, Colors.primary.light)
      } else {
        bg.setFillStyle(Colors.background.card)
        bg.setStrokeStyle(Borders.width.thin, Colors.ui.divider)
      }
    })
  }

  private handleBuyClick(offer: BlackMarketOffer) {
    // Get warehouses with enough space
    const warehouses = this.worldModel.playerLocations.filter(
      loc => loc.type === 'warehouse'
    ) as WarehouseModel[]

    const availableWarehouses = warehouses.filter(
      w => w.getAvailableStorage() >= offer.quantity
    )

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
        `${warehouse.city}, ${warehouse.country}`,
        {
          fontSize: Typography.fontSize.regular,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.text.primary,
        }
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
        }
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
      const index = this.offers.findIndex(o => o.id === offer.id)
      if (index !== -1) {
        this.offers.splice(index, 1)
        // Remove the visual container
        const container = this.offerContainers[index]
        container.destroy()
        this.offerContainers.splice(index, 1)
      }

      // Update money display
      const moneyText = this.scene.children.getByName('moneyText') as Phaser.GameObjects.Text
      if (moneyText) {
        moneyText.setText(`$${this.worldModel.gameStatus.money.toLocaleString()}`)
      }

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