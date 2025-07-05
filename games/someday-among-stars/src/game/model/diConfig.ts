import { Lifetime, type NameAndRegistrationPair, asClass, asValue, createContainer } from 'awilix'
import { BoardScene } from '../scenes/board/BoardScene.ts'
import { ChoiceDirector } from '../scenes/choices/ChoiceDirector.ts'
import { ChoiceScene } from '../scenes/choices/ChoiceScene.ts'
import { MainMenuScene } from '../scenes/main-menu/MainMenuScene.ts'
import { WorldModel } from './entities/WorldModel.ts'
import { EndTurnProcessor } from './processors/EndTurnProcessor.ts'

export const SINGLETON_CONFIG = { lifetime: Lifetime.SINGLETON }
type DiConfig = NameAndRegistrationPair<Dependencies>

export interface Dependencies {
  worldModel: WorldModel
  boardScene: BoardScene
  mainMenuScene: MainMenuScene
  choicesScene: ChoiceScene
  endTurnProcessor: EndTurnProcessor
  choicesDirector: ChoiceDirector
}

export function instantiateContainer() {
  const diContainer = createContainer<Dependencies>({
    injectionMode: 'PROXY',
  })

  const diConfig: DiConfig = {
    worldModel: asValue(new WorldModel()),
    boardScene: asClass(BoardScene, SINGLETON_CONFIG),
    mainMenuScene: asClass(MainMenuScene, SINGLETON_CONFIG),
    choicesScene: asClass(ChoiceScene, SINGLETON_CONFIG),
    endTurnProcessor: asClass(EndTurnProcessor, SINGLETON_CONFIG),
    choicesDirector: asClass(ChoiceDirector, SINGLETON_CONFIG),
  }

  diContainer.register(diConfig)

  return diContainer
}
