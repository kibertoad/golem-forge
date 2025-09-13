import { ArmsBranch } from '../enums/ArmsBranches.ts'
import type { BranchQuality } from '../enums/ArmsStockEnums.ts'
import { ArmsManufacturer } from '../enums/ArmsManufacturer.ts'

// Immutable definition of an arms product
export interface ArmsDefinition {
  id: string // Unique identifier for this arms type
  name: string // Display name
  branch: ArmsBranch // Which branch this belongs to
  subcategories: Set<string> // All applicable subcategories
  manufacturer: ArmsManufacturer // Who makes this
  basePrice: number // Base market price per unit
  qualityAttributes: BranchQuality // Quality ratings for this specific item
  description?: string // Optional flavor text
  weight?: number // Weight per unit in kg (for logistics)
  requiredTech?: string[] // Tech prerequisites to manufacture/use
}

// Example arms definitions
export const armsDefinitions: Record<string, ArmsDefinition> = {
  // MISSILES
  viper_7_aam: {
    id: 'viper_7_aam',
    name: 'Viper-7 AAM',
    branch: ArmsBranch.MISSILES,
    subcategories: new Set(['medium_range', 'air_to_air', 'guided', 'radar_guided', 'fire_and_forget']),
    manufacturer: ArmsManufacturer.NEXUS_DEFENSE,
    basePrice: 1200000,
    qualityAttributes: {
      destructivePower: 75,
      accuracy: 90,
      range: 85,
      evasion: 70,
      ecmResistance: 80,
      reliability: 95,
    },
    description: 'Advanced medium-range air-to-air missile with active radar guidance',
    weight: 152,
  },

  talon_atg: {
    id: 'talon_atg',
    name: 'Talon ATG',
    branch: ArmsBranch.MISSILES,
    subcategories: new Set(['short_range', 'air_to_ground', 'guided', 'laser_guided']),
    manufacturer: ArmsManufacturer.TITAN_AEROSPACE,
    basePrice: 150000,
    qualityAttributes: {
      destructivePower: 85,
      accuracy: 95,
      range: 45,
      evasion: 30,
      ecmResistance: 60,
      reliability: 90,
    },
    description: 'Laser-guided anti-tank missile for helicopters and drones',
    weight: 49,
  },

  horizon_cm: {
    id: 'horizon_cm',
    name: 'Horizon CM',
    branch: ArmsBranch.MISSILES,
    subcategories: new Set(['long_range', 'surface_to_surface', 'cruise', 'guided']),
    manufacturer: ArmsManufacturer.NEXUS_DEFENSE,
    basePrice: 1800000,
    qualityAttributes: {
      destructivePower: 95,
      accuracy: 85,
      range: 100,
      evasion: 60,
      ecmResistance: 70,
      reliability: 88,
    },
    description: 'Long-range subsonic cruise missile for land attack',
    weight: 1440,
  },

  // ARMORED VEHICLES
  thunderbolt_mbt: {
    id: 'thunderbolt_mbt',
    name: 'Thunderbolt MBT',
    branch: ArmsBranch.ARMORED_VEHICLES,
    subcategories: new Set(['main_battle_tank', 'tracked', 'reactive_armor', 'nbc_protection']),
    manufacturer: ArmsManufacturer.IRONFORGE,
    basePrice: 8900000,
    qualityAttributes: {
      armor: 95,
      firepower: 90,
      mobility: 70,
      targeting: 95,
      range: 65,
      reliability: 85,
    },
    description: 'Third-generation American main battle tank',
    weight: 68000,
  },

  wolverine_ifv: {
    id: 'wolverine_ifv',
    name: 'Wolverine IFV',
    branch: ArmsBranch.ARMORED_VEHICLES,
    subcategories: new Set(['ifv', 'tracked', 'amphibious', 'nbc_protection']),
    manufacturer: ArmsManufacturer.APEX_ARMAMENTS,
    basePrice: 3200000,
    qualityAttributes: {
      armor: 65,
      firepower: 70,
      mobility: 80,
      targeting: 75,
      range: 75,
      reliability: 80,
    },
    description: 'Infantry fighting vehicle with troop transport capability',
    weight: 27600,
  },

  guardian_apc: {
    id: 'guardian_apc',
    name: 'Guardian APC',
    branch: ArmsBranch.ARMORED_VEHICLES,
    subcategories: new Set(['apc', 'wheeled', 'mine_resistant']),
    manufacturer: ArmsManufacturer.IRONFORGE,
    basePrice: 4900000,
    qualityAttributes: {
      armor: 60,
      firepower: 50,
      mobility: 85,
      targeting: 60,
      range: 80,
      reliability: 88,
    },
    description: 'Eight-wheeled armored personnel carrier',
    weight: 18000,
  },

  // AIRCRAFT
  phantom_x5: {
    id: 'phantom_x5',
    name: 'Phantom X5',
    branch: ArmsBranch.AIRCRAFT,
    subcategories: new Set(['fighter', 'jet', '5th_gen', 'stealth', 'vtol', 'all_weather']),
    manufacturer: ArmsManufacturer.TITAN_AEROSPACE,
    basePrice: 80000000,
    qualityAttributes: {
      speed: 85,
      maneuverability: 80,
      payload: 75,
      range: 70,
      stealth: 95,
      avionics: 98,
    },
    description: 'Fifth-generation stealth multirole fighter',
    weight: 13200,
  },

  havoc_gunship: {
    id: 'havoc_gunship',
    name: 'Havoc Gunship',
    branch: ArmsBranch.AIRCRAFT,
    subcategories: new Set(['attack', 'helicopter', 'all_weather']),
    manufacturer: ArmsManufacturer.SKYFORGE,
    basePrice: 35000000,
    qualityAttributes: {
      speed: 55,
      maneuverability: 85,
      payload: 80,
      range: 60,
      stealth: 30,
      avionics: 85,
    },
    description: 'Twin-turboshaft attack helicopter',
    weight: 5165,
  },

  // SMALL ARMS
  nexus_ac7: {
    id: 'nexus_ac7',
    name: 'Nexus AC-7',
    branch: ArmsBranch.SMALL_ARMS,
    subcategories: new Set(['assault_rifle', 'automatic', 'scoped']),
    manufacturer: ArmsManufacturer.PRECISION_ARMS,
    basePrice: 700,
    qualityAttributes: {
      accuracy: 75,
      fireRate: 80,
      reliability: 85,
      range: 70,
      stoppingPower: 65,
      ergonomics: 90,
    },
    description: '5.56mm selective-fire carbine',
    weight: 3.4,
  },

  longshot_50: {
    id: 'longshot_50',
    name: 'Longshot .50',
    branch: ArmsBranch.SMALL_ARMS,
    subcategories: new Set(['sniper_rifle', 'semi_automatic', 'scoped']),
    manufacturer: ArmsManufacturer.EAGLE_EYE,
    basePrice: 8900,
    qualityAttributes: {
      accuracy: 95,
      fireRate: 30,
      reliability: 80,
      range: 100,
      stoppingPower: 100,
      ergonomics: 40,
    },
    description: '.50 caliber anti-materiel sniper rifle',
    weight: 14,
  },

  // NAVAL
  leviathan_destroyer: {
    id: 'leviathan_destroyer',
    name: 'Leviathan-class Destroyer',
    branch: ArmsBranch.NAVAL,
    subcategories: new Set(['destroyer', 'gas_turbine', 'aegis', 'vertical_launch', 'anti_submarine']),
    manufacturer: ArmsManufacturer.MARITIME_DEFENSE,
    basePrice: 1800000000,
    qualityAttributes: {
      armor: 70,
      firepower: 90,
      speed: 75,
      range: 85,
      sensors: 95,
      stealth: 60,
    },
    description: 'Guided missile destroyer with advanced combat system',
    weight: 9200000,
  },

  // ELECTRONIC WARFARE
  spectre_ew_suite: {
    id: 'spectre_ew_suite',
    name: 'Spectre EW Suite',
    branch: ArmsBranch.ELECTRONIC_WARFARE,
    subcategories: new Set(['airborne', 'tactical_jamming']),
    manufacturer: ArmsManufacturer.NEXUS_DEFENSE,
    basePrice: 12000000,
    qualityAttributes: {
      jamming: 85,
      detection: 70,
      range: 80,
      bandwidth: 90,
      power: 85,
      countermeasures: 75,
    },
    description: 'Tactical jamming system for electronic warfare aircraft',
    weight: 950,
  },

  // DRONES
  sentinel_uav: {
    id: 'sentinel_uav',
    name: 'Sentinel UAV',
    branch: ArmsBranch.DRONES,
    subcategories: new Set(['attack', 'reconnaissance', 'long_endurance']),
    manufacturer: ArmsManufacturer.AUTONOMOUS_SYSTEMS,
    basePrice: 32000000,
    qualityAttributes: {
      endurance: 95,
      payload: 75,
      sensors: 85,
      range: 90,
      reliability: 80,
    },
    description: 'Hunter-killer unmanned aerial vehicle',
    weight: 2223,
  },

  // LOW-TIER WEAPONS
  // Desert Forge products
  scorpion_rifle: {
    id: 'scorpion_rifle',
    name: 'Scorpion R-47',
    branch: ArmsBranch.SMALL_ARMS,
    subcategories: new Set(['assault_rifle', 'automatic']),
    manufacturer: ArmsManufacturer.DESERT_FORGE,
    basePrice: 350,
    qualityAttributes: {
      accuracy: 45,
      fireRate: 65,
      reliability: 55,
      range: 50,
      stoppingPower: 60,
      ergonomics: 40,
    },
    description: 'Rugged, simple assault rifle designed for desert conditions',
    weight: 4.5,
  },

  dune_runner_apc: {
    id: 'dune_runner_apc',
    name: 'Dune Runner Light APC',
    branch: ArmsBranch.ARMORED_VEHICLES,
    subcategories: new Set(['apc', 'wheeled']),
    manufacturer: ArmsManufacturer.DESERT_FORGE,
    basePrice: 180000,
    qualityAttributes: {
      armor: 35,
      firepower: 25,
      mobility: 70,
      targeting: 30,
      range: 65,
      reliability: 60,
    },
    description: 'Lightly armored personnel carrier built on truck chassis',
    weight: 8000,
  },

  // Liberty Surplus products
  patriot_surplus_rifle: {
    id: 'patriot_surplus_rifle',
    name: 'Patriot M-16A1 (Surplus)',
    branch: ArmsBranch.SMALL_ARMS,
    subcategories: new Set(['assault_rifle', 'semi_automatic']),
    manufacturer: ArmsManufacturer.LIBERTY_SURPLUS,
    basePrice: 200,
    qualityAttributes: {
      accuracy: 50,
      fireRate: 40,
      reliability: 35,
      range: 55,
      stoppingPower: 50,
      ergonomics: 45,
    },
    description: 'Refurbished military surplus rifle from the 1980s',
    weight: 3.9,
  },

  // Iron Curtain products
  grad_lite: {
    id: 'grad_lite',
    name: 'Grad-L Rocket System',
    branch: ArmsBranch.ARTILLERY,
    subcategories: new Set(['rocket_artillery', 'mobile']),
    manufacturer: ArmsManufacturer.IRON_CURTAIN,
    basePrice: 450000,
    qualityAttributes: {
      firepower: 70,
      accuracy: 30,
      range: 60,
      reliability: 50,
      rateOfFire: 65,
    },
    description: 'Simplified multiple rocket launcher based on old designs',
    weight: 12000,
  },

  steel_bear_tank: {
    id: 'steel_bear_tank',
    name: 'Steel Bear T-64M',
    branch: ArmsBranch.ARMORED_VEHICLES,
    subcategories: new Set(['main_battle_tank', 'tracked']),
    manufacturer: ArmsManufacturer.IRON_CURTAIN,
    basePrice: 1200000,
    qualityAttributes: {
      armor: 60,
      firepower: 65,
      mobility: 45,
      targeting: 40,
      range: 50,
      reliability: 55,
    },
    description: 'Modernized version of 1970s main battle tank',
    weight: 42000,
  },

  // Guerrilla Works products
  jungle_viper_smg: {
    id: 'jungle_viper_smg',
    name: 'Jungle Viper SMG',
    branch: ArmsBranch.SMALL_ARMS,
    subcategories: new Set(['submachine_gun', 'automatic', 'suppressed']),
    manufacturer: ArmsManufacturer.GUERRILLA_WORKS,
    basePrice: 450,
    qualityAttributes: {
      accuracy: 35,
      fireRate: 80,
      reliability: 45,
      range: 25,
      stoppingPower: 40,
      ergonomics: 65,
    },
    description: 'Compact SMG favored by irregular forces',
    weight: 2.2,
  },

  wasp_drone: {
    id: 'wasp_drone',
    name: 'Wasp Surveillance Drone',
    branch: ArmsBranch.DRONES,
    subcategories: new Set(['reconnaissance', 'commercial_grade']),
    manufacturer: ArmsManufacturer.GUERRILLA_WORKS,
    basePrice: 8000,
    qualityAttributes: {
      endurance: 30,
      payload: 10,
      sensors: 40,
      range: 35,
      reliability: 45,
    },
    description: 'Modified commercial drone for basic reconnaissance',
    weight: 5,
  },

  // Budget Ballistics products
  thunder_rocket: {
    id: 'thunder_rocket',
    name: 'Thunder-1 Rocket',
    branch: ArmsBranch.MISSILES,
    subcategories: new Set(['short_range', 'surface_to_surface', 'unguided']),
    manufacturer: ArmsManufacturer.BUDGET_BALLISTICS,
    basePrice: 5000,
    qualityAttributes: {
      destructivePower: 55,
      accuracy: 20,
      range: 30,
      evasion: 10,
      ecmResistance: 15,
      reliability: 60,
    },
    description: 'Simple unguided rocket for area bombardment',
    weight: 70,
  },

  hawk_eye_missile: {
    id: 'hawk_eye_missile',
    name: 'Hawk Eye SAM',
    branch: ArmsBranch.MISSILES,
    subcategories: new Set(['short_range', 'ground_to_air', 'guided']),
    manufacturer: ArmsManufacturer.BUDGET_BALLISTICS,
    basePrice: 45000,
    qualityAttributes: {
      destructivePower: 50,
      accuracy: 55,
      range: 40,
      evasion: 25,
      ecmResistance: 30,
      reliability: 65,
    },
    description: 'Basic surface-to-air missile for point defense',
    weight: 85,
  },

  // Frontier Arms products
  rhino_mrap: {
    id: 'rhino_mrap',
    name: 'Rhino MRAP',
    branch: ArmsBranch.ARMORED_VEHICLES,
    subcategories: new Set(['armored_car', 'wheeled', 'mine_resistant']),
    manufacturer: ArmsManufacturer.FRONTIER_ARMS,
    basePrice: 380000,
    qualityAttributes: {
      armor: 55,
      firepower: 35,
      mobility: 60,
      targeting: 35,
      range: 70,
      reliability: 70,
    },
    description: 'Mine-resistant ambush protected vehicle',
    weight: 14000,
  },

  bushmaster_rifle: {
    id: 'bushmaster_rifle',
    name: 'Bushmaster BR-8',
    branch: ArmsBranch.SMALL_ARMS,
    subcategories: new Set(['assault_rifle', 'semi_automatic']),
    manufacturer: ArmsManufacturer.FRONTIER_ARMS,
    basePrice: 600,
    qualityAttributes: {
      accuracy: 60,
      fireRate: 50,
      reliability: 65,
      range: 65,
      stoppingPower: 55,
      ergonomics: 55,
    },
    description: 'Reliable rifle designed for harsh African conditions',
    weight: 4.1,
  },

  // Backyard Defense products
  copycat_ak: {
    id: 'copycat_ak',
    name: 'Copycat AK-47',
    branch: ArmsBranch.SMALL_ARMS,
    subcategories: new Set(['assault_rifle', 'automatic']),
    manufacturer: ArmsManufacturer.BACKYARD_DEFENSE,
    basePrice: 150,
    qualityAttributes: {
      accuracy: 30,
      fireRate: 60,
      reliability: 40,
      range: 40,
      stoppingPower: 55,
      ergonomics: 35,
    },
    description: 'Locally produced copy of famous assault rifle',
    weight: 4.8,
  },

  thunder_mortar: {
    id: 'thunder_mortar',
    name: 'Thunder Mortar 81mm',
    branch: ArmsBranch.ARTILLERY,
    subcategories: new Set(['mortar', 'portable']),
    manufacturer: ArmsManufacturer.BACKYARD_DEFENSE,
    basePrice: 3000,
    qualityAttributes: {
      firepower: 45,
      accuracy: 35,
      range: 40,
      reliability: 45,
      rateOfFire: 50,
    },
    description: 'Simple mortar system for indirect fire support',
    weight: 45,
  },
}