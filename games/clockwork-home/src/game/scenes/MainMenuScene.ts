import { PrefabMainMenuScene } from '@potato-golem/prefab-scenes'
import { worldModel } from '../model/entities/WorldModel.ts'
import { populateStartGame } from '../model/populators/StartGamePopulator.ts'
import { imageRegistry } from '../registries/imageRegistry.ts'
import { type SceneId, sceneRegistry } from '../registries/sceneRegistry.ts'

const isMusicEnabled = false

export class MainMenuScene extends PrefabMainMenuScene<SceneId> {
  constructor() {
    super({
      buttonTextureKey: imageRegistry.ROCKET,
      credits: [],
      gameStartScene: sceneRegistry.BOARD_SCENE,
      mainMenuSceneId: sceneRegistry.MAIN_MENU_SCENE,
      subtitleText: 'Clockwork Home',
      worldModelPopulator: () => {
        populateStartGame(worldModel)
      },
    })
  }

  preloadImages(): void {
    this.load.image(imageRegistry.ROCKET, 'favicon.png')
    this.load.image(imageRegistry.CARD_BACKGROUND, 'card_background.png')
    this.load.image(imageRegistry.CARD_BACKGROUND_DECOR, 'card_background_decor.png')
  }
}
