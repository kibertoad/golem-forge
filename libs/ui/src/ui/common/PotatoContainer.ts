import * as Phaser from 'phaser'
import Container = Phaser.GameObjects.Container
import { type Destroyable, type IdHolder, removeFromArrayById } from '@potato-golem/core'

import type { PotatoScene } from './PotatoScene.ts'

export type CommmonContainerParams = {
  isShown?: boolean // default is true
}

/**
 * Encapsulates a group of Phaser objects that are supposed to move together
 */
export abstract class PotatoContainer<
  ContainerParams extends CommmonContainerParams = CommmonContainerParams,
> extends Container {
  protected readonly potatoScene: PotatoScene
  protected readonly viewObjects: Array<IdHolder & Destroyable>

  constructor(scene: PotatoScene, containerParams: ContainerParams) {
    super(scene)
    this.potatoScene = scene
    this.viewObjects = []

    this.scene.add.existing(this)

    if (containerParams.isShown === false) {
      this.setVisible(false)
    }
  }

  addChildViewObject(object: IdHolder & Destroyable) {
    this.viewObjects.push(object)
  }

  destroyChildByModelId(modelId: string) {
    const viewObject = removeFromArrayById(this.viewObjects, modelId)
    if (viewObject) {
      viewObject.destroy()
    } else {
      console.log(`Object ${modelId} not found`)
    }
  }
}
