import type { Country } from '../enums/Countries.ts'
import {
  FacilitySize,
  ProductionType,
  FacilityTechnology,
  FacilityInfrastructure,
  type ProductionFacilityData,
} from '../enums/ProductionEnums.ts'

export class ProductionFacilityModel {
  public id: string
  public name: string
  public country: Country
  public city: string
  public size: FacilitySize
  public technology: FacilityTechnology
  public infrastructure: FacilityInfrastructure
  public concealment: number
  public heat: number
  public currentProduction: ProductionType
  public outputWarehouseId?: string
  public monthlyUpkeep: number
  public productionRate: number
  public owned: boolean
  public productionProgress: number = 0 // 0-100%

  constructor(data: ProductionFacilityData) {
    this.id = data.id
    this.name = data.name
    this.country = data.country as Country
    this.city = data.city
    this.size = data.size
    this.technology = data.technology
    this.infrastructure = data.infrastructure
    this.concealment = data.concealment
    this.heat = data.heat
    this.currentProduction = data.currentProduction
    this.outputWarehouseId = data.outputWarehouseId
    this.monthlyUpkeep = data.monthlyUpkeep
    this.productionRate = data.productionRate
    this.owned = data.owned
  }

  public getProductionCapacity(): number {
    // Calculate production capacity based on size, tech, and infrastructure
    const sizeMultiplier = {
      [FacilitySize.SMALL]: 1,
      [FacilitySize.MEDIUM]: 2.5,
      [FacilitySize.LARGE]: 5,
      [FacilitySize.INDUSTRIAL]: 10,
    }[this.size]

    const techMultiplier = this.technology * 0.5
    const infraMultiplier = this.infrastructure * 0.3

    return Math.floor(this.productionRate * sizeMultiplier * techMultiplier * infraMultiplier)
  }

  public getUpgradeCost(targetSize?: FacilitySize, targetTech?: FacilityTechnology): number {
    let cost = 0

    if (targetSize) {
      const sizeCosts = {
        [FacilitySize.SMALL]: 100000,
        [FacilitySize.MEDIUM]: 500000,
        [FacilitySize.LARGE]: 2000000,
        [FacilitySize.INDUSTRIAL]: 10000000,
      }
      cost += sizeCosts[targetSize]
    }

    if (targetTech) {
      cost += targetTech * 250000
    }

    return cost
  }

  public getSellValue(): number {
    // Facilities sell for 60% of their upgrade cost
    const sizeCosts = {
      [FacilitySize.SMALL]: 100000,
      [FacilitySize.MEDIUM]: 500000,
      [FacilitySize.LARGE]: 2000000,
      [FacilitySize.INDUSTRIAL]: 10000000,
    }
    const baseCost = sizeCosts[this.size] + this.technology * 250000
    return Math.floor(baseCost * 0.6)
  }

  public changeProduction(newType: ProductionType) {
    this.currentProduction = newType
    this.productionProgress = 0 // Reset progress when changing production
  }

  public setOutputWarehouse(warehouseId: string) {
    this.outputWarehouseId = warehouseId
  }

  public processProduction(): number {
    if (this.currentProduction === ProductionType.NONE) return 0
    if (!this.outputWarehouseId) return 0

    this.productionProgress += (100 / 4) // 4 weeks per month

    if (this.productionProgress >= 100) {
      this.productionProgress = 0
      return this.getProductionCapacity()
    }

    return 0
  }
}