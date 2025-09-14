import type { RegistryEntityId } from '@potato-golem/core'

export type ImageId = RegistryEntityId<typeof imageRegistry>

export const imageRegistry = {
  ROCKET: 'rocket',
  EXPLOSION: 'explosion',
} as const
