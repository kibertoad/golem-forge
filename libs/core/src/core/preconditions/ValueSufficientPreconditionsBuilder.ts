import type { LimitedNumber } from '../primitives/LimitedNumber.ts'
import { ValueSufficientPrecondition } from './ValueSufficientPrecondition.ts'

type Params = { trackedValue: LimitedNumber; targetValue: number; relatedEntityId?: string }

export function buildValueSufficientPreconditions(params: Params[]) {
  return params.map(
    (entry) =>
      new ValueSufficientPrecondition(entry.trackedValue, entry.targetValue, entry.relatedEntityId),
  )
}
