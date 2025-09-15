import type { TurnProcessor } from '@potato-golem/core'
import type { Dependencies } from '../diConfig.ts'
import type { WorldModel } from '../entities/WorldModel.ts'

export class WarDirector implements TurnProcessor {
  private readonly worldModel: WorldModel

  constructor({ worldModel }: Dependencies) {
    this.worldModel = worldModel
  }

  processTurn(): void {
    // Process all wars for countries
    // This will be expanded with actual war logic
    console.log('WarDirector: Processing wars for turn', this.worldModel.gameStatus.turn)
  }
}