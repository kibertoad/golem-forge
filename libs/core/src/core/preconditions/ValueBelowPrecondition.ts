import type { LimitedNumber } from '../primitives/LimitedNumber.ts'
import { PreconditionWithMetadata } from './PreconditionWithMetadata.ts'

export class ValueBelowPrecondition extends PreconditionWithMetadata {
  private readonly trackedValue: LimitedNumber
  private readonly targetValue: number

  constructor(trackedValue: LimitedNumber, targetValue: number, relatedEntityId: string) {
    super({
      relatedEntityId,
    })
    this.trackedValue = trackedValue
    this.targetValue = targetValue
  }

  isSatisfied(): boolean {
    return this.trackedValue.value < this.targetValue
  }
}
