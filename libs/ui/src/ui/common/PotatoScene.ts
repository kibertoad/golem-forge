import { type GlobalSceneEvents, removeFromArrayById } from '@potato-golem/core'
import type { Destroyable, IdHolder } from '@potato-golem/core'
import type { EventEmitter } from 'emitix'
import { Scene } from 'phaser'
import type * as Phaser from 'phaser'
import type { ViewParent } from './CommonUITypes.ts'

export class PotatoScene extends Scene {
  rexUI!: any
  protected readonly globalSceneEventBus: EventEmitter<GlobalSceneEvents>

  /**
   * Stores all parent views of the scene (which may have smaller views of their own)
   */
  protected readonly viewParents: ViewParent[]

  protected readonly viewObjects: Array<IdHolder & Destroyable>

  constructor(
    globalSceneEmitter: EventEmitter<GlobalSceneEvents>,
    config?: string | Phaser.Types.Scenes.SettingsConfig,
  ) {
    super(config)

    this.globalSceneEventBus = globalSceneEmitter
    this.viewParents = []
    this.viewObjects = []
  }

  init() {
    console.log(`Init scene ${this.scene.key}`)
    this.globalSceneEventBus.on('CHANGE_SCENE', (targetStateId) => {
      console.log(`Trying to change state to ${targetStateId} from ${this.scene.key}`)
      if (this.scene.isActive() && this.scene.key !== targetStateId) {
        console.log(`Changing state to ${targetStateId} from ${this.scene.key}`)
        this.scene.start(targetStateId)
      }
    })
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
