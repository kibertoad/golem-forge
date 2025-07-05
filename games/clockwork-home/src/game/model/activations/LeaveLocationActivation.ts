import type { Activation } from '@potato-golem/core'
import { choicesViewEventBus } from '../../registries/eventEmitterRegistry.ts'
import { worldModel } from '../entities/WorldModel.ts'

export class LeaveLocationActivation implements Activation {
  activate(): void {
    console.log('Left location')
    worldModel.setLocation(undefined)
    choicesViewEventBus.emit('REFRESH')
  }
}
