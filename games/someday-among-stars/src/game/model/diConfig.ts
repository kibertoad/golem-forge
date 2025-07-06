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
import { ChoiceDirector } from '../content/choices/ChoiceDirector.ts'
import { ChoiceScene } from '../scenes/choices/ChoiceScene.ts'
import { MainMenuScene } from '../scenes/main-menu/MainMenuScene.ts'
import { SpaceScene } from '../scenes/space/SpaceScene.ts'
import { type WorldModel, getWorldModel } from './entities/WorldModel.ts'
import { EndTurnProcessor } from './processors/EndTurnProcessor.ts'

export const SINGLETON_CONFIG = { lifetime: Lifetime.SINGLETON }
type DiConfig = NameAndRegistrationPair<Dependencies>

export interface Dependencies {
  worldModel: WorldModel
  spaceScene: SpaceScene
  mainMenuScene: MainMenuScene
  choicesScene: ChoiceScene
  endTurnProcessor: EndTurnProcessor
  choicesDirector: ChoiceDirector
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
    spaceScene: asClass(SpaceScene, SINGLETON_CONFIG),
    mainMenuScene: asClass(MainMenuScene, SINGLETON_CONFIG),
    choicesScene: asClass(ChoiceScene, SINGLETON_CONFIG),
    endTurnProcessor: asClass(EndTurnProcessor, SINGLETON_CONFIG),
    choicesDirector: asClass(ChoiceDirector, SINGLETON_CONFIG),
  }

  diContainer.register(diConfig)

  return diContainer
}
