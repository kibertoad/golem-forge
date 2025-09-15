import type { TurnProcessor } from '@potato-golem/core'
import type { Dependencies } from '../diConfig.ts'
import type { CountryModel } from '../entities/CountryModel.ts'
import { AssaultUnit } from '../entities/units/AssaultUnit.ts'
import { UnitBranch } from '../entities/units/BaseUnit.ts'
import { RegularUnit } from '../entities/units/RegularUnit.ts'
import type { WorldModel } from '../entities/WorldModel.ts'
import type { Country } from '../enums/Countries.ts'
import type { WarSystem } from '../WarSystem.ts'

export class WarDirector implements TurnProcessor {
  private readonly worldModel: WorldModel
  private readonly warSystem: WarSystem
  private readonly spawnedCountries: Set<Country> = new Set()
  private warsInitialized = false

  constructor({ worldModel, warSystem }: Dependencies) {
    this.worldModel = worldModel
    this.warSystem = warSystem
  }

  /**
   * Sets up the war system callbacks and initializes starting wars.
   * This should be called once during game initialization.
   */
  public setupWarSystem(): void {
    console.log('[WarDirector] Setting up war system')

    // Set up the callback to handle war declarations
    this.warSystem.onWarDeclared = (aggressor: Country, defender: Country) => {
      this.onWarDeclared(aggressor, defender)
    }

    // Initialize starting wars if not already done
    if (!this.warsInitialized) {
      console.log('[WarDirector] Initializing starting wars')
      this.warSystem.initializeWars()
      this.warsInitialized = true

      // Log all active wars after initialization
      const activeWars = this.warSystem.getActiveWars()
      console.log(`[WarDirector] ${activeWars.length} active wars initialized`)
      activeWars.forEach((war) => {
        console.log(`  War: ${war.aggressor} vs ${war.defender}`)
      })
    }
  }

  processTurn(): void {
    console.log('WarDirector: Processing wars for turn', this.worldModel.gameStatus.turn)

    // Process all countries' units
    this.worldModel.getAllCountries().forEach((country) => {
      country.processUnitsTurn()
    })

    // TODO: Process combat between units
    // TODO: Process city sieges
    // TODO: Check for war endings
  }

  private onWarDeclared(aggressor: Country, defender: Country) {
    console.log(`[WarDirector] ============================================`)
    console.log(`[WarDirector] WAR DECLARED: ${aggressor} attacks ${defender}`)
    console.log(`[WarDirector] ============================================`)

    // Get country models
    const aggressorModel = this.worldModel.getCountry(aggressor)
    const defenderModel = this.worldModel.getCountry(defender)

    console.log(
      `[WarDirector] Aggressor model found: ${!!aggressorModel}, Defender model found: ${!!defenderModel}`,
    )

    // FIRST: Update country war status BEFORE spawning units
    // This ensures warsWith arrays are populated when units are created
    if (aggressorModel) {
      console.log(`[WarDirector] Declaring war for aggressor ${aggressor} against ${defender}`)
      aggressorModel.declareWarOn(defender, true) // true = as aggressor
      console.log(
        `[WarDirector] Aggressor ${aggressor} war status: isAtWar=${aggressorModel.isAtWar}, warsWith=${Array.from(aggressorModel.warsWith)}, isAttacking=${Array.from(aggressorModel.isAttacking)}`,
      )
    }
    if (defenderModel) {
      console.log(`[WarDirector] Declaring war for defender ${defender} against ${aggressor}`)
      defenderModel.declareWarOn(aggressor, false) // false = as defender
      console.log(
        `[WarDirector] Defender ${defender} war status: isAtWar=${defenderModel.isAtWar}, warsWith=${Array.from(defenderModel.warsWith)}, isDefending=${Array.from(defenderModel.isDefending)}`,
      )
    }

    // THEN: Spawn units for both countries if not already spawned
    if (aggressorModel && !this.spawnedCountries.has(aggressor)) {
      console.log(`[WarDirector] Spawning units for aggressor ${aggressor}`)
      this.spawnUnitsForCountry(aggressorModel)
      this.spawnedCountries.add(aggressor)
    }

    if (defenderModel && !this.spawnedCountries.has(defender)) {
      console.log(`[WarDirector] Spawning units for defender ${defender}`)
      this.spawnUnitsForCountry(defenderModel)
      this.spawnedCountries.add(defender)
    }
  }

  private spawnUnitsForCountry(country: CountryModel) {
    console.log(`[WarDirector] Spawning units for ${country.name}`)

    // Calculate spawn numbers based on military strength
    const spawnCounts = this.calculateSpawnCounts(country)

    console.log(`[WarDirector] Spawn counts for ${country.name}:`)
    spawnCounts.regular.forEach((count, branch) => {
      console.log(`  Regular ${branch}: ${count}`)
    })
    spawnCounts.assault.forEach((count, branch) => {
      console.log(`  Assault ${branch}: ${count}`)
    })

    // Spawn regular units in cities (simplified - using country name as city for now)
    this.spawnRegularUnits(country, spawnCounts.regular)

    // Spawn assault units on the front
    this.spawnAssaultUnits(country, spawnCounts.assault)

    console.log(`[WarDirector] After spawning, ${country.name} has:`)
    console.log(`  ${country.regularUnits.length} regular units`)
    console.log(`  ${country.assaultUnits.length} assault units`)
    country.assaultUnitsByTarget.forEach((units, target) => {
      console.log(`  ${units.length} assault units targeting ${target}`)
    })
  }

  private calculateSpawnCounts(country: CountryModel): {
    regular: Map<UnitBranch, number>
    assault: Map<UnitBranch, number>
  } {
    const regular = new Map<UnitBranch, number>()
    const assault = new Map<UnitBranch, number>()

    // Base spawn calculation - military strength determines unit count
    // Each strength point spawns 2 regular units and 1 assault unit
    const branches: (keyof typeof country.militaryStrength)[] = [
      'army',
      'navy',
      'airforce',
      'specialForces',
      'drones',
    ]

    branches.forEach((branch) => {
      const strength = country.militaryStrength[branch]
      const unitBranch = this.mapToBranchEnum(branch)

      // Regular units: 2 per strength point
      regular.set(unitBranch, strength * 2)

      // Assault units: 1 per strength point
      assault.set(unitBranch, strength)
    })

    return { regular, assault }
  }

  private mapToBranchEnum(branch: string): UnitBranch {
    switch (branch) {
      case 'army':
        return UnitBranch.ARMY
      case 'navy':
        return UnitBranch.NAVY
      case 'airforce':
        return UnitBranch.AIRFORCE
      case 'specialForces':
        return UnitBranch.SPECIAL_FORCES
      case 'drones':
        return UnitBranch.DRONES
      default:
        return UnitBranch.ARMY
    }
  }

  private spawnRegularUnits(country: CountryModel, spawnCounts: Map<UnitBranch, number>) {
    spawnCounts.forEach((count, branch) => {
      for (let i = 0; i < count; i++) {
        // Calculate unit strength based on production capability
        const production = this.getBranchProduction(country, branch)
        const tech = this.getBranchTech(country, branch)

        // Initial strength: 50-100 based on production
        const initialStrength = 50 + production * 10

        // Equipment quality based on tech level
        const equipment = tech

        // Create regular unit (using country name as city for now)
        const unit = new RegularUnit(
          country.country,
          branch,
          `${country.name}-capital`,
          initialStrength,
          equipment,
        )

        // Adjust unit attributes based on country characteristics
        this.adjustUnitAttributes(unit, country)

        country.addRegularUnit(unit)
      }
    })
  }

  private spawnAssaultUnits(country: CountryModel, spawnCounts: Map<UnitBranch, number>) {
    spawnCounts.forEach((count, branch) => {
      for (let i = 0; i < count; i++) {
        // Assault units get better equipment and strength
        const production = this.getBranchProduction(country, branch)
        const tech = this.getBranchTech(country, branch)

        // Initial strength: 70-100 based on production
        const initialStrength = 70 + production * 6

        // Equipment quality based on tech level (assault units get priority equipment)
        const equipment = Math.min(5, tech + 1)

        // Create assault unit
        // For now, we'll assign to the first war enemy if any
        const enemyCountry = country.warsWith.size > 0 ? Array.from(country.warsWith)[0] : null
        if (!enemyCountry) {
          console.warn(`[WarDirector] Country ${country.country} has no war targets for assault units`)
          continue
        }

        const frontId = `front-${country.country}-${enemyCountry}`
        const unit = new AssaultUnit(country.country, branch, frontId, initialStrength, equipment)

        // Adjust unit attributes based on country characteristics
        this.adjustUnitAttributes(unit, country)

        // Add unit using the new method that tracks by target
        country.addAssaultUnitForTarget(unit, enemyCountry)
      }
    })
  }

  private getBranchProduction(country: CountryModel, branch: UnitBranch): number {
    switch (branch) {
      case UnitBranch.ARMY:
        return country.industrialProduction.army
      case UnitBranch.NAVY:
        return country.industrialProduction.navy
      case UnitBranch.AIRFORCE:
        return country.industrialProduction.airforce
      case UnitBranch.SPECIAL_FORCES:
        return country.industrialProduction.specialForces
      case UnitBranch.DRONES:
        return country.industrialProduction.drones
      default:
        return 1
    }
  }

  private getBranchTech(country: CountryModel, branch: UnitBranch): number {
    switch (branch) {
      case UnitBranch.ARMY:
        return country.industrialTech.army
      case UnitBranch.NAVY:
        return country.industrialTech.navy
      case UnitBranch.AIRFORCE:
        return country.industrialTech.airforce
      case UnitBranch.SPECIAL_FORCES:
        return country.industrialTech.specialForces
      case UnitBranch.DRONES:
        return country.industrialTech.drones
      default:
        return 1
    }
  }

  private adjustUnitAttributes(unit: RegularUnit | AssaultUnit, country: CountryModel) {
    // Adjust supplies based on corruption (less corrupt = better supplies)
    unit.attributes.supplies = Math.max(40, 100 - country.corruption * 10)

    // Adjust organization based on standards
    unit.attributes.organization = 50 + country.standards * 10

    // Adjust training based on military budget
    unit.attributes.training = 40 + country.militaryBudget * 12

    // Special adjustments for assault units
    if (unit instanceof AssaultUnit) {
      unit.morale = 60 + country.standards * 8
    }
  }
}
