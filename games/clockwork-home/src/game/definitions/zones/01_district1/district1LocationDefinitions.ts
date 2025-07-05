import {
  type RegistryEntityId,
  ValueSufficientPrecondition,
  buildValueSufficientPreconditions,
} from '@potato-golem/core'
import { StoryConclusionActivation } from '../../../model/activations/StoryConclusionActivation.ts'
import { worldModel } from '../../../model/entities/WorldModel.ts'
import { NeverPrecondition } from '../../../model/preconditions/NeverPrecondition.ts'
import type { LocationDefinition } from '../common/LocationDefinition.ts'

export const locationRegistry = {
  EXPLORE_DISTRICT_1: 'exploreDistrict1',
  BACK_ALLEY_SAWBONES: 'backAlleySawbones',
  YACHT: 'yacht',
} as const

export const district1LocationDefinitions = {
  exploreDistrict1: {
    id: locationRegistry.EXPLORE_DISTRICT_1,
    name: 'Explore District 1',
    image: 'card_background_decor',
    stories: [],
  },

  backAlleySawbones: {
    id: locationRegistry.BACK_ALLEY_SAWBONES,
    name: 'Back Alley Sawbones',
    image: 'card_background_decor',
    stories: [
      {
        id: 'patchup_job',
        name: 'Get a quick patchup job',
        conditionsToEnable: buildValueSufficientPreconditions([
          {
            trackedValue: worldModel.playerStates.energy,
            targetValue: 3,
          },
          {
            trackedValue: worldModel.playerStates.kibble,
            targetValue: 20,
          },
        ]),
        effects: [
          new StoryConclusionActivation({
            text: 'The pain. The blood. Hope it was all worth it.',
            image: 'rocket',
            stateChanges: {
              kibble: -20,
            },
          }),
        ],
        image: 'rocket',
      },

      {
        id: 'buy_cheap_meds',
        name: 'Buy some cheap meds',
        conditionsToEnable: [new ValueSufficientPrecondition(worldModel.playerStates.kibble, 10)],
        effects: [
          new StoryConclusionActivation({
            text: 'Will it make you feel better? No. But will it eventually help? Who knows.',
            image: 'rocket',
            stateChanges: {
              kibble: 1,
            },
          }),
        ],
        image: 'rocket',
      },
    ],
  },

  yacht: {
    id: locationRegistry.YACHT,
    name: 'Back Alley Sawbones',
    image: 'card_background_decor',
    stories: [],
    conditionsToShow: [new NeverPrecondition()],
  },
} as const satisfies Record<RegistryEntityId<typeof locationRegistry>, LocationDefinition>
