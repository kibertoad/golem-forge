import { Lifetime, type NameAndRegistrationPair, asClass, asValue, createContainer } from 'awilix'
import { BoardScene } from '../scenes/board/BoardScene.ts'
import { MainMenuScene } from '../scenes/main-menu/MainMenuScene.ts'
import { WorldModel } from './entities/WorldModel.ts'
import { EndTurnProcessor } from './processors/EndTurnProcessor.ts'

export const SINGLETON_CONFIG = { lifetime: Lifetime.SINGLETON }
type DiConfig = NameAndRegistrationPair<Dependencies>

export interface Dependencies {
  worldModel: WorldModel
  boardScene: BoardScene
  mainMenuScene: MainMenuScene
  endTurnProcessor: EndTurnProcessor
}

export function instantiateContainer() {
  const diContainer = createContainer<Dependencies>({
    injectionMode: 'PROXY',
  })

  const diConfig: DiConfig = {
    worldModel: asValue(new WorldModel()),
    boardScene: asClass(BoardScene, SINGLETON_CONFIG),
    mainMenuScene: asClass(MainMenuScene, SINGLETON_CONFIG),
    endTurnProcessor: asClass(EndTurnProcessor, SINGLETON_CONFIG),
  }

  diContainer.register(diConfig)

  return diContainer
}
