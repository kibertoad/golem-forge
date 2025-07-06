import type { GlobalSceneEvents } from '@potato-golem/core'
import {
  Lifetime,
  type NameAndRegistrationPair,
  asClass,
  asFunction,
  asValue,
  createContainer,
} from 'awilix'
import type { EventEmitter } from 'emitix'
import { BoardScene } from '../scenes/board/BoardScene.ts'
import { MainMenuScene } from '../scenes/main-menu/MainMenuScene.ts'
import { type WorldModel, getWorldModel } from './entities/WorldModel.ts'
import { EndTurnProcessor } from './processors/EndTurnProcessor.ts'

export const SINGLETON_CONFIG = { lifetime: Lifetime.SINGLETON }
type DiConfig = NameAndRegistrationPair<Dependencies>

export interface Dependencies {
  worldModel: WorldModel
  boardScene: BoardScene
  mainMenuScene: MainMenuScene
  endTurnProcessor: EndTurnProcessor
  globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>
}

export function instantiateContainer() {
  const diContainer = createContainer<Dependencies>({
    injectionMode: 'PROXY',
  })

  const diConfig: DiConfig = {
    globalSceneEventEmitter: asFunction(
      (dependencies: Dependencies) => dependencies.worldModel.globalSceneEventEmitter,
      SINGLETON_CONFIG,
    ),
    worldModel: asValue(getWorldModel()),
    boardScene: asClass(BoardScene, SINGLETON_CONFIG),
    mainMenuScene: asClass(MainMenuScene, SINGLETON_CONFIG),
    endTurnProcessor: asClass(EndTurnProcessor, SINGLETON_CONFIG),
  }

  diContainer.register(diConfig)

  return diContainer
}
