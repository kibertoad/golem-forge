import {
  type GlobalSceneEvents,
  removeFromArrayById,
  type State,
  type StateHolder,
} from '@potato-golem/core'
import { EventEmitter } from 'emitix'
import type { EntityModel } from './EntityModel.ts'
import type { BusinessAgentModel } from './BusinessAgentModel.ts'
import type { ArmsStockModel } from './ArmsStockModel.ts'
import { AgentStatus } from '../enums/AgentEnums.ts'
import { ArmsManufacturer } from '../enums/ArmsManufacturer.ts'

export type StateFlags = 'isAlive'
export type MainStates = 'combat' | 'travel'

export interface GameStatus {
  date: Date
  week: number
  turn: number
  money: number
}

export class WorldModel implements StateHolder<StateFlags, MainStates> {
  public readonly state: State<StateFlags, MainStates>
  public readonly globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>

  public readonly entities: EntityModel[] = []
  public readonly businessAgents: BusinessAgentModel[] = []
  public readonly playerStock: ArmsStockModel[] = []
  public readonly vendorContacts: Set<ArmsManufacturer> = new Set()
  public gameStatus: GameStatus

  constructor(globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>) {
    this.globalSceneEventEmitter = globalSceneEventEmitter
    this.state = {
      mainState: 'travel',
      stateFlags: {
        isAlive: true,
      },
    }

    // Initialize game status
    this.gameStatus = {
      date: new Date(1985, 0, 1),
      week: 1,
      turn: 1,
      money: 1000000,
    }
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

  // Agent management
  addAgent(agent: BusinessAgentModel) {
    this.businessAgents.push(agent)
  }

  getAvailableAgents(): BusinessAgentModel[] {
    return this.businessAgents.filter(agent => agent.status === AgentStatus.AVAILABLE)
  }

  // Stock management
  addStock(stock: ArmsStockModel) {
    this.playerStock.push(stock)
  }

  removeStock(stockId: string): ArmsStockModel | null {
    const index = this.playerStock.findIndex(s => s.id === stockId)
    if (index !== -1) {
      return this.playerStock.splice(index, 1)[0]
    }
    return null
  }

  // Money management
  deductMoney(amount: number): boolean {
    if (this.gameStatus.money >= amount) {
      this.gameStatus.money -= amount
      return true
    }
    return false
  }

  addMoney(amount: number) {
    this.gameStatus.money += amount
  }

  // Turn management
  advanceTurn() {
    this.gameStatus.turn += 1
    this.gameStatus.week += 1

    if (this.gameStatus.week > 4) {
      this.gameStatus.week = 1
      this.gameStatus.date.setMonth(this.gameStatus.date.getMonth() + 1)
    } else {
      this.gameStatus.date.setDate(this.gameStatus.date.getDate() + 7)
    }
  }

  // Vendor contact management
  addVendorContact(manufacturer: ArmsManufacturer): boolean {
    if (this.vendorContacts.has(manufacturer)) {
      return false // Already have this contact
    }
    this.vendorContacts.add(manufacturer)
    return true
  }

  hasVendorContact(manufacturer: ArmsManufacturer): boolean {
    return this.vendorContacts.has(manufacturer)
  }

  getVendorContacts(): ArmsManufacturer[] {
    return Array.from(this.vendorContacts)
  }
}

let worldModel = new WorldModel(new EventEmitter<GlobalSceneEvents>())

export function resetWorldModel() {
  worldModel = new WorldModel(worldModel.globalSceneEventEmitter)
}

export function getWorldModel(): WorldModel {
  return worldModel
}
