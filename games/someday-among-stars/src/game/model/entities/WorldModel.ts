import type { GlobalSceneEvents, State, StateHolder } from '@potato-golem/core'
import { EventEmitter } from 'emitix'
import { WEAPON_COMPONENTS } from '../../content/components/WeaponComponents.ts'
import { generatePlanet } from '../generators/PlanetGenerator.ts'
import { CommonComponentModel } from './ComponentModel.ts'
import type { PlanetModel } from './PlanetModel.ts'
import type { RaceModel } from './RaceModel.ts'
import { ShipModel } from './ShipModel.ts'

export type StateFlags = 'isAlive'
export type MainStates = 'planet' | 'space'

export class WorldModel implements StateHolder<StateFlags, MainStates> {
  public readonly state: State<StateFlags, MainStates>

  public readonly globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>

  public readonly races: RaceModel[]
  public readonly planets: PlanetModel[]

  public readonly playerShip: ShipModel

  constructor(globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>) {
    this.globalSceneEventEmitter = globalSceneEventEmitter
    this.state = {
      mainState: 'planet',
      stateFlags: {
        isAlive: true,
      },
    }
    this.races = [
      {
        name: 'Terrans',
      },
    ]
    this.planets = [generatePlanet(this.races[0])]

    this.playerShip = new ShipModel()
    this.playerShip.weapons.push(new CommonComponentModel('weapon', WEAPON_COMPONENTS.LASER))
    this.playerShip.weapons.push(new CommonComponentModel('weapon', WEAPON_COMPONENTS.LASER))
  }
}

let worldModel = new WorldModel(new EventEmitter<GlobalSceneEvents>())

export function resetWorldModel() {
  worldModel = new WorldModel(worldModel.globalSceneEventEmitter)
}

export function getWorldModel(): WorldModel {
  return worldModel
}
