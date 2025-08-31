import type { RegistryEntityIdValues } from '@potato-golem/core'
import { WEAPON_SLOT_SIDES, type WeaponSlotSide } from '../../model/slot_sides/WeaponSlotSides.ts'
import type { CommonComponentDefinition } from './CommonComponents.ts'

export type WeaponComponentDefinition = CommonComponentDefinition<WeaponSlotSide>

export type WeaponComponentIds = RegistryEntityIdValues<typeof WEAPON_COMPONENTS>

export const WEAPON_COMPONENTS = {
  LASER: {
    id: 'LASER',
    name: 'Laser Cannon',
    image: 'damage',
    maxSlots: 3,
    maxDurability: 100,
    defaultSlots: [WEAPON_SLOT_SIDES.DAMAGE, WEAPON_SLOT_SIDES.DAMAGE, WEAPON_SLOT_SIDES.JAM],
    description: 'A laser cannon',
    energyUsage: 1,
  },
  MISSILE: {
    id: 'MISSILE',
    name: 'Missile Launcher',
    image: 'damage',
    maxSlots: 3,
    maxDurability: 80,
    defaultSlots: [WEAPON_SLOT_SIDES.DAMAGE, WEAPON_SLOT_SIDES.STUN, WEAPON_SLOT_SIDES.CRITICAL],
    description: 'A missile launcher with explosive warheads',
    energyUsage: 1,
  },
} as const satisfies Record<string, WeaponComponentDefinition>
