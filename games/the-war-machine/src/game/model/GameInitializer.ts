import type { Dependencies } from './diConfig.ts'
import type { WarDirector } from './processors/WarDirector.ts'
import type { WorldModel } from './entities/WorldModel.ts'

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

    this.initialized = true
    console.log('[GameInitializer] Game initialization complete')
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