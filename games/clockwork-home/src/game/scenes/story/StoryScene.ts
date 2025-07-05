import {
  PotatoScene,
  SpriteBuilder,
  createGlobalPositionLabel,
  updateGlobalPositionLabel,
} from '@potato-golem/ui'
import Phaser from 'phaser'

import { createGlobalTrackerLabel, updateGlobalTrackerLabel } from '@potato-golem/ui'
import type { Dependencies } from '../../model/diConfig.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import Sprite = Phaser.GameObjects.Sprite
import type { ChoicesDirector } from '../../model/director/ChoicesDirector.ts'
import type { EndTurnProcessor } from '../../model/processors/EndTurnProcessor.ts'
import { DepthRegistry } from '../../model/registries/depthRegistry.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { ChoicesView } from '../common/organisms/ChoicesView.ts'

export class StoryScene extends PotatoScene {
  private readonly worldModel: WorldModel

  private globalPositionLabel: Phaser.GameObjects.Text
  private globalTrackerLabel: Phaser.GameObjects.Text

  private backgroundImage: Sprite
  private readonly endTurnProcessor: EndTurnProcessor
  private choicesView: ChoicesView
  private readonly choicesDirector: ChoicesDirector

  constructor({ worldModel, endTurnProcessor, choicesDirector }: Dependencies) {
    super(sceneRegistry.BOARD_SCENE)

    this.choicesDirector = choicesDirector
    this.worldModel = worldModel
    this.endTurnProcessor = endTurnProcessor
  }

  init() {
    this.choicesView = new ChoicesView(
      this,
      {},
      {
        worldModel: this.worldModel,
        choicesDirector: this.choicesDirector,
      },
    )
    this.choicesView.init()
  }

  preload() {}

  update() {
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

    // ToDo reenable later
    this.backgroundImage.setVisible(false)

    this.globalPositionLabel = createGlobalPositionLabel(this)
    this.globalTrackerLabel = createGlobalTrackerLabel(this)
  }
}
