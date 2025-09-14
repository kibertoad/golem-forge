export enum ResearchField {
  CONVENTIONAL_WEAPONS = 'Conventional Weapons',
  AEROSPACE = 'Aerospace',
  ELECTRONICS = 'Electronics',
  COMMUNICATIONS = 'Communications',
  MATERIALS = 'Materials Science',
  CYBER = 'Cyber Warfare',
  NAVAL = 'Naval',
  CHEMICAL = 'Chemical',
  BIOLOGICAL = 'Biological',
  NUCLEAR = 'Nuclear',
  DIRECTED_ENERGY = 'Directed Energy',
}

export interface ResearchProject {
  id: string
  name: string
  description: string
  field: ResearchField
  category: string // Project category for organization
  facilityType: string // Using string to avoid circular dependency
  techLevel: number // Required laboratory tech level (1-10)
  complexity: number // 1-5 stars
  unpredictability: number // 1-5 stars
  cost: number // Launch cost
  estimatedMonths: number // Base duration
  prerequisites: string[] // IDs of prerequisite projects
  maxMoralityAllowed?: number // Directors with morality higher than this will refuse to work on the project
}
