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
import { AssetsScene } from '../scenes/assets/AssetsScene.ts'
import { BoardScene } from '../scenes/board/BoardScene.ts'
import { ContactsScene } from '../scenes/contacts/ContactsScene.ts'
import { MainMenuScene } from '../scenes/main-menu/MainMenuScene.ts'
import { PersonnelScene } from '../scenes/personnel/PersonnelScene.ts'
import { PoliticsScene } from '../scenes/politics/PoliticsScene.ts'
import { ProductionScene } from '../scenes/production/ProductionScene.ts'
import { ResearchScene } from '../scenes/research/ResearchScene.ts'
import { getWorldModel, type WorldModel } from './entities/WorldModel.ts'
import { GameInitializer } from './GameInitializer.ts'
import { EndTurnProcessor } from './processors/EndTurnProcessor.ts'
import { WarDirector } from './processors/WarDirector.ts'
import { WarSystem } from './WarSystem.ts'

export const SINGLETON_CONFIG = { lifetime: Lifetime.SINGLETON }
type DiConfig = NameAndRegistrationPair<Dependencies>

export interface Dependencies {
  worldModel: WorldModel
  boardScene: BoardScene
  mainMenuScene: MainMenuScene
  armsShowScene: ArmsShowScene
  assetsScene: AssetsScene
  researchScene: ResearchScene
  personnelScene: PersonnelScene
  contactsScene: ContactsScene
  politicsScene: PoliticsScene
  productionScene: ProductionScene
  endTurnProcessor: EndTurnProcessor
  warDirector: WarDirector
  warSystem: WarSystem
  gameInitializer: GameInitializer
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
    assetsScene: asClass(AssetsScene, SINGLETON_CONFIG),
    researchScene: asClass(ResearchScene, SINGLETON_CONFIG),
    personnelScene: asClass(PersonnelScene, SINGLETON_CONFIG),
    contactsScene: asClass(ContactsScene, SINGLETON_CONFIG),
    politicsScene: asClass(PoliticsScene, SINGLETON_CONFIG),
    productionScene: asClass(ProductionScene, SINGLETON_CONFIG),
    endTurnProcessor: asClass(EndTurnProcessor, SINGLETON_CONFIG),
    warSystem: asClass(WarSystem, SINGLETON_CONFIG),
    warDirector: asClass(WarDirector, SINGLETON_CONFIG),
    gameInitializer: asClass(GameInitializer, SINGLETON_CONFIG),
    choicesDirector: asClass(ChoicesDirector, SINGLETON_CONFIG),
  }

  diContainer.register(diConfig)

  return diContainer
}
