import {
  type GlobalSceneEvents,
  removeFromArrayById,
  type State,
  type StateHolder,
} from '@potato-golem/core'
import { EventEmitter } from 'emitix'
import { AgentStatus } from '../enums/AgentEnums.ts'
import { ArmsManufacturer } from '../enums/ArmsManufacturer.ts'
import { ArmsCondition } from '../enums/ArmsStockEnums.ts'
import { type CityData, CountryCities } from '../enums/Cities.ts'
import type { Country } from '../enums/Countries.ts'
import { StartingCountryAttributes } from '../enums/CountryAttributes.ts'
import { ArmsStockModel } from './ArmsStockModel.ts'
import type { BusinessAgentModel } from './BusinessAgentModel.ts'
import { CountryModel } from './CountryModel.ts'
import type { EntityModel } from './EntityModel.ts'
import type { AbstractLocationModel } from './locations/AbstractLocationModel.ts'
import { LocationSize } from './locations/AbstractLocationModel.ts'
import { WarehouseModel } from './locations/WarehouseModel.ts'
import type { ResearchDirectorModel } from './ResearchDirectorModel.ts'
import type { ResearchFacilityModel } from './ResearchFacilityModel.ts'

export type StateFlags = 'isAlive'
export type MainStates = 'combat' | 'travel'

export interface GameStatus {
  date: Date
  week: number
  turn: number
  money: number
}

export type WorldModelEvents = {
  'money-changed': [{ oldAmount: number; newAmount: number }]
  'date-changed': [{ month: number; week: number; turn: number }]
}

export class WorldModel implements StateHolder<StateFlags, MainStates> {
  public readonly state: State<StateFlags, MainStates>
  public readonly globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>
  public readonly worldEventEmitter: EventEmitter<WorldModelEvents>

  public readonly entities: EntityModel[] = []
  public readonly businessAgents: BusinessAgentModel[] = []
  public readonly vendorContacts: Set<ArmsManufacturer> = new Set()
  public readonly researchFacilities: ResearchFacilityModel[] = []
  public readonly researchDirectors: ResearchDirectorModel[] = []
  public readonly countries: Map<string, CountryModel> = new Map()
  public readonly playerLocations: AbstractLocationModel[] = []
  public gameStatus: GameStatus

  constructor(globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>) {
    this.globalSceneEventEmitter = globalSceneEventEmitter
    this.worldEventEmitter = new EventEmitter<WorldModelEvents>()
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

    // Initialize countries from starting data
    this.initializeCountries()

    // Initialize with a starting warehouse
    this.initializeStartingWarehouse()
  }

  private initializeCountries() {
    // Create CountryModel instances from the starting attributes
    for (const [countryKey, attributes] of Object.entries(StartingCountryAttributes)) {
      const country = countryKey as Country
      const countryModel = new CountryModel(country, attributes)
      this.addCountry(countryModel)
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
    return this.businessAgents.filter((agent) => agent.status === AgentStatus.AVAILABLE)
  }

  // Stock management
  // Get all stock from all warehouses
  getAllStock(): ArmsStockModel[] {
    const allStock: ArmsStockModel[] = []
    for (const location of this.playerLocations) {
      if (location.type === 'warehouse') {
        const warehouse = location as WarehouseModel
        allStock.push(...warehouse.getArmsStock())
      }
    }
    return allStock
  }

  // Add stock to a specific warehouse
  addStockToWarehouse(warehouseId: string, stock: ArmsStockModel): boolean {
    const warehouse = this.playerLocations.find(
      (loc) => loc.id === warehouseId && loc.type === 'warehouse',
    ) as WarehouseModel | undefined

    if (warehouse) {
      return warehouse.addArmsStock(stock)
    }
    return false
  }

  // Remove stock from any warehouse
  removeStock(stockId: string): ArmsStockModel | null {
    for (const location of this.playerLocations) {
      if (location.type === 'warehouse') {
        const warehouse = location as WarehouseModel
        const removed = warehouse.removeArmsStock(stockId)
        if (removed) {
          return removed
        }
      }
    }
    return null
  }

  // Get the first available warehouse with space
  getAvailableWarehouse(requiredSpace: number = 1): WarehouseModel | null {
    for (const location of this.playerLocations) {
      if (location.type === 'warehouse') {
        const warehouse = location as WarehouseModel
        if (warehouse.getAvailableStorage() >= requiredSpace) {
          return warehouse
        }
      }
    }
    return null
  }

  // Money management
  deductMoney(amount: number): boolean {
    if (this.gameStatus.money >= amount) {
      const oldAmount = this.gameStatus.money
      this.gameStatus.money -= amount
      this.worldEventEmitter.emit('money-changed', { oldAmount, newAmount: this.gameStatus.money })
      return true
    }
    return false
  }

  addMoney(amount: number) {
    const oldAmount = this.gameStatus.money
    this.gameStatus.money += amount
    this.worldEventEmitter.emit('money-changed', { oldAmount, newAmount: this.gameStatus.money })
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

    // Emit date change event
    this.worldEventEmitter.emit('date-changed', {
      month: this.gameStatus.date.getMonth() + 1,
      week: this.gameStatus.week,
      turn: this.gameStatus.turn,
    })
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

  // Research facility management
  addResearchFacility(facility: ResearchFacilityModel) {
    this.researchFacilities.push(facility)
  }

  removeResearchFacility(facilityId: string): ResearchFacilityModel | null {
    const index = this.researchFacilities.findIndex((f) => f.id === facilityId)
    if (index !== -1) {
      return this.researchFacilities.splice(index, 1)[0]
    }
    return null
  }

  getResearchFacility(facilityId: string): ResearchFacilityModel | undefined {
    return this.researchFacilities.find((f) => f.id === facilityId)
  }

  advanceAllResearch() {
    this.researchFacilities.forEach((facility) => {
      if (facility.isRetooling) {
        facility.advanceRetooling()
      } else {
        facility.advanceResearch()
      }
    })
  }

  // Research Director management
  addResearchDirector(director: ResearchDirectorModel) {
    this.researchDirectors.push(director)
  }

  removeResearchDirector(directorId: string): ResearchDirectorModel | null {
    const index = this.researchDirectors.findIndex((d) => d.id === directorId)
    if (index !== -1) {
      return this.researchDirectors.splice(index, 1)[0]
    }
    return null
  }

  getAvailableDirectors(): ResearchDirectorModel[] {
    return this.researchDirectors.filter((d) => d.isAvailable)
  }

  getDirector(directorId: string): ResearchDirectorModel | undefined {
    return this.researchDirectors.find((d) => d.id === directorId)
  }

  // Country management
  addCountry(country: CountryModel) {
    this.countries.set(country.country, country)
  }

  // Get the event emitter for external listeners
  getEventEmitter(): EventEmitter<WorldModelEvents> {
    return this.worldEventEmitter
  }

  getCountry(countryName: string): CountryModel | undefined {
    return this.countries.get(countryName)
  }

  getAllCountries(): CountryModel[] {
    return Array.from(this.countries.values())
  }

  // Create initial stock for the starting warehouse
  private createInitialStock(warehouse: WarehouseModel) {
    // Create some basic starting stock using actual arms definition IDs
    const initialStock = [
      new ArmsStockModel({
        armsId: 'copycat_ak', // AK-47 knockoff
        quantity: 50,
        purchasePrice: 500,
        condition: ArmsCondition.GOOD,
        acquiredFrom: 'Starting Inventory',
      }),
      new ArmsStockModel({
        armsId: 'scorpion_rifle', // Basic assault rifle
        quantity: 30,
        purchasePrice: 800,
        condition: ArmsCondition.NEW,
        acquiredFrom: 'Starting Inventory',
      }),
      new ArmsStockModel({
        armsId: 'thunder_rocket', // Basic RPG
        quantity: 10,
        purchasePrice: 2000,
        condition: ArmsCondition.FAIR,
        acquiredFrom: 'Starting Inventory',
      }),
    ]

    // Add each stock item to the warehouse
    for (const stock of initialStock) {
      const success = warehouse.addArmsStock(stock)
      if (!success) {
        console.warn(`Could not add ${stock.getName()} to warehouse - insufficient space`)
      }
    }
  }

  // Initialize starting warehouse
  private initializeStartingWarehouse() {
    const countries = Array.from(this.countries.keys())
    let countryCities: CityData[] | undefined
    let randomCountry: Country
    let attempts = 0
    const maxAttempts = 100 // Safety limit to prevent infinite loop

    // Keep picking random countries until we find one with cities
    do {
      randomCountry = countries[Math.floor(Math.random() * countries.length)] as Country
      countryCities = CountryCities[randomCountry]
      attempts++
    } while ((!countryCities || countryCities.length === 0) && attempts < maxAttempts)

    if (!countryCities || countryCities.length === 0) {
      console.error(`Could not find a country with cities after ${maxAttempts} attempts!`)
      return
    }

    const randomCity = countryCities[Math.floor(Math.random() * countryCities.length)]

    const warehouse = new WarehouseModel({
      id: 'warehouse-1',
      country: randomCountry,
      city: randomCity.name,
      legality: 5,
      heat: 0,
      concealment: 1,
      infrastructure: 1,
      size: LocationSize.SMALL,
    })

    // Add some initial stock to the warehouse for testing
    this.createInitialStock(warehouse)

    this.addLocation(warehouse)
    console.log(
      `Created warehouse in ${randomCity.name}, ${randomCountry} with ${warehouse.armsStock.length} stock items`,
    )

    // Add a random vendor contact for testing
    this.addRandomStartingVendorContact()
  }

  // Add a random vendor contact at game start for testing
  private addRandomStartingVendorContact() {
    const vendors = [
      ArmsManufacturer.DESERT_FORGE,
      ArmsManufacturer.LIBERTY_SURPLUS,
      ArmsManufacturer.IRON_CURTAIN,
      ArmsManufacturer.GUERRILLA_WORKS,
      ArmsManufacturer.BUDGET_BALLISTICS,
      ArmsManufacturer.FRONTIER_ARMS,
      ArmsManufacturer.PRECISION_ARMS,
      ArmsManufacturer.IRONFORGE,
    ]

    const randomVendor = vendors[Math.floor(Math.random() * vendors.length)]
    this.addVendorContact(randomVendor)
    console.log(`Added starting vendor contact: ${randomVendor}`)
  }

  // Location management
  addLocation(location: AbstractLocationModel) {
    this.playerLocations.push(location)
  }

  removeLocation(locationId: string): AbstractLocationModel | null {
    const index = this.playerLocations.findIndex((l) => l.id === locationId)
    if (index !== -1) {
      return this.playerLocations.splice(index, 1)[0]
    }
    return null
  }

  getLocation(locationId: string): AbstractLocationModel | undefined {
    return this.playerLocations.find((l) => l.id === locationId)
  }

  getLocationsByCountry(country: Country): AbstractLocationModel[] {
    return this.playerLocations.filter((l) => l.country === country)
  }

  getLocationsByCity(country: Country, city: string): AbstractLocationModel[] {
    return this.playerLocations.filter((l) => l.country === country && l.city === city)
  }

  hasLocationInCity(country: Country, city: string): boolean {
    return this.playerLocations.some((l) => l.country === country && l.city === city)
  }
}

let worldModel = new WorldModel(new EventEmitter<GlobalSceneEvents>())

export function resetWorldModel() {
  worldModel = new WorldModel(worldModel.globalSceneEventEmitter)
}

export function getWorldModel(): WorldModel {
  return worldModel
}
