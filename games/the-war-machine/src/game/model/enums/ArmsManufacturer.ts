import { ArmsBranch } from './ArmsBranches.ts'
import { Country } from './Countries.ts'

export enum ArmsManufacturer {
  NEXUS_DEFENSE = 'nexus_defense',
  TITAN_AEROSPACE = 'titan_aerospace',
  IRONFORGE = 'ironforge',
  APEX_ARMAMENTS = 'apex_armaments',
  SKYFORGE = 'skyforge',
  PRECISION_ARMS = 'precision_arms',
  EAGLE_EYE = 'eagle_eye',
  MARITIME_DEFENSE = 'maritime_defense',
  AUTONOMOUS_SYSTEMS = 'autonomous_systems',
  SHADOW_WORKS = 'shadow_works',
  QUANTUM_DYNAMICS = 'quantum_dynamics',
  FORTRESS_HEAVY = 'fortress_heavy',
  REDSTAR_ARMS = 'redstar_arms',
  SAKURA_TECH = 'sakura_tech',
  EUROPA_DEFENSE = 'europa_defense',
  DESERT_FORGE = 'desert_forge',
  LIBERTY_SURPLUS = 'liberty_surplus',
  IRON_CURTAIN = 'iron_curtain',
  GUERRILLA_WORKS = 'guerrilla_works',
  BUDGET_BALLISTICS = 'budget_ballistics',
  FRONTIER_ARMS = 'frontier_arms',
  BACKYARD_DEFENSE = 'backyard_defense',
}

export interface ManufacturerInfo {
  id: ArmsManufacturer
  displayName: string
  country: Country
  prestigeLevel: number // 1-5, where 5 is most prestigious
  technologyLevel: number // 1-5, where 5 is cutting edge
  manufacturingScale: number // 1-5, where 5 is massive scale
  branches: ArmsBranch[] // Which branches they specialize in
  description: string
  foundedYear?: number // In-game year
  specialties?: string[] // Specific product focuses
}

export const manufacturerDetails: Record<ArmsManufacturer, ManufacturerInfo> = {
  [ArmsManufacturer.NEXUS_DEFENSE]: {
    id: ArmsManufacturer.NEXUS_DEFENSE,
    displayName: 'Nexus Defense Systems',
    country: Country.USA,
    prestigeLevel: 5,
    technologyLevel: 5,
    manufacturingScale: 4,
    branches: [ArmsBranch.MISSILES, ArmsBranch.ELECTRONIC_WARFARE, ArmsBranch.CYBER_WARFARE],
    description: 'Premier high-tech defense contractor specializing in advanced missile systems and electronic warfare',
    specialties: ['radar_guided_missiles', 'ecm_systems', 'cyber_defense'],
  },
  [ArmsManufacturer.TITAN_AEROSPACE]: {
    id: ArmsManufacturer.TITAN_AEROSPACE,
    displayName: 'Titan Aerospace',
    country: Country.USA,
    prestigeLevel: 5,
    technologyLevel: 5,
    manufacturingScale: 5,
    branches: [ArmsBranch.AIRCRAFT, ArmsBranch.MISSILES, ArmsBranch.SPACE],
    description: 'Leading aerospace giant producing cutting-edge fighter jets and space systems',
    specialties: ['stealth_aircraft', 'air_to_air_missiles', 'satellite_systems'],
  },
  [ArmsManufacturer.IRONFORGE]: {
    id: ArmsManufacturer.IRONFORGE,
    displayName: 'Ironforge Industries',
    country: Country.GERMANY,
    prestigeLevel: 4,
    technologyLevel: 4,
    manufacturingScale: 5,
    branches: [ArmsBranch.ARMORED_VEHICLES, ArmsBranch.ARTILLERY],
    description: 'Renowned for heavily armored vehicles and self-propelled artillery',
    specialties: ['main_battle_tanks', 'reactive_armor', 'mobile_artillery'],
  },
  [ArmsManufacturer.APEX_ARMAMENTS]: {
    id: ArmsManufacturer.APEX_ARMAMENTS,
    displayName: 'Apex Armaments',
    country: Country.UK,
    prestigeLevel: 3,
    technologyLevel: 3,
    manufacturingScale: 3,
    branches: [ArmsBranch.ARMORED_VEHICLES, ArmsBranch.SMALL_ARMS],
    description: 'Versatile manufacturer of infantry fighting vehicles and small arms',
    specialties: ['ifv_systems', 'assault_rifles', 'urban_combat'],
  },
  [ArmsManufacturer.SKYFORGE]: {
    id: ArmsManufacturer.SKYFORGE,
    displayName: 'SkyForge Corporation',
    country: Country.FRANCE,
    prestigeLevel: 4,
    technologyLevel: 4,
    manufacturingScale: 3,
    branches: [ArmsBranch.AIRCRAFT, ArmsBranch.DRONES],
    description: 'European leader in military aviation and unmanned systems',
    specialties: ['attack_helicopters', 'reconnaissance_drones'],
  },
  [ArmsManufacturer.PRECISION_ARMS]: {
    id: ArmsManufacturer.PRECISION_ARMS,
    displayName: 'Precision Arms Co',
    country: Country.SWITZERLAND,
    prestigeLevel: 3,
    technologyLevel: 3,
    manufacturingScale: 2,
    branches: [ArmsBranch.SMALL_ARMS, ArmsBranch.AMMUNITION],
    description: 'Boutique manufacturer of high-quality firearms and specialty ammunition',
    specialties: ['sniper_rifles', 'match_grade_ammo'],
  },
  [ArmsManufacturer.EAGLE_EYE]: {
    id: ArmsManufacturer.EAGLE_EYE,
    displayName: 'Eagle Eye Firearms',
    country: Country.CANADA,
    prestigeLevel: 3,
    technologyLevel: 3,
    manufacturingScale: 2,
    branches: [ArmsBranch.SMALL_ARMS, ArmsBranch.SURVEILLANCE],
    description: 'Specialized in precision firearms with integrated optics',
    specialties: ['long_range_rifles', 'smart_scopes'],
  },
  [ArmsManufacturer.MARITIME_DEFENSE]: {
    id: ArmsManufacturer.MARITIME_DEFENSE,
    displayName: 'Maritime Defense Group',
    country: Country.UK,
    prestigeLevel: 5,
    technologyLevel: 4,
    manufacturingScale: 4,
    branches: [ArmsBranch.NAVAL, ArmsBranch.MISSILES],
    description: 'Premier naval contractor for destroyers and naval missile systems',
    specialties: ['destroyers', 'anti_ship_missiles', 'submarine_warfare'],
  },
  [ArmsManufacturer.AUTONOMOUS_SYSTEMS]: {
    id: ArmsManufacturer.AUTONOMOUS_SYSTEMS,
    displayName: 'Autonomous Systems Inc',
    country: Country.ISRAEL,
    prestigeLevel: 4,
    technologyLevel: 5,
    manufacturingScale: 2,
    branches: [ArmsBranch.DRONES, ArmsBranch.SURVEILLANCE, ArmsBranch.ELECTRONIC_WARFARE],
    description: 'Cutting-edge autonomous warfare and intelligence systems',
    specialties: ['ai_drones', 'swarm_technology', 'signal_intelligence'],
  },
  [ArmsManufacturer.SHADOW_WORKS]: {
    id: ArmsManufacturer.SHADOW_WORKS,
    displayName: 'Shadow Works Limited',
    country: Country.CHINA,
    prestigeLevel: 2,
    technologyLevel: 3,
    manufacturingScale: 5,
    branches: [ArmsBranch.MISSILES, ArmsBranch.ARMORED_VEHICLES, ArmsBranch.SMALL_ARMS],
    description: 'High-volume manufacturer offering cost-effective military equipment',
    specialties: ['mass_production', 'reverse_engineering'],
  },
  [ArmsManufacturer.QUANTUM_DYNAMICS]: {
    id: ArmsManufacturer.QUANTUM_DYNAMICS,
    displayName: 'Quantum Dynamics',
    country: Country.JAPAN,
    prestigeLevel: 4,
    technologyLevel: 5,
    manufacturingScale: 2,
    branches: [ArmsBranch.CYBER_WARFARE, ArmsBranch.ELECTRONIC_WARFARE, ArmsBranch.COMMUNICATIONS],
    description: 'Advanced electronic and cyber warfare systems',
    specialties: ['quantum_encryption', 'emp_weapons', 'secure_comms'],
  },
  [ArmsManufacturer.FORTRESS_HEAVY]: {
    id: ArmsManufacturer.FORTRESS_HEAVY,
    displayName: 'Fortress Heavy Industries',
    country: Country.RUSSIA,
    prestigeLevel: 3,
    technologyLevel: 3,
    manufacturingScale: 4,
    branches: [ArmsBranch.ARMORED_VEHICLES, ArmsBranch.ARTILLERY, ArmsBranch.MISSILES],
    description: 'Rugged, reliable heavy weapons and armor',
    specialties: ['heavy_tanks', 'rocket_artillery', 'ballistic_missiles'],
  },
  [ArmsManufacturer.REDSTAR_ARMS]: {
    id: ArmsManufacturer.REDSTAR_ARMS,
    displayName: 'RedStar Arms Corporation',
    country: Country.RUSSIA,
    prestigeLevel: 2,
    technologyLevel: 2,
    manufacturingScale: 5,
    branches: [ArmsBranch.SMALL_ARMS, ArmsBranch.AMMUNITION, ArmsBranch.LOGISTICS],
    description: 'Mass producer of reliable, affordable infantry weapons',
    specialties: ['assault_rifles', 'grenades', 'field_equipment'],
  },
  [ArmsManufacturer.SAKURA_TECH]: {
    id: ArmsManufacturer.SAKURA_TECH,
    displayName: 'Sakura Technologies',
    country: Country.JAPAN,
    prestigeLevel: 4,
    technologyLevel: 5,
    manufacturingScale: 3,
    branches: [ArmsBranch.DRONES, ArmsBranch.SURVEILLANCE, ArmsBranch.SPACE],
    description: 'Miniaturized drones and advanced reconnaissance technology',
    specialties: ['micro_drones', 'satellite_imaging', 'stealth_tech'],
  },
  [ArmsManufacturer.EUROPA_DEFENSE]: {
    id: ArmsManufacturer.EUROPA_DEFENSE,
    displayName: 'Europa Defense Consortium',
    country: Country.GERMANY,
    prestigeLevel: 4,
    technologyLevel: 4,
    manufacturingScale: 4,
    branches: [ArmsBranch.AIRCRAFT, ArmsBranch.NAVAL, ArmsBranch.MISSILES],
    description: 'Pan-European defense collaboration for major systems',
    specialties: ['multirole_fighters', 'frigates', 'cruise_missiles'],
  },
  [ArmsManufacturer.DESERT_FORGE]: {
    id: ArmsManufacturer.DESERT_FORGE,
    displayName: 'Desert Forge Industries',
    country: Country.EGYPT,
    prestigeLevel: 1,
    technologyLevel: 2,
    manufacturingScale: 3,
    branches: [ArmsBranch.SMALL_ARMS, ArmsBranch.AMMUNITION, ArmsBranch.ARMORED_VEHICLES],
    description: 'Regional supplier of basic military equipment, known for rugged desert-tested gear',
    specialties: ['simple_firearms', 'light_armor', 'surplus_ammo'],
  },
  [ArmsManufacturer.LIBERTY_SURPLUS]: {
    id: ArmsManufacturer.LIBERTY_SURPLUS,
    displayName: 'Liberty Surplus Co',
    country: Country.USA,
    prestigeLevel: 1,
    technologyLevel: 1,
    manufacturingScale: 2,
    branches: [ArmsBranch.SMALL_ARMS, ArmsBranch.LOGISTICS, ArmsBranch.COMMUNICATIONS],
    description: 'Refurbishes and resells military surplus, popular with militias and budget forces',
    specialties: ['surplus_rifles', 'used_radios', 'refurbished_gear'],
  },
  [ArmsManufacturer.IRON_CURTAIN]: {
    id: ArmsManufacturer.IRON_CURTAIN,
    displayName: 'Iron Curtain Works',
    country: Country.UKRAINE,
    prestigeLevel: 2,
    technologyLevel: 2,
    manufacturingScale: 3,
    branches: [ArmsBranch.ARTILLERY, ArmsBranch.AMMUNITION, ArmsBranch.ARMORED_VEHICLES],
    description: 'Soviet-era designs with modest modernization, reliable but dated',
    specialties: ['towed_artillery', 'rocket_launchers', 'old_tanks'],
  },
  [ArmsManufacturer.GUERRILLA_WORKS]: {
    id: ArmsManufacturer.GUERRILLA_WORKS,
    displayName: 'Guerrilla Works Ltd',
    country: Country.BRAZIL,
    prestigeLevel: 1,
    technologyLevel: 2,
    manufacturingScale: 1,
    branches: [ArmsBranch.SMALL_ARMS, ArmsBranch.DRONES, ArmsBranch.LOGISTICS],
    description: 'Specializes in asymmetric warfare equipment and improvised solutions',
    specialties: ['compact_weapons', 'commercial_drones', 'improvised_explosives'],
  },
  [ArmsManufacturer.BUDGET_BALLISTICS]: {
    id: ArmsManufacturer.BUDGET_BALLISTICS,
    displayName: 'Budget Ballistics International',
    country: Country.INDIA,
    prestigeLevel: 1,
    technologyLevel: 2,
    manufacturingScale: 4,
    branches: [ArmsBranch.MISSILES, ArmsBranch.AMMUNITION, ArmsBranch.SMALL_ARMS],
    description: 'Mass produces simple, cost-effective weapons for developing nations',
    specialties: ['unguided_rockets', 'basic_missiles', 'cheap_ammo'],
  },
  [ArmsManufacturer.FRONTIER_ARMS]: {
    id: ArmsManufacturer.FRONTIER_ARMS,
    displayName: 'Frontier Arms & Equipment',
    country: Country.SOUTH_AFRICA,
    prestigeLevel: 2,
    technologyLevel: 2,
    manufacturingScale: 2,
    branches: [ArmsBranch.ARMORED_VEHICLES, ArmsBranch.SMALL_ARMS, ArmsBranch.LOGISTICS],
    description: 'Designs for harsh conditions and unconventional warfare',
    specialties: ['mine_resistant_vehicles', 'bush_warfare', 'area_denial'],
  },
  [ArmsManufacturer.BACKYARD_DEFENSE]: {
    id: ArmsManufacturer.BACKYARD_DEFENSE,
    displayName: 'Backyard Defense Systems',
    country: Country.PAKISTAN,
    prestigeLevel: 1,
    technologyLevel: 1,
    manufacturingScale: 2,
    branches: [ArmsBranch.SMALL_ARMS, ArmsBranch.ARTILLERY, ArmsBranch.AMMUNITION],
    description: 'Cottage industry producing copies and knock-offs of popular designs',
    specialties: ['copied_designs', 'homemade_mortars', 'reloaded_ammo'],
  },
}

// Helper functions
export function getManufacturersByCountry(country: Country): ArmsManufacturer[] {
  return Object.values(ArmsManufacturer).filter(
    (manufacturer) => manufacturerDetails[manufacturer].country === country
  )
}

export function getManufacturersByBranch(branch: ArmsBranch): ArmsManufacturer[] {
  return Object.values(ArmsManufacturer).filter(
    (manufacturer) => manufacturerDetails[manufacturer].branches.includes(branch)
  )
}

export function getManufacturersByPrestige(minPrestige: number): ArmsManufacturer[] {
  return Object.values(ArmsManufacturer).filter(
    (manufacturer) => manufacturerDetails[manufacturer].prestigeLevel >= minPrestige
  )
}

export function getManufacturerDisplayName(manufacturer: ArmsManufacturer): string {
  return manufacturerDetails[manufacturer].displayName
}