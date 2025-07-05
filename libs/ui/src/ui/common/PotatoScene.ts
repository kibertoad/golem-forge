import { removeFromArrayById } from '@potato-golem/core'
import type { Destroyable, IdHolder } from '@potato-golem/core'
import { Scene } from 'phaser'
import type * as Phaser from 'phaser'
import type { ViewParent } from './CommonUITypes.ts'

export class PotatoScene extends Scene {
  rexUI!: any

  /**
   * Stores all parent views of the scene (which may have smaller views of their own)
   */
  protected readonly viewParents: ViewParent[]

  protected readonly viewObjects: Array<IdHolder & Destroyable>

  constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config)

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
