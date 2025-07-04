import type { RegistryEntityId } from '@potato-golem/core'
import { storyRegistry } from './district1StoryDefinitions.ts'
import { StartStoryActivation } from '../../../model/activations/StartStoryActivation.ts'
import type {ChoiceDefinition} from "../../definitionInterfaces.ts";

export const choiceRegistry = {
  EXPLORE_DISTRICT_1: 'exploreDistrict1',
} as const

export const district1ChoiceDefinitions = {
  exploreDistrict1: {
    id: choiceRegistry.EXPLORE_DISTRICT_1,
    name: 'Explore District 1',
    description: 'Might as well understand where you are',
    image: 'card_background_decor',
    effects: [new StartStoryActivation(storyRegistry.EXPLORE_DISTRICT_1)]
  },
} as const satisfies Record<RegistryEntityId<typeof choiceRegistry>, ChoiceDefinition>
