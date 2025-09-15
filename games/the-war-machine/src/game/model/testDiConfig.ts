import type { GlobalSceneEvents } from '@potato-golem/core'
import { asClass, asValue, createContainer, Lifetime, type NameAndRegistrationPair } from 'awilix'
import { EventEmitter } from 'emitix'
import { getWorldModel, type WorldModel } from './entities/WorldModel.ts'
import { EndTurnProcessor } from './processors/EndTurnProcessor.ts'
import { WarDirector } from './processors/WarDirector.ts'
import { WarSystem } from './WarSystem.ts'

export const SINGLETON_CONFIG = { lifetime: Lifetime.SINGLETON }
type TestDiConfig = NameAndRegistrationPair<TestDependencies>

export interface TestDependencies {
  worldModel: WorldModel
  endTurnProcessor: EndTurnProcessor
  warSystem: WarSystem
  warDirector: WarDirector
  globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>
}

export function instantiateTestContainer() {
  const diContainer = createContainer<TestDependencies>({
    injectionMode: 'PROXY',
  })

  const diConfig: TestDiConfig = {
    globalSceneEventEmitter: asValue(new EventEmitter<GlobalSceneEvents>()),
    worldModel: asValue(getWorldModel()),
    endTurnProcessor: asClass(EndTurnProcessor, SINGLETON_CONFIG),
    warSystem: asClass(WarSystem, SINGLETON_CONFIG),
    warDirector: asClass(WarDirector, SINGLETON_CONFIG),
  }

  diContainer.register(diConfig)

  return diContainer
}
