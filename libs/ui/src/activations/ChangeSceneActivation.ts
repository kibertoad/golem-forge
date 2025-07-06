import type { Activation, ActivationCallback } from '@potato-golem/core'
import type { Scene } from 'phaser'

export class ChangeSceneActivation<Scenes extends string = string> implements Activation {
  readonly #newScene: Scene | Scenes
  readonly #currentScene: Scene

  private constructor(currentScene: Scene, newScene: Scene | Scenes) {
    this.#currentScene = currentScene
    this.#newScene = newScene
  }

  activate() {
    this.#currentScene.scene.start(this.#newScene)
  }

  public static build(currentScene: Scene, newScene: Scene | string): ActivationCallback {
    const activation = new ChangeSceneActivation(currentScene, newScene)
    return () => {
      activation.activate()
    }
  }
}
