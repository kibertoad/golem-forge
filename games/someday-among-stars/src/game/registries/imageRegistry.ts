import type { RegistryEntityId } from '@potato-golem/core'

export type ImageId = RegistryEntityId<typeof imageRegistry>

export const imageRegistry = {
  ROCKET: 'rocket',
  PLAYER_SHIP: 'rocket',
  ABOVE_PLANET_BACKGROUND: 'rocket',
  ENCOUNTER_BACKGROUND: 'rocket',

  SLOT: 'slot',

  // slot sides
  DAMAGE: 'damage',
  CRITICAL: 'critical',
  OVERHEAT: 'overheat',
  COOLDOWN: 'cooldown',
  SHIELD_RESTORE: 'shield_restore',
  ARMOUR_RESTORE: 'armour_restore',
  JAM: 'jam',
  STUN: 'stun',
  SHIELD_PIERCE: 'shield_pierce',
} as const
