import {
  createGlobalPositionLabel,
  createGlobalTrackerLabel,
  PotatoScene,
  SpriteBuilder,
  updateGlobalPositionLabel,
  updateGlobalTrackerLabel,
} from '@potato-golem/ui'
import type { GameObjects } from 'phaser'
import {
  type ArmsShowDefinition,
  armsShowsDefinitions,
} from '../../model/definitions/armsShowsDefinitions.ts'
import { entityDefinitions } from '../../model/definitions/entityDefinitions.ts'
import type { Dependencies } from '../../model/diConfig.ts'
import { ArmsStockModel } from '../../model/entities/ArmsStockModel.ts'
import { BusinessAgentModel } from '../../model/entities/BusinessAgentModel.ts'
import { EntityModel } from '../../model/entities/EntityModel.ts'
import { ResearchFacilityModel } from '../../model/entities/ResearchFacilityModel.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { Gender, PositiveTrait } from '../../model/enums/AgentEnums.ts'
import { ArmsCondition } from '../../model/enums/ArmsStockEnums.ts'
import { Country, CountryNames } from '../../model/enums/Countries.ts'
import { CountryCapitals } from '../../model/enums/CountryCapitals.ts'
import type { EarthRegion } from '../../model/enums/EarthRegions.ts'
import { ResearchFacilityType } from '../../model/enums/ResearchDirectorEnums.ts'
import type { EndTurnProcessor } from '../../model/processors/EndTurnProcessor.ts'
import type { WarSystem } from '../../model/WarSystem.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { eventEmitters } from '../../registries/eventEmitterRegistry.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import type { ArmsShowSceneData } from '../armsShow/ArmsShowScene.ts'
import {
  createArmsShowContextPanel,
  createArmsShowCostCalculator,
  createArmsShowSelectionValidator,
} from './molecules/agents/ArmsShowContextPanel.ts'
import {
  type AgentSelectionContext,
  BusinessAgentSelector,
} from './molecules/agents/BusinessAgentSelector.ts'
import { ScheduleAttendanceButton } from './molecules/agents/ScheduleAttendanceButton.ts'
import { EntityView } from './molecules/entities/EntityView.js'
import { StockInventoryView } from './molecules/inventory/StockInventoryView.ts'
import { EarthMap } from './molecules/map/EarthMap.ts'
import { NavigationBar, NavigationState } from './molecules/navigation/NavigationBar.ts'
import { EventLog } from './molecules/ui/EventLog.ts'
import { NextTurnButton } from './molecules/ui/NextTurnButton.ts'
import { StatusBar } from '../../components/StatusBar.ts'
import { ToastContainer, type ToastData } from './molecules/ui/ToastContainer.ts'

export class BoardScene extends PotatoScene {
  private readonly worldModel: WorldModel

  private globalPositionLabel!: GameObjects.Text
  private globalTrackerLabel!: GameObjects.Text

  private backgroundImage!: GameObjects.Sprite
  private readonly endTurnProcessor: EndTurnProcessor
  private readonly warSystem: WarSystem

  private toastContainer!: ToastContainer
  private navigationBar!: NavigationBar
  private earthMap!: EarthMap
  private statusBar!: StatusBar
  private nextTurnButton!: NextTurnButton
  private eventLog!: EventLog
  private scheduleAttendanceButton: ScheduleAttendanceButton | null = null
  private selectedArmsShow: ArmsShowDefinition | null = null
  private agentSelector: BusinessAgentSelector | null = null
  private scheduledArmsShowData: {
    agent: BusinessAgentModel
    armsShow: ArmsShowDefinition
  } | null = null
  private stockInventoryView: StockInventoryView | null = null

  constructor({ worldModel, endTurnProcessor, warSystem, globalSceneEventEmitter }: Dependencies) {
    super(globalSceneEventEmitter, sceneRegistry.BOARD_SCENE)

    this.worldModel = worldModel
    this.endTurnProcessor = endTurnProcessor
    this.warSystem = warSystem
  }

  init() {
    // Only initialize world state if it hasn't been initialized yet
    if (this.worldModel.businessAgents.length === 0) {
      this.addEntity()
      this.initializeAgents()
      this.initializeStartingStock()
      this.initializeResearchFacilities()
    }

    eventEmitters.boardEmitter.on('destroyEntity', ({ entityUuid }) => {
      /*
      if (entity.type === EntityTypeRegistry.DEFAULT) {
        this.worldModel.removeEntity(entity.id)
        this.destroyChildByModelId(entity.id)
      }

       */
    })
  }

  private initializeAgents() {
    // Create the player as the first agent
    const playerAgent = new BusinessAgentModel({
      name: 'You',
      nationality: Country.USA,
      age: 35,
      gender: Gender.OTHER,
      isPlayer: true,
      currentLocation: Country.USA,
      skills: {
        negotiation: 2,
        intimidation: 2,
        networking: 2,
        languages: 2,
        combat: 2,
        stealth: 2,
        technical: 2,
        finance: 2,
      },
      positiveTraits: [PositiveTrait.NEGOTIATOR],
    })

    this.worldModel.addAgent(playerAgent)
  }

  private initializeStartingStock() {
    // Add some starting stock for testing
    const startingStock = [
      // MISSILES
      new ArmsStockModel({
        armsId: 'viper_7_aam',
        quantity: 24,
        purchasePrice: 1100000,
        condition: ArmsCondition.EXCELLENT,
        acquiredFrom: 'Initial Inventory',
      }),
      new ArmsStockModel({
        armsId: 'horizon_cm',
        quantity: 8,
        purchasePrice: 1750000,
        condition: ArmsCondition.NEW,
        acquiredFrom: 'Government Contract',
      }),
      new ArmsStockModel({
        armsId: 'thunder_rocket',
        quantity: 500,
        purchasePrice: 4500,
        condition: ArmsCondition.GOOD,
        acquiredFrom: 'Warehouse Clearance',
      }),
      new ArmsStockModel({
        armsId: 'talon_atg',
        quantity: 15,
        purchasePrice: 145000,
        condition: ArmsCondition.GOOD,
        acquiredFrom: 'Air Force Surplus',
      }),
      new ArmsStockModel({
        armsId: 'sky_needle_sam',
        quantity: 35,
        purchasePrice: 8500,
        condition: ArmsCondition.FAIR,
        acquiredFrom: 'Black Market',
      }),

      // AIRCRAFT
      new ArmsStockModel({
        armsId: 'phantom_x5',
        quantity: 2,
        purchasePrice: 75000000,
        condition: ArmsCondition.NEW,
        acquiredFrom: 'Factory Direct',
      }),
      new ArmsStockModel({
        armsId: 'storm_rider_gunship',
        quantity: 4,
        purchasePrice: 32000000,
        condition: ArmsCondition.GOOD,
        acquiredFrom: 'Military Surplus',
      }),

      // ARMORED VEHICLES
      new ArmsStockModel({
        armsId: 'thunderbolt_mbt',
        quantity: 5,
        purchasePrice: 8500000,
        condition: ArmsCondition.GOOD,
        acquiredFrom: 'Factory Direct',
      }),
      new ArmsStockModel({
        armsId: 'wolverine_ifv',
        quantity: 8,
        purchasePrice: 3000000,
        condition: ArmsCondition.FAIR,
        acquiredFrom: 'Military Surplus',
      }),
      new ArmsStockModel({
        armsId: 'dune_runner_apc',
        quantity: 12,
        purchasePrice: 150000,
        condition: ArmsCondition.POOR,
        acquiredFrom: 'Salvage Yard',
      }),

      // SMALL ARMS
      new ArmsStockModel({
        armsId: 'nexus_ac7',
        quantity: 500,
        purchasePrice: 650,
        condition: ArmsCondition.GOOD,
        acquiredFrom: 'Bulk Purchase',
      }),
      new ArmsStockModel({
        armsId: 'copycat_ak',
        quantity: 2000,
        purchasePrice: 120,
        condition: ArmsCondition.FAIR,
        acquiredFrom: 'Black Market',
      }),
      new ArmsStockModel({
        armsId: 'liberty_surplus_rifle',
        quantity: 300,
        purchasePrice: 350,
        condition: ArmsCondition.SALVAGE,
        acquiredFrom: 'Police Auction',
      }),
      new ArmsStockModel({
        armsId: 'scorpion_rifle',
        quantity: 150,
        purchasePrice: 1200,
        condition: ArmsCondition.EXCELLENT,
        acquiredFrom: 'Special Forces Surplus',
      }),
      new ArmsStockModel({
        armsId: 'jungle_viper_smg',
        quantity: 75,
        purchasePrice: 450,
        condition: ArmsCondition.GOOD,
        acquiredFrom: 'Guerrilla Contact',
      }),
      new ArmsStockModel({
        armsId: 'frontier_carbine',
        quantity: 200,
        purchasePrice: 280,
        condition: ArmsCondition.FAIR,
        acquiredFrom: 'Regional Militia',
      }),
      new ArmsStockModel({
        armsId: 'longshot_50',
        quantity: 12,
        purchasePrice: 8500,
        condition: ArmsCondition.NEW,
        acquiredFrom: 'Precision Arms Dealer',
      }),

      // DRONES
      new ArmsStockModel({
        armsId: 'sentinel_uav',
        quantity: 15,
        purchasePrice: 1200000,
        condition: ArmsCondition.EXCELLENT,
        acquiredFrom: 'Tech Startup Acquisition',
      }),
      new ArmsStockModel({
        armsId: 'wasp_drone',
        quantity: 50,
        purchasePrice: 7500,
        condition: ArmsCondition.NEW,
        acquiredFrom: 'Commercial Supplier',
      }),

      // NAVAL
      new ArmsStockModel({
        armsId: 'leviathan_destroyer',
        quantity: 1,
        purchasePrice: 450000000,
        condition: ArmsCondition.GOOD,
        acquiredFrom: 'Navy Decommission',
      }),

      // ARTILLERY
      new ArmsStockModel({
        armsId: 'grad_lite',
        quantity: 3,
        purchasePrice: 850000,
        condition: ArmsCondition.FAIR,
        acquiredFrom: 'Eastern European Contact',
      }),
      new ArmsStockModel({
        armsId: 'thunder_mortar',
        quantity: 25,
        purchasePrice: 800,
        condition: ArmsCondition.POOR,
        acquiredFrom: 'Workshop Production',
      }),

      // ELECTRONIC WARFARE
      new ArmsStockModel({
        armsId: 'spectre_ew_suite',
        quantity: 4,
        purchasePrice: 2800000,
        condition: ArmsCondition.NEW,
        acquiredFrom: 'R&D Partnership',
      }),

      // Additional vehicles
      new ArmsStockModel({
        armsId: 'rhino_mrap',
        quantity: 10,
        purchasePrice: 450000,
        condition: ArmsCondition.GOOD,
        acquiredFrom: 'Corporate Liquidation',
      }),
      new ArmsStockModel({
        armsId: 'guardian_apc',
        quantity: 6,
        purchasePrice: 3200000,
        condition: ArmsCondition.EXCELLENT,
        acquiredFrom: 'NATO Surplus',
      }),

      // Some damaged/salvage items
      new ArmsStockModel({
        armsId: 'steel_bear_tank',
        quantity: 3,
        purchasePrice: 800000,
        condition: ArmsCondition.SALVAGE,
        acquiredFrom: 'Battlefield Recovery',
      }),
    ]

    // Stock is now managed in warehouses - this method is deprecated
    // startingStock.forEach((stock) => this.worldModel.addStock(stock))
  }

  private initializeResearchFacilities() {
    // Pick random facility type for the first facility
    const facilityTypes = Object.values(ResearchFacilityType)
    const randomType = facilityTypes[Math.floor(Math.random() * facilityTypes.length)]

    // Create initial research facility in Sudan with random type
    const sudanFacility = new ResearchFacilityModel({
      name: 'Sudan Defense Research Institute',
      location: Country.SUDAN,
      facilityType: randomType,
      monthlyUpkeep: 75000,
    })

    this.worldModel.addResearchFacility(sudanFacility)

    // Start with 0 directors - players must hire through agencies
  }

  addEntity() {
    const entityModel = new EntityModel({
      definition: entityDefinitions.sausage,
    })
    this.worldModel.addEntity(entityModel)

    const entityView = new EntityView(
      this,
      {
        model: entityModel,
        x: 0,
        y: 0,
      },
      {
        endTurnProcessor: this.endTurnProcessor,
      },
    )
    this.addChildViewObject(entityView)
  }

  preload() {}

  override update() {
    updateGlobalPositionLabel(this.globalPositionLabel)
    updateGlobalTrackerLabel(this.globalTrackerLabel)
  }

  create() {
    this.backgroundImage = SpriteBuilder.instance(this)
      .setTextureKey(imageRegistry.ROCKET)
      .setPosition({
        x: 0,
        y: 0,
      })
      .setDepth(DepthRegistry.BOARD_BACKGROUND)
      .setDimensions({
        width: 1900,
        height: 900,
      })
      .build()

    this.globalPositionLabel = createGlobalPositionLabel(this)
    this.globalTrackerLabel = createGlobalTrackerLabel(this)

    this.createUIElements()
  }

  private createUIElements() {
    const { width, height } = this.cameras.main

    // Position toasts below the status display area
    this.toastContainer = new ToastContainer(this, width - 160, 200)
    this.toastContainer.setDepth(1000)

    this.navigationBar = new NavigationBar(this, 70, height / 2)
    this.navigationBar.setDepth(900)
    this.navigationBar.on('navigation-changed', (state: NavigationState) => {
      console.log('Navigation changed to:', state)
      this.handleNavigationChange(state)
    })

    // Create stock inventory view (initially hidden)
    this.stockInventoryView = new StockInventoryView(this, width / 2, height / 2)
    this.stockInventoryView.setVisible(false)
    this.stockInventoryView.setStockItems(this.worldModel.getAllStock())
    this.stockInventoryView.on('item-sold', (item: ArmsStockModel) => {
      this.handleStockSale(item)
    })
    this.stockInventoryView.on('inventory-closed', () => {
      // Restore map visibility when stock inventory is closed
      this.earthMap.setVisible(true)
      // Reset navigation state
      this.navigationBar.clearActiveState()
    })

    this.earthMap = new EarthMap(
      this,
      width / 2,
      height / 2 + 100,
      this.worldModel,
      this.warSystem,
      this.toastContainer,
    )
    this.earthMap.setDepth(100)
    this.earthMap.on('region-selected', (region: EarthRegion) => {
      console.log('Region selected:', region)
      this.handleRegionSelection(region)
    })
    this.earthMap.on('country-selected', (country: Country) => {
      console.log('Country selected:', country)
      this.handleCountrySelection(country)
    })

    // Game initialization is now handled by GameInitializer before scenes are created

    // Create status bar that auto-updates from WorldModel events
    this.statusBar = new StatusBar(this, this.worldModel)
    this.statusBar.setDepth(950)

    // Move next turn button further down to avoid overlap
    this.nextTurnButton = new NextTurnButton(this, width - 110, 250)
    this.nextTurnButton.setDepth(950)
    this.nextTurnButton.on('next-turn', () => {
      this.processTurn()
    })

    // Add event log at the bottom of the screen
    this.eventLog = new EventLog(this, width / 2, height - 80)
    this.eventLog.setDepth(900)

    this.demoToast()
  }

  private handleNavigationChange(state: NavigationState) {
    // Hide all views first
    if (this.stockInventoryView) {
      this.stockInventoryView.setVisible(false)
    }

    // Map visibility is handled by individual views

    // Show the selected view
    switch (state) {
      case NavigationState.STOCK:
        if (this.stockInventoryView) {
          // Hide the map when showing stock inventory
          this.earthMap.setVisible(false)
          this.stockInventoryView.show()
        }
        break
      case NavigationState.RESEARCH:
        // Transition to full Research Scene
        this.scene.sleep()
        this.scene.run(sceneRegistry.RESEARCH_SCENE, {})
        break
      case NavigationState.PERSONNEL:
        // Transition to Personnel Scene
        this.scene.sleep()
        this.scene.run(sceneRegistry.PERSONNEL_SCENE, {})
        break
      case NavigationState.ASSETS:
        // Transition to Assets Scene
        this.scene.sleep()
        this.scene.run(sceneRegistry.ASSETS_SCENE, {})
        break
      case NavigationState.CONTACTS:
        // Transition to Contacts Scene
        this.scene.sleep()
        this.scene.run(sceneRegistry.CONTACTS_SCENE, {})
        break
      case NavigationState.POLITICS:
        // Transition to Politics Scene
        this.scene.sleep()
        this.scene.run(sceneRegistry.POLITICS_SCENE, {})
        break
      case NavigationState.INVESTIGATIONS:
        // Coming soon - Investigations Scene
        break
      // Add other navigation cases here as needed
    }
  }

  private handleStockSale(item: ArmsStockModel) {
    const salePrice = item.sell(1) // Sell 1 unit
    this.worldModel.addMoney(salePrice)
    // StatusBar auto-updates from event
    this.eventLog.addEntry(
      `Sold 1x ${item.getName()} for $${salePrice.toLocaleString()}`,
      'success',
    )

    // Update the inventory view
    if (this.stockInventoryView) {
      this.stockInventoryView.setStockItems(this.worldModel.getAllStock())
    }
  }

  private handleRegionSelection(region: EarthRegion) {
    // Region selection handled silently
    console.log('Region selected:', region)
  }

  private handleCountrySelection(country: Country) {
    // Handle country selection from zoomed view
    const countryName = CountryNames[country]
    const capital = CountryCapitals[country]
    if (capital) {
      this.eventLog.addEntry(`Selected: ${countryName} (Capital: ${capital.name})`, 'info')
    }
  }

  private processTurn() {
    this.nextTurnButton.setProcessing(true)

    // Process all turn operations (includes war processing via EndTurnProcessor)
    this.endTurnProcessor.processTurn()

    // Update world model turn
    this.worldModel.advanceTurn()
    this.worldModel.addMoney(Math.floor(Math.random() * 100000)) // Random income

    // Advance all research projects
    this.worldModel.advanceAllResearch()

    // Deduct research facility upkeep costs
    this.worldModel.researchFacilities.forEach((facility) => {
      this.worldModel.deductMoney(facility.monthlyUpkeep / 4) // Weekly upkeep
    })

    // Check for arms shows this week
    this.checkArmsShows(
      this.worldModel.gameStatus.date.getMonth() + 1,
      this.worldModel.gameStatus.week,
    )

    // StatusBar auto-updates from events

    // Check if we have a scheduled arms show to transition to
    if (this.scheduledArmsShowData) {
      const { agent, armsShow } = this.scheduledArmsShowData
      this.scheduledArmsShowData = null // Clear the data

      // Transition to arms show scene after a brief delay
      this.time.delayedCall(1000, () => {
        const sceneData: ArmsShowSceneData = { agent, armsShow }
        this.scene.sleep() // Preserve BoardScene state
        this.scene.run(sceneRegistry.ARMS_SHOW_SCENE, sceneData)
      })
    } else {
      this.time.delayedCall(500, () => {
        this.nextTurnButton.setProcessing(false)
      })
    }
  }

  private checkArmsShows(month: number, week: number) {
    // Clear previous event markers
    this.earthMap.clearEventMarkers()

    Object.values(armsShowsDefinitions).forEach((show) => {
      if (show.cadence.month === month && show.cadence.week === week) {
        // Create toast for arms show
        const countryName = this.getCountryDisplayName(show.country)
        const toastData: ToastData = {
          id: `arms-show-${show.id}`,
          icon: imageRegistry.ROCKET,
          title: `🎯 ${show.name} (${countryName})`,
          description: `Prestige: ${'★'.repeat(show.prestigeLevel)} | Entry: $${show.entranceFee.toLocaleString()}`,
          timestamp: Date.now(),
        }

        this.toastContainer.addToast(toastData)
      }
    })

    // Remove any existing listener before adding a new one
    this.toastContainer.off('toast-detail-requested')

    // Set up listener for all toast clicks this turn
    this.toastContainer.on('toast-detail-requested', (data: ToastData) => {
      if (data.id.startsWith('arms-show-')) {
        // Clear existing markers to show new selection
        this.earthMap.clearEventMarkers()

        // Find the corresponding show
        const showId = data.id.replace('arms-show-', '')
        const show = Object.values(armsShowsDefinitions).find((s) => s.id === showId)

        if (show) {
          // Jump to continent view and highlight the country
          this.earthMap.showArmsShowLocation(show.country, show.name)

          // Show attendance button for the selected show
          this.showScheduleAttendanceButton(show)
        }
      }
    })
  }

  private showScheduleAttendanceButton(armsShow: ArmsShowDefinition) {
    // Remove existing button if any
    if (this.scheduleAttendanceButton) {
      this.scheduleAttendanceButton.destroy()
    }

    this.selectedArmsShow = armsShow
    const currentCash = this.worldModel.gameStatus.money
    const canAfford = currentCash >= armsShow.entranceFee

    // Create button to the left of the Next Turn button
    // This ensures it's visible and not overlapping with other UI elements
    this.scheduleAttendanceButton = new ScheduleAttendanceButton(
      this,
      this.cameras.main.width - 320, // To the left of Next Turn button (which is at width - 110)
      250, // Same y position as Next Turn button
      canAfford,
      () => this.openAgentSelectionWindow(armsShow),
    )
    this.scheduleAttendanceButton.setDepth(1500)
  }

  private openAgentSelectionWindow(armsShow: ArmsShowDefinition) {
    // Close existing window if any
    if (this.agentSelector) {
      this.agentSelector.destroy()
    }

    const currentCash = this.worldModel.gameStatus.money

    // Create arms show specific context
    const context: AgentSelectionContext = {
      title: 'SELECT REPRESENTATIVE FOR ARMS SHOW',
      detailsPanel: createArmsShowContextPanel(this, armsShow, currentCash),
      costCalculator: createArmsShowCostCalculator(armsShow),
      canSelectValidator: createArmsShowSelectionValidator(armsShow),
    }

    this.agentSelector = new BusinessAgentSelector(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.worldModel.businessAgents,
      context,
      currentCash,
      (agent) => this.confirmAttendance(armsShow, agent),
    )
  }

  private confirmAttendance(armsShow: ArmsShowDefinition, agent: BusinessAgentModel) {
    // Calculate total cost
    const totalCost = agent.calculateAttendanceFee(armsShow.entranceFee)

    // Deduct money from world model
    this.worldModel.deductMoney(totalCost)
    // StatusBar auto-updates from event

    // Mark agent as busy
    agent.markAsBusy()

    // Remove the arms show toast after scheduling
    this.toastContainer.removeToast(`arms-show-${armsShow.id}`)

    // Add to event log instead of toast
    this.eventLog.addEntry(`${agent.name} scheduled to attend ${armsShow.name}`, 'success')

    // Clear the map highlight
    this.earthMap.clearEventMarkers()

    // Clean up UI elements
    if (this.scheduleAttendanceButton) {
      this.scheduleAttendanceButton.destroy()
      this.scheduleAttendanceButton = null
    }
    if (this.agentSelector) {
      this.agentSelector.destroy()
      this.agentSelector = null
    }

    // Clear map markers
    this.earthMap.clearEventMarkers()

    // Store the scheduled arms show data for scene transition after turn ends
    this.scheduledArmsShowData = { agent, armsShow }
  }

  private getMonthName(monthIndex: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return months[monthIndex]
  }

  private getCountryDisplayName(countryCode: string): string {
    // Import CountryNames from the Countries enum file
    const countryNames: Record<string, string> = {
      usa: 'USA',
      russia: 'Russia',
      china: 'China',
      uk: 'UK',
      france: 'France',
      germany: 'Germany',
      israel: 'Israel',
      india: 'India',
      japan: 'Japan',
      south_korea: 'South Korea',
      turkey: 'Turkey',
      italy: 'Italy',
      sweden: 'Sweden',
      switzerland: 'Switzerland',
      uae: 'UAE',
      canada: 'Canada',
      australia: 'Australia',
      brazil: 'Brazil',
      south_africa: 'South Africa',
      poland: 'Poland',
      spain: 'Spain',
      netherlands: 'Netherlands',
      belgium: 'Belgium',
      norway: 'Norway',
      singapore: 'Singapore',
      saudi_arabia: 'Saudi Arabia',
      egypt: 'Egypt',
      pakistan: 'Pakistan',
      ukraine: 'Ukraine',
      czech_republic: 'Czech Republic',
    }
    return countryNames[countryCode] || countryCode.toUpperCase()
  }

  private demoToast() {
    // Welcome toast removed - war declarations will show instead
    /*
    this.time.delayedCall(1000, () => {
      const welcomeToast: ToastData = {
        id: 'welcome',
        icon: imageRegistry.ROCKET,
        title: 'Welcome to The War Machine',
        description: 'Your arms dealing empire awaits',
        timestamp: Date.now(),
      }
      this.toastContainer.addToast(welcomeToast)
    })
    */
  }
}
