import type { ValueHolder } from './CommonPrimitives.js'

/**
 * Numeric value that can have a max limit and optionally a negativity constraint
 */
export class LimitedNumber implements ValueHolder {
  public value: number
  public maxValue: number
  public referenceId?: string // allows to identify what the number is pointing at
  private canBeNegative: boolean

  constructor(value: number, maxValue: number, canBeNegative?: boolean, referenceId?: string) {
    this.value = value
    this.maxValue = maxValue
    this.canBeNegative = canBeNegative ?? true
    this.referenceId = referenceId
  }

    /**
     * Increases the value by delta, but does not exceed the max value
     * @param delta
     */
  increase(delta: number) {
    this.value = Math.min(this.value + delta, this.maxValue)
  }

    /**
     * Decreases the value by delta, but does not go below zero if canBeNegative is false
     * @param delta
     */
  decrease(delta: number) {
    this.value -= delta
    if (!this.canBeNegative && this.value < 0) {
      this.value = 0
    }
  }

    /**
     * Sets the value to the max value
     */
  setToMax() {
    this.value = this.maxValue
  }

    /**
     * Sets the value to the given value, but does not exceed the max value
     * @param value
     */
  setValue(value: number) {
    this.value = Math.min(value, this.maxValue)
  }

    /**
     * Sets the max value, adjusts current value if it goes below the new max value
     * @param maxValue
     */
  setMaxValue(maxValue: number) {
    this.maxValue = maxValue
    this.value = Math.min(this.value, this.maxValue)
  }

    /**
     * Returns the percentage of the value compared to the max value
     * @returns
     */
  getPercentage() {
    return (this.value / this.maxValue) * 100
  }

    /**
     * Returns the amount of missing value to reach the max value
     */
  getMissing() {
    return this.maxValue - this.value
  }

    /**
     * Returns true if the value is at the max value
     */
  isAtMax() {
    return this.maxValue === this.value
  }

    /**
     * Returns true if the value is at zero
     */
  isAtZero() {
    return this.value === 0
  }
}
