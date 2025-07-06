import type { StateHolder } from '../../state/State.js'
import type { Activation } from './Activation.js'

export class MainStateActivation<MainStates extends string> implements Activation {
  private readonly targetState: MainStates
  private readonly worldModel: StateHolder<string, MainStates>

  constructor(worldModel: StateHolder<string, MainStates>, targetState: MainStates) {
    this.targetState = targetState
    this.worldModel = worldModel
  }

  activate(): void {
    this.worldModel.state.mainState = this.targetState
  }
}
