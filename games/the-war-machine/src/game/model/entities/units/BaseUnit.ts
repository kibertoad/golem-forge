import type { Country } from '../../enums/Countries.ts'

export enum UnitType {
  REGULAR = 'regular',
  ASSAULT = 'assault',
}

export enum UnitBranch {
  ARMY = 'army',
  NAVY = 'navy',
  AIRFORCE = 'airforce',
  SPECIAL_FORCES = 'specialForces',
  DRONES = 'drones',
}

export interface UnitAttributes {
  supplies: number // 0-100: How well supplied (food, ammo, medicine)
  organization: number // 0-100: Quality of command and discipline
  training: number // 0-100: Training level
}

export abstract class BaseUnit {
  public readonly id: string
  public readonly country: Country
  public readonly type: UnitType
  public readonly branch: UnitBranch

  // Combat attributes
  public strength: number // Current strength (0-100% of max)
  public maxStrength: number // Maximum strength based on initial spawn
  public equipment: number // Equipment quality (1-5, based on industrial tech)

  // Unit attributes
  public attributes: UnitAttributes

  // Location
  public location: string // City or front line identifier

  constructor(
    country: Country,
    type: UnitType,
    branch: UnitBranch,
    location: string,
    initialStrength: number,
    equipment: number,
  ) {
    this.id = `${country}-${type}-${branch}-${Date.now()}-${Math.random()}`
    this.country = country
    this.type = type
    this.branch = branch
    this.location = location
    this.maxStrength = initialStrength
    this.strength = initialStrength
    this.equipment = equipment

    // Initialize attributes with default values
    this.attributes = {
      supplies: 80, // Start with good supplies
      organization: 70, // Decent organization
      training: 60, // Basic training
    }
  }

  // Calculate combat effectiveness (0-100)
  getCombatEffectiveness(): number {
    const strengthFactor = this.strength / this.maxStrength
    const equipmentFactor = this.equipment / 5
    const suppliesFactor = this.attributes.supplies / 100
    const organizationFactor = this.attributes.organization / 100
    const trainingFactor = this.attributes.training / 100

    // Weighted average of all factors
    const effectiveness =
      strengthFactor * 0.3 +
      equipmentFactor * 0.25 +
      suppliesFactor * 0.15 +
      organizationFactor * 0.15 +
      trainingFactor * 0.15

    return Math.round(effectiveness * 100)
  }

  // Calculate unit efficiency with more detailed breakdown
  getUnitEfficiency(): {
    overall: number
    combat: number
    operational: number
    logistical: number
    breakdown: {
      strength: number
      equipment: number
      supplies: number
      organization: number
      training: number
    }
  } {
    // Individual factors (0-1 scale)
    const strengthFactor = this.strength / this.maxStrength
    const equipmentFactor = this.equipment / 5
    const suppliesFactor = this.attributes.supplies / 100
    const organizationFactor = this.attributes.organization / 100
    const trainingFactor = this.attributes.training / 100

    // Combat efficiency: strength, equipment, training
    const combatEfficiency =
      (strengthFactor * 0.4 + equipmentFactor * 0.35 + trainingFactor * 0.25) * 100

    // Operational efficiency: organization, training
    const operationalEfficiency = (organizationFactor * 0.6 + trainingFactor * 0.4) * 100

    // Logistical efficiency: supplies, organization
    const logisticalEfficiency = (suppliesFactor * 0.7 + organizationFactor * 0.3) * 100

    // Overall efficiency
    const overallEfficiency =
      combatEfficiency * 0.5 + operationalEfficiency * 0.3 + logisticalEfficiency * 0.2

    return {
      overall: Math.round(overallEfficiency),
      combat: Math.round(combatEfficiency),
      operational: Math.round(operationalEfficiency),
      logistical: Math.round(logisticalEfficiency),
      breakdown: {
        strength: Math.round(strengthFactor * 100),
        equipment: Math.round(equipmentFactor * 100),
        supplies: Math.round(suppliesFactor * 100),
        organization: Math.round(organizationFactor * 100),
        training: Math.round(trainingFactor * 100),
      },
    }
  }

  // Take damage in combat
  takeDamage(damage: number) {
    this.strength = Math.max(0, this.strength - damage)
    // Damage also affects organization
    this.attributes.organization = Math.max(0, this.attributes.organization - damage * 0.5)
  }

  // Consume supplies each turn
  consumeSupplies(amount: number = 2) {
    this.attributes.supplies = Math.max(0, this.attributes.supplies - amount)
  }

  // Resupply the unit
  resupply(amount: number) {
    this.attributes.supplies = Math.min(100, this.attributes.supplies + amount)
  }

  // Improve training over time
  train(amount: number = 1) {
    this.attributes.training = Math.min(100, this.attributes.training + amount)
  }

  // Reorganize to improve organization
  reorganize(amount: number = 5) {
    this.attributes.organization = Math.min(100, this.attributes.organization + amount)
  }

  abstract processTurn(): void
}
