import type { RegistryEntityId } from '@potato-golem/core'
import { EndStoryActivation } from '../../../model/activations/EndStoryActivation.ts'
import type { StoryDefinition } from '../../definitionInterfaces.ts'

export const storyRegistry = {
  EXPLORE_DISTRICT_1: 'exploreDistrict1',
} as const

export const district1StoryDefinitions = {
  exploreDistrict1: {
    id: storyRegistry.EXPLORE_DISTRICT_1,
    name: 'Explore District 1',
    image: 'card_background_decor',
    choices: [
      {
        id: 'careful',
        name: 'Careful exploration',
        description: 'Take your time, leave no traces',
        image: 'card_background_decor',
        effects: [new EndStoryActivation()],
      },
    ],
  },
} as const satisfies Record<RegistryEntityId<typeof storyRegistry>, StoryDefinition>
