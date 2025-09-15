import { Country } from '../enums/Countries.ts'
import type { CountryAttributeData } from '../enums/CountryAttributes.ts'

export class CountryModel {
  public readonly id: string
  public readonly country: Country
  public readonly name: string

  // Dynamic state that can change during the game
  public militaryBudget: number
  public corruption: number
  public regime: string
  public politicalStance: string
  public industrialProduction: {
    army: number
    navy: number
    airforce: number
  }
  public industrialTech: {
    army: number
    navy: number
    airforce: number
  }
  public visibility: number
  public standards: number

  // War-related state
  public isAtWar: boolean = false
  public warsWith: Country[] = []

  constructor(country: Country, initialAttributes: CountryAttributeData) {
    this.id = `country-${country}`
    this.country = country
    this.name = country

    // Initialize from starting attributes
    this.militaryBudget = initialAttributes.budget
    this.corruption = initialAttributes.corruption
    this.regime = initialAttributes.regime
    this.politicalStance = initialAttributes.politicalStance
    this.industrialProduction = { ...initialAttributes.industrialProduction }
    this.industrialTech = { ...initialAttributes.industrialTech }
    this.visibility = initialAttributes.visibility
    this.standards = initialAttributes.standards
  }

  declareWarOn(country: Country) {
    if (!this.warsWith.includes(country)) {
      this.warsWith.push(country)
      this.isAtWar = true
    }
  }

  endWarWith(country: Country) {
    const index = this.warsWith.indexOf(country)
    if (index !== -1) {
      this.warsWith.splice(index, 1)
      this.isAtWar = this.warsWith.length > 0
    }
  }

  getMilitaryPower(): number {
    const avgProduction =
      (this.industrialProduction.army +
       this.industrialProduction.navy +
       this.industrialProduction.airforce) / 3
    const avgTech =
      (this.industrialTech.army +
       this.industrialTech.navy +
       this.industrialTech.airforce) / 3

    return this.militaryBudget * 2 + avgProduction + avgTech
  }
}