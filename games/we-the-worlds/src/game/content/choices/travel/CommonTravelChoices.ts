import {
    type ChoiceDefinition,
    MainStateActivation,
    type RegistryEntityIdValues,
} from '@potato-golem/core'
import { ChangeSceneActivation2 } from '@potato-golem/ui'
import { type MainStates, getWorldModel } from '../../../model/entities/WorldModel.ts'
import type { SceneId } from '../../../registries/sceneRegistry.ts'

export type CommonPlanetChoicesIds = RegistryEntityIdValues<typeof COMMON_TRAVEL_CHOICES>

export const COMMON_TRAVEL_CHOICES = {
    COMBAT: {
        id: 'COMBAT',
        name: 'Start combat',
        effects: [
            new MainStateActivation<MainStates>(getWorldModel(), 'combat'),
            new ChangeSceneActivation2<SceneId>(getWorldModel().globalSceneEventEmitter, 'board'),
        ],
    },
} as const satisfies Record<string, ChoiceDefinition>
