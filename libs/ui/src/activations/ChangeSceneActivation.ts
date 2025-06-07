import type { Activation, ActivationCallback } from '@potato-golem/core'
import type { Scene } from 'phaser'

export class ChangeSceneActivation implements Activation {
  readonly #newScene: Scene | string
  readonly #currentScene: Scene

  private constructor(currentScene: Scene, newScene: Scene | string) {
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
