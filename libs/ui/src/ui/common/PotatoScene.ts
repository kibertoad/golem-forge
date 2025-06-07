import { Scene } from 'phaser'
import * as Phaser from 'phaser'
import type { ViewParent } from './CommonUITypes.ts'
import EventEmitter = Phaser.Events.EventEmitter
import {
  type COMMON_EVENT_TYPES,
  type EventSink,
  type EventSource,
  removeFromArrayById,
} from '@potato-golem/core'
import type { Destroyable, IdHolder } from '@potato-golem/core'

export class PotatoScene<SupportedEvents extends string = COMMON_EVENT_TYPES> extends Scene {
  rexUI!: any

  /**
   * Stores all parent views of the scene (which may have smaller views of their own)
   */
  protected readonly viewParents: ViewParent[]

  protected readonly viewObjects: Array<IdHolder & Destroyable>

  protected readonly eventBus: EventSink<SupportedEvents> & EventSource<SupportedEvents>

  constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config)

    this.eventBus = new EventEmitter()

    this.viewParents = []
    this.viewObjects = []
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
