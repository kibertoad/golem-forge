import {
  ActivationContainer,
  allConditionsPass, type COMMON_EVENT_TYPES,
  type CommonEntity,
  type EffectsHolder,
  type EventSink,
  type EventSource,
  type OptionWithPreconditions,
} from '@potato-golem/core'
import { ButtonGridBuilder, PotatoContainer, type PotatoScene } from '@potato-golem/ui'
import { EntityTypeRegistry } from '../../../model/registries/entityTypeRegistry.ts'
import type { ImageId } from '../../../registries/imageRegistry.ts'
import { choicesViewEventBus } from '../../../registries/eventEmitterRegistry.ts'
import type {WorldModel} from "../../../model/entities/WorldModel.ts";
import type {ChoicesDirector} from "../../../model/director/ChoicesDirector.ts";
import {LeaveLocationActivation} from "../../../model/activations/LeaveLocationActivation.ts";
import type {MenuItem} from "../../../definitions/definitionInterfaces.ts";
import type {LocationDefinition} from "../../../definitions/zones/common/LocationDefinition.ts";
import type { GameObjects } from 'phaser'

export type CardViewParams = {
}

export type ChoicesViewDependencies = {
  worldModel: WorldModel
  choicesDirector: ChoicesDirector
}

/**
 * Displays stories and locations of a zone, and potentially a location
 */
export class ChoicesView extends PotatoContainer {

  protected readonly eventBus: EventSink & EventSource<COMMON_EVENT_TYPES | 'REFRESH'>
  protected buttonGridBuilder: ButtonGridBuilder<ImageId>
  private readonly choicesDirector: ChoicesDirector;
  private readonly worldModel: WorldModel;
  private choicesContainer: GameObjects.Container

  constructor(
    scene: PotatoScene,
    params: CardViewParams,
    dependencies: ChoicesViewDependencies
  ) {
    super(scene, {})
    this.choicesDirector = dependencies.choicesDirector
    this.worldModel = dependencies.worldModel
    this.eventBus = choicesViewEventBus

    this.x = 300
    this.y = 100
  }

  refreshChoices() {
    if (this.choicesContainer) {
      this.choicesContainer.destroy(true)
    }

    this.buttonGridBuilder = new ButtonGridBuilder(this.scene, {
      textureKey: 'card_background',
      rowSize: 4,
      rowSpacingOffset: 10,

      depth: 100,
      distance: 20,
      height: 50,
      width: 300,
      orientation: 'vertical',
      hoverTint: 0x66ff7f,
      position: {
        x: 300 / 2 - 300 / 2,
        y: 450,
      },
    })

    const availableStories = this.choicesDirector.resolveAvailableStories(this.worldModel.currentZone, this.worldModel.currentLocation)

    throw new Error('This needs to be fixed')
    // FixMe this is broken
    for (const story of availableStories) {
      this.addOption(story as any)
    }

    const availableLocations = this.choicesDirector.resolveAvailableLocations(this.worldModel.currentZone, this.worldModel.currentLocation)

    for (const location of availableLocations) {
      this.addLocation(location)
    }

    if (this.worldModel.currentLocation && this.worldModel.playerStates.restricted_movement.value === 0) {
      this.addOption({
        image: 'rocket',
        name: 'Leave',
        effects: [new LeaveLocationActivation()]
      })
    }

    this.choicesContainer = this.buttonGridBuilder.build()
  }

  init() {
    this.refreshChoices()

    this.eventBus.on('DESTROY', (entity: CommonEntity) => {
      if (entity.type === EntityTypeRegistry.DEFAULT) {
        this.destroyChildByModelId(entity.id)
      }
    })

    this.eventBus.on('REFRESH', () => {
      this.refreshChoices()
    })
  }

  addOption(option: MenuItem & EffectsHolder & OptionWithPreconditions) {
    /*
    const choiceModel = new ChoiceModel({
      parentEventSink: this.eventBus,
      definition: this.worldModel.currentZone.globalChoices[choiceId],
    })

     */

    this.buttonGridBuilder.addButton(option.name, () => {
      console.log(`Clicked ${option.name}`)
      //console.log(`Definition: ${JSON.stringify(choiceDefinition)}`)
      if (allConditionsPass(option.conditionsToEnable)) {
        const effectContainer = ActivationContainer.fromEffectList(option.effects)
        effectContainer.activateOnlySync()
      }
    })
    console.log('added button')
  }

  addLocation(option: LocationDefinition) {
    this.buttonGridBuilder.addButton(option.name, () => {
      console.log(`Clicked location ${option.name}`)
      if (allConditionsPass(option.conditionsToEnable)) {
        const effectContainer = ActivationContainer.fromEffectList(option.effects)
        effectContainer.activateOnlySync()
        this.worldModel.setLocation(option)
        this.refreshChoices()
        console.log('location changed')
      }
    })
    console.log('added location')
  }
}
