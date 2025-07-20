// Computable.spec.ts

import { describe, expect, it } from 'vitest'
import {
  Computable,
  ComputationContext,
  type FactorImpact,
  SingleInputFactor,
} from './Computable.ts'

// Minimal ValueHolder mock
type ValueHolder = { value: number }
type User = { name: string; age: number }

// Factory for creating factors using User as the source model
const makeUserFactor = (
  min: number,
  max: number,
  effects: readonly FactorImpact[],
  valueSourceType = 'user',
) =>
  new SingleInputFactor<User>(
    [{ atValueMin: min, atValueMax: max, effects }],
    // Use age as the value
    (u: User) => ({ value: u.age }),
    valueSourceType,
  )

describe('ComputationContext', () => {
  it('enforces floor and ceiling', () => {
    const ctx = new ComputationContext()
    ctx.currentFloor = 10
    ctx.currentCeiling = 20

    ctx.currentValue = 5
    expect(ctx.calculateOutput()).toBe(10)

    ctx.currentValue = 25
    expect(ctx.calculateOutput()).toBe(20)

    ctx.currentValue = 15
    expect(ctx.calculateOutput()).toBe(15)
  })

  it('applies value boost and caps', () => {
    const ctx = new ComputationContext()
    ctx.currentValue = 50
    ctx.currentValueBoost = 0.2 // 20% boost
    expect(ctx.calculateOutput()).toBe(60)
  })

  it('applies caps', () => {
    const ctx = new ComputationContext()
    ctx.currentValue = 50

    ctx.currentValueCapMin = 70
    expect(ctx.calculateOutput()).toBe(70)

    ctx.currentValueCapMin = 30
    ctx.currentValueCapMax = 40
    expect(ctx.calculateOutput()).toBe(40)

    ctx.currentValueCapMax = 50
    ctx.currentValueCapMin = 70
    expect(() => ctx.calculateOutput()).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid caps: max 50 < min 70]`,
    )
  })

  it('applies boost and caps in order', () => {
    const ctx = new ComputationContext()
    ctx.currentValue = 50
    ctx.currentValueBoost = 1 // 100% boost
    ctx.currentValueCapMin = 40
    ctx.currentValueCapMax = 80
    expect(ctx.calculateOutput()).toBe(80)
  })
})

describe('Computable', () => {
  it('applies raiseValue and value boosts from factors', () => {
    const factor = makeUserFactor(0, 100, [
      { type: 'raiseValue', value: 10 },
      { type: 'raiseValueBoost', value: 0.5 },
    ])
    const computable = new Computable<'user', User>([factor])
    computable.compute({ user: { name: 'Alice', age: 10 } })
    // 0 + 10, then 50% boost => 10 * 1.5 = 15
    expect(computable.currentValue).toBe(15)
  })

  it('enforces capValueMin and capValueMax effects', () => {
    const factor = makeUserFactor(0, 100, [
      { type: 'raiseValue', value: 10 },
      { type: 'capValueMin', value: 12 },
      { type: 'capValueMax', value: 13 },
    ])
    const computable = new Computable<'user', User>([factor])
    computable.compute({ user: { name: 'Bob', age: 42 } })
    // value after raiseValue is 10, then cap min/max clamps to 12
    expect(computable.currentValue).toBe(12)
  })

  it('throws error if source missing', () => {
    const factor = makeUserFactor(0, 100, [])
    const computable = new Computable<'user', User>([factor])
    expect(() => computable.compute({} as any)).toThrow()
  })

  it('combines multiple factors additively', () => {
    // Factor 1: raises value by 10 for age 0-100
    const factor1 = makeUserFactor(0, 100, [{ type: 'raiseValue', value: 10 }])
    // Factor 2: raises value by 5 for age 0-100
    const factor2 = makeUserFactor(0, 100, [{ type: 'raiseValue', value: 5 }])
    const computable = new Computable<'user', User>([factor1, factor2])
    computable.compute({ user: { name: 'Carol', age: 50 } })
    // 0 + 10 + 5 = 15
    expect(computable.currentValue).toBe(15)
  })

  it('applies multiple boosts cumulatively', () => {
    // Factor 1: raise value by 20, then boost by 50%
    const factor1 = makeUserFactor(0, 100, [
      { type: 'raiseValue', value: 20 },
      { type: 'raiseValueBoost', value: 0.5 },
    ])
    // Factor 2: another 20% boost
    const factor2 = makeUserFactor(0, 100, [{ type: 'raiseValueBoost', value: 0.2 }])
    const computable = new Computable<'user', User>([factor1, factor2])
    computable.compute({ user: { name: 'Dan', age: 20 } })
    // currentValue: 0 + 20
    // total boost: 0.5 + 0.2 = 0.7 (i.e. +70%)
    // result: 20 * 1.7 = 34
    expect(computable.currentValue).toBe(34)
  })

  it('applies multiple caps and picks highest min/lowest max', () => {
    // Factor 1: raiseValue 5, capMin 8
    const factor1 = makeUserFactor(0, 100, [
      { type: 'raiseValue', value: 5 },
      { type: 'capValueMin', value: 8 },
    ])
    // Factor 2: capMin 12, capMax 14
    const factor2 = makeUserFactor(0, 100, [
      { type: 'capValueMin', value: 12 },
      { type: 'capValueMax', value: 14 },
    ])
    const computable = new Computable<'user', User>([factor1, factor2])
    computable.compute({ user: { name: 'Eve', age: 33 } })
    // Raise value to 5, then min cap is Math.max(8, 12) = 12, max cap is 14
    // result: 12 (capped up to min)
    expect(computable.currentValue).toBe(12)
  })

  it('applies boost and cap with multiple factors', () => {
    // Factor 1: raiseValue 10, boost 100%
    const factor1 = makeUserFactor(0, 100, [
      { type: 'raiseValue', value: 10 },
      { type: 'raiseValueBoost', value: 1 },
    ])
    // Factor 2: capMax 15
    const factor2 = makeUserFactor(0, 100, [{ type: 'capValueMax', value: 15 }])
    const computable = new Computable<'user', User>([factor1, factor2])
    computable.compute({ user: { name: 'Frank', age: 22 } })
    // 0 + 10 = 10, then *2 = 20, cap max = 15, so result is 15
    expect(computable.currentValue).toBe(15)
  })

  it('handles negative boosts and lowerValue', () => {
    // Factor 1: raiseValue 20, lowerValue 5
    const factor1 = makeUserFactor(0, 100, [
      { type: 'raiseValue', value: 20 },
      { type: 'lowerValue', value: 5 },
    ])
    // Factor 2: lowerValueBoost by 0.25 (-25%)
    const factor2 = makeUserFactor(0, 100, [{ type: 'lowerValueBoost', value: 0.25 }])
    const computable = new Computable<'user', User>([factor1, factor2])
    computable.compute({ user: { name: 'Grace', age: 70 } })
    // value: 0 + 20 - 5 = 15, total boost: -0.25, 15 * 0.75 = 11.25
    expect(computable.currentValue).toBe(11.25)
  })

  it('applies effects from the correct tier based on user.age', () => {
    // Factor has two tiers: 0-30 and 31-100
    const factor = new SingleInputFactor<User>(
      [
        {
          atValueMin: 0,
          atValueMax: 30,
          effects: [{ type: 'raiseValue', value: 10 }],
        },
        {
          atValueMin: 31,
          atValueMax: 100,
          effects: [{ type: 'raiseValue', value: 20 }],
        },
      ],
      (u: User) => ({ value: u.age }),
      'user',
    )
    const computable = new Computable<'user', User>([factor])

    // Should apply first tier for age 25
    computable.compute({ user: { name: 'Young', age: 25 } })
    expect(computable.currentValue).toBe(10)

    // Should apply second tier for age 40
    computable.compute({ user: { name: 'Old', age: 40 } })
    expect(computable.currentValue).toBe(20)
  })
})
