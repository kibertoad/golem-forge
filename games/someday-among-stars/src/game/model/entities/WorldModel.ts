import {
  type GlobalSceneEvents,
  type State,
  type StateHolder,
  removeFromArrayById,
} from '@potato-golem/core'
import { EventEmitter } from 'emitix'
import type { EntityModel } from './EntityModel.ts'
import {RaceModel} from "./RaceModel.ts";
import {PlanetModel} from "./PlanetModel.ts";
import {generatePlanet} from "../generators/PlanetGenerator.ts";

export type StateFlags = 'isAlive'
export type MainStates = 'planet' | 'space'

export class WorldModel implements StateHolder<StateFlags, MainStates> {
  public readonly state: State<StateFlags, MainStates>

  public readonly entities: EntityModel[] = []
  public readonly globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>

  public readonly races: RaceModel[]
  public readonly planets: PlanetModel[]

  constructor(globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>) {
    this.globalSceneEventEmitter = globalSceneEventEmitter
    this.state = {
      mainState: 'planet',
      stateFlags: {
        isAlive: true,
      },
    }
    this.races = [{
      name: 'Terrans'
    }]
    this.planets = [
        generatePlanet(this.races[0])
    ]
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
