import { allConditionsPass, CommonEntity, EventSink, EventSource } from '@potato-golem/core'
import { ButtonGridBuilder, PotatoContainer, type PotatoScene } from '@potato-golem/ui'
import Phaser from 'phaser'
import { district1ChoiceDefinitions } from '../../../definitions/zones/01_district1/district1ChoiceDefinitions.ts'
import { ChoiceModel } from '../../../model/entities/narrative/ChoiceModel.ts'
import EventEmitter = Phaser.Events.EventEmitter
import { EntityTypeRegistry } from '../../../model/registries/entityTypeRegistry.ts'
import type { ImageId } from '../../../registries/imageRegistry.ts'
import { ZoneBundle } from '../../../definitions/zones/common/ZoneBundle.ts'
import { district1Bundle } from '../../../definitions/zones/01_district1/district1Bundle.ts'
import { LocationModel } from '../../../model/entities/narrative/LocationModel.ts'

export type CardViewParams = {
}

export type CardViewDependencies = {
}

export class LocationsView extends PotatoContainer {

  protected readonly eventBus: EventSink & EventSource
  protected buttonGridBuilder: ButtonGridBuilder<ImageId>
  protected zone: ZoneBundle

  constructor(
    scene: PotatoScene,
    params: CardViewParams,
    dependencies: CardViewDependencies
  ) {
    super(scene, {})
    this.eventBus = new EventEmitter()
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
    this.addLocation(district1ChoiceDefinitions.exploreDistrict1.id)
    this.finishLocations()
  }

  finishLocations() {
    console.log('finished')
    this.buttonGridBuilder.build()
  }

  addLocation(locationId: string) {
    const locationModel = new LocationModel({
      definition: this.zone.zoneLocations[locationId],
    })
    const locationDefinition = locationModel.definition

    this.buttonGridBuilder.addButton(locationDefinition.name, () => {
      console.log(`Clicked ${locationModel.id} location`)
      console.log(`Definition: ${JSON.stringify(locationDefinition)}`)
      // ToDo navigate to a location
    })
    console.log('added button')
  }
}
