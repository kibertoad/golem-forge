import type { RegistryEntityIdValues } from '@potato-golem/core'
import type { CommonSlotSide } from './CommonSlotSide.ts'

export type WeaponSlotSidesIds = RegistryEntityIdValues<typeof WEAPON_SLOT_SIDES>

export type WeaponSlotSide = CommonSlotSide & {
  targetEffects: []
}

export const WEAPON_SLOT_SIDES = {
  DAMAGE: {
    id: 'DAMAGE',
    image: 'damage',
    targetEffects: [],
  },
  JAM: {
    id: 'JAM',
    image: 'jam',
    targetEffects: [],
  },
  CRITICAL: {
    id: 'CRITICAL',
    image: 'critical',
    targetEffects: [],
  },
  OVERHEAT: {
    id: 'OVERHEAT',
    image: 'overheat',
    targetEffects: [],
  },
  SHIELD_PIERCE: {
    id: 'SHIELD_PIERCE',
    image: 'shield_pierce',
    targetEffects: [],
  },
  STUN: {
    id: 'STUN',
    image: 'stun',
    targetEffects: [],
  },
} as const satisfies Record<string, WeaponSlotSide>
