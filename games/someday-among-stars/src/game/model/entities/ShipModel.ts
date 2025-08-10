import type { CommonComponentModel } from './ComponentModel.ts'

export class ShipModel {
  public weapons: CommonComponentModel[]

  constructor() {
    this.weapons = []
  }
}
