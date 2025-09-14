import { v4 as uuidv4 } from 'uuid'
import {
  type AgentSkills,
  AgentStatus,
  type Gender,
  LegalStatus,
  type NegativeTrait,
  type PositiveTrait,
  type RegionalBonus,
  type SpecialPerk,
} from '../enums/AgentEnums.ts'
import { Country } from '../enums/Countries.ts'

export interface LegalStatusByCountry {
  country: Country
  status: LegalStatus
}

export class BusinessAgentModel {
  public readonly id: string
  public name: string
  public nationality: Country
  public legalStatusByCountry: LegalStatusByCountry[]
  public skills: AgentSkills
  public salary: number // 0 for player
  public loyalty: number // 0-100, always 100 for player
  public specialPerks: SpecialPerk[]
  public positiveTraits: PositiveTrait[]
  public negativeTraits: NegativeTrait[]
  public currentLocation: Country
  public regionalBonuses: RegionalBonus[]
  public age: number
  public gender: Gender
  public status: AgentStatus
  public isPlayer: boolean
  public portraitImage?: string // Path to portrait image

  constructor(params: {
    name: string
    nationality: Country
    age: number
    gender: Gender
    isPlayer?: boolean
    currentLocation?: Country
    skills?: Partial<AgentSkills>
    salary?: number
    loyalty?: number
    specialPerks?: SpecialPerk[]
    positiveTraits?: PositiveTrait[]
    negativeTraits?: NegativeTrait[]
    regionalBonuses?: RegionalBonus[]
    portraitImage?: string
  }) {
    this.id = uuidv4()
    this.name = params.name
    this.nationality = params.nationality
    this.age = params.age
    this.gender = params.gender
    this.isPlayer = params.isPlayer || false
    this.currentLocation = params.currentLocation || params.nationality
    this.status = AgentStatus.AVAILABLE

    // Initialize skills with defaults
    this.skills = {
      negotiation: params.skills?.negotiation || 5,
      intimidation: params.skills?.intimidation || 5,
      networking: params.skills?.networking || 5,
      languages: params.skills?.languages || 5,
      combat: params.skills?.combat || 5,
      stealth: params.skills?.stealth || 5,
      technical: params.skills?.technical || 5,
      finance: params.skills?.finance || 5,
    }

    // Player-specific defaults
    if (this.isPlayer) {
      this.salary = 0
      this.loyalty = 100
    } else {
      this.salary = params.salary || 50000
      this.loyalty = params.loyalty || 50
    }

    this.specialPerks = params.specialPerks || []
    this.positiveTraits = params.positiveTraits || []
    this.negativeTraits = params.negativeTraits || []
    this.regionalBonuses = params.regionalBonuses || []
    this.portraitImage = params.portraitImage

    // Initialize legal status - everyone starts legal everywhere
    this.legalStatusByCountry = []
    Object.values(Country).forEach((country) => {
      this.legalStatusByCountry.push({
        country: country as Country,
        status: LegalStatus.LEGAL,
      })
    })
  }

  getLegalStatusInCountry(country: Country): LegalStatus {
    const statusEntry = this.legalStatusByCountry.find((entry) => entry.country === country)
    return statusEntry?.status || LegalStatus.LEGAL
  }

  setLegalStatusInCountry(country: Country, status: LegalStatus): void {
    const existingEntry = this.legalStatusByCountry.find((entry) => entry.country === country)
    if (existingEntry) {
      existingEntry.status = status
    } else {
      this.legalStatusByCountry.push({ country, status })
    }
  }

  canTravelTo(country: Country): boolean {
    const status = this.getLegalStatusInCountry(country)
    return status === LegalStatus.LEGAL || status === LegalStatus.WANTED
  }

  markAsBusy(): void {
    this.status = AgentStatus.BUSY
  }

  markAsAvailable(): void {
    this.status = AgentStatus.AVAILABLE
  }

  getTotalSkillScore(): number {
    return Object.values(this.skills).reduce((sum, skill) => sum + skill, 0)
  }

  getAverageSkillScore(): number {
    const skillValues = Object.values(this.skills)
    return skillValues.reduce((sum, skill) => sum + skill, 0) / skillValues.length
  }

  hasRequiredSkillLevel(skillType: keyof AgentSkills, requiredLevel: number): boolean {
    return this.skills[skillType] >= requiredLevel
  }

  getRegionalBonusForCountry(country: Country): number {
    // Check if agent has any regional bonus that applies to this country
    // This is simplified - you might want to map countries to regions
    const bonus = this.regionalBonuses.find((rb) => rb.region === country)
    return bonus?.bonus || 0
  }

  calculateAttendanceFee(baseFee: number): number {
    // Player doesn't charge extra
    if (this.isPlayer) return baseFee

    // Agent takes a cut based on their skills and loyalty
    const skillMultiplier = this.getAverageSkillScore() / 10
    const loyaltyMultiplier = 1.5 - this.loyalty / 100 // Lower loyalty = higher fee
    const agentCut = this.salary * 0.1 * skillMultiplier * loyaltyMultiplier

    return baseFee + agentCut
  }
}
