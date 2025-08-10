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
    defaultSlots: [WEAPON_SLOT_SIDES.DAMAGE, WEAPON_SLOT_SIDES.DAMAGE, WEAPON_SLOT_SIDES.DAMAGE],
    description: 'A laser cannon',
  },
} as const satisfies Record<string, WeaponComponentDefinition>
