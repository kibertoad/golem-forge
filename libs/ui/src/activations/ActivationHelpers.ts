import type { ActivationCallback } from '@potato-golem/core'
import * as Phaser from 'phaser'
import type { ViewListener } from '../ui/state/StateUIManager.ts'

export function addOnClickActivation(
  onClickListener: ViewListener,
  activation: ActivationCallback,
) {
  onClickListener.on(Phaser.Input.Events.POINTER_DOWN, () => {
    activation()
  })
}
