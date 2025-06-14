import type { IdHolder } from '@potato-golem/core'
import {
  type Position,
  type PotatoScene,
  SpriteBuilder,
  TextBuilder,
  buildDragWithActivations,
  setEntityModel,
  setEntityType,
} from '@potato-golem/ui'
import { GameObjects } from 'phaser'
import type { EntityModel } from '../../../model/entities/EntityModel.ts'
import type { EndTurnProcessor } from '../../../model/processors/EndTurnProcessor.ts'
import { EntityTypeRegistry } from '../../../registries/entityTypeRegistry.ts'
import { imageRegistry } from '../../../registries/imageRegistry.ts'

export type CardViewParams = {
  model: EntityModel
} & Position

export type CardViewDependencies = {
  endTurnProcessor: EndTurnProcessor
}

const textOffsetX = 35
const textOffsetY = 5

export class EntityView extends GameObjects.Container implements IdHolder {
  /**
   * Generic frame for the card
   */
  private readonly cardFrameSprite: GameObjects.Sprite

  /**
   * Card-specific image for the card
   */
  private readonly cardPictureSprite: GameObjects.Sprite

  /**
   * Text element with the name of the card
   */
  private readonly title: GameObjects.Text

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

    this.cardFrameSprite = SpriteBuilder.instance(scene)
      .setTextureKey(imageRegistry.ROCKET)
      .setPosition({
        x: 0,
        y: 0,
      })
      .setOrigin(0, 0)
      .setWidth(120)
      .setHeight(180)
      .build()

    this.cardPictureSprite = SpriteBuilder.instance(scene)
      .setTextureKey(imageRegistry.ROCKET)
      .setPosition({
        x: 0,
        y: 30,
      })
      .setOrigin(0, 0)
      .setWidth(120)
      .setHeight(140)
      .build()

    this.title = TextBuilder.instance(scene)
      .setRelativePositionFromBackground(this, textOffsetX, textOffsetY)
      .setOrigin(0, 0)
      .setText(params.model.name)
      .setDisplaySize(15, 15)
      .build().value

    setEntityType(this.cardFrameSprite, EntityTypeRegistry.DEFAULT)
    setEntityModel(this.cardFrameSprite, this.model)

    this.add(this.cardFrameSprite)
    this.add(this.cardPictureSprite)
    this.add(this.title)

    scene.add.existing(this)

    // Build ticket drag'n'drop
    buildDragWithActivations({
      dragStartItem: this.cardFrameSprite,
      draggedItem: this,
      dropActivations: {
        [EntityTypeRegistry.DEFAULT]: () => {
          // restoreStartPosition(this)
          this.endTurnProcessor.processTurn()
        },
      },
      config: {},
      potentialHoverTargets: [],
      potentialDropTargets: [],
    })
  }
}
