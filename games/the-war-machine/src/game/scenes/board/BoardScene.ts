import {
  createGlobalPositionLabel,
  createGlobalTrackerLabel,
  PotatoScene,
  SpriteBuilder,
  updateGlobalPositionLabel,
  updateGlobalTrackerLabel,
} from '@potato-golem/ui'
import type { GameObjects } from 'phaser'
import { armsShowsDefinitions } from '../../model/definitions/armsShowsDefinitions.ts'
import { entityDefinitions } from '../../model/definitions/entityDefinitions.ts'
import type { Dependencies } from '../../model/diConfig.ts'
import { EntityModel } from '../../model/entities/EntityModel.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { CountryCapitals } from '../../model/enums/CountryCapitals.ts'
import type { EndTurnProcessor } from '../../model/processors/EndTurnProcessor.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { eventEmitters } from '../../registries/eventEmitterRegistry.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { EarthMap, type EarthRegion } from './molecules/EarthMap.ts'
import { EntityView } from './molecules/EntityView.js'
import { NavigationBar, type NavigationState } from './molecules/NavigationBar.ts'
import { NextTurnButton } from './molecules/NextTurnButton.ts'
import { type StatusData, StatusDisplay } from './molecules/StatusDisplay.ts'
import { ToastContainer, type ToastData } from './molecules/ToastContainer.ts'

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

  constructor({ worldModel, endTurnProcessor, globalSceneEventEmitter }: Dependencies) {
    super(globalSceneEventEmitter, sceneRegistry.BOARD_SCENE)

    this.worldModel = worldModel
    this.endTurnProcessor = endTurnProcessor
  }

  init() {
    this.addEntity()

    eventEmitters.boardEmitter.on('destroyEntity', ({ entityUuid }) => {
      /*
      if (entity.type === EntityTypeRegistry.DEFAULT) {
        this.worldModel.removeEntity(entity.id)
        this.destroyChildByModelId(entity.id)
      }

       */
    })
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

    this.toastContainer = new ToastContainer(this, width - 160, 100)
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
    this.statusDisplay = new StatusDisplay(this, width - 140, height - 60, initialStatus)
    this.statusDisplay.setDepth(950)

    this.nextTurnButton = new NextTurnButton(this, width - 100, height - 150)
    this.nextTurnButton.setDepth(950)
    this.nextTurnButton.on('next-turn', () => {
      this.processTurn()
    })

    this.demoToast()
  }

  private handleNavigationChange(state: NavigationState) {
    const toastData: ToastData = {
      id: `nav-${Date.now()}`,
      icon: imageRegistry.ROCKET,
      title: `Switched to ${state}`,
      description: `You are now viewing the ${state} panel`,
      timestamp: Date.now(),
    }
    this.toastContainer.addToast(toastData)
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
        }
      }
    })
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
