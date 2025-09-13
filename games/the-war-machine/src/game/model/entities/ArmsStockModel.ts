import { v4 as uuidv4 } from 'uuid'
import { ArmsBranch } from '../enums/ArmsBranches.ts'
import {
  ArmsCondition,
  type BranchQuality,
  getDefaultQualityForBranch,
  validateSubcategories,
} from '../enums/ArmsStockEnums.ts'

export interface ArmsStockParams {
  name: string
  branch: ArmsBranch
  subcategories?: Set<string> | string[] // Accept both Set and array for convenience
  quantity: number
  boughtAtPrice: number
  condition?: ArmsCondition
  qualityAttributes?: BranchQuality
  manufacturer?: string
}

export class ArmsStockModel {
  public readonly id: string
  public name: string
  public branch: ArmsBranch
  public subcategories: Set<string>
  public quantity: number
  public boughtAtPrice: number
  public condition: ArmsCondition
  public qualityAttributes: BranchQuality
  public manufacturer: string | undefined
  public dateAcquired: Date
  public lastModified: Date

  constructor(params: ArmsStockParams) {
    this.id = uuidv4()
    this.name = params.name
    this.branch = params.branch

    // Convert subcategories to Set and validate
    if (params.subcategories) {
      this.subcategories = params.subcategories instanceof Set
        ? params.subcategories
        : new Set(params.subcategories)
    } else {
      this.subcategories = new Set()
    }

    // Validate subcategories for mutual exclusivity
    if (!validateSubcategories(this.branch, this.subcategories)) {
      console.error(`Invalid subcategory combination for ${this.name}`)
    }

    this.quantity = params.quantity
    this.boughtAtPrice = params.boughtAtPrice
    this.condition = params.condition || ArmsCondition.GOOD
    this.qualityAttributes = params.qualityAttributes || getDefaultQualityForBranch(params.branch)
    this.manufacturer = params.manufacturer
    this.dateAcquired = new Date()
    this.lastModified = new Date()
  }

  // Calculate total value based on condition and quantity
  getTotalValue(): number {
    const conditionMultiplier = this.getConditionMultiplier()
    return this.boughtAtPrice * this.quantity * conditionMultiplier
  }

  // Calculate current market value (could fluctuate based on game events)
  getCurrentMarketValue(): number {
    const baseValue = this.getTotalValue()
    const qualityMultiplier = this.getQualityMultiplier()
    return Math.round(baseValue * qualityMultiplier)
  }

  // Get condition multiplier for value calculations
  private getConditionMultiplier(): number {
    switch (this.condition) {
      case ArmsCondition.NEW:
        return 1.2
      case ArmsCondition.EXCELLENT:
        return 1.0
      case ArmsCondition.GOOD:
        return 0.8
      case ArmsCondition.FAIR:
        return 0.6
      case ArmsCondition.POOR:
        return 0.4
      case ArmsCondition.SALVAGE:
        return 0.2
      default:
        return 0.8
    }
  }

  // Calculate quality multiplier based on quality attributes
  private getQualityMultiplier(): number {
    const attributes = Object.values(this.qualityAttributes)
    const avgQuality = attributes.reduce((sum, val) => sum + val, 0) / attributes.length
    return 0.5 + (avgQuality / 100) // 0.5 to 1.5 multiplier
  }

  // Update quantity (for sales, losses, etc.)
  updateQuantity(change: number): void {
    this.quantity = Math.max(0, this.quantity + change)
    this.lastModified = new Date()
  }

  // Degrade condition over time or due to use
  degradeCondition(): void {
    const conditions = Object.values(ArmsCondition)
    const currentIndex = conditions.indexOf(this.condition)
    if (currentIndex < conditions.length - 1) {
      this.condition = conditions[currentIndex + 1] as ArmsCondition
      this.lastModified = new Date()
    }
  }

  // Improve condition through maintenance
  improveCondition(): boolean {
    const conditions = Object.values(ArmsCondition)
    const currentIndex = conditions.indexOf(this.condition)
    if (currentIndex > 0) {
      this.condition = conditions[currentIndex - 1] as ArmsCondition
      this.lastModified = new Date()
      return true
    }
    return false
  }

  // Check if stock meets minimum quality requirements
  meetsQualityThreshold(threshold: number): boolean {
    const attributes = Object.values(this.qualityAttributes)
    const avgQuality = attributes.reduce((sum, val) => sum + val, 0) / attributes.length
    return avgQuality >= threshold
  }

  // Check if stock has a specific subcategory
  hasSubcategory(subcategory: string): boolean {
    return this.subcategories.has(subcategory)
  }

  // Check if stock matches all required subcategories
  matchesSubcategories(required: Set<string> | string[]): boolean {
    const requiredSet = required instanceof Set ? required : new Set(required)
    for (const cat of requiredSet) {
      if (!this.subcategories.has(cat)) {
        return false
      }
    }
    return true
  }

  // Get a summary description
  getSummary(): string {
    const subcatString = this.subcategories.size > 0
      ? ` [${Array.from(this.subcategories).join(', ')}]`
      : ''
    return `${this.name} (${this.branch}${subcatString}) - Qty: ${this.quantity}, Condition: ${this.condition}`
  }

  // Clone the stock (for splitting inventory)
  clone(newQuantity?: number): ArmsStockModel {
    return new ArmsStockModel({
      name: this.name,
      branch: this.branch,
      subcategories: new Set(this.subcategories),
      quantity: newQuantity || this.quantity,
      boughtAtPrice: this.boughtAtPrice,
      condition: this.condition,
      qualityAttributes: { ...this.qualityAttributes },
      manufacturer: this.manufacturer,
    })
  }

  // Serialize for storage
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      branch: this.branch,
      subcategories: Array.from(this.subcategories),
      quantity: this.quantity,
      boughtAtPrice: this.boughtAtPrice,
      condition: this.condition,
      qualityAttributes: this.qualityAttributes,
      manufacturer: this.manufacturer,
      dateAcquired: this.dateAcquired.toISOString(),
      lastModified: this.lastModified.toISOString(),
    }
  }

  // Create from JSON
  static fromJSON(json: any): ArmsStockModel {
    const stock = new ArmsStockModel({
      name: json.name,
      branch: json.branch,
      subcategories: json.subcategories || [],
      quantity: json.quantity,
      boughtAtPrice: json.boughtAtPrice,
      condition: json.condition,
      qualityAttributes: json.qualityAttributes,
      manufacturer: json.manufacturer,
    })
    stock.dateAcquired = new Date(json.dateAcquired)
    stock.lastModified = new Date(json.lastModified)
    return stock
  }
}
