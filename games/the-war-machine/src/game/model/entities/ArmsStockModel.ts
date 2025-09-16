import { v4 as uuidv4 } from 'uuid'
import { armsRegistry } from '../../registries/armsRegistry.ts'
import type { ArmsDefinition, ArmsId } from '../definitions/armsDefinitions.ts'
import { ArmsCondition } from '../enums/ArmsStockEnums.ts'

export interface ArmsStockParams {
  armsId: ArmsId // Reference to the arms definition (type-safe)
  quantity: number
  purchasePrice: number // What the player paid per unit
  condition?: ArmsCondition
  acquiredFrom?: string // Where/who it was acquired from
}

export class ArmsStockModel {
  public readonly id: string
  public readonly armsId: ArmsId // Reference to immutable definition (type-safe)
  public quantity: number
  public purchasePrice: number // What was paid per unit
  public condition: ArmsCondition
  public acquiredFrom: string | undefined
  public dateAcquired: Date
  public lastModified: Date

  constructor(params: ArmsStockParams) {
    // Validate that the arms definition exists
    if (!armsRegistry.hasDefinition(params.armsId)) {
      throw new Error(`Arms definition not found: ${params.armsId}`)
    }

    this.id = uuidv4()
    this.armsId = params.armsId
    this.quantity = params.quantity
    this.purchasePrice = params.purchasePrice
    this.condition = params.condition || ArmsCondition.GOOD
    this.acquiredFrom = params.acquiredFrom
    this.dateAcquired = new Date()
    this.lastModified = new Date()
  }

  // Get the immutable definition for this stock
  getDefinition(): ArmsDefinition | undefined {
    return armsRegistry.getDefinition(this.armsId)
  }

  // Get display name from definition
  getName(): string {
    const def = this.getDefinition()
    return def ? def.name : 'Unknown Arms'
  }

  // Calculate total value based on condition and quantity
  getTotalValue(): number {
    const conditionMultiplier = this.getConditionMultiplier()
    return this.purchasePrice * this.quantity * conditionMultiplier
  }

  // Calculate current market value (could fluctuate based on game events)
  getCurrentMarketValue(): number {
    const def = this.getDefinition()
    if (!def) return 0

    const baseValue = def.basePrice * this.quantity
    const conditionMultiplier = this.getConditionMultiplier()
    const qualityMultiplier = this.getQualityMultiplier()

    return Math.round(baseValue * conditionMultiplier * qualityMultiplier)
  }

  // Calculate profit/loss if sold at current market value
  getPotentialProfit(): number {
    return this.getCurrentMarketValue() - this.purchasePrice * this.quantity
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

  // Calculate quality multiplier based on quality attributes from definition
  private getQualityMultiplier(): number {
    const def = this.getDefinition()
    if (!def) return 1.0

    const attributes = Object.values(def.qualityAttributes)
    const avgQuality = attributes.reduce((sum, val) => sum + val, 0) / attributes.length
    return 0.5 + avgQuality / 100 // 0.5 to 1.5 multiplier
  }

  // Update quantity (for sales, losses, etc.)
  updateQuantity(change: number): void {
    this.quantity = Math.max(0, this.quantity + change)
    this.lastModified = new Date()
  }

  // Sell some quantity
  sell(quantityToSell: number): number {
    if (quantityToSell > this.quantity) {
      quantityToSell = this.quantity
    }

    const valuePerUnit = this.getCurrentMarketValue() / this.quantity
    const totalValue = valuePerUnit * quantityToSell

    this.updateQuantity(-quantityToSell)
    return totalValue
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

  // Check if stock meets minimum quality threshold
  meetsQualityThreshold(threshold: number): boolean {
    const def = this.getDefinition()
    if (!def) return false

    const attributes = Object.values(def.qualityAttributes)
    const avgQuality = attributes.reduce((sum, val) => sum + val, 0) / attributes.length
    return avgQuality >= threshold
  }

  // Check if this stock can fulfill a requirement
  canFulfillRequirement(subcategories: Set<string>, minQuality?: number): boolean {
    const def = this.getDefinition()
    if (!def) return false

    // Check subcategories match
    for (const cat of subcategories) {
      if (!def.subcategories.has(cat)) {
        return false
      }
    }

    // Check quality if specified
    if (minQuality !== undefined) {
      return this.meetsQualityThreshold(minQuality)
    }

    return true
  }

  // Get a summary description
  getSummary(): string {
    const def = this.getDefinition()
    if (!def) return `Unknown Arms - Qty: ${this.quantity}`

    const subcatString =
      def.subcategories.size > 0 ? ` [${Array.from(def.subcategories).join(', ')}]` : ''
    return `${def.name} (${def.branch}${subcatString}) - Qty: ${this.quantity}, Condition: ${this.condition}`
  }

  // Clone the stock (for splitting inventory)
  clone(newQuantity?: number): ArmsStockModel {
    return new ArmsStockModel({
      armsId: this.armsId,
      quantity: newQuantity || this.quantity,
      purchasePrice: this.purchasePrice,
      condition: this.condition,
      acquiredFrom: this.acquiredFrom,
    })
  }

  // Split stock into two parts
  split(quantityToSplit: number): ArmsStockModel | null {
    if (quantityToSplit >= this.quantity || quantityToSplit <= 0) {
      return null
    }

    const newStock = this.clone(quantityToSplit)
    this.updateQuantity(-quantityToSplit)
    return newStock
  }

  // Merge with another stock of the same type
  merge(otherStock: ArmsStockModel): boolean {
    if (otherStock.armsId !== this.armsId) {
      return false // Can't merge different arms types
    }

    // Calculate weighted average purchase price
    const totalValue =
      this.purchasePrice * this.quantity + otherStock.purchasePrice * otherStock.quantity
    const totalQuantity = this.quantity + otherStock.quantity
    this.purchasePrice = totalValue / totalQuantity

    // Take the worse condition
    const conditions = Object.values(ArmsCondition)
    const thisIndex = conditions.indexOf(this.condition)
    const otherIndex = conditions.indexOf(otherStock.condition)
    if (otherIndex > thisIndex) {
      this.condition = otherStock.condition
    }

    this.quantity = totalQuantity
    this.lastModified = new Date()
    return true
  }
}
