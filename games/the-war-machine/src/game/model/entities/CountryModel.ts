import type { Country } from '../enums/Countries.ts'
import type { BranchCapabilities, CountryAttributeData } from '../enums/CountryAttributes.ts'
import type { AssaultUnit } from './units/AssaultUnit.ts'
import type { RegularUnit } from './units/RegularUnit.ts'

export class CountryModel {
  public readonly id: string
  public readonly country: Country
  public readonly name: string

  // Dynamic state that can change during the game
  public militaryBudget: number
  public corruption: number
  public regime: string
  public politicalStance: string
  public militaryStrength: BranchCapabilities
  public industrialProduction: BranchCapabilities
  public industrialTech: BranchCapabilities
  public visibility: number
  public standards: number

  // War-related state
  public isAtWar: boolean = false
  public warsWith: Set<Country> = new Set()
  public isAttacking: Set<Country> = new Set() // Countries we are attacking
  public isDefending: Set<Country> = new Set() // Countries that are attacking us

  // Military units
  public regularUnits: RegularUnit[] = []
  public assaultUnits: AssaultUnit[] = []
  // Map of assault units organized by target country for easier lookup
  public assaultUnitsByTarget: Map<Country, AssaultUnit[]> = new Map()

  constructor(country: Country, initialAttributes: CountryAttributeData) {
    this.id = `country-${country}`
    this.country = country
    this.name = country

    // Initialize from starting attributes
    this.militaryBudget = initialAttributes.budget
    this.corruption = initialAttributes.corruption
    this.regime = initialAttributes.regime
    this.politicalStance = initialAttributes.politicalStance
    this.militaryStrength = { ...initialAttributes.militaryStrength }
    this.industrialProduction = { ...initialAttributes.industrialProduction }
    this.industrialTech = { ...initialAttributes.industrialTech }
    this.visibility = initialAttributes.visibility
    this.standards = initialAttributes.standards
  }

  declareWarOn(country: Country, asAggressor: boolean = true) {
    if (!this.warsWith.has(country)) {
      this.warsWith.add(country)
      this.isAtWar = true

      // Track whether we're attacking or defending
      if (asAggressor) {
        this.isAttacking.add(country)
      } else {
        this.isDefending.add(country)
      }
    }
  }

  endWarWith(country: Country) {
    if (this.warsWith.delete(country)) {
      this.isAtWar = this.warsWith.size > 0

      // Remove from attacking/defending sets
      this.isAttacking.delete(country)
      this.isDefending.delete(country)
    }
  }

  getMilitaryPower(): number {
    const avgStrength =
      (this.militaryStrength.army +
        this.militaryStrength.navy +
        this.militaryStrength.airforce +
        this.militaryStrength.specialForces +
        this.militaryStrength.drones) /
      5
    const avgProduction =
      (this.industrialProduction.army +
        this.industrialProduction.navy +
        this.industrialProduction.airforce +
        this.industrialProduction.specialForces +
        this.industrialProduction.drones) /
      5
    const avgTech =
      (this.industrialTech.army +
        this.industrialTech.navy +
        this.industrialTech.airforce +
        this.industrialTech.specialForces +
        this.industrialTech.drones) /
      5

    return this.militaryBudget * 2 + avgStrength * 1.5 + avgProduction + avgTech * 0.5
  }

  // Add regular unit to country's forces
  addRegularUnit(unit: RegularUnit) {
    this.regularUnits.push(unit)
  }

  // Add assault unit to country's forces
  addAssaultUnit(unit: AssaultUnit) {
    this.assaultUnits.push(unit)
  }

  /**
   * Add an assault unit targeting a specific country
   */
  addAssaultUnitForTarget(unit: AssaultUnit, targetCountry: Country) {
    // Add to general assault units list
    this.assaultUnits.push(unit)

    // Also organize by target
    if (!this.assaultUnitsByTarget.has(targetCountry)) {
      this.assaultUnitsByTarget.set(targetCountry, [])
    }
    this.assaultUnitsByTarget.get(targetCountry)!.push(unit)
  }

  /**
   * Get assault units targeting a specific country
   */
  getAssaultUnitsTargeting(targetCountry: Country): AssaultUnit[] {
    return this.assaultUnitsByTarget.get(targetCountry) || []
  }

  // Get total unit count
  getTotalUnitCount(): number {
    return this.regularUnits.length + this.assaultUnits.length
  }

  // Process all units for turn
  processUnitsTurn() {
    this.regularUnits.forEach((unit) => unit.processTurn())
    this.assaultUnits.forEach((unit) => unit.processTurn())
  }
}
