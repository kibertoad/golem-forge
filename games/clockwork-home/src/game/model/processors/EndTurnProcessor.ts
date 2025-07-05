import type { TurnProcessor } from '@potato-golem/core'
import type { Dependencies } from '../diConfig.ts'
import type { WorldModel } from '../entities/WorldModel.ts'

export class EndTurnProcessor implements TurnProcessor {
  private readonly worldModel: WorldModel

  constructor({ worldModel }: Dependencies) {
    this.worldModel = worldModel
  }

  processTurn(): void {
    console.log('Next turn')
  }
}
