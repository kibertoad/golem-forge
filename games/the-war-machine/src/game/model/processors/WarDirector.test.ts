import { beforeEach, describe, expect, it } from 'vitest'
import type { WorldModel } from '../entities/WorldModel.ts'
import { instantiateTestContainer } from '../testDiConfig.ts'
import type { WarDirector } from './WarDirector.ts'

describe('WarDirector', () => {
  let warDirector: WarDirector
  let worldModel: WorldModel

  beforeEach(() => {
    // Create a fresh DI container for each test
    const container = instantiateTestContainer()

    // Resolve dependencies from the container
    warDirector = container.resolve('warDirector')
    worldModel = container.resolve('worldModel')
  })

  it('should be resolvable from DI container', () => {
    expect(warDirector).toBeDefined()
    expect(warDirector).toHaveProperty('processTurn')
  })

  it('should implement TurnProcessor interface', () => {
    expect(typeof warDirector.processTurn).toBe('function')
  })

  it('should process turn without errors', () => {
    // Smoke test - just ensure processTurn can be called without throwing
    expect(() => warDirector.processTurn()).not.toThrow()
  })

  it('should have access to worldModel', () => {
    // Verify that the WarDirector has been properly initialized with worldModel
    // We'll expand this test as we add more logic to WarDirector
    warDirector.processTurn()

    // After processing, the world model should still have all countries initialized
    expect(worldModel.getAllCountries().length).toBeGreaterThan(0)
  })
})
