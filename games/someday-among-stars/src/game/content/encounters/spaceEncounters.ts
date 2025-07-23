import type { RegistryEntityIdValues } from '@potato-golem/core'
import { ChangeSceneActivation2 } from '@potato-golem/ui'
import type { EncounterModel } from '../../model/entities/EncounterModel.ts'
import { getWorldModel } from '../../model/entities/WorldModel.ts'
import { type SceneId, sceneRegistry } from '../../registries/sceneRegistry.ts'

export type SpaceEncountersIds = RegistryEntityIdValues<typeof SPACE_ENCOUNTERS>

export const SPACE_ENCOUNTERS = {
  PIRATES: {
    id: 'PIRATES',
    name: 'Pirates',
    choices: [
      {
        id: '1',
        name: 'Fight!',
        effects: [
          new ChangeSceneActivation2<SceneId>(
            getWorldModel().globalSceneEventEmitter,
            sceneRegistry.SPACE_COMBAT,
          ),
        ],
        description: 'This will trigger a fight',
        conditionsToEnable: [],
        conditionsToShow: [],
      },
    ],
  },
} as const satisfies Record<string, EncounterModel>
