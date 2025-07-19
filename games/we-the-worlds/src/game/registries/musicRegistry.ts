import type { RegistryEntityId } from '@potato-golem/core'

export type MusicId = RegistryEntityId<typeof musicRegistry>

export const musicRegistry = {
  MAIN_THEME: 'mainTheme',
} as const
