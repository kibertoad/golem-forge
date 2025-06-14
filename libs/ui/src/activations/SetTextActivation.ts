import type { Activation, ActivationCallback } from '@potato-golem/core'
import type { GameObjects } from 'phaser'
import { validateNotNil } from 'validation-utils'
import type { UIContainer } from '../ui/elements/UIContainer.ts'

export class SetTextActivation implements Activation {
  private newText: string
  private targetObject: UIContainer<GameObjects.Text>

  private constructor(targetObject: UIContainer<GameObjects.Text>, newText: string) {
    this.targetObject = targetObject
    this.newText = newText
  }

  activate() {
    this.targetObject.value.text = this.newText
  }

  public static build(
    targetObject: UIContainer<GameObjects.Text>,
    newText: string,
  ): ActivationCallback {
    validateNotNil(targetObject, 'targetObject cannot be null')
    const activation = new SetTextActivation(targetObject, newText)
    return () => {
      activation.activate()
    }
  }
}
