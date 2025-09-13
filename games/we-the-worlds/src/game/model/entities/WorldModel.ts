import {
  type GlobalSceneEvents,
  type State,
  type StateHolder,
  removeFromArrayById,
} from '@potato-golem/core'
import { EventEmitter } from 'emitix'
import type { EntityModel } from './EntityModel.ts'
import {PlayerModel} from "./PlayerModel.ts";

export type StateFlags = 'isAlive'
export type MainStates = 'combat' | 'travel'

export class WorldModel implements StateHolder<StateFlags, MainStates> {
  public readonly playerModel: PlayerModel
  public readonly state: State<StateFlags, MainStates>
  public readonly globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>

  public readonly entities: EntityModel[] = []

  constructor(globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>) {
    this.globalSceneEventEmitter = globalSceneEventEmitter
    this.state = {
      mainState: 'travel',
      stateFlags: {
        isAlive: true,
      },
    }
    this.playerModel = new PlayerModel()
  }

  addEntity(cardModel: EntityModel) {
    this.entities.push(cardModel)
  }

  /**
   * Remove entity by unique id
   */
  removeEntity(entityModelId: string): EntityModel | null {
    return removeFromArrayById(this.entities, entityModelId)
  }
}

let worldModel = new WorldModel(new EventEmitter<GlobalSceneEvents>())

export function resetWorldModel() {
  worldModel = new WorldModel(worldModel.globalSceneEventEmitter)
}

export function getWorldModel(): WorldModel {
  return worldModel
}
