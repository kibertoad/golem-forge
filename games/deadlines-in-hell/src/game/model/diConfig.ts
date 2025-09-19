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
import { BoardScene } from '../scenes/board/BoardScene.ts'
import { MainMenuScene } from '../scenes/main-menu/MainMenuScene.ts'
import { GameStateManager } from '../services/GameStateManager.ts'
import { TurnProcessor } from '../services/TurnProcessor.ts'
import { WorkflowManager } from '../services/WorkflowManager.ts'
import { getWorldModel, type WorldModel } from './entities/WorldModel.ts'
import { EndTurnProcessor } from './processors/EndTurnProcessor.ts'

export const SINGLETON_CONFIG = { lifetime: Lifetime.SINGLETON }
type DiConfig = NameAndRegistrationPair<Dependencies>

export interface Dependencies {
  worldModel: WorldModel
  boardScene: BoardScene
  mainMenuScene: MainMenuScene
  endTurnProcessor: EndTurnProcessor
  globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>
  choicesDirector: ChoicesDirector
  turnProcessor: TurnProcessor
  workflowManager: WorkflowManager
  gameStateManager: GameStateManager
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
    turnProcessor: asClass(TurnProcessor, SINGLETON_CONFIG),
    workflowManager: asClass(WorkflowManager, SINGLETON_CONFIG),
    gameStateManager: asClass(GameStateManager, SINGLETON_CONFIG),
    boardScene: asClass(BoardScene, SINGLETON_CONFIG),
    mainMenuScene: asClass(MainMenuScene, SINGLETON_CONFIG),
    endTurnProcessor: asClass(EndTurnProcessor, SINGLETON_CONFIG),
    choicesDirector: asClass(ChoicesDirector, SINGLETON_CONFIG),
  }

  diContainer.register(diConfig)

  return diContainer
}
