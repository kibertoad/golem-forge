import { PrefabChoicesScene } from '@potato-golem/prefab-scenes'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import {Dependencies} from "../../model/diConfig.ts";

export class ChoiceScene extends PrefabChoicesScene<WorldModel> {
  constructor(dependencies: Dependencies) {
    super(
      {
        buttonTextureKey: imageRegistry.ROCKET,
        choicesSceneId: sceneRegistry.CHOICES_SCENE,
      },
      dependencies,
    )
  }
}
