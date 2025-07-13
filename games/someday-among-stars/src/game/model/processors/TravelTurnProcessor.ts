import type { TurnProcessor } from '@potato-golem/core'
import type { Dependencies } from '../../diConfig.ts'
import type { WorldModel } from '../entities/WorldModel.ts'
import {EncounterModel} from "../entities/EncounterModel.ts";
import Phaser from "phaser";
import {SPACE_ENCOUNTERS} from "../../content/encounters/spaceEncounters.ts";

export class TravelTurnProcessor implements TurnProcessor {
  private readonly worldModel: WorldModel

  constructor({ worldModel }: Dependencies) {
    this.worldModel = worldModel
  }

  processTurn(): EncounterModel | null  {
    const diceRoll = Phaser.Math.Between(1, 100)

    if (diceRoll < 5) {
        return SPACE_ENCOUNTERS.PIRATES
    }

    return null
  }
}
