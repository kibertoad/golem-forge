import type { Country } from '../enums/Countries.ts'
import {
  type DirectorTrait,
  type DirectorTraitEffect,
  TRAIT_EFFECTS,
} from '../enums/ResearchDirectorEnums.ts'

export interface DirectorStats {
  talent: number // 1-5 stars, affects speed of progress
  morality: number // 1-5 stars, limits what research they'll do (lower = fewer limits)
  expertise: number // 1-5 stars, maximum complexity they can handle effectively
  management: number // 1-5 stars, affects project costs
}

export class ResearchDirectorModel {
  public readonly id: string
  public readonly name: string
  public readonly nationality: Country
  public readonly traits: DirectorTrait[]
  public readonly stats: DirectorStats
  public salary: number
  public currentFacilityId: string | null = null
  public hiredDate: Date | null = null
  public hiredTurn: number | null = null
  public projectsCompleted: number = 0
  public isAvailable: boolean = true
  public traitsRevealed: boolean = true // False if hired with standard fee

  constructor(params: {
    name: string
    nationality: Country
    traits: DirectorTrait[]
    stats: DirectorStats
    salary: number
    traitsRevealed?: boolean
  }) {
    this.id = `director-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.name = params.name
    this.nationality = params.nationality
    this.traits = params.traits
    this.stats = params.stats
    this.salary = params.salary
    this.traitsRevealed = params.traitsRevealed ?? true
  }

  hire(facilityId: string, date: Date, currentTurn?: number) {
    this.currentFacilityId = facilityId
    this.hiredDate = date
    this.hiredTurn = currentTurn ?? null
    this.isAvailable = false
  }

  checkTraitReveal(currentTurn: number): boolean {
    if (this.traitsRevealed) return false
    if (this.hiredTurn === null) return false

    // Reveal traits after 12 turns (3 months with 4 weeks per month)
    if (currentTurn - this.hiredTurn >= 12) {
      this.traitsRevealed = true
      return true
    }
    return false
  }

  fire() {
    this.currentFacilityId = null
    this.isAvailable = true
  }

  getTraitEffects(): DirectorTraitEffect {
    const combined: DirectorTraitEffect = {}

    this.traits.forEach((trait) => {
      const effect = TRAIT_EFFECTS[trait]
      Object.entries(effect).forEach(([key, value]) => {
        const k = key as keyof DirectorTraitEffect
        if (typeof value === 'number') {
          // Multiply modifiers if already exists, otherwise set
          const existing = combined[k]
          if (typeof existing === 'number') {
            ;(combined as any)[k] = existing * value
          } else {
            ;(combined as any)[k] = value
          }
        } else {
          // Override boolean/other values
          ;(combined as any)[k] = value
        }
      })
    })

    return combined
  }

  calculateProjectCost(baseCost: number): number {
    const effects = this.getTraitEffects()
    const costModifier = effects.costModifier || 1
    const launchModifier = effects.launchCostModifier || 1
    return Math.floor(baseCost * costModifier * launchModifier)
  }

  calculateProjectTime(baseTime: number): number {
    const effects = this.getTraitEffects()
    const timeModifier = effects.timeModifier || 1
    // Talent affects speed: each star above 3 reduces time by 10%
    const talentModifier = 1 - (this.stats.talent - 3) * 0.1
    return Math.ceil(baseTime * timeModifier * talentModifier)
  }

  calculateProjectSpeed(): number {
    // Base speed modified by talent (each star above 3 = 20% faster)
    const talentBonus = 1 + (this.stats.talent - 3) * 0.2
    const effects = this.getTraitEffects()
    const timeModifier = effects.timeModifier || 1
    return talentBonus / timeModifier
  }

  calculateMonthlyCost(baseMonthlyCost: number, projectComplexity: number): number {
    const effects = this.getTraitEffects()
    const monthlyModifier = effects.monthlyCostModifier || 1

    // Management affects costs based on complexity difference
    let managementModifier = 1
    if (this.stats.management > projectComplexity) {
      // Reduce costs by 20% per star above complexity
      managementModifier = 1 - (this.stats.management - projectComplexity) * 0.2
    } else if (this.stats.management < projectComplexity) {
      // Increase costs by 30% per star below complexity
      managementModifier = 1 + (projectComplexity - this.stats.management) * 0.3
    }

    return Math.floor(baseMonthlyCost * monthlyModifier * managementModifier)
  }

  canHandleComplexity(complexity: number): boolean {
    return this.stats.expertise >= complexity
  }

  willAcceptProject(moralityRequired: number): boolean {
    // Lower morality means willing to do more questionable research
    return this.stats.morality <= moralityRequired
  }

  canManageSimultaneousProjects(): number {
    const effects = this.getTraitEffects()
    return effects.simultaneousProjects || 1
  }

  hasTimeEstimateAbility(): boolean {
    const effects = this.getTraitEffects()
    return effects.showTimeEstimate || false
  }

  getExperienceLevel(): string {
    if (this.projectsCompleted === 0) return 'Novice'
    if (this.projectsCompleted < 3) return 'Junior'
    if (this.projectsCompleted < 7) return 'Experienced'
    if (this.projectsCompleted < 15) return 'Senior'
    return 'Veteran'
  }
}
