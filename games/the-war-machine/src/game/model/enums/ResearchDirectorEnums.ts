export enum DirectorTrait {
  STINGY = 'Stingy', // Projects take 15% longer but are 30% cheaper
  DISCIPLINED = 'Disciplined', // Effects of unpredictability reduced
  STRONG_PLANNER = 'Strong Planner', // Shows rough time range for completion
  INNOVATIVE = 'Innovative', // 20% chance of breakthrough (faster progress)
  METHODICAL = 'Methodical', // Steady progress, less variance
  RISK_TAKER = 'Risk Taker', // Can skip prerequisites but 30% chance of setback
  PERFECTIONIST = 'Perfectionist', // 25% longer but results are better
  NETWORKED = 'Networked', // 15% discount on launch costs
  AMBITIOUS = 'Ambitious', // Can run 2 projects simultaneously but at 70% efficiency each
  FRUGAL = 'Frugal', // Monthly costs reduced by 25%
}

export interface DirectorTraitEffect {
  costModifier?: number
  timeModifier?: number
  unpredictabilityModifier?: number
  showTimeEstimate?: boolean
  breakthroughChance?: number
  canSkipPrerequisites?: boolean
  qualityBonus?: number
  launchCostModifier?: number
  simultaneousProjects?: number
  monthlyCostModifier?: number
}

export const TRAIT_EFFECTS: Record<DirectorTrait, DirectorTraitEffect> = {
  [DirectorTrait.STINGY]: {
    timeModifier: 1.15,
    costModifier: 0.7,
  },
  [DirectorTrait.DISCIPLINED]: {
    unpredictabilityModifier: 0.5,
  },
  [DirectorTrait.STRONG_PLANNER]: {
    showTimeEstimate: true,
  },
  [DirectorTrait.INNOVATIVE]: {
    breakthroughChance: 0.2,
  },
  [DirectorTrait.METHODICAL]: {
    unpredictabilityModifier: 0.3,
  },
  [DirectorTrait.RISK_TAKER]: {
    canSkipPrerequisites: true,
  },
  [DirectorTrait.PERFECTIONIST]: {
    timeModifier: 1.25,
    qualityBonus: 1.3,
  },
  [DirectorTrait.NETWORKED]: {
    launchCostModifier: 0.85,
  },
  [DirectorTrait.AMBITIOUS]: {
    simultaneousProjects: 2,
  },
  [DirectorTrait.FRUGAL]: {
    monthlyCostModifier: 0.75,
  },
}

export enum ResearchFacilityType {
  WEAPONS = 'Weapons Research',
  CYBERWARFARE = 'Cyber Warfare',
  AEROSPACE = 'Aerospace Engineering',
  ELECTRONICS = 'Electronics & Computing',
  MATERIALS = 'Materials Science',
  ENERGY = 'Energy Systems',
  NAVAL = 'Naval Engineering',
  VEHICLE = 'Vehicle Design',
  PROPULSION = 'Propulsion Systems',
  AI = 'AI Systems',
  ROBOTICS = 'Robotics & Mechatronics',
}

export enum ProjectComplexity {
  TRIVIAL = 1,
  SIMPLE = 2,
  MODERATE = 3,
  COMPLEX = 4,
  BREAKTHROUGH = 5,
}

export enum ProjectUnpredictability {
  ROUTINE = 1,
  STABLE = 2,
  VARIABLE = 3,
  VOLATILE = 4,
  CHAOTIC = 5,
}
