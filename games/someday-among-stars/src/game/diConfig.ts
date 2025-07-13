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
import { ChoiceDirector } from './content/choices/ChoiceDirector.ts'
import { ChoiceScene } from './scenes/choices/ChoiceScene.ts'
import { MainMenuScene } from './scenes/main-menu/MainMenuScene.ts'
import { SpaceScene } from './scenes/space/SpaceScene.ts'
import { type WorldModel, getWorldModel } from './model/entities/WorldModel.ts'
import { TravelTurnProcessor } from './model/processors/TravelTurnProcessor.ts'
import {StarmapScene} from "./scenes/starmap/StarmapScene.ts";
import {StarmapUIScene} from "./scenes/starmap/StarmapUIScene.ts";
import {SpaceCombatScene} from "./scenes/space-combat/SpaceCombatScene.ts";

export const SINGLETON_CONFIG = { lifetime: Lifetime.SINGLETON }
type DiConfig = NameAndRegistrationPair<Dependencies>

export interface Dependencies {
  worldModel: WorldModel
  spaceScene: SpaceScene
  starmapScene: StarmapScene
  starmapUIScene: StarmapUIScene
  spaceCombatScene: SpaceCombatScene
  mainMenuScene: MainMenuScene
  choicesScene: ChoiceScene
  travelTurnProcessor: TravelTurnProcessor
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
    starmapScene: asClass(StarmapScene, SINGLETON_CONFIG),
    starmapUIScene: asClass(StarmapUIScene, SINGLETON_CONFIG),
    spaceCombatScene: asClass(SpaceCombatScene, SINGLETON_CONFIG),
    mainMenuScene: asClass(MainMenuScene, SINGLETON_CONFIG),
    choicesScene: asClass(ChoiceScene, SINGLETON_CONFIG),
    travelTurnProcessor: asClass(TravelTurnProcessor, SINGLETON_CONFIG),
    choicesDirector: asClass(ChoiceDirector, SINGLETON_CONFIG),
  }

  diContainer.register(diConfig)

  return diContainer
}
