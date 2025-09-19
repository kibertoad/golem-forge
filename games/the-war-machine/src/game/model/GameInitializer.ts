import type { Dependencies } from './diConfig.ts'
import type { WorldModel } from './entities/WorldModel.ts'
import type { WarDirector } from './processors/WarDirector.ts'
import { ProductionFacilityModel } from './entities/ProductionFacilityModel.ts'
import { FacilitySize, ProductionType } from './enums/ProductionEnums.ts'
import { WarehouseModel } from './entities/locations/WarehouseModel.ts'
import { LocationSize } from './entities/locations/AbstractLocationModel.ts'

/**
 * Responsible for initializing the game state when a new game starts.
 * This includes setting up wars, initializing AI behaviors, and any other
 * startup logic that needs to run once at the beginning of the game.
 */
export class GameInitializer {
  private readonly worldModel: WorldModel
  private readonly warDirector: WarDirector
  private initialized = false

  constructor({ worldModel, warDirector }: Dependencies) {
    this.worldModel = worldModel
    this.warDirector = warDirector
  }

  /**
   * Initialize the game state. This should be called once when the game starts.
   * It sets up all the initial conditions for the game.
   */
  public initializeGame(): void {
    if (this.initialized) {
      console.log('[GameInitializer] Game already initialized, skipping')
      return
    }

    console.log('[GameInitializer] Starting game initialization')

    // Step 1: Set up the war system and initialize starting wars
    console.log('[GameInitializer] Step 1: Setting up war system')
    this.warDirector.setupWarSystem()
    console.log('[GameInitializer] War system setup complete')

    // Step 2: Initialize AI directors and agents (if needed)
    // TODO: Add AI initialization here

    // Step 3: Set up initial economic conditions
    // TODO: Add economic setup here

    // Step 4: Initialize diplomatic relations
    // TODO: Add diplomatic initialization here

    // Step 5: Set up initial research projects
    // TODO: Add research initialization here

    // Step 6: Set up initial production facilities
    console.log('[GameInitializer] Step 6: Setting up production facilities')
    this.initializeProductionFacilities()
    console.log('[GameInitializer] Production facilities setup complete')

    this.initialized = true
    console.log('[GameInitializer] Game initialization complete')
  }

  /**
   * Initialize starting production facilities
   */
  private initializeProductionFacilities(): void {
    // Get the first warehouse's location (created in WorldModel constructor)
    const firstWarehouse = this.worldModel.playerLocations.find(loc => loc.type === 'warehouse')
    if (!firstWarehouse) {
      console.error('[GameInitializer] No starting warehouse found, cannot create production facility')
      return
    }

    const country = firstWarehouse.country
    const city = firstWarehouse.city

    // Create a small production facility in the same city
    const facility = new ProductionFacilityModel({
      id: `facility-${Date.now()}`,
      name: 'Small Arms Factory',
      country: country,
      city: city,
      size: FacilitySize.SMALL,
      technology: 1,
      infrastructure: 1,
      concealment: 5,
      heat: 2,
      monthlyUpkeep: 50000,
      productionRate: 10, // Small facility default rate
      owned: true, // Player owns this facility
      currentProduction: ProductionType.NONE, // Not producing anything initially
      outputWarehouseId: undefined, // No warehouse selected yet
    })

    this.worldModel.productionFacilities.push(facility)
    console.log(`[GameInitializer] Created production facility in ${city}, ${country}`)

    // Create an additional warehouse in the same city for storing production output
    const additionalWarehouse = new WarehouseModel({
      id: `warehouse-${Date.now()}`,
      country: country,
      city: city,
      legality: 5,
      heat: 0,
      concealment: 3,
      infrastructure: 1,
      size: LocationSize.MEDIUM,
    })

    this.worldModel.addLocation(additionalWarehouse)
    console.log(`[GameInitializer] Created additional warehouse in ${city}, ${country}`)
  }

  /**
   * Check if the game has been initialized
   */
  public isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Reset the game state (for new game or restart)
   */
  public resetGame(): void {
    console.log('[GameInitializer] Resetting game state')
    this.initialized = false
    // TODO: Add cleanup logic here
  }
}
