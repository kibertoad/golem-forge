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
}

export interface CountryAttributeData {
  budget: number // Military budget (1-5)
  standards: number // Sensitivity to ordnance quality (1-5)
  corruption: number // Corruption level (1-5, where 1=very clean, 5=highly corrupt)
  visibility: number // How observed operations are (1-5)
  regime: RegimeType
  industrialProduction: BranchCapabilities // Per branch production capability (1-5)
  industrialTech: BranchCapabilities // Per branch tech level (1-5)
  politicalStance: PoliticalStance
}

// Corruption mapping based on Corruption Perceptions Index (CPI):
// CPI 80-100 (very clean) → corruption: 1
// CPI 60-79 (clean) → corruption: 2
// CPI 40-59 (moderately corrupt) → corruption: 3
// CPI 30-39 (corrupt) → corruption: 4
// CPI 0-29 (highly corrupt) → corruption: 5

export const CountryAttributes: Record<Country, CountryAttributeData> = {
  // Major Powers
  [Country.USA]: {
    budget: 5,
    standards: 5,
    corruption: 2, // CPI ~69
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 5, navy: 5, airforce: 5 },
    industrialTech: { army: 5, navy: 5, airforce: 5 },
    politicalStance: PoliticalStance.INTERVENTIONIST,
  },
  [Country.CHINA]: {
    budget: 5,
    standards: 3,
    corruption: 3, // CPI ~42
    visibility: 3,
    regime: RegimeType.AUTHORITARIAN,
    industrialProduction: { army: 5, navy: 4, airforce: 4 },
    industrialTech: { army: 4, navy: 4, airforce: 4 },
    politicalStance: PoliticalStance.EXPANSIONIST,
  },
  [Country.RUSSIA]: {
    budget: 4,
    standards: 2,
    corruption: 5, // CPI ~26
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    industrialProduction: { army: 4, navy: 3, airforce: 4 },
    industrialTech: { army: 3, navy: 3, airforce: 3 },
    politicalStance: PoliticalStance.EXPANSIONIST,
  },
  [Country.INDIA]: {
    budget: 3,
    standards: 3,
    corruption: 3, // CPI ~40
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 3, navy: 3, airforce: 3 },
    industrialTech: { army: 3, navy: 3, airforce: 3 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.GERMANY]: {
    budget: 3,
    standards: 5,
    corruption: 1, // CPI ~78
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 4, navy: 3, airforce: 4 },
    industrialTech: { army: 5, navy: 4, airforce: 5 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },
  [Country.FRANCE]: {
    budget: 3,
    standards: 4,
    corruption: 2, // CPI ~71
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 3, navy: 3, airforce: 4 },
    industrialTech: { army: 4, navy: 4, airforce: 4 },
    politicalStance: PoliticalStance.INTERVENTIONIST,
  },
  [Country.UK]: {
    budget: 3,
    standards: 5,
    corruption: 2, // CPI ~71
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 3, navy: 4, airforce: 3 },
    industrialTech: { army: 4, navy: 4, airforce: 4 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },
  [Country.JAPAN]: {
    budget: 3,
    standards: 5,
    corruption: 2, // CPI ~73
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 3, navy: 4, airforce: 3 },
    industrialTech: { army: 5, navy: 5, airforce: 5 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.CANADA]: {
    budget: 2,
    standards: 5,
    corruption: 2, // CPI ~74
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 4, navy: 4, airforce: 4 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },
  [Country.AUSTRALIA]: {
    budget: 2,
    standards: 5,
    corruption: 2, // CPI ~75
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 4, navy: 4, airforce: 4 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },

  // Regional Powers
  [Country.BRAZIL]: {
    budget: 2,
    standards: 3,
    corruption: 4, // CPI ~36
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 3, navy: 2, airforce: 2 },
    industrialTech: { army: 3, navy: 3, airforce: 3 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.MEXICO]: {
    budget: 2,
    standards: 3,
    corruption: 4, // CPI ~31
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.ARGENTINA]: {
    budget: 2,
    standards: 3,
    corruption: 4, // CPI ~37
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.SOUTH_AFRICA]: {
    budget: 2,
    standards: 3,
    corruption: 3, // CPI ~41
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 3, navy: 2, airforce: 3 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.NORWAY]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~84
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 3, airforce: 2 },
    industrialTech: { army: 4, navy: 4, airforce: 4 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },
  [Country.SWEDEN]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~82
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 2, airforce: 3 },
    industrialTech: { army: 4, navy: 4, airforce: 4 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.SPAIN]: {
    budget: 2,
    standards: 4,
    corruption: 2, // CPI ~60
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 3, airforce: 2 },
    industrialTech: { army: 3, navy: 3, airforce: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },
  [Country.ITALY]: {
    budget: 2,
    standards: 4,
    corruption: 3, // CPI ~56
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 3, navy: 3, airforce: 3 },
    industrialTech: { army: 3, navy: 3, airforce: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },
  [Country.POLAND]: {
    budget: 2,
    standards: 3,
    corruption: 3, // CPI ~54
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 1, airforce: 2 },
    industrialTech: { army: 3, navy: 2, airforce: 3 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },

  // Middle Eastern Countries
  [Country.SAUDI_ARABIA]: {
    budget: 4,
    standards: 4,
    corruption: 3, // CPI ~51
    visibility: 3,
    regime: RegimeType.MONARCHY,
    industrialProduction: { army: 2, navy: 2, airforce: 3 },
    industrialTech: { army: 3, navy: 3, airforce: 4 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.ISRAEL]: {
    budget: 3,
    standards: 5,
    corruption: 2, // CPI ~62
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 3, navy: 3, airforce: 4 },
    industrialTech: { army: 5, navy: 4, airforce: 5 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.TURKEY]: {
    budget: 3,
    standards: 3,
    corruption: 4, // CPI ~34
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 3, navy: 3, airforce: 3 },
    industrialTech: { army: 3, navy: 3, airforce: 3 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.IRAN]: {
    budget: 3,
    standards: 2,
    corruption: 5, // CPI ~24
    visibility: 2,
    regime: RegimeType.THEOCRACY,
    industrialProduction: { army: 3, navy: 2, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.EXPANSIONIST,
  },
  [Country.IRAQ]: {
    budget: 2,
    standards: 2,
    corruption: 5, // CPI ~23
    visibility: 2,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 1, airforce: 2 },
    industrialTech: { army: 2, navy: 1, airforce: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.SYRIA]: {
    budget: 1,
    standards: 1,
    corruption: 5, // CPI ~13
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.JORDAN]: {
    budget: 2,
    standards: 3,
    corruption: 3, // CPI ~47
    visibility: 3,
    regime: RegimeType.MONARCHY,
    industrialProduction: { army: 2, navy: 1, airforce: 2 },
    industrialTech: { army: 2, navy: 1, airforce: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.LEBANON]: {
    budget: 1,
    standards: 2,
    corruption: 5, // CPI ~24
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.UAE]: {
    budget: 3,
    standards: 4,
    corruption: 2, // CPI ~67
    visibility: 3,
    regime: RegimeType.MONARCHY,
    industrialProduction: { army: 2, navy: 2, airforce: 3 },
    industrialTech: { army: 3, navy: 3, airforce: 4 },
    politicalStance: PoliticalStance.NEUTRAL,
  },

  // African Countries
  [Country.EGYPT]: {
    budget: 2,
    standards: 2,
    corruption: 4, // CPI ~35
    visibility: 3,
    regime: RegimeType.AUTHORITARIAN,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.ETHIOPIA]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~37
    visibility: 2,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.KENYA]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~31
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.NIGERIA]: {
    budget: 2,
    standards: 2,
    corruption: 5, // CPI ~25
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 1, airforce: 2 },
    industrialTech: { army: 2, navy: 1, airforce: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.MOROCCO]: {
    budget: 2,
    standards: 3,
    corruption: 3, // CPI ~42
    visibility: 3,
    regime: RegimeType.MONARCHY,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.ALGERIA]: {
    budget: 2,
    standards: 2,
    corruption: 4, // CPI ~33
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },

  // Asian Countries
  [Country.PAKISTAN]: {
    budget: 2,
    standards: 2,
    corruption: 5, // CPI ~29
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.INDONESIA]: {
    budget: 2,
    standards: 3,
    corruption: 4, // CPI ~34
    visibility: 2,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.SOUTH_KOREA]: {
    budget: 3,
    standards: 4,
    corruption: 2, // CPI ~61
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 3, navy: 4, airforce: 3 },
    industrialTech: { army: 4, navy: 4, airforce: 4 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.VIETNAM]: {
    budget: 2,
    standards: 2,
    corruption: 4, // CPI ~36
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.THAILAND]: {
    budget: 2,
    standards: 3,
    corruption: 4, // CPI ~35
    visibility: 3,
    regime: RegimeType.MILITARY_JUNTA,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.MALAYSIA]: {
    budget: 2,
    standards: 3,
    corruption: 3, // CPI ~47
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 3, navy: 2, airforce: 3 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.SINGAPORE]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~83
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 3, airforce: 2 },
    industrialTech: { army: 4, navy: 4, airforce: 4 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.PHILIPPINES]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~33
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },

  // European Countries
  [Country.NETHERLANDS]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~79
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 3, airforce: 2 },
    industrialTech: { army: 4, navy: 4, airforce: 4 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },
  [Country.BELGIUM]: {
    budget: 2,
    standards: 4,
    corruption: 2, // CPI ~73
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 1, airforce: 2 },
    industrialTech: { army: 3, navy: 3, airforce: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },
  [Country.SWITZERLAND]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~82
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 1, airforce: 2 },
    industrialTech: { army: 4, navy: 2, airforce: 4 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.AUSTRIA]: {
    budget: 1,
    standards: 4,
    corruption: 2, // CPI ~71
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 2 },
    industrialTech: { army: 3, navy: 2, airforce: 3 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.GREECE]: {
    budget: 2,
    standards: 3,
    corruption: 3, // CPI ~49
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.PORTUGAL]: {
    budget: 1,
    standards: 3,
    corruption: 2, // CPI ~61
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 2, airforce: 1 },
    industrialTech: { army: 3, navy: 3, airforce: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },
  [Country.CZECH_REPUBLIC]: {
    budget: 1,
    standards: 3,
    corruption: 3, // CPI ~57
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 1, airforce: 2 },
    industrialTech: { army: 3, navy: 2, airforce: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },
  [Country.HUNGARY]: {
    budget: 1,
    standards: 3,
    corruption: 3, // CPI ~43
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.ROMANIA]: {
    budget: 2,
    standards: 2,
    corruption: 3, // CPI ~46
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 1, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },
  [Country.BULGARIA]: {
    budget: 1,
    standards: 2,
    corruption: 3, // CPI ~44
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },
  [Country.SERBIA]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~36
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.CROATIA]: {
    budget: 1,
    standards: 3,
    corruption: 3, // CPI ~50
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 2, airforce: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },
  [Country.UKRAINE]: {
    budget: 2,
    standards: 2,
    corruption: 4, // CPI ~36
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 1, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.FINLAND]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~87
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 4, navy: 3, airforce: 4 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.DENMARK]: {
    budget: 2,
    standards: 5,
    corruption: 1, // CPI ~88
    visibility: 5,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 3, navy: 3, airforce: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },

  // South American Countries
  [Country.COLOMBIA]: {
    budget: 2,
    standards: 2,
    corruption: 3, // CPI ~40
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 1, airforce: 2 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.VENEZUELA]: {
    budget: 1,
    standards: 1,
    corruption: 5, // CPI ~14
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.CHILE]: {
    budget: 2,
    standards: 3,
    corruption: 2, // CPI ~67
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 2, navy: 2, airforce: 2 },
    industrialTech: { army: 3, navy: 3, airforce: 3 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.PERU]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~35
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.ECUADOR]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~35
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
  },

  // Oceania Countries
  [Country.NEW_ZEALAND]: {
    budget: 1,
    standards: 5,
    corruption: 1, // CPI ~88
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 2, airforce: 1 },
    industrialTech: { army: 3, navy: 3, airforce: 3 },
    politicalStance: PoliticalStance.COOPERATIVE,
  },

  // Additional African Countries
  [Country.TANZANIA]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~38
    visibility: 2,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.SUDAN]: {
    budget: 1,
    standards: 1,
    corruption: 5, // CPI ~20
    visibility: 2,
    regime: RegimeType.MILITARY_JUNTA,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.LIBYA]: {
    budget: 2,
    standards: 2,
    corruption: 5, // CPI ~18
    visibility: 2,
    regime: RegimeType.MILITARY_JUNTA,
    industrialProduction: { army: 2, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.EXPANSIONIST,
  },
  [Country.TUNISIA]: {
    budget: 1,
    standards: 2,
    corruption: 3, // CPI ~44
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 2 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.GHANA]: {
    budget: 1,
    standards: 2,
    corruption: 3, // CPI ~43
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.UGANDA]: {
    budget: 1,
    standards: 2,
    corruption: 5, // CPI ~26
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.ZAMBIA]: {
    budget: 1,
    standards: 2,
    corruption: 4, // CPI ~33
    visibility: 2,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.ZIMBABWE]: {
    budget: 1,
    standards: 1,
    corruption: 5, // CPI ~23
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.SENEGAL]: {
    budget: 1,
    standards: 2,
    corruption: 3, // CPI ~43
    visibility: 3,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.ANGOLA]: {
    budget: 2,
    standards: 2,
    corruption: 4, // CPI ~33
    visibility: 2,
    regime: RegimeType.AUTHORITARIAN,
    industrialProduction: { army: 2, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },

  // Additional Oceania Countries
  [Country.PAPUA_NEW_GUINEA]: {
    budget: 1,
    standards: 1,
    corruption: 5, // CPI ~25
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.FIJI]: {
    budget: 1,
    standards: 2,
    corruption: 3, // CPI ~51
    visibility: 2,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.SOLOMON_ISLANDS]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~42
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.VANUATU]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~43
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.SAMOA]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~41
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.TONGA]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~44
    visibility: 1,
    regime: RegimeType.MONARCHY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.KIRIBATI]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~40 (estimated)
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.MICRONESIA]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~40 (estimated)
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.PALAU]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~45 (estimated)
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },
  [Country.MARSHALL_ISLANDS]: {
    budget: 1,
    standards: 1,
    corruption: 3, // CPI ~40 (estimated)
    visibility: 1,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 1, navy: 1, airforce: 1 },
    politicalStance: PoliticalStance.NEUTRAL,
  },

  // Baltic States
  [Country.ESTONIA]: {
    budget: 1,
    standards: 4,
    corruption: 2, // CPI ~74
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 3, navy: 2, airforce: 3 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.LATVIA]: {
    budget: 1,
    standards: 3,
    corruption: 2, // CPI ~59
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
  [Country.LITHUANIA]: {
    budget: 1,
    standards: 3,
    corruption: 2, // CPI ~61
    visibility: 4,
    regime: RegimeType.DEMOCRACY,
    industrialProduction: { army: 1, navy: 1, airforce: 1 },
    industrialTech: { army: 2, navy: 2, airforce: 2 },
    politicalStance: PoliticalStance.DEFENSIVE,
  },
}
