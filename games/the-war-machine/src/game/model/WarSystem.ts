import type { Country } from './enums/Countries.ts'
import { StartingCountryAttributes, PoliticalStance } from './enums/CountryAttributes.ts'
import { CountryNeighbors } from './enums/CountryNeighbors.ts'

export interface War {
  aggressor: Country
  defender: Country
  startTurn: number
  active: boolean
}

export class WarSystem {
  private wars: War[] = []
  private countriesAtWar: Set<Country> = new Set()
  public onWarDeclared?: (aggressor: Country, defender: Country) => void

  public initializeWars() {
    // Find all expansionist countries
    const expansionists = Object.entries(StartingCountryAttributes)
      .filter(([_, attributes]) => attributes.politicalStance === PoliticalStance.EXPANSIONIST)
      .map(([country]) => country as Country)

    // For each expansionist, find a weaker neighbor to attack
    for (const aggressor of expansionists) {
      if (this.countriesAtWar.has(aggressor)) continue

      const target = this.findWeakerNeighbor(aggressor)
      if (target && !this.countriesAtWar.has(target)) {
        this.declareWar(aggressor, target, 0)
      }
    }
  }

  private findWeakerNeighbor(aggressor: Country): Country | null {
    const aggressorPower = this.calculateMilitaryPower(aggressor)

    // Get actual neighbors from the neighbor list
    const actualNeighbors = CountryNeighbors[aggressor] || []

    // Filter for weaker neighbors not already at war
    const validTargets = actualNeighbors.filter((neighbor) => {
      if (this.countriesAtWar.has(neighbor)) return false

      const neighborPower = this.calculateMilitaryPower(neighbor)
      return neighborPower < aggressorPower
    })

    // Pick a random weaker neighbor
    if (validTargets.length === 0) return null
    return validTargets[Math.floor(Math.random() * validTargets.length)]
  }

  private calculateMilitaryPower(country: Country): number {
    const attrs = StartingCountryAttributes[country]
    if (!attrs) return 0

    // Calculate power based on budget, industrial production, and tech
    const budget = attrs.budget
    const avgProduction =
      (attrs.industrialProduction.army +
        attrs.industrialProduction.navy +
        attrs.industrialProduction.airforce) /
      3
    const avgTech =
      (attrs.industrialTech.army + attrs.industrialTech.navy + attrs.industrialTech.airforce) / 3

    return budget * 2 + avgProduction + avgTech
  }

  declareWar(aggressor: Country, defender: Country, turn: number) {
    const war: War = {
      aggressor,
      defender,
      startTurn: turn,
      active: true,
    }

    this.wars.push(war)
    this.countriesAtWar.add(aggressor)
    this.countriesAtWar.add(defender)

    console.log(`WAR: ${aggressor} declares war on ${defender} (Turn ${turn})`)

    // Emit war declaration event
    if (this.onWarDeclared) {
      this.onWarDeclared(aggressor, defender)
    }
  }

  endWar(aggressor: Country, defender: Country) {
    const warIndex = this.wars.findIndex(
      (w) => w.active && w.aggressor === aggressor && w.defender === defender,
    )

    if (warIndex !== -1) {
      this.wars[warIndex].active = false
      this.countriesAtWar.delete(aggressor)
      this.countriesAtWar.delete(defender)
    }
  }

  isAtWar(country: Country): boolean {
    return this.countriesAtWar.has(country)
  }

  getWarsForCountry(country: Country): War[] {
    return this.wars.filter((w) => w.active && (w.aggressor === country || w.defender === country))
  }

  getActiveWars(): War[] {
    return this.wars.filter((w) => w.active)
  }

  getAllWars(): War[] {
    return [...this.wars]
  }
}
