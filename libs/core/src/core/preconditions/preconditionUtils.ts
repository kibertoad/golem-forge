import type { Precondition } from './Precondition.ts'

export function allConditionsPass(preconditions?: Precondition[]): boolean {
  if (!preconditions) {
    return true
  }
  return preconditions.every((entry) => entry.isSatisfied())
}
