import type { RegistryEntityId } from '../registries/registryUtils.ts'
import { LimitedNumber } from './LimitedNumber.ts'

export type StateValues<Registry extends Record<string, string>> = Record<
  RegistryEntityId<Registry>,
  LimitedNumber
>

/**
 * Tracks state changes and limits them to a certain amount
 *
 */
export class StateTracker<Registry extends Record<string, string>> {
  public readonly states: StateValues<Registry>

  constructor(
    stateRegistry: Registry,
    stateDefinitions: Record<RegistryEntityId<Registry>, { maxAmount: number }>,
  ) {
    this.states = {} as Record<RegistryEntityId<Registry>, LimitedNumber>
    for (const stateId of Object.values(stateRegistry)) {
      this.states[stateId] = new LimitedNumber(
        0,
        stateDefinitions[stateId].maxAmount,
        false,
        stateId,
      )
    }
  }

  applyDelta(stateDelta: Partial<Record<RegistryEntityId<Registry>, number>>) {
    for (const stateEntry of Object.entries(stateDelta)) {
      const [key, value] = stateEntry
      const currentValue = this.states[key] as LimitedNumber
      const _oldValue = currentValue.value

      currentValue.increase(value as number)
    }
  }
}
