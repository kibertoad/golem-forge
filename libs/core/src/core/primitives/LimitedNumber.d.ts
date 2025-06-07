/**
 * Numeric value that can have a max limit and optionally negativity constraint
 */
export declare class LimitedNumber {
  value: number
  maxValue: number
  private canBeNegative
  constructor(value: number, maxValue: number, canBeNegative?: boolean)
  increase(delta: number): void
  decrease(delta: number): void
  setToMax(): void
  setValue(value: number): void
  setMaxValue(maxValue: number): void
  getPercentage(): number
  getMissing(): number
  isAtMax(): boolean
  isAtZero(): boolean
}
//# sourceMappingURL=LimitedNumber.d.ts.map
