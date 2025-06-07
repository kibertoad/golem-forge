import * as Phaser from 'phaser'
import Container = Phaser.GameObjects.Container
import {
  type COMMON_EVENT_TYPES,
  type Destroyable,
  type EventSink,
  type EventSource,
  type IdHolder,
  removeFromArrayById,
} from '@potato-golem/core'
import EventEmitter = Phaser.Events.EventEmitter
import type { PotatoScene } from './PotatoScene.ts'

export type CommmonContainerParams = {
  isShown?: boolean // default is true
}

export abstract class PotatoContainer<
  SupportedEvents extends string = COMMON_EVENT_TYPES,
  ContainerParams extends CommmonContainerParams = CommmonContainerParams,
> extends Container {
  protected readonly potatoScene: PotatoScene
  protected readonly viewObjects: Array<IdHolder & Destroyable>

  protected readonly eventBus: EventSink<SupportedEvents> & EventSource<SupportedEvents>

  constructor(scene: PotatoScene, containerParams: ContainerParams) {
    super(scene)
    this.potatoScene = scene
    this.viewObjects = []
    this.eventBus = new EventEmitter()

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
