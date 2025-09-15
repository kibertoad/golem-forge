import { describe, expect, it } from 'vitest'
import type { Country } from './enums/Countries.ts'
import { StartingCountryAttributes, PoliticalStance } from './enums/CountryAttributes.ts'
import { WarSystem } from './WarSystem.ts'

describe('WarSystem', () => {
  it('should initialize wars for expansionist countries', () => {
    const warSystem = new WarSystem()
    warSystem.initializeWars()
    const activeWars = warSystem.getActiveWars()

    // Find all expansionist countries
    const expansionistCountries = Object.entries(StartingCountryAttributes)
      .filter(([_, attrs]) => attrs.politicalStance === PoliticalStance.EXPANSIONIST)
      .map(([country]) => country as Country)

    console.log('\n=== WAR SIMULATION RESULTS ===')
    console.log(`Expansionist countries: ${expansionistCountries.join(', ')}`)
    console.log(`Active wars: ${activeWars.length}`)

    // Each expansionist should have started at least one war (unless no valid targets)
    expect(activeWars.length).toBeGreaterThan(0)

    // Log all wars
    activeWars.forEach((war) => {
      const aggressorAttrs = StartingCountryAttributes[war.aggressor]
      const defenderAttrs = StartingCountryAttributes[war.defender]
      console.log(
        `\n${war.aggressor} (budget: ${aggressorAttrs.budget}) → ${war.defender} (budget: ${defenderAttrs.budget})`,
      )
    })

    // Verify no country is in multiple wars (our current implementation)
    const countriesInWars = new Set<Country>()
    activeWars.forEach((war) => {
      expect(countriesInWars.has(war.aggressor)).toBe(false)
      expect(countriesInWars.has(war.defender)).toBe(false)
      countriesInWars.add(war.aggressor)
      countriesInWars.add(war.defender)
    })
  })

  it('should only attack weaker neighbors', () => {
    const warSystem = new WarSystem()
    warSystem.initializeWars()
    const activeWars = warSystem.getActiveWars()

    activeWars.forEach((war) => {
      const aggressorAttrs = StartingCountryAttributes[war.aggressor]
      const defenderAttrs = StartingCountryAttributes[war.defender]

      // Calculate power as done in WarSystem
      const aggressorPower =
        aggressorAttrs.budget * 2 +
        (aggressorAttrs.industrialProduction.army +
          aggressorAttrs.industrialProduction.navy +
          aggressorAttrs.industrialProduction.airforce) /
          3 +
        (aggressorAttrs.industrialTech.army +
          aggressorAttrs.industrialTech.navy +
          aggressorAttrs.industrialTech.airforce) /
          3

      const defenderPower =
        defenderAttrs.budget * 2 +
        (defenderAttrs.industrialProduction.army +
          defenderAttrs.industrialProduction.navy +
          defenderAttrs.industrialProduction.airforce) /
          3 +
        (defenderAttrs.industrialTech.army +
          defenderAttrs.industrialTech.navy +
          defenderAttrs.industrialTech.airforce) /
          3

      // Aggressor should be stronger
      expect(aggressorPower).toBeGreaterThan(defenderPower)
    })
  })

  it('should track countries at war correctly', () => {
    const warSystem = new WarSystem()
    warSystem.initializeWars()
    const activeWars = warSystem.getActiveWars()

    activeWars.forEach((war) => {
      expect(warSystem.isAtWar(war.aggressor)).toBe(true)
      expect(warSystem.isAtWar(war.defender)).toBe(true)

      // Check that getWarsForCountry returns the correct war
      const aggressorWars = warSystem.getWarsForCountry(war.aggressor)
      const defenderWars = warSystem.getWarsForCountry(war.defender)

      expect(aggressorWars).toContainEqual(war)
      expect(defenderWars).toContainEqual(war)
    })
  })
})
