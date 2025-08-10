import { PrefabMainMenuScene } from '@potato-golem/prefab-scenes'
import type { Dependencies } from '../../diConfig.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { type SceneId, sceneRegistry } from '../../registries/sceneRegistry.ts'

const _isMusicEnabled = false

export class MainMenuScene extends PrefabMainMenuScene<SceneId> {
  constructor(dependencies: Dependencies) {
    super(dependencies.globalSceneEventEmitter, {
      buttonTextureKey: imageRegistry.ROCKET,
      credits: [],
      gameStartScene: sceneRegistry.CHOICES_SCENE,
      mainMenuSceneId: sceneRegistry.MAIN_MENU_SCENE,
      subtitleText: 'Someday, Among Stars',
    })
  }

  preloadImages(): void {
    console.log('preloadImages')
    this.load.setPath('assets')
    this.load.image(imageRegistry.ROCKET, 'rocket.png')
    this.load.image(imageRegistry.ARMOUR_RESTORE, 'sides/armour_restore.png')
    this.load.image(imageRegistry.SHIELD_RESTORE, 'sides/shield_restore.png')
    this.load.image(imageRegistry.DAMAGE, 'sides/damage.png')
    this.load.image(imageRegistry.JAM, 'sides/jam.png')
    this.load.image(imageRegistry.OVERHEAT, 'sides/overheat.png')
    this.load.image(imageRegistry.COOLDOWN, 'sides/cooldown.png')
    this.load.image(imageRegistry.SLOT, 'rolll_slot.png')


  }
}
