import type { RegistryEntityId } from '@potato-golem/core'

export type ImageId = RegistryEntityId<typeof imageRegistry>

export const imageRegistry = {
  ROCKET: 'rocket',
  PLAYER_SHIP: 'rocket',
  ABOVE_PLANET_BACKGROUND: 'rocket',
  ENCOUNTER_BACKGROUND: 'rocket',
} as const
