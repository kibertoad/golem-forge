import type { ChoiceDefinition, RegistryEntityIdValues } from '@potato-golem/core'
import { ChangeSceneActivation2 } from '@potato-golem/ui'
import { getWorldModel } from '../../../model/entities/WorldModel.ts'
import {SceneId, sceneRegistry} from '../../../registries/sceneRegistry.ts'

export type CommonSpaceChoicesIds = RegistryEntityIdValues<typeof COMMON_SPACE_CHOICES>

export const COMMON_SPACE_CHOICES = {
  CHART_COURSE: {
    id: 'CHART_COURSE',
    name: 'Chart the course',
    effects: [
      // new ChangeSceneActivation2<SceneId>(getWorldModel().globalSceneEventEmitter, sceneRegistry.STARMAP_SCENE),
      new ChangeSceneActivation2<SceneId>(getWorldModel().globalSceneEventEmitter, sceneRegistry.SPACE_COMBAT),
    ],
  },
} as const satisfies Record<string, ChoiceDefinition>
