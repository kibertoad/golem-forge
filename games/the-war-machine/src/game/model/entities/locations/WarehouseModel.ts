import type { Country } from '../../enums/Countries.ts'
import type { ArmsStockModel } from '../ArmsStockModel.ts'
import { AbstractLocationModel, LocationSize } from './AbstractLocationModel.ts'

export interface StockItem {
  id: string
  name: string
  quantity: number
  unitSize: number // storage space per unit
}

export class WarehouseModel extends AbstractLocationModel {
  public maxStorage: number
  public stockItems: Map<string, StockItem>
  public armsStock: ArmsStockModel[] = []

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
  }) {
    super({
      ...params,
      type: 'warehouse',
    })

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

    this.stockItems = new Map()
  }

  public getCapacity(): number {
    return this.maxStorage
  }

  public getUsedStorage(): number {
    let used = 0
    for (const item of this.stockItems.values()) {
      used += item.quantity * item.unitSize
    }
    return used
  }

  public getAvailableStorage(): number {
    return this.maxStorage - this.getUsedStorage()
  }

  public addStock(item: StockItem): boolean {
    const requiredSpace = item.quantity * item.unitSize
    if (requiredSpace > this.getAvailableStorage()) {
      return false
    }

    const existing = this.stockItems.get(item.id)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      this.stockItems.set(item.id, { ...item })
    }
    return true
  }

  public removeStock(itemId: string, quantity: number): boolean {
    const item = this.stockItems.get(itemId)
    if (!item || item.quantity < quantity) {
      return false
    }

    item.quantity -= quantity
    if (item.quantity === 0) {
      this.stockItems.delete(itemId)
    }
    return true
  }
}
