import { ArmsBranch } from './ArmsBranches.ts'

export enum ArmsCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  SALVAGE = 'salvage',
}

export enum ArmsGrade {
  OBSOLETE = 'obsolete',
  LEGACY = 'legacy',
  MODERN = 'modern',
  NEXTGEN = 'nextgen',
  EXPERIMENTAL = 'experimental',
}

// Subcategory groups - categories within a group are mutually exclusive
export interface SubcategoryGroup {
  name: string
  mutuallyExclusive: boolean
  categories: string[]
}

// Missile subcategory groups
export const MissileSubcategories: SubcategoryGroup[] = [
  {
    name: 'range',
    mutuallyExclusive: true,
    categories: ['short_range', 'medium_range', 'long_range'],
  },
  {
    name: 'platform',
    mutuallyExclusive: true,
    categories: ['air_to_air', 'air_to_ground', 'ground_to_air', 'surface_to_surface', 'anti_ship'],
  },
  {
    name: 'type',
    mutuallyExclusive: true,
    categories: ['ballistic', 'cruise', 'guided', 'unguided'],
  },
  {
    name: 'features',
    mutuallyExclusive: false,
    categories: ['heat_seeking', 'radar_guided', 'laser_guided', 'fire_and_forget', 'multi_stage'],
  },
]

// Armored Vehicle subcategory groups
export const ArmoredVehicleSubcategories: SubcategoryGroup[] = [
  {
    name: 'type',
    mutuallyExclusive: true,
    categories: [
      'main_battle_tank',
      'light_tank',
      'apc',
      'ifv',
      'armored_car',
      'self_propelled_artillery',
    ],
  },
  {
    name: 'features',
    mutuallyExclusive: false,
    categories: [
      'amphibious',
      'mine_resistant',
      'reactive_armor',
      'active_protection',
      'nbc_protection',
    ],
  },
  {
    name: 'mobility',
    mutuallyExclusive: true,
    categories: ['tracked', 'wheeled', 'half_track'],
  },
]

// Aircraft subcategory groups
export const AircraftSubcategories: SubcategoryGroup[] = [
  {
    name: 'type',
    mutuallyExclusive: true,
    categories: ['fighter', 'bomber', 'attack', 'transport', 'reconnaissance', 'trainer', 'tanker'],
  },
  {
    name: 'propulsion',
    mutuallyExclusive: true,
    categories: ['jet', 'turboprop', 'helicopter', 'tiltrotor'],
  },
  {
    name: 'generation',
    mutuallyExclusive: true,
    categories: ['4th_gen', '4.5_gen', '5th_gen', '6th_gen'],
  },
  {
    name: 'features',
    mutuallyExclusive: false,
    categories: ['stealth', 'vtol', 'carrier_capable', 'all_weather', 'long_range'],
  },
]

// Small Arms subcategory groups
export const SmallArmsSubcategories: SubcategoryGroup[] = [
  {
    name: 'type',
    mutuallyExclusive: true,
    categories: [
      'assault_rifle',
      'sniper_rifle',
      'machine_gun',
      'submachine_gun',
      'handgun',
      'shotgun',
      'grenade_launcher',
    ],
  },
  {
    name: 'action',
    mutuallyExclusive: true,
    categories: ['automatic', 'semi_automatic', 'bolt_action', 'pump_action'],
  },
  {
    name: 'features',
    mutuallyExclusive: false,
    categories: ['suppressed', 'scoped', 'laser_sight', 'night_vision', 'smart_trigger'],
  },
]

// Naval subcategory groups
export const NavalSubcategories: SubcategoryGroup[] = [
  {
    name: 'type',
    mutuallyExclusive: true,
    categories: [
      'carrier',
      'destroyer',
      'frigate',
      'submarine',
      'patrol_boat',
      'corvette',
      'landing_craft',
      'cruiser',
    ],
  },
  {
    name: 'propulsion',
    mutuallyExclusive: true,
    categories: ['nuclear', 'diesel', 'gas_turbine', 'hybrid'],
  },
  {
    name: 'features',
    mutuallyExclusive: false,
    categories: ['stealth', 'aegis', 'vertical_launch', 'mine_warfare', 'anti_submarine'],
  },
]

// Quality attributes per branch
export interface QualityAttributes {
  [key: string]: number // 0-100 scale
}

export interface MissileQuality extends QualityAttributes {
  destructivePower: number // Ability to destroy targets
  accuracy: number // Hit probability
  range: number // Effective range
  evasion: number // Ability to avoid interception
  ecmResistance: number // Resistance to electronic countermeasures
  reliability: number // Chance of successful launch/detonation
}

export interface ArmoredVehicleQuality extends QualityAttributes {
  armor: number // Protection level
  firepower: number // Main gun effectiveness
  mobility: number // Speed and maneuverability
  targeting: number // Fire control system quality
  range: number // Operational range
  reliability: number // Mechanical reliability
}

export interface AircraftQuality extends QualityAttributes {
  speed: number // Maximum speed
  maneuverability: number // Dogfighting capability
  payload: number // Weapon/cargo capacity
  range: number // Operational range
  stealth: number // Radar signature reduction
  avionics: number // Electronic systems quality
}

export interface SmallArmsQuality extends QualityAttributes {
  accuracy: number // Shot precision
  fireRate: number // Rounds per minute
  reliability: number // Jam resistance
  range: number // Effective range
  stoppingPower: number // Damage per shot
  ergonomics: number // Ease of use
}

export interface NavalQuality extends QualityAttributes {
  armor: number // Hull protection
  firepower: number // Weapon systems
  speed: number // Maximum speed
  range: number // Operational range
  sensors: number // Detection capabilities
  stealth: number // Signature reduction
}

export interface ElectronicWarfareQuality extends QualityAttributes {
  jamming: number // Signal disruption capability
  detection: number // Signal intelligence gathering
  range: number // Effective range
  bandwidth: number // Frequency coverage
  power: number // Output strength
  countermeasures: number // Anti-jamming capability
}

// Get subcategory groups for a branch
export function getSubcategoryGroups(branch: ArmsBranch): SubcategoryGroup[] {
  switch (branch) {
    case ArmsBranch.MISSILES:
      return MissileSubcategories
    case ArmsBranch.ARMORED_VEHICLES:
      return ArmoredVehicleSubcategories
    case ArmsBranch.AIRCRAFT:
      return AircraftSubcategories
    case ArmsBranch.SMALL_ARMS:
      return SmallArmsSubcategories
    case ArmsBranch.NAVAL:
      return NavalSubcategories
    default:
      return []
  }
}

// Validate that subcategories don't violate mutual exclusivity
export function validateSubcategories(branch: ArmsBranch, subcategories: Set<string>): boolean {
  const groups = getSubcategoryGroups(branch)

  for (const group of groups) {
    if (group.mutuallyExclusive) {
      const matchingCategories = group.categories.filter((cat) => subcategories.has(cat))
      if (matchingCategories.length > 1) {
        console.warn(
          `Multiple mutually exclusive subcategories from group '${group.name}': ${matchingCategories.join(', ')}`,
        )
        return false
      }
    }
  }

  return true
}

export type BranchQuality =
  | MissileQuality
  | ArmoredVehicleQuality
  | AircraftQuality
  | SmallArmsQuality
  | NavalQuality
  | ElectronicWarfareQuality
  | QualityAttributes // Default for other branches

// Helper to get quality attributes for a branch
export function getDefaultQualityForBranch(branch: ArmsBranch): BranchQuality {
  switch (branch) {
    case ArmsBranch.MISSILES:
      return {
        destructivePower: 50,
        accuracy: 50,
        range: 50,
        evasion: 50,
        ecmResistance: 50,
        reliability: 50,
      }
    case ArmsBranch.ARMORED_VEHICLES:
      return {
        armor: 50,
        firepower: 50,
        mobility: 50,
        targeting: 50,
        range: 50,
        reliability: 50,
      }
    case ArmsBranch.AIRCRAFT:
      return {
        speed: 50,
        maneuverability: 50,
        payload: 50,
        range: 50,
        stealth: 50,
        avionics: 50,
      }
    case ArmsBranch.SMALL_ARMS:
      return {
        accuracy: 50,
        fireRate: 50,
        reliability: 50,
        range: 50,
        stoppingPower: 50,
        ergonomics: 50,
      }
    case ArmsBranch.NAVAL:
      return {
        armor: 50,
        firepower: 50,
        speed: 50,
        range: 50,
        sensors: 50,
        stealth: 50,
      }
    case ArmsBranch.ELECTRONIC_WARFARE:
      return {
        jamming: 50,
        detection: 50,
        range: 50,
        bandwidth: 50,
        power: 50,
        countermeasures: 50,
      }
    default:
      return {
        quality: 50,
        reliability: 50,
        effectiveness: 50,
      }
  }
}
