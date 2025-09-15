import type { Country } from '../../enums/Countries.ts'
import { BaseUnit, type UnitBranch, UnitType } from './BaseUnit.ts'

export class AssaultUnit extends BaseUnit {
  // Assault units are offensive units that attack enemy positions
  public readonly frontId: string
  public morale: number = 80 // Morale affects combat performance (0-100)
  public momentum: number = 0 // Momentum bonus from consecutive victories

  constructor(
    country: Country,
    branch: UnitBranch,
    frontId: string,
    initialStrength: number,
    equipment: number,
  ) {
    super(country, UnitType.ASSAULT, branch, frontId, initialStrength, equipment)
    this.frontId = frontId

    // Assault units get better initial training and organization
    this.attributes.training = 75
    this.attributes.organization = 80
  }

  processTurn(): void {
    // Assault units consume more supplies due to active combat
    this.consumeSupplies(3)

    // Morale decays slowly if supplies are low
    if (this.attributes.supplies < 30) {
      this.morale = Math.max(0, this.morale - 5)
    }

    // Organization degrades faster in active combat zones
    if (this.attributes.organization > 50) {
      this.attributes.organization = Math.max(50, this.attributes.organization - 1)
    }

    // Momentum decays over time if not winning battles
    if (this.momentum > 0) {
      this.momentum = Math.max(0, this.momentum - 1)
    }

    // Training improves slowly even in combat
    if (this.attributes.training < 90) {
      this.train(0.3)
    }
  }

  // Calculate attack bonus for assault operations
  getAttackBonus(): number {
    // Assault units get bonuses when attacking
    const baseBonus = 1.3
    const moraleBonus = 1 + (this.morale / 100) * 0.4
    const momentumBonus = 1 + (this.momentum / 100) * 0.3
    const trainingBonus = 1 + (this.attributes.training / 100) * 0.2

    return baseBonus * moraleBonus * momentumBonus * trainingBonus
  }

  // Add momentum after a victory
  addVictoryMomentum(amount: number = 10) {
    this.momentum = Math.min(100, this.momentum + amount)
    // Victory also boosts morale
    this.morale = Math.min(100, this.morale + amount * 0.5)
  }

  // Lose morale after a defeat
  sufferDefeat(severity: number = 10) {
    this.morale = Math.max(0, this.morale - severity)
    this.momentum = Math.max(0, this.momentum - severity * 2)
    this.attributes.organization = Math.max(20, this.attributes.organization - severity)
  }
}
