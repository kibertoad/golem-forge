import {
  ActivationContainer,
  type EffectsHolder,
  type MenuTextItem,
  type OptionWithPreconditions,
  type StateHolder,
  allConditionsPass,
} from '@potato-golem/core'
import { ButtonGridBuilder, PotatoContainer, type PotatoScene } from '@potato-golem/ui'
import type { GameObjects } from 'phaser'
import type {
  AbstractChoicesDirector,
  CommonResolvedChoices,
} from '../processors/AbstractChoicesDirector.js'

export type ChoicesViewParams = {
  buttonTextureKey: string
}

export type ChoicesViewDependencies<
  WorldModel extends StateHolder<string>,
  ResolvedChoices extends CommonResolvedChoices,
> = {
  worldModel: WorldModel
  choicesDirector: AbstractChoicesDirector<WorldModel, ResolvedChoices>
}

/**
 * Displays stories and locations of a zone, and potentially a location
 */
export class ChoicesView<
  WorldModel extends StateHolder<any, any>,
  ResolvedChoices extends CommonResolvedChoices,
> extends PotatoContainer {
  protected buttonGridBuilder!: ButtonGridBuilder
  private readonly choicesDirector: AbstractChoicesDirector<WorldModel, ResolvedChoices>
  private readonly worldModel: WorldModel
  private choicesContainer!: GameObjects.Container
  private readonly params: ChoicesViewParams

  constructor(
    scene: PotatoScene,
    params: ChoicesViewParams,
    dependencies: ChoicesViewDependencies<WorldModel, ResolvedChoices>,
  ) {
    super(scene, {})
    this.choicesDirector = dependencies.choicesDirector
    this.worldModel = dependencies.worldModel
    this.params = params

    this.x = 300
    this.y = 100
  }

  refreshChoices() {
    if (this.choicesContainer) {
      this.choicesContainer.destroy(true)
    }

    this.buttonGridBuilder = new ButtonGridBuilder(this.scene, {
      textureKey: this.params.buttonTextureKey,
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

    const availableChoices = this.choicesDirector.resolveAvailableChoices()

    for (const choice of availableChoices.choices) {
      this.addOption(choice)
    }

    /*
    const availableStories = this.choicesDirector.resolveAvailableStories(this.worldModel.currentZone, this.worldModel.currentLocation)

    // FixMe this is broken
    for (const story of availableStories) {
      this.addOption(story)
    }

    const availableLocations = this.choicesDirector.resolveAvailableLocations(this.worldModel.currentZone, this.worldModel.currentLocation)

    for (const location of availableLocations) {
      this.addLocation(location)
    }

     */

    this.choicesContainer = this.buttonGridBuilder.build()
  }

  init() {
    this.refreshChoices()

    // FixMe
    /*
    this.eventBus.on('DESTROY', (entity: CommonEntity) => {
      if (entity.type === EntityTypeRegistry.DEFAULT) {
        this.destroyChildByModelId(entity.id)
      }
    })

    this.eventBus.on('REFRESH', () => {
      this.refreshChoices()
    })

     */
  }

  addOption(option: MenuTextItem & EffectsHolder & OptionWithPreconditions) {
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
        console.log(`All conditions passed for ${option.name}`)
        const effectContainer = ActivationContainer.fromEffectList(option.effects)
        effectContainer.activateOnlySync()
      } else {
        console.log(`Some conditions failed for ${option.name}`)
      }
    })
    console.log('added button')
  }

  // FixMe
  /*
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

   */
}
