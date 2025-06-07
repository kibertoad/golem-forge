/**
 * Holds state flags (true/false per key) and current main state identifier (e. g. "active", "destrpyed" etc)
 */
export type State<StateFlags extends string, MainStates extends string = ''> = {
  stateFlags: Record<StateFlags, boolean>
  mainState: MainStates
}

export interface StateHolder<StateFlags extends string, MainStates extends string = ''> {
  state: State<StateFlags, MainStates>
}
