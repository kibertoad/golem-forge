import { PrefabChoicesScene } from '@potato-golem/prefab-scenes'
import type { Dependencies } from '../../diConfig.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'

export class SpaceScene extends PrefabChoicesScene<WorldModel> {
  constructor(dependencies: Dependencies) {
    super(
      {
        buttonTextureKey: imageRegistry.ROCKET,
        choicesSceneId: sceneRegistry.SPACE_SCENE,
      },
      dependencies,
    )
  }
}
