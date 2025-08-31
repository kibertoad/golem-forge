import type { RegistryEntityIdValues } from '@potato-golem/core'
import {
  CRITICAL_DAMAGE_ACTIVATION,
  DAMAGE_ACTIVATION,
  PIERCE_DAMAGE_ACTIVATION,
  type TargettedActivation,
} from '../activations/activations.ts'
import type { CommonSlotSide } from './CommonSlotSide.ts'

export type WeaponSlotSidesIds = RegistryEntityIdValues<typeof WEAPON_SLOT_SIDES>

export type WeaponSlotSide = CommonSlotSide & {
  targetEffects: TargettedActivation[]
}

export const WEAPON_SLOT_SIDES = {
  DAMAGE: {
    id: 'DAMAGE',
    image: 'damage',
    targetEffects: [DAMAGE_ACTIVATION],
  },
  JAM: {
    id: 'JAM',
    image: 'jam',
    targetEffects: [],
  },
  CRITICAL: {
    id: 'CRITICAL',
    image: 'critical',
    targetEffects: [CRITICAL_DAMAGE_ACTIVATION], // Critical uses double damage activation
  },
  OVERHEAT: {
    id: 'OVERHEAT',
    image: 'overheat',
    targetEffects: [],
  },
  SHIELD_PIERCE: {
    id: 'SHIELD_PIERCE',
    image: 'shield_pierce',
    targetEffects: [PIERCE_DAMAGE_ACTIVATION], // Pierce bypasses shields and hits hull directly
  },
  STUN: {
    id: 'STUN',
    image: 'stun',
    targetEffects: [],
  },
} as const satisfies Record<string, WeaponSlotSide>
