import {
  type ChoiceDefinition,
  MainStateActivation,
  type RegistryEntityIdValues,
} from '@potato-golem/core'
import { ChangeSceneActivation2 } from '@potato-golem/ui'
import { type MainStates, getWorldModel } from '../../../model/entities/WorldModel.ts'
import type { SceneId } from '../../../registries/sceneRegistry.ts'

export type CommonPlanetChoicesIds = RegistryEntityIdValues<typeof COMMON_PLANET_CHOICES>

export const COMMON_PLANET_CHOICES = {
  LIFT_OFF: {
    id: 'LIFT_OFF',
    name: 'Lift off',
    effects: [
      new MainStateActivation<MainStates>(getWorldModel(), 'space'),
      new ChangeSceneActivation2<SceneId>(getWorldModel().globalSceneEventEmitter, 'space'),
    ],
  },
} as const satisfies Record<string, ChoiceDefinition>
