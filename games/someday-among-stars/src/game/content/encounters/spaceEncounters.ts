import type {ChoiceDefinition, RegistryEntityIdValues} from "@potato-golem/core";
import {ChangeSceneActivation2} from "@potato-golem/ui";
import {SceneId, sceneRegistry} from "../../registries/sceneRegistry.ts";
import {getWorldModel} from "../../model/entities/WorldModel.ts";
import {EncounterModel} from "../../model/entities/EncounterModel.ts";

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
                    new ChangeSceneActivation2<SceneId>(getWorldModel().globalSceneEventEmitter, sceneRegistry.SPACE_COMBAT),
                ],
                description: 'This will trigger a fight',
                conditionsToEnable: [],
                conditionsToShow: []
            }
        ]
    },
} as const satisfies Record<string, EncounterModel>
