import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'
import { SelectionCard } from '../../../components/SelectionCard.ts'
import type { WarehouseOption, WorldModel } from '../../../model/entities/WorldModel.ts'
import type { CityData } from '../../../model/enums/Cities.ts'
import { CountryCities } from '../../../model/enums/Cities.ts'
import type { Country } from '../../../model/enums/Countries.ts'
import { CountryNames } from '../../../model/enums/Countries.ts'
import type { EarthRegion } from '../../../model/enums/EarthRegions.ts'
import type { WarSystem } from '../../../model/WarSystem.ts'
import { DepthRegistry } from '../../../registries/depthRegistry.ts'
import {
  createCenteredContainer,
  createFullScreenOverlay,
  getScreenCenter,
  LayoutRegistry,
} from '../../../registries/layoutRegistry.ts'
import { Borders, Colors, Dimensions, Typography } from '../../../registries/styleRegistry.ts'
import { CityZoomView } from '../../board/molecules/map/CityZoomView.ts'
import { ContinentZoomView } from '../../board/molecules/map/ContinentZoomView.ts'
import { EarthMap } from '../../board/molecules/map/EarthMap.ts'

interface WarehouseSelectionCallbacks {
  onWarehouseSelected?: (warehouse: WarehouseOption) => void
  onCancel?: () => void
}

export class WarehouseSelectionOverlay extends GameObjects.Container {
  private worldModel: WorldModel
  private warSystem: WarSystem
  private callbacks: WarehouseSelectionCallbacks
  private overlay: GameObjects.Rectangle
  private contentContainer: GameObjects.Container

  // Sub-views
  private earthMap?: EarthMap
  private continentZoomView?: ContinentZoomView
  private cityZoomView?: CityZoomView
  private currentView?: 'map' | 'service' | 'options'
  private instructionText?: Phaser.GameObjects.Text
  private closeButton?: Phaser.GameObjects.Container

  // Selection state
  private selectedCity?: CityData
  private selectedCountry?: Country
  private selectedServiceTier?: 'basic' | 'advanced' | 'premium'
  private currentViewContainer?: GameObjects.Container

  constructor(
    scene: PotatoScene,
    worldModel: WorldModel,
    warSystem: WarSystem,
    callbacks: WarehouseSelectionCallbacks,
  ) {
    super(scene, 0, 0)
    this.worldModel = worldModel
    this.warSystem = warSystem
    this.callbacks = callbacks

    // Set high depth to be above everything
    this.setDepth(DepthRegistry.STOCK_INVENTORY)
    this.createOverlay()
    this.showMapSelection()

    scene.add.existing(this)
  }

  private createOverlay() {
    // Semi-transparent background that covers entire screen
    this.overlay = createFullScreenOverlay(this.scene, 0.7, 0)
    this.overlay.setVisible(false) // Start hidden, only show for non-map views
    this.add(this.overlay)

    // Content container - doesn't need specific position since map components have their own
    this.contentContainer = this.scene.add.container(0, 0)
    this.add(this.contentContainer)

    // Close button - needs to be at even higher depth than map
    const center = getScreenCenter(this.scene)
    this.closeButton = this.scene.add.container(center.width - 80, 100)
    this.closeButton.setDepth(DepthRegistry.STOCK_INVENTORY + 200) // Above everything
    const closeBg = this.scene.add.rectangle(
      0,
      0,
      Dimensions.button.small.height,
      Dimensions.button.small.height,
      Colors.status.danger,
    )
    closeBg.setInteractive()
    this.closeButton.add(closeBg)

    const closeText = this.scene.add.text(0, 0, '✕', {
      fontSize: Typography.fontSize.h3,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    closeText.setOrigin(0.5)
    this.closeButton.add(closeText)

    closeBg.on('pointerdown', () => this.close())
    closeBg.on('pointerover', () => closeBg.setFillStyle(Colors.status.danger, 0.8))
    closeBg.on('pointerout', () => closeBg.setFillStyle(Colors.status.danger))

    // Add close button directly to scene for proper depth
    this.scene.add.existing(this.closeButton)

    // Right-click to go back or close
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        // Stop propagation to prevent other handlers
        pointer.event.stopPropagation()
        this.handleRightClick()
        return false // Prevent further processing
      }
    }, this)
  }

  private showMapSelection() {
    this.clearCurrentView()
    this.currentView = 'map'

    // Hide overlay background for map selection
    this.overlay.setVisible(false)

    // Add instruction text at the top
    const center = getScreenCenter(this.scene)
    this.instructionText = this.scene.add.text(center.x, 100, 'Select a city for your warehouse', {
      fontSize: `${Typography.fontSize.h3}px`,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    this.instructionText.setOrigin(0.5)
    this.instructionText.setDepth(DepthRegistry.STOCK_INVENTORY + 150) // Above the map
    this.scene.add.existing(this.instructionText)

    // Create EarthMap at the same position as in BoardScene
    const { width, height } = this.scene.cameras.main
    this.earthMap = new EarthMap(
      this.scene as PotatoScene,
      width / 2,
      height / 2 + 100,
      this.worldModel,
      this.warSystem,
      undefined, // No toastContainer needed for selection
    )
    // Set high depth to ensure it's above the Assets scene background
    this.earthMap.setDepth(DepthRegistry.STOCK_INVENTORY + 100)

    // Listen for continent selection to show ContinentZoomView
    this.earthMap.on('region-selected', (region: EarthRegion) => {
      this.showContinentZoom(region)
    })

    // Don't add to container, add directly to scene for proper depth
    this.scene.add.existing(this.earthMap)
  }

  private showContinentZoom(continent: EarthRegion) {
    // Hide EarthMap
    if (this.earthMap) {
      this.earthMap.setVisible(false)
    }

    // Create ContinentZoomView in selection mode
    const { width, height } = this.scene.cameras.main
    this.continentZoomView = new ContinentZoomView(
      this.scene as PotatoScene,
      width / 2,
      height / 2 + 100,
      continent,
      this.worldModel,
      this.warSystem,
      true, // emitSelectionOnly mode
    )
    // Set high depth
    this.continentZoomView.setDepth(DepthRegistry.STOCK_INVENTORY + 100)

    // Listen for country selection
    this.continentZoomView.on('country-selected', (country: Country) => {
      this.showCityZoom(country)
    })

    // Listen for close event (right-click) to close the entire overlay
    this.continentZoomView.on('close', () => {
      // Clean up all map views before closing
      if (this.earthMap) {
        this.earthMap.destroy()
        this.earthMap = undefined
      }
      if (this.continentZoomView) {
        this.continentZoomView.destroy()
        this.continentZoomView = undefined
      }
      // Close the entire overlay to return to assets list
      this.close()
    })

    // Add directly to scene for proper depth
    this.scene.add.existing(this.continentZoomView)
  }

  private showCityZoom(country: Country) {
    this.selectedCountry = country

    // Hide ContinentZoomView
    if (this.continentZoomView) {
      this.continentZoomView.setVisible(false)
    }

    // Create CityZoomView
    const { width, height } = this.scene.cameras.main
    this.cityZoomView = new CityZoomView(
      this.scene as PotatoScene,
      width / 2,
      height / 2 + 100,
      country,
      this.worldModel,
      this.warSystem,
    )
    // Set high depth to ensure it's above everything
    this.cityZoomView.setDepth(DepthRegistry.STOCK_INVENTORY + 100)

    // Listen for city selection
    this.cityZoomView.on('city-selected', (data: { country: Country; city: string }) => {
      console.log('City selected event received:', data)
      // Find the city data
      const cities = CountryCities[this.selectedCountry!]
      console.log('Looking for city in:', this.selectedCountry, 'cities:', cities?.length)
      const city = cities?.find((c) => c.name === data.city)
      console.log('Found city:', city)
      if (city) {
        this.selectedCity = city
        console.log('Calling showServiceTierSelection')
        this.showServiceTierSelection()
      } else {
        console.error('City not found:', data.city)
      }
    })

    // Listen for close event to go back to continent view
    this.cityZoomView.on('close', () => {
      this.cityZoomView?.destroy()
      this.cityZoomView = undefined
      if (this.continentZoomView) {
        this.continentZoomView.setVisible(true)
      }
    })

    // Add directly to scene for proper depth
    this.scene.add.existing(this.cityZoomView)
  }

  private showServiceTierSelection() {
    if (!this.selectedCity || !this.selectedCountry) return

    // Check if we have a cached service for this location
    const cachedService = this.worldModel.getWarehouseService(
      this.selectedCountry,
      this.selectedCity.name
    )

    if (cachedService) {
      // Use cached service (free of charge)
      console.log(`Using cached ${cachedService.tier} service for ${this.selectedCity.name}, ${this.selectedCountry}`)
      this.selectedServiceTier = cachedService.tier
      // Clear current view to destroy any existing map views
      this.clearCurrentView()
      this.showWarehouseOptions()
      return
    }

    this.clearCurrentView()
    this.currentView = 'service'

    // Show overlay background for service tier selection
    this.overlay.setVisible(true)

    // Create container for service tier selection - centered on screen
    const container = createCenteredContainer(this.scene, 0)

    // Title
    const cityName = this.selectedCity.name
    const countryName = CountryNames[this.selectedCountry] || this.selectedCountry
    const title = this.scene.add.text(
      0,
      LayoutRegistry.selection.title.y,
      `Select Service Tier for ${cityName}, ${countryName}`,
      {
        fontSize: Typography.fontSize.h2,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.primary,
        fontStyle: Typography.fontStyle.bold,
      },
    )
    title.setOrigin(0.5)
    container.add(title)

    // Service tier options
    const playerMoney = this.worldModel.gameStatus.money

    // Display player's money
    const moneyText = this.scene.add.text(
      0,
      LayoutRegistry.selection.title.y + 40,
      `Available Funds: $${playerMoney.toLocaleString()}`,
      {
        fontSize: Typography.fontSize.h4,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.money.positive,
      },
    )
    moneyText.setOrigin(0.5)
    container.add(moneyText)

    const tiers = [
      {
        type: 'basic' as const,
        name: 'BASIC SERVICE',
        options: 3,
        color: Colors.status.warning,
        description: '3 warehouse options\nLimited selection\nBudget pricing',
        price: '$10,000',
        cost: 10000,
      },
      {
        type: 'advanced' as const,
        name: 'ADVANCED SERVICE',
        options: 6,
        color: Colors.primary.main,
        description: '6 warehouse options\nBetter selection\nImproved deals',
        price: '$25,000',
        cost: 25000,
      },
      {
        type: 'premium' as const,
        name: 'PREMIUM SERVICE',
        options: 10,
        color: Colors.status.success,
        description: '10 warehouse options\nBest selection\nExclusive locations',
        price: '$50,000',
        cost: 50000,
      },
    ]

    tiers.forEach((tier, index) => {
      const x = LayoutRegistry.selection.tierCards.getXPosition(index, tiers.length)
      const y = LayoutRegistry.selection.tierCards.y

      const canAfford = playerMoney >= tier.cost

      const card = new SelectionCard(
        this.scene as PotatoScene,
        x,
        y,
        {
          width: LayoutRegistry.selection.tierCards.width,
          height: LayoutRegistry.selection.tierCards.height,
          borderColor: canAfford ? tier.color : Colors.military.neutral,
          borderWidth: Borders.width.thick,
          hoverBorderColor: canAfford ? tier.color : Colors.military.neutral,
          backgroundColor: canAfford ? Colors.background.card : Colors.background.tertiary,
          backgroundAlpha: canAfford ? 1.0 : 0.5,
        },
        [
          {
            type: 'title',
            y: -100,
            text: tier.name,
            style: {
              fontSize: Typography.fontSize.h3,
              fontStyle: Typography.fontStyle.bold,
              color: canAfford ? Colors.text.primary : Colors.text.disabled,
            },
          },
          {
            type: 'subtitle',
            y: -20,
            text: tier.description,
            style: {
              align: 'center',
              color: canAfford ? Colors.text.secondary : Colors.text.disabled,
            },
          },
          {
            type: 'text',
            y: 80,
            text: tier.price,
            style: {
              fontSize: Typography.fontSize.h4,
              color: canAfford ? Colors.money.neutral : Colors.text.disabled,
              fontStyle: Typography.fontStyle.bold,
            },
          },
          {
            type: 'text',
            y: 110,
            text: canAfford ? '' : 'Insufficient Funds',
            style: {
              fontSize: Typography.fontSize.small,
              color: Colors.money.negative,
              fontStyle: Typography.fontStyle.italic,
            },
          },
        ],
        canAfford
          ? {
              onClick: () => {
                // Deduct the service fee
                if (this.worldModel.deductMoney(tier.cost)) {
                  this.selectedServiceTier = tier.type
                  // Generate and cache warehouse options
                  const options = this.generateWarehouseOptions(
                    this.selectedCity!,
                    this.selectedCountry!,
                    tier.type
                  )
                  this.worldModel.setWarehouseService(
                    this.selectedCountry!,
                    this.selectedCity!.name,
                    tier.type,
                    options
                  )
                  this.showWarehouseOptions()
                }
              },
            }
          : {}, // No callbacks if can't afford
      )

      container.add(card)
    })

    // Back button
    const backButton = this.scene.add.container(
      LayoutRegistry.selection.buttons.back.x,
      LayoutRegistry.selection.buttons.back.y,
    )
    const backBg = this.scene.add.rectangle(
      0,
      0,
      LayoutRegistry.selection.buttons.back.width,
      LayoutRegistry.selection.buttons.back.height,
      Colors.background.cardHover,
    )
    backBg.setInteractive()
    backButton.add(backBg)

    const backText = this.scene.add.text(0, 0, 'BACK', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    backText.setOrigin(0.5)
    backButton.add(backText)

    backBg.on('pointerdown', () => this.showCityView())
    backBg.on('pointerover', () => backBg.setFillStyle(Colors.background.card))
    backBg.on('pointerout', () => backBg.setFillStyle(Colors.background.cardHover))

    container.add(backButton)

    // Add container directly to scene, not to contentContainer
    this.scene.add.existing(container)
    container.setDepth(DepthRegistry.STOCK_INVENTORY + 300)

    // Store reference for cleanup
    this.currentViewContainer = container
  }

  private showWarehouseOptions() {
    if (!this.selectedCity || !this.selectedCountry || !this.selectedServiceTier) return

    console.log('showWarehouseOptions - clearing current view')
    this.clearCurrentView()
    this.currentView = 'options'

    // Don't show full overlay - we want to keep warehouse list visible
    this.overlay.setVisible(false)

    // Get options - either from cache or generate new ones
    let options: WarehouseOption[]
    const cachedService = this.worldModel.getWarehouseService(
      this.selectedCountry,
      this.selectedCity.name
    )

    if (cachedService) {
      // Use cached options but filter out already purchased ones
      console.log('Cached service purchased IDs:', Array.from(cachedService.purchasedIds))
      console.log('All warehouse option IDs:', cachedService.warehouseOptions.map(o => o.id))

      options = cachedService.warehouseOptions.filter(
        option => !cachedService.purchasedIds.has(option.id)
      )
      console.log(`Using cached options: ${options.length} remaining out of ${cachedService.warehouseOptions.length} total`)

      // If all options have been purchased, inform the user
      if (options.length === 0) {
        this.showAllOptionsPurchasedMessage()
        return
      }
    } else {
      // This shouldn't happen as we set the service when tier is selected
      options = this.generateWarehouseOptions(
        this.selectedCity,
        this.selectedCountry,
        this.selectedServiceTier,
      )
    }

    // Explicitly destroy all map views to ensure nothing remains visible
    // This is redundant with clearCurrentView but ensures cleanup
    if (this.earthMap) {
      this.scene.children.remove(this.earthMap)
      this.earthMap.destroy()
      this.earthMap = undefined
    }
    if (this.continentZoomView) {
      this.scene.children.remove(this.continentZoomView)
      this.continentZoomView.destroy()
      this.continentZoomView = undefined
    }
    if (this.cityZoomView) {
      this.scene.children.remove(this.cityZoomView)
      this.cityZoomView.destroy()
      this.cityZoomView = undefined
    }
    // Also clean up instruction text if it exists
    if (this.instructionText) {
      this.scene.children.remove(this.instructionText)
      this.instructionText.destroy()
      this.instructionText = undefined
    }

    // Create warehouse options display - positioned on the right side using registry
    const container = this.scene.add.container(
      LayoutRegistry.warehouse.rightSideSelection.containerX,
      LayoutRegistry.warehouse.rightSideSelection.containerY
    )

    // Add semi-transparent background just for the right side panel
    const rightPanelBg = this.scene.add.rectangle(
      0,
      0,
      LayoutRegistry.warehouse.rightSideSelection.frameWidth + 50,
      600,
      Colors.background.primary,
      0.95
    )
    container.add(rightPanelBg)

    // Location frame using registry values
    const frameWidth = LayoutRegistry.warehouse.rightSideSelection.frameWidth
    const frameHeight = LayoutRegistry.warehouse.rightSideSelection.frameHeight
    const locationFrame = this.scene.add.graphics()
    locationFrame.fillStyle(Colors.background.secondary, 1.0)
    locationFrame.fillRoundedRect(-frameWidth/2, -280, frameWidth, frameHeight, 10)
    locationFrame.lineStyle(2, Colors.ui.border, 1)
    locationFrame.strokeRoundedRect(-frameWidth/2, -280, frameWidth, frameHeight, 10)
    container.add(locationFrame)

    // Title
    const title = this.scene.add.text(
      0,
      -250,
      'Select Warehouse',
      {
        fontSize: Typography.fontSize.h2,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.primary,
        fontStyle: Typography.fontStyle.bold,
      },
    )
    title.setOrigin(0.5)
    container.add(title)

    // Location info in frame
    const locationText = this.scene.add.text(
      0,
      -220,
      `${this.selectedCity.name}, ${CountryNames[this.selectedCountry] || this.selectedCountry}`,
      {
        fontSize: Typography.fontSize.h3,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.secondary,
      },
    )
    locationText.setOrigin(0.5)
    container.add(locationText)

    // Create scrollable list of warehouse options using registry
    const listY = -150  // Adjusted for better positioning
    const itemHeight = LayoutRegistry.warehouse.rightSideSelection.itemHeight
    const itemWidth = LayoutRegistry.warehouse.rightSideSelection.itemWidth
    const maxVisibleItems = Math.min(options.length, LayoutRegistry.warehouse.rightSideSelection.maxVisibleItems)
    let scrollIndex = 0
    const maxScrollIndex = Math.max(0, options.length - maxVisibleItems)

    // Create a mask for scrolling
    const maskShape = this.scene.add.graphics()
    maskShape.fillStyle(Colors.ui.maskFill)
    const maskPadding = 10
    maskShape.fillRect(
      -itemWidth / 2,
      listY - maskPadding,
      itemWidth,
      maxVisibleItems * itemHeight + maskPadding * 2,
    )
    const mask = maskShape.createGeometryMask()
    container.add(maskShape)
    maskShape.setVisible(false)

    // Container for all option items
    const optionsContainer = this.scene.add.container(0, 0)
    optionsContainer.setMask(mask)
    container.add(optionsContainer)

    // Function to update visible options with item-based scrolling
    const updateVisibleOptions = () => {
      optionsContainer.removeAll(true)

      // Only render visible items
      const startIndex = scrollIndex
      const endIndex = Math.min(startIndex + maxVisibleItems, options.length)

      for (let i = startIndex; i < endIndex; i++) {
        const option = options[i]
        const displayIndex = i - startIndex // Position relative to visible area
        const y = listY + displayIndex * itemHeight

        const optionContainer = this.scene.add.container(0, y)

        // Option background - adjusted for right side
        const bg = this.scene.add.rectangle(
          0,
          0,
          itemWidth - 20,
          itemHeight - 10,
          Colors.background.card,
        )
        bg.setStrokeStyle(Borders.width.normal, Colors.ui.border)
        bg.setInteractive()
        optionContainer.add(bg)

        // Concealment stars - positioned on the left side of the card
        const concealmentText = this.scene.add.text(
          -(itemWidth / 2) + 20,  // Left edge with padding
          -25,
          `Concealment: ${'⭐'.repeat(option.concealment)}`,
          {
            fontSize: Typography.fontSize.regular,
            fontFamily: Typography.fontFamily.primary,
            color: Colors.text.primary,
          },
        )
        optionContainer.add(concealmentText)

        // Storage space - positioned on the left side of the card
        const storageText = this.scene.add.text(
          -(itemWidth / 2) + 20,  // Left edge with padding
          5,
          `Storage: ${option.storageSpace.toLocaleString()} units`,
          {
            fontSize: Typography.fontSize.regular,
            fontFamily: Typography.fontFamily.primary,
            color: Colors.text.secondary,
          },
        )
        optionContainer.add(storageText)

        // Buy option - positioned on the center-right of the card
        const buyButtonWidth = 180
        const buyButtonHeight = 70
        const buyContainer = this.scene.add.container(
          60,  // Center-right position
          0,
        )
        const buyBg = this.scene.add.rectangle(
          0,
          0,
          buyButtonWidth,
          buyButtonHeight,
          Colors.status.success,
          0.3,
        )
        buyBg.setInteractive()
        buyContainer.add(buyBg)

        const buyPrice = this.scene.add.text(0, -20, `BUY: $${option.buyPrice.toLocaleString()}`, {
          fontSize: Typography.fontSize.small,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.text.primary,
          fontStyle: Typography.fontStyle.bold,
        })
        buyPrice.setOrigin(0.5)
        buyContainer.add(buyPrice)

        // Show upkeep for owned property
        const buyUpkeep = this.scene.add.text(
          0,
          0,
          `Upkeep: $${option.upkeep.toLocaleString()}/mo`,
          {
            fontSize: Typography.fontSize.tiny,
            fontFamily: Typography.fontFamily.primary,
            color: Colors.money.neutral,
          },
        )
        buyUpkeep.setOrigin(0.5)
        buyContainer.add(buyUpkeep)

        const buyBreakeven = this.scene.add.text(
          0,
          18,
          `${Math.ceil(option.buyPrice / option.rentPrice)} mo break-even`,
          {
            fontSize: Typography.fontSize.tiny,
            fontFamily: Typography.fontFamily.primary,
            color: Colors.text.muted,
          },
        )
        buyBreakeven.setOrigin(0.5)
        buyContainer.add(buyBreakeven)

        buyBg.on('pointerover', () => buyBg.setFillStyle(Colors.status.success, 0.5))
        buyBg.on('pointerout', () => buyBg.setFillStyle(Colors.status.success, 0.3))
        buyBg.on('pointerdown', () => {
          const purchasedWarehouse = { ...option, purchased: true }
          this.callbacks.onWarehouseSelected?.(purchasedWarehouse)
          // Refresh the warehouse options instead of closing
          this.showWarehouseOptions()
        })

        optionContainer.add(buyContainer)

        // Rent option - positioned on the far right of the card
        const rentButtonWidth = 150
        const rentButtonHeight = 70
        const rentContainer = this.scene.add.container(
          240,  // Far right position
          0,
        )
        const rentBg = this.scene.add.rectangle(
          0,
          0,
          rentButtonWidth,
          rentButtonHeight,
          Colors.primary.main,
          0.3,
        )
        rentBg.setInteractive()
        rentContainer.add(rentBg)

        const rentPrice = this.scene.add.text(
          0,
          0,
          `RENT\n$${option.rentPrice.toLocaleString()}/mo`,
          {
            fontSize: Typography.fontSize.small,
            fontFamily: Typography.fontFamily.primary,
            color: Colors.text.primary,
            fontStyle: Typography.fontStyle.bold,
            align: 'center',
          },
        )
        rentPrice.setOrigin(0.5)
        rentContainer.add(rentPrice)

        rentBg.on('pointerover', () => rentBg.setFillStyle(Colors.primary.main, 0.5))
        rentBg.on('pointerout', () => rentBg.setFillStyle(Colors.primary.main, 0.3))
        rentBg.on('pointerdown', () => {
          const rentedWarehouse = { ...option, purchased: false }
          this.callbacks.onWarehouseSelected?.(rentedWarehouse)
          // Refresh the warehouse options instead of closing
          this.showWarehouseOptions()
        })

        optionContainer.add(rentContainer)

        // Hover effect for main background
        bg.on('pointerover', () => bg.setFillStyle(Colors.background.cardHover))
        bg.on('pointerout', () => bg.setFillStyle(Colors.background.card))

        optionsContainer.add(optionContainer)
      }
    }

    // Initial display
    updateVisibleOptions()

    // Add scrollbar if needed
    if (options.length > maxVisibleItems) {
      const scrollbarX = (itemWidth / 2) + 10  // Right edge of items
      const scrollbarTrackHeight = maxVisibleItems * itemHeight
      const scrollbarTrackTop = listY - maskPadding

      // Scrollbar background (track)
      const scrollbarBg = this.scene.add.rectangle(
        scrollbarX,
        scrollbarTrackTop + scrollbarTrackHeight / 2,
        Dimensions.scrollbar.width,
        scrollbarTrackHeight,
        Colors.ui.scrollbarBg,
        Dimensions.scrollbar.bgAlpha,
      )
      container.add(scrollbarBg)

      // Scrollbar thumb
      const scrollbarHeight = (maxVisibleItems / options.length) * scrollbarTrackHeight
      const scrollbar = this.scene.add.rectangle(
        scrollbarX,
        scrollbarTrackTop + scrollbarHeight / 2, // Start at top of track
        Dimensions.scrollbar.width,
        scrollbarHeight,
        Colors.ui.scrollbar,
        Dimensions.scrollbar.thumbAlpha,
      )
      container.add(scrollbar)

      // Mouse wheel scrolling - item-based like StockListDisplay
      this.scene.input.on(
        'wheel',
        (pointer: any, gameObjects: any[], deltaX: number, deltaY: number) => {
          // Scroll by 1 item at a time
          const scrollDirection = deltaY > 0 ? 1 : -1
          scrollIndex = Math.max(0, Math.min(maxScrollIndex, scrollIndex + scrollDirection))

          // Update scrollbar position based on item index
          const scrollPercent = maxScrollIndex > 0 ? scrollIndex / maxScrollIndex : 0
          const scrollbarRange = scrollbarTrackHeight - scrollbarHeight
          scrollbar.y = scrollbarTrackTop + scrollbarHeight / 2 + scrollPercent * scrollbarRange

          updateVisibleOptions()
        },
      )
    }

    // Back button
    const backButton = this.scene.add.container(
      LayoutRegistry.warehouse.backButton.x,
      LayoutRegistry.warehouse.backButton.y,
    )
    const backBg = this.scene.add.rectangle(
      0,
      0,
      Dimensions.button.default.width,
      Dimensions.button.default.height,
      Colors.background.cardHover,
    )
    backBg.setInteractive()
    backButton.add(backBg)

    const backText = this.scene.add.text(0, 0, 'BACK', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    backText.setOrigin(0.5)
    backButton.add(backText)

    // Check if we have a cached service - if so, go back to map selection instead
    const hasCachedService = this.worldModel.getWarehouseService(
      this.selectedCountry!,
      this.selectedCity!.name
    )

    backBg.on('pointerdown', () => {
      if (hasCachedService) {
        // If using cached service, go back to city view
        this.showCityView()
      } else {
        // If paid for service, go back to service tier selection
        this.showServiceTierSelection()
      }
    })
    backBg.on('pointerover', () => backBg.setFillStyle(Colors.background.card))
    backBg.on('pointerout', () => backBg.setFillStyle(Colors.background.cardHover))

    container.add(backButton)

    // Add container directly to scene, not to contentContainer
    this.scene.add.existing(container)
    container.setDepth(DepthRegistry.STOCK_INVENTORY + 300)

    // Store reference for cleanup
    this.currentViewContainer = container
  }

  private generateWarehouseOptions(
    city: CityData,
    country: Country,
    tier: 'basic' | 'advanced' | 'premium',
  ): WarehouseOption[] {
    const countryModel = this.worldModel.countries.get(country)
    if (!countryModel) return []

    const countryWealth = countryModel.wealth
    const cityWealth = this.calculateCityWealth(city, countryWealth)

    // Base price multiplier based on wealth
    const wealthMultiplier = 0.5 + countryWealth * 0.3 + cityWealth * 0.2

    // Number of options based on tier
    const numOptions = tier === 'basic' ? 3 : tier === 'advanced' ? 6 : 10

    // Generate options with varying quality
    const options: WarehouseOption[] = []
    for (let i = 0; i < numOptions; i++) {
      // Premium tier should have more variety - include some smaller options
      let qualityFactor: number
      if (tier === 'premium') {
        // Mix of high, medium, and low quality options
        if (i < 3) {
          // Top 3: High quality
          qualityFactor = 0.65 + Math.random() * 0.25
        } else if (i < 7) {
          // Middle 4: Medium quality
          qualityFactor = 0.35 + Math.random() * 0.35
        } else {
          // Bottom 3: Budget options
          qualityFactor = 0.15 + Math.random() * 0.25
        }
      } else if (tier === 'advanced') {
        // More mid-range options
        qualityFactor = 0.35 + Math.random() * 0.4
      } else {
        // Basic: Lower quality
        qualityFactor = 0.2 + Math.random() * 0.35
      }

      // Calculate warehouse attributes with more variation
      const concealmentBase = qualityFactor * 4.5 // Base 0-4.5 range
      const concealmentVariance = (Math.random() - 0.5) * 2 // -1 to +1 variance
      const concealment = Math.min(
        5,
        Math.max(1, Math.round(concealmentBase + concealmentVariance)),
      )

      // Storage space with more variation
      const storageBase = 500 + qualityFactor * 4500 // 500-5000 base range
      const storageVariance = (Math.random() - 0.5) * 2500 // -1250 to +1250 variance
      const storageSpace = Math.round(storageBase + storageVariance)

      // Calculate prices with more variation
      const basePrice = 20000 + concealment * 15000 + storageSpace * 8
      const priceVariance = 0.8 + Math.random() * 0.4 // 80% to 120% of base
      const buyPrice = Math.round(basePrice * wealthMultiplier * priceVariance)
      // Rent should be 8-12% of buy price per month for 8-12 month break-even
      const rentPercent = 0.08 + Math.random() * 0.04 // 8-12% per month
      const rentPrice = Math.round(buyPrice * rentPercent)
      const upkeep = Math.round(buyPrice * 0.003) // Upkeep is 0.3% of buy price per month

      options.push({
        id: `warehouse-${country}-${city.name}-${i}`,
        city: city.name,
        country,
        concealment,
        storageSpace,
        buyPrice,
        rentPrice,
        upkeep,
      })
    }

    // Sort by a combination of concealment and storage space
    return options.sort((a, b) => {
      const scoreA = a.concealment * 2 + a.storageSpace / 1000
      const scoreB = b.concealment * 2 + b.storageSpace / 1000
      return scoreB - scoreA
    })
  }

  private calculateCityWealth(city: CityData, countryWealth: number): number {
    // Capital cities are wealthier
    if (city.isCapital) {
      return Math.min(5, countryWealth + 1)
    }

    // Major cities (based on position) have varying wealth
    // Cities near center tend to be wealthier
    const distFromCenter = Math.abs(city.x - 5) + Math.abs(city.y - 5)
    const wealthModifier = distFromCenter < 4 ? 1 : distFromCenter < 6 ? 0 : -1

    return Math.min(5, Math.max(1, countryWealth + wealthModifier))
  }

  private clearCurrentView() {
    // Destroy map components that were added directly to scene
    if (this.earthMap) {
      this.scene.children.remove(this.earthMap)
      this.earthMap.destroy()
      this.earthMap = undefined
    }
    if (this.continentZoomView) {
      this.scene.children.remove(this.continentZoomView)
      this.continentZoomView.destroy()
      this.continentZoomView = undefined
    }
    if (this.cityZoomView) {
      this.scene.children.remove(this.cityZoomView)
      this.cityZoomView.destroy()
      this.cityZoomView = undefined
    }
    // Destroy instruction text if it exists
    if (this.instructionText) {
      this.scene.children.remove(this.instructionText)
      this.instructionText.destroy()
      this.instructionText = undefined
    }
    // Destroy current view container if it exists
    if (this.currentViewContainer) {
      this.scene.children.remove(this.currentViewContainer)
      this.currentViewContainer.destroy()
      this.currentViewContainer = undefined
    }
    // Clear any other content in the container
    this.contentContainer.removeAll(true)
  }

  private showCityView() {
    // Clear current view and recreate city view for the selected country
    if (!this.selectedCountry) return

    this.clearCurrentView()
    this.currentView = 'map'

    // Hide overlay for map navigation
    this.overlay.setVisible(false)

    // Recreate the city zoom view
    const { width, height } = getScreenCenter(this.scene)

    this.cityZoomView = new CityZoomView(
      this.scene as PotatoScene,
      width / 2,
      height / 2 + 100,
      this.selectedCountry,
      this.worldModel,
      this.warSystem,
    )
    this.cityZoomView.setDepth(DepthRegistry.STOCK_INVENTORY + 110)

    // Listen for city selection
    this.cityZoomView.on('city-selected', (data: any) => {
      const cities = CountryCities[this.selectedCountry!]
      const city = cities?.find((c) => c.name === data.city)
      if (city) {
        this.selectedCity = city
        // Clean up the city view before showing service tier
        if (this.cityZoomView) {
          this.cityZoomView.destroy()
          this.cityZoomView = undefined
        }
        this.showServiceTierSelection()
      }
    })

    // Listen for close event to go back to continent view
    this.cityZoomView.on('close', () => {
      // When closing from city view, close the entire overlay
      this.close()
    })

    // Add directly to scene for proper depth
    this.scene.add.existing(this.cityZoomView)
  }

  private showAllOptionsPurchasedMessage() {
    this.clearCurrentView()
    this.overlay.setVisible(true)

    const container = createCenteredContainer(this.scene, 0)

    // Message
    const message = this.scene.add.text(
      0,
      -50,
      'All warehouse options have been purchased!',
      {
        fontSize: Typography.fontSize.h3,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.primary,
        fontStyle: Typography.fontStyle.bold,
        align: 'center',
      },
    )
    message.setOrigin(0.5)
    container.add(message)

    const subMessage = this.scene.add.text(
      0,
      20,
      `You have already acquired all available warehouses\nin ${this.selectedCity?.name}, ${CountryNames[this.selectedCountry!] || this.selectedCountry}.`,
      {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.secondary,
        align: 'center',
      },
    )
    subMessage.setOrigin(0.5)
    container.add(subMessage)

    // OK button
    const okButton = this.scene.add.container(0, 100)
    const okBg = this.scene.add.rectangle(
      0,
      0,
      Dimensions.button.default.width,
      Dimensions.button.default.height,
      Colors.primary.main,
    )
    okBg.setInteractive()
    okButton.add(okBg)

    const okText = this.scene.add.text(0, 0, 'OK', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    okText.setOrigin(0.5)
    okButton.add(okText)

    okBg.on('pointerdown', () => this.showCityView())
    okBg.on('pointerover', () => okBg.setFillStyle(Colors.primary.light))
    okBg.on('pointerout', () => okBg.setFillStyle(Colors.primary.main))

    container.add(okButton)

    // Add container to scene
    this.scene.add.existing(container)
    container.setDepth(DepthRegistry.STOCK_INVENTORY + 300)
    this.currentViewContainer = container
  }

  private handleRightClick() {
    console.log('WarehouseSelectionOverlay - handling right click, current view:', this.currentView)
    // Context-aware navigation based on current view
    switch (this.currentView) {
      case 'options':
        // From warehouse options, go back to city selection
        console.log('Going back to city view from options')
        this.showCityView()
        break
      case 'service':
        // From service tier selection, go back to city selection
        console.log('Going back to city view from service')
        this.showCityView()
        break
      case 'map':
        // From map selection, close the overlay entirely
        console.log('Closing overlay from map view')
        this.close()
        break
      default:
        console.log('Closing overlay from unknown view')
        this.close()
        break
    }
  }

  private close() {
    this.callbacks.onCancel?.()
    this.destroy()
  }

  destroy() {
    // Clean up all map views that were added directly to the scene
    if (this.earthMap) {
      this.scene.children.remove(this.earthMap)
      this.earthMap.destroy()
      this.earthMap = undefined
    }
    if (this.continentZoomView) {
      this.scene.children.remove(this.continentZoomView)
      this.continentZoomView.destroy()
      this.continentZoomView = undefined
    }
    if (this.cityZoomView) {
      this.scene.children.remove(this.cityZoomView)
      this.cityZoomView.destroy()
      this.cityZoomView = undefined
    }
    if (this.instructionText) {
      this.scene.children.remove(this.instructionText)
      this.instructionText.destroy()
      this.instructionText = undefined
    }
    if (this.currentViewContainer) {
      this.scene.children.remove(this.currentViewContainer)
      this.currentViewContainer.destroy()
      this.currentViewContainer = undefined
    }
    if (this.closeButton) {
      this.scene.children.remove(this.closeButton)
      this.closeButton.destroy()
    }

    // Call parent destroy
    super.destroy()
  }
}
