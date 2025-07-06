import type { Activation, ActivationCallback } from '@potato-golem/core'
import type { EventEmitter } from 'emitix'
import type { Scene } from 'phaser'

export class ChangeSceneActivation2<Scenes extends string = string> implements Activation {
  readonly newScene: Scene | Scenes
  private eventEmitter: EventEmitter

  public constructor(globalSceneEventEmitter: EventEmitter, newScene: Scene | Scenes) {
    this.newScene = newScene
    this.eventEmitter = globalSceneEventEmitter
  }

  activate() {
    console.log(`Emitting event CHANGE_SCENE to ${this.newScene}`)
    this.eventEmitter.emit(
      'CHANGE_SCENE',
      typeof this.newScene === 'string' ? this.newScene : this.newScene.scene.key,
    )
  }

  public static build(
    globalSceneEventEmitter: EventEmitter,
    newScene: Scene | string,
  ): ActivationCallback {
    const activation = new ChangeSceneActivation2(globalSceneEventEmitter, newScene)
    return () => {
      activation.activate()
    }
  }
}
