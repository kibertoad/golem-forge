import type { IdHolder } from '@potato-golem/core'
import type { Position, PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'
import type { EntityModel } from '../../../model/entities/EntityModel.ts'
import type { EndTurnProcessor } from '../../../model/processors/EndTurnProcessor.ts'

export type CardViewParams = {
  model: EntityModel
} & Position

export type CardViewDependencies = {
  endTurnProcessor: EndTurnProcessor
}

const textOffsetX = 35
const textOffsetY = 5

export class EntityView extends GameObjects.Container implements IdHolder {
  id: string

  /**
   * Domain model of the card
   */
  private readonly model: EntityModel
  private readonly endTurnProcessor: EndTurnProcessor

  constructor(scene: PotatoScene, params: CardViewParams, dependencies: CardViewDependencies) {
    super(scene)

    this.id = params.model.id
    this.x = params.x
    this.y = params.y
    this.setDepth(100)

    this.model = params.model
    this.endTurnProcessor = dependencies.endTurnProcessor

    scene.add.existing(this)
  }
}
