import {
  createGlobalPositionLabel,
  createGlobalTrackerLabel,
  PotatoScene,
  SpriteBuilder,
  updateGlobalPositionLabel,
  updateGlobalTrackerLabel,
} from '@potato-golem/ui'
import type { GameObjects } from 'phaser'
import { armsShowsDefinitions, type ArmsShowDefinition } from '../../model/definitions/armsShowsDefinitions.ts'
import { entityDefinitions } from '../../model/definitions/entityDefinitions.ts'
import type { Dependencies } from '../../model/diConfig.ts'
import { EntityModel } from '../../model/entities/EntityModel.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { BusinessAgentModel } from '../../model/entities/BusinessAgentModel.ts'
import { CountryCapitals } from '../../model/enums/CountryCapitals.ts'
import { Country } from '../../model/enums/Countries.ts'
import { Gender, PositiveTrait } from '../../model/enums/AgentEnums.ts'
import type { EndTurnProcessor } from '../../model/processors/EndTurnProcessor.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { eventEmitters } from '../../registries/eventEmitterRegistry.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { EarthMap, type EarthRegion } from './molecules/EarthMap.ts'
import { EntityView } from './molecules/EntityView.js'
import { NavigationBar, NavigationState } from './molecules/NavigationBar.ts'
import { NextTurnButton } from './molecules/NextTurnButton.ts'
import { type StatusData, StatusDisplay } from './molecules/StatusDisplay.ts'
import { ToastContainer, type ToastData } from './molecules/ToastContainer.ts'
import { ScheduleAttendanceButton } from './molecules/ScheduleAttendanceButton.ts'
import { AgentSelectionWindow } from './molecules/AgentSelectionWindow.ts'
import { EventLog } from './molecules/EventLog.ts'
import { StockInventoryView } from './molecules/StockInventoryView.ts'
import { ArmsStockModel } from '../../model/entities/ArmsStockModel.ts'
import { ArmsCondition } from '../../model/enums/ArmsStockEnums.ts'

export class BoardScene extends PotatoScene {
  private readonly worldModel: WorldModel

  private globalPositionLabel!: GameObjects.Text
  private globalTrackerLabel!: GameObjects.Text

  private backgroundImage!: GameObjects.Sprite
  private readonly endTurnProcessor: EndTurnProcessor

  private toastContainer!: ToastContainer
  private navigationBar!: NavigationBar
  private earthMap!: EarthMap
  private statusDisplay!: StatusDisplay
  private nextTurnButton!: NextTurnButton
  private eventLog!: EventLog
  private businessAgents: BusinessAgentModel[] = []
  private scheduleAttendanceButton: ScheduleAttendanceButton | null = null
  private selectedArmsShow: ArmsShowDefinition | null = null
  private agentSelectionWindow: AgentSelectionWindow | null = null
  private stockInventoryView: StockInventoryView | null = null
  private playerStock: ArmsStockModel[] = []

  constructor({ worldModel, endTurnProcessor, globalSceneEventEmitter }: Dependencies) {
    super(globalSceneEventEmitter, sceneRegistry.BOARD_SCENE)

    this.worldModel = worldModel
    this.endTurnProcessor = endTurnProcessor
  }

  init() {
    this.addEntity()
    this.initializeAgents()
    this.initializeStartingStock()

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
        negotiation: 7,
        intimidation: 5,
        networking: 6,
        languages: 4,
        combat: 3,
        stealth: 4,
        technical: 5,
        finance: 6,
      },
      positiveTraits: [PositiveTrait.NEGOTIATOR],
    })

    this.businessAgents.push(playerAgent)
  }

  private initializeStartingStock() {
    // Add some starting stock for testing
    this.playerStock = [
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
    this.toastContainer.on('toast-detail-requested', (data: ToastData) => {
      console.log('Toast detail requested:', data)
    })

    this.navigationBar = new NavigationBar(this, 70, height / 2)
    this.navigationBar.setDepth(900)
    this.navigationBar.on('navigation-changed', (state: NavigationState) => {
      console.log('Navigation changed to:', state)
      this.handleNavigationChange(state)
    })

    // Create stock inventory view (initially hidden)
    this.stockInventoryView = new StockInventoryView(this, width / 2, height / 2)
    this.stockInventoryView.setVisible(false)
    this.stockInventoryView.setStockItems(this.playerStock)
    this.stockInventoryView.on('item-sold', (item: ArmsStockModel) => {
      this.handleStockSale(item)
    })

    this.earthMap = new EarthMap(this, width / 2, height / 2)
    this.earthMap.setDepth(100)
    this.earthMap.on('region-selected', (region: EarthRegion) => {
      console.log('Region selected:', region)
      this.handleRegionSelection(region)
    })

    const initialStatus: StatusData = {
      date: new Date(2024, 0, 1),
      week: 1,
      money: 1000000,
      turn: 1,
    }
    // Move status display to top-right corner
    this.statusDisplay = new StatusDisplay(this, width - 160, 80, initialStatus)
    this.statusDisplay.setDepth(950)

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

    // Show the selected view
    switch (state) {
      case NavigationState.STOCK:
        if (this.stockInventoryView) {
          this.stockInventoryView.show()
        }
        break
      // Add other navigation cases here as needed
    }

    const toastData: ToastData = {
      id: `nav-${Date.now()}`,
      icon: imageRegistry.ROCKET,
      title: `Switched to ${state}`,
      description: `You are now viewing the ${state} panel`,
      timestamp: Date.now(),
    }
    this.toastContainer.addToast(toastData)
  }

  private handleStockSale(item: ArmsStockModel) {
    const salePrice = item.sell(1) // Sell 1 unit
    const currentStatus = this.statusDisplay.getStatus()
    this.statusDisplay.updateStatus({
      ...currentStatus,
      money: currentStatus.money + salePrice,
    })
    this.eventLog.addEntry(`Sold 1x ${item.getName()} for $${salePrice.toLocaleString()}`, 'success')

    // Update the inventory view
    if (this.stockInventoryView) {
      this.stockInventoryView.setStockItems(this.playerStock)
    }
  }

  private handleRegionSelection(region: EarthRegion) {
    // Region selection handled silently
    console.log('Region selected:', region)
  }

  private processTurn() {
    this.nextTurnButton.setProcessing(true)

    this.endTurnProcessor.processTurn()

    const currentStatus = this.statusDisplay.getStatus()
    const newDate = new Date(currentStatus.date)
    let newWeek = currentStatus.week + 1

    // If we've gone past week 4, move to next month
    if (newWeek > 4) {
      newWeek = 1
      newDate.setMonth(newDate.getMonth() + 1)
    } else {
      // Just advance by 7 days for visual consistency
      newDate.setDate(newDate.getDate() + 7)
    }

    // Check for arms shows this week
    this.checkArmsShows(newDate.getMonth() + 1, newWeek)

    this.statusDisplay.updateStatus({
      date: newDate,
      week: newWeek,
      money: currentStatus.money + Math.floor(Math.random() * 100000),
      turn: currentStatus.turn + 1,
    })

    this.time.delayedCall(500, () => {
      this.nextTurnButton.setProcessing(false)
    })
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
          description: `Prestige Level: ${show.prestigeLevel}/10 | Entry: $${show.entranceFee.toLocaleString()}`,
          timestamp: Date.now(),
        }

        this.toastContainer.addToast(toastData)
      }
    })

    // Set up listener for all toast clicks this turn
    this.toastContainer.on('toast-detail-requested', (data: ToastData) => {
      if (data.id.startsWith('arms-show-')) {
        // Clear existing markers to show new selection
        this.earthMap.clearEventMarkers()

        // Find the corresponding show
        const showId = data.id.replace('arms-show-', '')
        const show = Object.values(armsShowsDefinitions).find(s => s.id === showId)

        if (show) {
          const capital = CountryCapitals[show.country]
          if (capital) {
            this.earthMap.addEventMarkerAtCapital(capital.x, capital.y, show.name)
          }

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
    const currentCash = this.statusDisplay.getStatus().money
    const canAfford = currentCash >= armsShow.entranceFee

    // Create button near the map marker
    const capital = CountryCapitals[armsShow.country]
    this.scheduleAttendanceButton = new ScheduleAttendanceButton(
      this,
      this.cameras.main.width / 2 + capital.x,
      this.cameras.main.height / 2 + capital.y + 80,
      canAfford,
      () => this.openAgentSelectionWindow(armsShow),
    )
    this.scheduleAttendanceButton.setDepth(1500)
  }

  private openAgentSelectionWindow(armsShow: ArmsShowDefinition) {
    // Close existing window if any
    if (this.agentSelectionWindow) {
      this.agentSelectionWindow.destroy()
    }

    const currentCash = this.statusDisplay.getStatus().money

    this.agentSelectionWindow = new AgentSelectionWindow(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      armsShow,
      this.businessAgents,
      currentCash,
      (agent) => this.confirmAttendance(armsShow, agent),
    )
  }

  private confirmAttendance(armsShow: ArmsShowDefinition, agent: BusinessAgentModel) {
    // Calculate total cost
    const totalCost = agent.calculateAttendanceFee(armsShow.entranceFee)
    const currentStatus = this.statusDisplay.getStatus()

    // Deduct money
    this.statusDisplay.updateStatus({
      ...currentStatus,
      money: currentStatus.money - totalCost,
    })

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
    if (this.agentSelectionWindow) {
      this.agentSelectionWindow.destroy()
      this.agentSelectionWindow = null
    }

    // Clear map markers
    this.earthMap.clearEventMarkers()
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
  }
}
