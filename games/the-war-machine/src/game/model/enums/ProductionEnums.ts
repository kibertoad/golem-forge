export enum FacilitySize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  INDUSTRIAL = 'industrial',
}

export enum ProductionType {
  NONE = 'none',
  SMALL_ARMS = 'small_arms',
  AMMUNITION = 'ammunition',
  EXPLOSIVES = 'explosives',
  HEAVY_WEAPONS = 'heavy_weapons',
  VEHICLES = 'vehicles',
  ARTILLERY = 'artillery',
  TANKS = 'tanks',
  AIRCRAFT = 'aircraft',
  MISSILES = 'missiles',
  NAVAL = 'naval',
  ELECTRONICS = 'electronics',
  DRONES = 'drones',
  ARMOR = 'armor',
  MEDICAL = 'medical',
  SUPPLIES = 'supplies',
}

export enum FacilityTechnology {
  BASIC = 1,
  STANDARD = 2,
  ADVANCED = 3,
  CUTTING_EDGE = 4,
  EXPERIMENTAL = 5,
}

export enum FacilityInfrastructure {
  POOR = 1,
  BASIC = 2,
  GOOD = 3,
  EXCELLENT = 4,
  WORLD_CLASS = 5,
}

export interface ProductionFacilityData {
  id: string
  name: string
  country: string
  city: string
  size: FacilitySize
  technology: FacilityTechnology
  infrastructure: FacilityInfrastructure
  concealment: number // 0-10
  heat: number // 0-10
  currentProduction: ProductionType
  outputWarehouseId?: string
  monthlyUpkeep: number
  productionRate: number // units per month
  owned: boolean
}