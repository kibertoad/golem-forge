import type { Country } from '../../enums/Countries.ts'
import { BaseUnit, type UnitBranch, UnitType } from './BaseUnit.ts'

export class RegularUnit extends BaseUnit {
  // Regular units are garrison units that defend cities
  public readonly cityId: string
  private recoveryRate: number = 2 // Strength recovery per turn when not in combat

  constructor(
    country: Country,
    branch: UnitBranch,
    cityId: string,
    initialStrength: number,
    equipment: number,
  ) {
    super(country, UnitType.REGULAR, branch, cityId, initialStrength, equipment)
    this.cityId = cityId
  }

  processTurn(): void {
    // Regular units slowly recover strength when garrisoned
    if (this.strength < this.maxStrength && this.attributes.supplies > 50) {
      // Recovery rate depends on supplies and organization
      const suppliesModifier = this.attributes.supplies / 100
      const organizationModifier = this.attributes.organization / 100
      const actualRecovery = this.recoveryRate * suppliesModifier * organizationModifier

      this.strength = Math.min(this.maxStrength, this.strength + actualRecovery)
    }

    // Consume supplies (lower rate for garrison units)
    this.consumeSupplies(1)

    // Slowly improve organization when not in combat
    if (this.attributes.organization < 100) {
      this.reorganize(2)
    }

    // Regular training improves over time
    if (this.attributes.training < 80) {
      this.train(0.5)
    }
  }

  // Calculate defense bonus when defending home city
  getDefenseBonus(): number {
    // Regular units get significant bonuses when defending
    const baseBonus = 1.5
    const trainingBonus = 1 + (this.attributes.training / 100) * 0.3
    const organizationBonus = 1 + (this.attributes.organization / 100) * 0.2

    return baseBonus * trainingBonus * organizationBonus
  }
}
