import type { Country } from '../../enums/Countries.ts'
import type { ArmsStockModel } from '../ArmsStockModel.ts'
import { AbstractLocationModel, LocationSize } from './AbstractLocationModel.ts'

export enum WarehouseOwnershipType {
  OWNED = 'owned',
  RENTED = 'rented',
}

export class WarehouseModel extends AbstractLocationModel {
  public maxStorage: number
  public armsStock: ArmsStockModel[] = []
  public ownershipType: WarehouseOwnershipType
  public monthlyRent?: number // Only for rented warehouses

  constructor(params: {
    id: string
    country: Country
    city: string
    legality?: number
    heat?: number
    concealment?: number
    infrastructure?: number
    size?: LocationSize
    maxStorage?: number
    ownershipType?: WarehouseOwnershipType
    monthlyRent?: number
  }) {
    super({
      ...params,
      type: 'warehouse',
    })

    this.ownershipType = params.ownershipType ?? WarehouseOwnershipType.OWNED
    this.monthlyRent = params.monthlyRent

    // Calculate max storage based on size if not provided
    if (params.maxStorage) {
      this.maxStorage = params.maxStorage
    } else {
      const baseStorage = {
        [LocationSize.SMALL]: 100,
        [LocationSize.MEDIUM]: 500,
        [LocationSize.LARGE]: 2000,
        [LocationSize.HUGE]: 10000,
      }
      this.maxStorage = baseStorage[this.size] * this.infrastructure
    }
  }

  public getCapacity(): number {
    return this.maxStorage
  }

  public getUsedStorage(): number {
    // Each arms stock item takes up space based on quantity
    // For simplicity, let's say each item takes 1 unit of space
    return this.armsStock.reduce((total, item) => total + item.quantity, 0)
  }

  public getAvailableStorage(): number {
    return this.maxStorage - this.getUsedStorage()
  }

  public addArmsStock(item: ArmsStockModel): boolean {
    const requiredSpace = item.quantity
    if (requiredSpace > this.getAvailableStorage()) {
      return false // Not enough space
    }

    // Check if we already have this item type
    const existing = this.armsStock.find(
      (stock) => stock.armsId === item.armsId && stock.condition === item.condition,
    )

    if (existing) {
      // Merge quantities
      existing.quantity += item.quantity
    } else {
      // Add new stock item
      this.armsStock.push(item)
    }
    return true
  }

  public removeArmsStock(stockId: string): ArmsStockModel | null {
    const index = this.armsStock.findIndex((s) => s.id === stockId)
    if (index !== -1) {
      return this.armsStock.splice(index, 1)[0]
    }
    return null
  }

  public getArmsStock(): ArmsStockModel[] {
    return this.armsStock
  }

  public getTotalStockValue(): number {
    return this.armsStock.reduce((total, item) => total + item.getTotalValue(), 0)
  }
}
