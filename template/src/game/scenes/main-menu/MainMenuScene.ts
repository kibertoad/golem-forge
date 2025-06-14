import { PrefabMainMenuScene } from '@potato-golem/prefab-scenes'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { type SceneId, sceneRegistry } from '../../registries/sceneRegistry.ts'

const _isMusicEnabled = false

export class MainMenuScene extends PrefabMainMenuScene<SceneId> {
  constructor() {
    super({
      buttonTextureKey: imageRegistry.ROCKET,
      credits: [],
      gameStartScene: sceneRegistry.BOARD_SCENE,
      mainMenuSceneId: sceneRegistry.MAIN_MENU_SCENE,
      subtitleText: 'Game template',
    })
  }

  preloadImages(): void {
    console.log('preloadImages')
    this.load.setPath('assets')
    this.load.image(imageRegistry.ROCKET, 'rocket.png')
  }
}
