import type { GlobalSceneEvents } from '@potato-golem/core'
import {
  asClass,
  asFunction,
  asValue,
  createContainer,
  Lifetime,
  type NameAndRegistrationPair,
} from 'awilix'
import type { EventEmitter } from 'emitix'
import { ChoicesDirector } from '../content/choices/ChoicesDirector.ts'
import { ArmsShowScene } from '../scenes/armsShow/ArmsShowScene.ts'
import { BoardScene } from '../scenes/board/BoardScene.ts'
import { MainMenuScene } from '../scenes/main-menu/MainMenuScene.ts'
import { getWorldModel, type WorldModel } from './entities/WorldModel.ts'
import { EndTurnProcessor } from './processors/EndTurnProcessor.ts'

export const SINGLETON_CONFIG = { lifetime: Lifetime.SINGLETON }
type DiConfig = NameAndRegistrationPair<Dependencies>

export interface Dependencies {
  worldModel: WorldModel
  boardScene: BoardScene
  mainMenuScene: MainMenuScene
  armsShowScene: ArmsShowScene
  endTurnProcessor: EndTurnProcessor
  globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>
  choicesDirector: ChoicesDirector
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
    armsShowScene: asClass(ArmsShowScene, SINGLETON_CONFIG),
    endTurnProcessor: asClass(EndTurnProcessor, SINGLETON_CONFIG),
    choicesDirector: asClass(ChoicesDirector, SINGLETON_CONFIG),
  }

  diContainer.register(diConfig)

  return diContainer
}
