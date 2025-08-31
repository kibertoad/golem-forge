import type { CommonComponentModel } from './ComponentModel.ts'

export class ShipModel {
  public weapons: CommonComponentModel[]
  public maxEnergy: number

  constructor() {
    this.weapons = []
    this.maxEnergy = 5
  }
}
