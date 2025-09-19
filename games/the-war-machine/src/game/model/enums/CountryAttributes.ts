import { Country } from './Countries.ts'

export enum RegimeType {
  DEMOCRACY = 'democracy',
  TOTALITARIAN = 'totalitarian',
  AUTHORITARIAN = 'authoritarian',
  MONARCHY = 'monarchy',
  THEOCRACY = 'theocracy',
  MILITARY_JUNTA = 'military_junta',
  OLIGARCHY = 'oligarchy',
}

export enum PoliticalStance {
  ISOLATIONIST = 'isolationist',
  INTERVENTIONIST = 'interventionist',
  EXPANSIONIST = 'expansionist',
  NEUTRAL = 'neutral',
  DEFENSIVE = 'defensive',
  COOPERATIVE = 'cooperative',
}

export interface BranchCapabilities {
  army: number // 1-5
  navy: number // 1-5
  airforce: number // 1-5
  specialForces: number // 1-5
  drones: number // 1-5
}

export interface CountryAttributeData {
  budget: number // Military budget (1-5)
  standards: number // Sensitivity to ordnance quality (1-5)
  corruption: number // Corruption level (1-5, where 1=very clean, 5=highly corrupt)
  visibility: number // How observed operations are (1-5)
  regime: RegimeType
  militaryStrength: BranchCapabilities // Per branch military strength (1-5)
  industrialProduction: BranchCapabilities // Per branch production capability (1-5)
  industrialTech: BranchCapabilities // Per branch tech level (1-5)
  politicalStance: PoliticalStance
  stability: number // Political stability (1-100, where 100=most stable)
}

// Corruption mapping based on Corruption Perceptions Index (CPI):
// CPI 80-100 (very clean) → corruption: 1
// CPI 60-79 (clean) → corruption: 2
// CPI 40-59 (moderately corrupt) → corruption: 3
// CPI 30-39 (corrupt) → corruption: 4
// CPI 0-29 (highly corrupt) → corruption: 5

export const StartingCountryAttributes: Record<Country, CountryAttributeData> = {
  // Major Powers
  [Country.USA]: {
    budget: 5,
    standards: 5,
    corruption: 2, // CPI ~69
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 5, navy: 5, airforce: 5, specialForces: 5, drones: 5 },
    industrialProduction: { army: 5, navy: 5, airforce: 5, specialForces: 4, drones: 5 },
    industrialTech: { army: 5, navy: 5, airforce: 5, specialForces: 5, drones: 5 },
    politicalStance: PoliticalStance.INTERVENTIONIST,
    stability: 70,
  },
  [Country.CHINA]: {
    budget: 5,
    standards: 3,
    corruption: 3, // CPI ~42
    visibility: 3,
    regime: RegimeType.AUTHORITARIAN,
    militaryStrength: { army: 5, navy: 4, airforce: 4, specialForces: 3, drones: 4 },
    industrialProduction: { army: 5, navy: 4, airforce: 4, specialForces: 2, drones: 4 },
    industrialTech: { army: 4, navy: 4, airforce: 4, specialForces: 3, drones: 4 },
    politicalStance: PoliticalStance.EXPANSIONIST,
    stability: 58,
  },
  [Country.RUSSIA]: {
    budget: 4,
    standards: 2,
    corruption: 5, // CPI ~26
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    militaryStrength: { army: 4, navy: 3, airforce: 4, specialForces: 3, drones: 4 },
    industrialProduction: { army: 4, navy: 3, airforce: 4, specialForces: 2, drones: 4 },
    industrialTech: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.EXPANSIONIST,
    stability: 45,
  },
  [Country.INDIA]: {
    budget: 3,
    standards: 3,
    corruption: 3, // CPI ~40
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    industrialProduction: { army: 3, navy: 3, airforce: 3, specialForces: 1, drones: 3 },
    industrialTech: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 50,
  },
  [Country.GERMANY]: {
    budget: 3,
    standards: 5,
    corruption: 1, // CPI ~78
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 4, navy: 3, airforce: 4, specialForces: 3, drones: 4 },
    industrialProduction: { army: 4, navy: 3, airforce: 4, specialForces: 2, drones: 4 },
    industrialTech: { army: 5, navy: 4, airforce: 5, specialForces: 4, drones: 5 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 84,
  },
  [Country.FRANCE]: {
    budget: 3,
    standards: 4,
    corruption: 2, // CPI ~71
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 3, navy: 3, airforce: 4, specialForces: 2, drones: 3 },
    industrialProduction: { army: 3, navy: 3, airforce: 4, specialForces: 1, drones: 3 },
    industrialTech: { army: 4, navy: 4, airforce: 4, specialForces: 3, drones: 4 },
    politicalStance: PoliticalStance.INTERVENTIONIST,
    stability: 76,
  },
  [Country.UK]: {
    budget: 3,
    standards: 5,
    corruption: 2, // CPI ~71
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 3, navy: 4, airforce: 3, specialForces: 2, drones: 3 },
    industrialProduction: { army: 3, navy: 4, airforce: 3, specialForces: 1, drones: 3 },
    industrialTech: { army: 4, navy: 4, airforce: 4, specialForces: 3, drones: 4 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 78,
  },
  [Country.JAPAN]: {
    budget: 3,
    standards: 5,
    corruption: 2, // CPI ~73
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 3, navy: 4, airforce: 3, specialForces: 2, drones: 3 },
    industrialProduction: { army: 3, navy: 4, airforce: 3, specialForces: 1, drones: 3 },
    industrialTech: { army: 5, navy: 5, airforce: 5, specialForces: 4, drones: 5 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 77,
  },
  [Country.CANADA]: {
    budget: 2,
    standards: 5,
    corruption: 2, // CPI ~74
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 4, navy: 4, airforce: 4, specialForces: 3, drones: 4 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 86,
  },
  [Country.AUSTRALIA]: {
    budget: 2,
    standards: 5,
    corruption: 2, // CPI ~75
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 4, navy: 4, airforce: 4, specialForces: 3, drones: 4 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 85,
  },

  // Regional Powers
  [Country.BRAZIL]: {
    budget: 2,
    standards: 3,
    corruption: 4, // CPI ~36
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 3, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 3, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 58,
  },
  [Country.MEXICO]: {
    budget: 2,
    standards: 3,
    corruption: 4, // CPI ~31
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 55,
  },
  [Country.ARGENTINA]: {
    budget: 2,
    standards: 3,
    corruption: 4, // CPI ~37
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 60,
  },
  [Country.SOUTH_AFRICA]: {
    budget: 2,
    standards: 3,
    corruption: 3, // CPI ~41
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 3, navy: 2, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 52,
  },
  [Country.NORWAY]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~84
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 3, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 3, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 4, navy: 4, airforce: 4, specialForces: 3, drones: 4 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 92,
  },
  [Country.SWEDEN]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~82
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 2, airforce: 3, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 3, specialForces: 1, drones: 2 },
    industrialTech: { army: 4, navy: 4, airforce: 4, specialForces: 3, drones: 4 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 88,
  },
  [Country.SPAIN]: {
    budget: 2,
    standards: 4,
    corruption: 2, // CPI ~60
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 3, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 3, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 74,
  },
  [Country.ITALY]: {
    budget: 2,
    standards: 4,
    corruption: 3, // CPI ~56
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    industrialProduction: { army: 3, navy: 3, airforce: 3, specialForces: 1, drones: 3 },
    industrialTech: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 72,
  },
  [Country.POLAND]: {
    budget: 2,
    standards: 3,
    corruption: 3, // CPI ~54
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 3, navy: 2, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 71,
  },

  // Middle Eastern Countries
  [Country.SAUDI_ARABIA]: {
    budget: 4,
    standards: 4,
    corruption: 3, // CPI ~51
    visibility: 3,
    regime: RegimeType.MONARCHY,
    militaryStrength: { army: 2, navy: 2, airforce: 3, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 3, specialForces: 1, drones: 2 },
    industrialTech: { army: 3, navy: 3, airforce: 4, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 46,
  },
  [Country.ISRAEL]: {
    budget: 3,
    standards: 5,
    corruption: 2, // CPI ~62
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 3, navy: 3, airforce: 4, specialForces: 2, drones: 3 },
    industrialProduction: { army: 3, navy: 3, airforce: 4, specialForces: 1, drones: 3 },
    industrialTech: { army: 5, navy: 4, airforce: 5, specialForces: 4, drones: 5 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 42,
  },
  [Country.TURKEY]: {
    budget: 3,
    standards: 3,
    corruption: 4, // CPI ~34
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    industrialProduction: { army: 3, navy: 3, airforce: 3, specialForces: 1, drones: 3 },
    industrialTech: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 48,
  },
  [Country.IRAN]: {
    budget: 3,
    standards: 2,
    corruption: 5, // CPI ~24
    visibility: 2,
    regime: RegimeType.THEOCRACY,
    militaryStrength: { army: 3, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 3, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.EXPANSIONIST,
    stability: 32,
  },
  [Country.IRAQ]: {
    budget: 2,
    standards: 2,
    corruption: 5, // CPI ~23
    visibility: 2,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 25,
  },
  [Country.SYRIA]: {
    budget: 1,
    standards: 1,
    corruption: 5, // CPI ~13
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 12,
  },
  [Country.JORDAN]: {
    budget: 2,
    standards: 3,
    corruption: 3, // CPI ~47
    visibility: 3,
    regime: RegimeType.MONARCHY,
    militaryStrength: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 44,
  },
  [Country.LEBANON]: {
    budget: 1,
    standards: 2,
    corruption: 5, // CPI ~24
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 28,
  },
  [Country.UAE]: {
    budget: 3,
    standards: 4,
    corruption: 2, // CPI ~67
    visibility: 3,
    regime: RegimeType.MONARCHY,
    militaryStrength: { army: 2, navy: 2, airforce: 3, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 3, specialForces: 1, drones: 2 },
    industrialTech: { army: 3, navy: 3, airforce: 4, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 58,
  },

  // African Countries
  [Country.EGYPT]: {
    budget: 2,
    standards: 2,
    corruption: 4, // CPI ~35
    visibility: 3,
    regime: RegimeType.AUTHORITARIAN,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 38,
  },
  [Country.ETHIOPIA]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~37
    visibility: 2,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 2, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 28,
  },
  [Country.KENYA]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~31
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 38,
  },
  [Country.NIGERIA]: {
    budget: 2,
    standards: 2,
    corruption: 5, // CPI ~25
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 32,
  },
  [Country.MOROCCO]: {
    budget: 2,
    standards: 3,
    corruption: 3, // CPI ~42
    visibility: 3,
    regime: RegimeType.MONARCHY,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 50,
  },
  [Country.ALGERIA]: {
    budget: 2,
    standards: 2,
    corruption: 4, // CPI ~33
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 42,
  },

  // Asian Countries
  [Country.PAKISTAN]: {
    budget: 2,
    standards: 2,
    corruption: 5, // CPI ~29
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 30,
  },
  [Country.INDONESIA]: {
    budget: 2,
    standards: 3,
    corruption: 4, // CPI ~34
    visibility: 2,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 53,
  },
  [Country.SOUTH_KOREA]: {
    budget: 3,
    standards: 4,
    corruption: 2, // CPI ~61
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 3, navy: 4, airforce: 3, specialForces: 2, drones: 3 },
    industrialProduction: { army: 3, navy: 4, airforce: 3, specialForces: 1, drones: 3 },
    industrialTech: { army: 4, navy: 4, airforce: 4, specialForces: 3, drones: 4 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 75,
  },
  [Country.VIETNAM]: {
    budget: 2,
    standards: 2,
    corruption: 4, // CPI ~36
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 56,
  },
  [Country.THAILAND]: {
    budget: 2,
    standards: 3,
    corruption: 4, // CPI ~35
    visibility: 3,
    regime: RegimeType.MILITARY_JUNTA,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 54,
  },
  [Country.MALAYSIA]: {
    budget: 2,
    standards: 3,
    corruption: 3, // CPI ~47
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 3, navy: 2, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 62,
  },
  [Country.SINGAPORE]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~83
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 3, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 1, navy: 3, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 4, navy: 4, airforce: 4, specialForces: 3, drones: 4 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 80,
  },
  [Country.PHILIPPINES]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~33
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 48,
  },

  // European Countries
  [Country.NETHERLANDS]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~79
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 3, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 3, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 4, navy: 4, airforce: 4, specialForces: 3, drones: 4 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 85,
  },
  [Country.BELGIUM]: {
    budget: 2,
    standards: 4,
    corruption: 2, // CPI ~73
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 78,
  },
  [Country.SWITZERLAND]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~82
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 4, navy: 2, airforce: 4, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 87,
  },
  [Country.AUSTRIA]: {
    budget: 1,
    standards: 4,
    corruption: 2, // CPI ~71
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 2, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 2, specialForces: 1, drones: 1 },
    industrialTech: { army: 3, navy: 2, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 83,
  },
  [Country.GREECE]: {
    budget: 2,
    standards: 3,
    corruption: 3, // CPI ~49
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 65,
  },
  [Country.PORTUGAL]: {
    budget: 1,
    standards: 3,
    corruption: 2, // CPI ~61
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 2, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 2, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 74,
  },
  [Country.CZECH_REPUBLIC]: {
    budget: 1,
    standards: 3,
    corruption: 3, // CPI ~57
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 3, navy: 2, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 73,
  },
  [Country.HUNGARY]: {
    budget: 1,
    standards: 3,
    corruption: 3, // CPI ~43
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 64,
  },
  [Country.ROMANIA]: {
    budget: 2,
    standards: 2,
    corruption: 3, // CPI ~46
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 63,
  },
  [Country.BULGARIA]: {
    budget: 1,
    standards: 2,
    corruption: 3, // CPI ~44
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 62,
  },
  [Country.SERBIA]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~36
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 2, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 55,
  },
  [Country.CROATIA]: {
    budget: 1,
    standards: 3,
    corruption: 3, // CPI ~50
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 2, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 2, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 66,
  },
  [Country.UKRAINE]: {
    budget: 2,
    standards: 2,
    corruption: 4, // CPI ~36
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 35,
  },
  [Country.FINLAND]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~87
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 4, navy: 3, airforce: 4, specialForces: 3, drones: 4 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 90,
  },
  [Country.DENMARK]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~88
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 88,
  },

  // South American Countries
  [Country.COLOMBIA]: {
    budget: 2,
    standards: 2,
    corruption: 3, // CPI ~40
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 46,
  },
  [Country.VENEZUELA]: {
    budget: 1,
    standards: 1,
    corruption: 5, // CPI ~14
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 22,
  },
  [Country.CHILE]: {
    budget: 2,
    standards: 3,
    corruption: 2, // CPI ~67
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialProduction: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    industrialTech: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 68,
  },
  [Country.PERU]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~35
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 52,
  },
  [Country.ECUADOR]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~35
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 45,
  },

  // Oceania Countries
  [Country.NEW_ZEALAND]: {
    budget: 1,
    standards: 5,
    corruption: 1, // CPI ~88
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 2, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 2, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 3, navy: 3, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
    stability: 87,
  },

  // Additional African Countries
  [Country.TANZANIA]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~38
    visibility: 2,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 48,
  },
  [Country.SUDAN]: {
    budget: 1,
    standards: 1,
    corruption: 5, // CPI ~20
    visibility: 2,
    regime: RegimeType.MILITARY_JUNTA,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 15,
  },
  [Country.LIBYA]: {
    budget: 2,
    standards: 2,
    corruption: 5, // CPI ~18
    visibility: 2,
    regime: RegimeType.MILITARY_JUNTA,
    militaryStrength: { army: 2, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 2, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.EXPANSIONIST,
    stability: 18,
  },
  [Country.TUNISIA]: {
    budget: 1,
    standards: 2,
    corruption: 3, // CPI ~44
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 45,
  },
  [Country.GHANA]: {
    budget: 1,
    standards: 2,
    corruption: 3, // CPI ~43
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 55,
  },
  [Country.UGANDA]: {
    budget: 1,
    standards: 2,
    corruption: 5, // CPI ~26
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 42,
  },
  [Country.ZAMBIA]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~33
    visibility: 2,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 45,
  },
  [Country.ZIMBABWE]: {
    budget: 1,
    standards: 1,
    corruption: 5, // CPI ~23
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 35,
  },
  [Country.SENEGAL]: {
    budget: 1,
    standards: 2,
    corruption: 3, // CPI ~43
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 52,
  },
  [Country.ANGOLA]: {
    budget: 2,
    standards: 2,
    corruption: 4, // CPI ~33
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    militaryStrength: { army: 2, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 2, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 40,
  },

  // Additional Oceania Countries
  [Country.PAPUA_NEW_GUINEA]: {
    budget: 1,
    standards: 1,
    corruption: 5, // CPI ~25
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 42,
  },
  [Country.FIJI]: {
    budget: 1,
    standards: 2,
    corruption: 3, // CPI ~51
    visibility: 2,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 55,
  },
  [Country.SOLOMON_ISLANDS]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~42
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 45,
  },
  [Country.VANUATU]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~43
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 52,
  },
  [Country.SAMOA]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~41
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 58,
  },
  [Country.TONGA]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~44
    visibility: 1,
    regime: RegimeType.MONARCHY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 55,
  },
  [Country.KIRIBATI]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~40 (estimated)
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 42,
  },
  [Country.MICRONESIA]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~40 (estimated)
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 50,
  },
  [Country.PALAU]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~45 (estimated)
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 55,
  },
  [Country.MARSHALL_ISLANDS]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~40 (estimated)
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
    stability: 48,
  },

  // Baltic States
  [Country.ESTONIA]: {
    budget: 1,
    standards: 4,
    corruption: 2, // CPI ~74
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 3, navy: 2, airforce: 3, specialForces: 2, drones: 3 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 75,
  },
  [Country.LATVIA]: {
    budget: 1,
    standards: 3,
    corruption: 2, // CPI ~59
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 73,
  },
  [Country.LITHUANIA]: {
    budget: 1,
    standards: 3,
    corruption: 2, // CPI ~61
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    militaryStrength: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialProduction: { army: 1, navy: 1, airforce: 1, specialForces: 1, drones: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2, specialForces: 1, drones: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
    stability: 74,
  },
}
