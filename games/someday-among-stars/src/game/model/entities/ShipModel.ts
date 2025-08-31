import type { CommonComponentModel } from './ComponentModel.ts'

export class ShipModel {
  public weapons: CommonComponentModel[]
  public maxEnergy: number
  public currentShield: number
  public maxShield: number
  public currentHull: number
  public maxHull: number

  constructor() {
    this.weapons = []
    this.maxEnergy = 5
    this.currentShield = 3
    this.maxShield = 3
    this.currentHull = 4
    this.maxHull = 4
  }
}
