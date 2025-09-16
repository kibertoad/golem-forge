import type { Country } from '../../enums/Countries.ts'

export enum LocationSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  HUGE = 'huge',
}

export abstract class AbstractLocationModel {
  public readonly id: string
  public readonly type: string
  public country: Country
  public city: string
  public legality: number // 1-5, 1 = completely illegal, 5 = fully legal
  public heat: number // 0-10, 0 = no attention, 10 = raided soon
  public concealment: number // 1-5, 1 = obvious, 5 = hidden
  public infrastructure: number // 1-5, 1 = basic, 5 = excellent
  public size: LocationSize

  constructor(params: {
    id: string
    type: string
    country: Country
    city: string
    legality?: number
    heat?: number
    concealment?: number
    infrastructure?: number
    size?: LocationSize
  }) {
    this.id = params.id
    this.type = params.type
    this.country = params.country
    this.city = params.city
    this.legality = params.legality ?? 5
    this.heat = params.heat ?? 0
    this.concealment = params.concealment ?? 1
    this.infrastructure = params.infrastructure ?? 1
    this.size = params.size ?? LocationSize.SMALL
  }

  public getMaintenanceCost(): number {
    const sizeCost = {
      [LocationSize.SMALL]: 1000,
      [LocationSize.MEDIUM]: 5000,
      [LocationSize.LARGE]: 20000,
      [LocationSize.HUGE]: 100000,
    }
    return sizeCost[this.size] * this.infrastructure
  }

  public increaseHeat(amount: number): void {
    this.heat = Math.min(10, this.heat + amount)
  }

  public decreaseHeat(amount: number): void {
    this.heat = Math.max(0, this.heat - amount)
  }

  public abstract getCapacity(): number
}
