import {
  createGlobalPositionLabel,
  createGlobalTrackerLabel,
  PotatoScene,
  SpriteBuilder,
  updateGlobalPositionLabel,
  updateGlobalTrackerLabel,
} from '@potato-golem/ui'
import type { GameObjects } from 'phaser'
import { entityDefinitions } from '../../model/definitions/entityDefinitions.ts'
import type { Dependencies } from '../../model/diConfig.ts'
import { EntityModel } from '../../model/entities/EntityModel.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
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
    const toastData: ToastData = {
      id: `region-${Date.now()}`,
      icon: imageRegistry.ROCKET,
      title: `${region.replace('_', ' ')} selected`,
      description: `You selected the ${region.replace('_', ' ')} region`,
      timestamp: Date.now(),
    }
    this.toastContainer.addToast(toastData)
  }

  private processTurn() {
    this.nextTurnButton.setProcessing(true)

    this.endTurnProcessor.processTurn()

    const currentStatus = this.statusDisplay.getStatus()
    const newDate = new Date(currentStatus.date)
    newDate.setMonth(newDate.getMonth() + 1)

    this.statusDisplay.updateStatus({
      date: newDate,
      money: currentStatus.money + Math.floor(Math.random() * 500000),
      turn: currentStatus.turn + 1,
    })

    const toastData: ToastData = {
      id: `turn-${Date.now()}`,
      icon: imageRegistry.ROCKET,
      title: 'Turn Complete',
      description: `Turn ${currentStatus.turn + 1} has begun`,
      timestamp: Date.now(),
    }
    this.toastContainer.addToast(toastData)

    this.time.delayedCall(500, () => {
      this.nextTurnButton.setProcessing(false)
    })
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
