import type { ValueHolder } from './CommonPrimitives.js'

/**
 *  Holds and applies computation effects
 */
export class ComputationContext {
  public currentCeiling: number
  public currentFloor: number
  public currentValue: number
  public currentValueBoost: number // 0.2 means 20% boost
  public currentValueCapMin: number
  public currentValueCapMax: number

  constructor() {
    this.currentCeiling = 100
    this.currentFloor = 0
    this.currentValue = 0
    this.currentValueBoost = 0
    this.currentValueCapMin = 0
    this.currentValueCapMax = 100
  }

  calculateOutput(): number {
    if (this.currentValueCapMax < this.currentValueCapMin) {
      throw new Error(
        `Invalid caps: max ${this.currentValueCapMax} < min ${this.currentValueCapMin}`,
      )
    }

    // 1. Enforce the floor/ceiling
    let value = this.currentValue
    value = Math.max(this.currentFloor, Math.min(value, this.currentCeiling))

    // 2. Apply value boost (could be negative)
    value = value * (1 + this.currentValueBoost)

    // 3. Enforce caps (lowest max, highest min wins)
    value = Math.max(this.currentValueCapMin, Math.min(value, this.currentValueCapMax))

    return value
  }
}

export type InputValueExtractor<SourceModel> = (source: SourceModel) => ValueHolder

/**
 * Describes input factors that rely on a single input value
 */
export class SingleInputFactor<SourceModel> {
  private readonly tiers: readonly SingleInputFactorTier[]
  private readonly extractor: InputValueExtractor<SourceModel>
  public valueSourceType: string

  constructor(
    tiers: readonly SingleInputFactorTier[],
    valueExtractor: InputValueExtractor<SourceModel>,
    valueSourceType: string,
  ) {
    this.tiers = tiers
    this.extractor = valueExtractor
    this.valueSourceType = valueSourceType
  }

  resolveApplicableTiers(inputSource: SourceModel): readonly SingleInputFactorTier[] {
    const { value } = this.extractor(inputSource)
    return this.tiers.filter((tier) => {
      return value >= tier.atValueMin && value <= tier.atValueMax
    })
  }
}

export type SingleInputFactorTier = {
  atValueMin: number // when equals this value or above
  atValueMax: number // when equals this value or below

  effects: readonly FactorImpact[]
}

export type FactorImpact = {
  type: FactorImpactType
  value: number
}

export type FactorImpactType =
  | 'raiseCeiling' // increases max value of output
  | 'lowerFloor' // increases min value of output
  | 'raiseValue'
  | 'lowerValue'
  | 'raiseValueBoost' // fraction increase of the value. only applied after all boosts are summed. 0.2 means 20% increase
  | 'lowerValueBoost' // fraction decrease of the value. only applied after all boosts are summed. can add up to a negative value

  // if there are two conflicting caps, lowest max and highest min wins
  | 'capValueMin' // forces value not to go lower than this value
  | 'capValueMax' // forces values not to go higher that this value

export class Computable<SourceModelTypes extends string, SourceModels = any> {
  public currentValue: number
  private readonly inputFactors: readonly SingleInputFactor<SourceModels>[]

  constructor(inputFactors: readonly SingleInputFactor<SourceModels>[]) {
    this.inputFactors = inputFactors
    this.currentValue = 0
  }

  compute(sourceModels: Record<SourceModelTypes, SourceModels>): void {
    const context = new ComputationContext()

    // For each input factor, apply tier effects
    for (const factor of this.inputFactors) {
      const inputSource = sourceModels[factor.valueSourceType]
      if (!inputSource) {
        throw new Error(`Input source ${factor.valueSourceType} not found`)
      }
      const relevantTiers = factor.resolveApplicableTiers(inputSource)
      for (const tier of relevantTiers) {
        for (const effect of tier.effects) {
          switch (effect.type) {
            case 'raiseCeiling':
              context.currentCeiling += effect.value
              break
            case 'lowerFloor':
              context.currentFloor += effect.value
              break
            case 'raiseValue':
              context.currentValue += effect.value
              break
            case 'lowerValue':
              context.currentValue -= effect.value
              break
            case 'raiseValueBoost':
              context.currentValueBoost += effect.value
              break
            case 'lowerValueBoost':
              context.currentValueBoost -= effect.value
              break
            case 'capValueMin':
              context.currentValueCapMin = Math.max(context.currentValueCapMin, effect.value)
              break
            case 'capValueMax':
              context.currentValueCapMax = Math.min(context.currentValueCapMax, effect.value)
              break
          }
        }
      }
    }

    this.currentValue = context.calculateOutput()
  }
}
