import { ButtonGridBuilder, PotatoContainer, type PotatoScene } from '@potato-golem/ui'
import Phaser from 'phaser'
import { district1ChoiceDefinitions } from '../../../definitions/zones/01_district1/district1ChoiceDefinitions.ts'
import { ChoiceModel } from '../../../model/entities/narrative/ChoiceModel.ts'
import EventEmitter = Phaser.Events.EventEmitter
import { EntityTypeRegistry } from '../../../model/registries/entityTypeRegistry.ts'
import type { ImageId } from '../../../registries/imageRegistry.ts'
import { district1Bundle } from '../../../definitions/zones/01_district1/district1Bundle.ts'
import {ActivationContainer, allConditionsPass, type CommonEntity, type EventSink} from "@potato-golem/core";
import type {ZoneBundle} from "../../../definitions/zones/common/ZoneBundle.ts";

export type CardViewParams = {
}

export type CardViewDependencies = {
}

export class StoriesView extends PotatoContainer {

  protected buttonGridBuilder: ButtonGridBuilder<ImageId>
  protected zone: ZoneBundle

  constructor(
    scene: PotatoScene,
    params: CardViewParams,
    dependencies: CardViewDependencies
  ) {
    super(scene, {})
    this.zone = district1Bundle

    console.log('test')

    this.x = 300
    this.y = 100
  }

  init() {
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
    this.addStory(district1ChoiceDefinitions.exploreDistrict1.id)
    this.addStory(district1ChoiceDefinitions.exploreDistrict1.id)
    this.finishChoices()

    this.eventBus.on('DESTROY', (entity: CommonEntity) => {
      if (entity.type === EntityTypeRegistry.DEFAULT) {
        this.destroyChildByModelId(entity.id)
      }
    })
  }

  finishChoices() {
    console.log('finished')
    this.buttonGridBuilder.build()

    /*
    for (const element of con) {
      this.scene.add.existing(element)
    }

     */
  }

  addStory(storyId: string) {
    throw new Error('This needs to be fixed')
    const choiceModel = new ChoiceModel({
      parentEventSink: this.eventBus,

      // FixMe This is broken
      definition: null as any
    })
    const choiceDefinition = choiceModel.definition

    this.buttonGridBuilder.addButton(choiceDefinition.name, () => {
      console.log(`Clicked ${choiceModel.id}`)
      console.log(`Definition: ${JSON.stringify(choiceDefinition)}`)
      if (allConditionsPass(choiceDefinition.conditionsToEnable)) {
        const container = new ActivationContainer()
        container.addBulk(choiceDefinition.effects)
        container.activateOnlySync()
      }
    })
    console.log('added button')

    /*
    const entityView = new CardView(
      this.potatoScene,
      {
        model: choiceModel,
        x: 0,
        y: 0,
      },
      {
      },
    )
    this.addChildViewObject(entityView)

     */
  }
}
