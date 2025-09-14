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
  public readonly enemyShip: ShipModel

  // Fog of war: stores discovered areas as circles (x, y, radius)
  public discoveredAreas: Array<{ x: number; y: number; radius: number }> = []

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
    this.playerShip.weapons.push(new CommonComponentModel('weapon', WEAPON_COMPONENTS.MISSILE))

    // Add concealed compartments to player ship
    this.playerShip.addConcealedCompartment({
      id: 'smuggler-hold-1',
      name: 'Hidden Compartment Alpha',
      maxSpace: 20,
      currentSpace: 20,
      concealmentLevel: 5,
      scannerProofing: {
        radiation: 60,
        thermal: 40,
        magnetic: 30,
        gravimetric: 20,
        bioscan: 50,
        quantum: 10,
      },
      contents: [],
    })

    this.playerShip.addConcealedCompartment({
      id: 'smuggler-hold-2',
      name: 'Shielded Cargo Bay Beta',
      maxSpace: 15,
      currentSpace: 15,
      concealmentLevel: 7,
      scannerProofing: {
        radiation: 80,
        thermal: 70,
        magnetic: 40,
        gravimetric: 30,
        bioscan: 20,
        quantum: 25,
      },
      contents: [],
    })

    this.playerShip.addConcealedCompartment({
      id: 'smuggler-hold-3',
      name: 'False Hull Section Gamma',
      maxSpace: 10,
      currentSpace: 10,
      concealmentLevel: 9,
      scannerProofing: {
        radiation: 50,
        thermal: 60,
        magnetic: 85,
        gravimetric: 75,
        bioscan: 30,
        quantum: 40,
      },
      contents: [],
    })

    // Add some initial cargo to player ship
    this.playerShip.addPublicCargo({
      id: 'initial-food',
      name: 'Food Rations',
      quantity: 10,
      spacePerUnit: 1,
      illegal: false,
      value: 10,
    })

    this.playerShip.addPublicCargo({
      id: 'initial-electronics',
      name: 'Electronics',
      quantity: 5,
      spacePerUnit: 1,
      illegal: false,
      value: 100,
    })

    this.playerShip.addConcealedCargo('smuggler-hold-1', {
      id: 'initial-weapons',
      name: 'Military Weapons',
      quantity: 2,
      spacePerUnit: 3,
      illegal: true,
      value: 500,
    })

    // Initialize enemy ship with different stats and weapons
    this.enemyShip = new ShipModel()
    this.enemyShip.maxEnergy = 4
    this.enemyShip.currentShield = 2
    this.enemyShip.maxShield = 2
    this.enemyShip.currentHull = 5
    this.enemyShip.maxHull = 5
    this.enemyShip.weapons.push(new CommonComponentModel('weapon', WEAPON_COMPONENTS.LASER))
    this.enemyShip.weapons.push(new CommonComponentModel('weapon', WEAPON_COMPONENTS.MISSILE))

    // Initialize with Hub Systems discovered (4 scanning radiuses = 600 units)
    this.discoveredAreas.push({ x: 0, y: 0, radius: 600 })
  }
}

let worldModel = new WorldModel(new EventEmitter<GlobalSceneEvents>())

export function resetWorldModel() {
  worldModel = new WorldModel(worldModel.globalSceneEventEmitter)
}

export function getWorldModel(): WorldModel {
  return worldModel
}
