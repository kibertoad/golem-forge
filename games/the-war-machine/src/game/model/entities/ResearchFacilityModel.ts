import type { Country } from '../enums/Countries.ts'
import {
  ProjectComplexity,
  ProjectUnpredictability,
  type ResearchFacilityType,
} from '../enums/ResearchDirectorEnums.ts'
import type { ResearchProject } from '../enums/ResearchEnums.ts'
import type { ResearchDirectorModel } from './ResearchDirectorModel.ts'

export interface ResearchProjectState {
  project: ResearchProject
  projectName: string
  director: ResearchDirectorModel
  progress: number // 0-100
  launchCost: number
  monthlyCost: number
  complexity: ProjectComplexity
  unpredictability: ProjectUnpredictability
  startedMonth: number
  actualMonthsElapsed: number
  progressHistory: number[] // Track progress each month for estimation
}

export class ResearchFacilityModel {
  public readonly id: string
  public readonly name: string
  public readonly location: Country
  public facilityType: ResearchFacilityType
  public techLevel: number = 1 // Laboratory tech level (1-10)
  public currentProject: ResearchProjectState | null = null
  public completedProjects: ResearchProject[] = []
  public monthlyUpkeep: number
  public director: ResearchDirectorModel | null = null
  public isRetooling: boolean = false
  public retoolingMonthsRemaining: number = 0
  public targetFacilityType: ResearchFacilityType | null = null
  public isUpgrading: boolean = false
  public upgradeMonthsRemaining: number = 0
  public targetTechLevel: number | null = null
  public upgradeMonthlyMaintenance: number = 0

  constructor(params: {
    name: string
    location: Country
    facilityType: ResearchFacilityType
    techLevel?: number
    monthlyUpkeep?: number
  }) {
    this.id = `research-${params.location}-${Date.now()}`
    this.name = params.name
    this.location = params.location
    this.facilityType = params.facilityType
    this.techLevel = params.techLevel || 1
    this.monthlyUpkeep = params.monthlyUpkeep || 75000
  }

  assignDirector(director: ResearchDirectorModel, currentTurn?: number) {
    this.director = director
    director.hire(this.id, new Date(), currentTurn)
  }

  removeDirector() {
    if (this.director) {
      this.director.fire()
      this.director = null
    }
  }

  startRetooling(newType: ResearchFacilityType, months: number = 6) {
    if (this.currentProject || this.isRetooling) {
      return false
    }
    this.isRetooling = true
    this.retoolingMonthsRemaining = months
    this.targetFacilityType = newType
    return true
  }

  advanceRetooling(): boolean {
    if (!this.isRetooling) return false

    this.retoolingMonthsRemaining--
    if (this.retoolingMonthsRemaining <= 0) {
      this.facilityType = this.targetFacilityType!
      this.isRetooling = false
      this.targetFacilityType = null
      return true
    }
    return false
  }

  startProject(
    project: ResearchProject,
    complexity: ProjectComplexity,
    unpredictability: ProjectUnpredictability,
    currentMonth: number,
  ): boolean {
    if (!this.director || this.currentProject || this.isRetooling) {
      return false
    }

    // Calculate costs with director modifiers
    const baseLaunchCost = project.cost
    const baseMonthly = project.cost / 10 // Monthly cost is 10% of launch cost
    const launchCost = this.director.calculateProjectCost(baseLaunchCost)
    const monthlyCost = this.director.calculateMonthlyCost(baseMonthly, complexity)

    this.currentProject = {
      project,
      projectName: project.name,
      director: this.director,
      progress: 0,
      launchCost,
      monthlyCost,
      complexity,
      unpredictability,
      startedMonth: currentMonth,
      actualMonthsElapsed: 0,
      progressHistory: [],
    }

    return true
  }

  advanceResearch(): number {
    if (!this.currentProject || !this.director) {
      return 0
    }

    const project = this.currentProject
    project.actualMonthsElapsed++

    // Calculate base progress based on complexity
    const complexityProgress = {
      [ProjectComplexity.TRIVIAL]: 40,
      [ProjectComplexity.SIMPLE]: 25,
      [ProjectComplexity.MODERATE]: 15,
      [ProjectComplexity.COMPLEX]: 10,
      [ProjectComplexity.BREAKTHROUGH]: 5,
    }

    const baseProgress = complexityProgress[project.complexity]

    // Apply unpredictability variance
    const unpredictabilityVariance = {
      [ProjectUnpredictability.ROUTINE]: 0.1,
      [ProjectUnpredictability.STABLE]: 0.2,
      [ProjectUnpredictability.VARIABLE]: 0.4,
      [ProjectUnpredictability.VOLATILE]: 0.6,
      [ProjectUnpredictability.CHAOTIC]: 0.8,
    }

    const variance = unpredictabilityVariance[project.unpredictability]
    const effects = this.director.getTraitEffects()

    // Apply director's unpredictability modifier
    const modifiedVariance = variance * (effects.unpredictabilityModifier || 1)

    // Random factor with variance
    const randomFactor = 1 + (Math.random() - 0.5) * modifiedVariance * 2
    let monthProgress = baseProgress * randomFactor

    // Check for breakthrough (if director has innovative trait)
    if (effects.breakthroughChance && Math.random() < effects.breakthroughChance) {
      monthProgress *= 2 // Double progress this month
    }

    // Apply time modifier from director traits
    const timeModifier = effects.timeModifier || 1
    monthProgress /= timeModifier

    // Update progress
    project.progress = Math.min(100, project.progress + monthProgress)
    project.progressHistory.push(monthProgress)

    // Check if complete
    if (project.progress >= 100) {
      this.completedProjects.push(project.project)
      if (this.director) {
        this.director.projectsCompleted++
      }
      const monthlyCost = project.monthlyCost
      this.currentProject = null
      return monthlyCost // Return the monthly cost that no longer needs to be paid
    }

    return 0
  }

  getProgressEstimate(): string {
    if (!this.currentProject || !this.director) {
      return 'No active project'
    }

    const progress = this.currentProject.progress

    if (progress < 20) return 'Just beginning'
    if (progress < 40) return 'Early stages'
    if (progress < 60) return 'Making progress'
    if (progress < 80) return 'Well underway'
    if (progress < 95) return 'Nearing completion'
    return 'Almost done'
  }

  getTimeEstimate(): { min: number; max: number } | null {
    if (!this.currentProject || !this.director) {
      return null
    }

    // Only show if director has Strong Planner trait
    if (!this.director.hasTimeEstimateAbility()) {
      return null
    }

    const history = this.currentProject.progressHistory
    if (history.length < 2) {
      return null // Not enough data
    }

    // Calculate average progress per month
    const avgProgress = history.reduce((a, b) => a + b, 0) / history.length
    const remaining = 100 - this.currentProject.progress

    if (avgProgress <= 0) return null

    const estimatedMonths = remaining / avgProgress

    // Add variance based on unpredictability
    const variance = this.currentProject.unpredictability * 0.2
    const min = Math.ceil(estimatedMonths * (1 - variance))
    const max = Math.ceil(estimatedMonths * (1 + variance))

    return { min, max }
  }

  canStartProject(): boolean {
    return !this.currentProject && !this.isRetooling && !this.isUpgrading && this.director !== null
  }

  startUpgrade(targetLevel: number, upgradeMonths: number, monthlyMaintenance: number) {
    if (targetLevel <= this.techLevel || targetLevel > 10) {
      throw new Error('Invalid target tech level')
    }
    if (this.isUpgrading || this.isRetooling || this.currentProject) {
      throw new Error('Facility is busy with another operation')
    }

    this.isUpgrading = true
    this.targetTechLevel = targetLevel
    this.upgradeMonthsRemaining = upgradeMonths
    this.upgradeMonthlyMaintenance = monthlyMaintenance
  }

  getUpgradeCost(targetLevel: number): number {
    // Non-incremental cost structure based on target level
    const costs: Record<number, number> = {
      2: 200000,
      3: 500000,
      4: 1000000,
      5: 2000000,
      6: 4000000,
      7: 8000000,
      8: 15000000,
      9: 30000000,
      10: 60000000,
    }
    return costs[targetLevel] || 0
  }

  processUpgrade(): boolean {
    if (!this.isUpgrading) return false

    this.upgradeMonthsRemaining--
    if (this.upgradeMonthsRemaining <= 0) {
      this.techLevel = this.targetTechLevel!
      this.isUpgrading = false
      this.upgradeMonthsRemaining = 0
      this.targetTechLevel = null
      this.upgradeMonthlyMaintenance = 0
      return true // Upgrade completed
    }
    return false
  }

  getTotalMonthlyCost(): number {
    let cost = this.monthlyUpkeep

    if (this.director) {
      cost += this.director.salary
    }

    if (this.currentProject) {
      cost += this.currentProject.monthlyCost
    }

    if (this.isUpgrading) {
      cost += this.upgradeMonthlyMaintenance
    }

    return cost
  }
}
