import { PrefabChoicesScene } from '@potato-golem/prefab-scenes'
import type { ChoicesSceneDependencies } from '@potato-golem/prefab-scenes'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'

export class ChoiceScene extends PrefabChoicesScene<WorldModel> {
  constructor(dependencies: ChoicesSceneDependencies<WorldModel>) {
    super(
      {
        buttonTextureKey: imageRegistry.ROCKET,
        choicesSceneId: sceneRegistry.CHOICES_SCENE,
      },
      dependencies,
    )
  }
}
