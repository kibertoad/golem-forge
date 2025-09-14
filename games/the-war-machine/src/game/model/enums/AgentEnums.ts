export enum LegalStatus {
  LEGAL = 'legal',
  WANTED = 'wanted',
  PERSONA_NON_GRATA = 'persona_non_grata',
  ENEMY_OF_STATE = 'enemy_of_state',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum AgentStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  TRAVELING = 'traveling',
  IMPRISONED = 'imprisoned',
  DEAD = 'dead',
}

export enum PositiveTrait {
  CHARISMATIC = 'charismatic',
  NEGOTIATOR = 'negotiator',
  WELL_CONNECTED = 'well_connected',
  POLYGLOT = 'polyglot',
  INTIMIDATING = 'intimidating',
  DISCRETE = 'discrete',
  TECH_SAVVY = 'tech_savvy',
  MILITARY_BACKGROUND = 'military_background',
}

export enum NegativeTrait {
  GREEDY = 'greedy',
  ALCOHOLIC = 'alcoholic',
  GAMBLING_ADDICTION = 'gambling_addiction',
  LOOSE_LIPS = 'loose_lips',
  COWARDLY = 'cowardly',
  HOTHEADED = 'hotheaded',
  DISLOYAL = 'disloyal',
  CLUMSY = 'clumsy',
}

export enum SpecialPerk {
  DIPLOMATIC_IMMUNITY = 'diplomatic_immunity',
  BLACK_MARKET_ACCESS = 'black_market_access',
  GOVERNMENT_CONTACTS = 'government_contacts',
  UNDERWORLD_CONNECTIONS = 'underworld_connections',
  FORMER_INTELLIGENCE = 'former_intelligence',
  WEAPONS_EXPERT = 'weapons_expert',
  LOGISTICS_MASTER = 'logistics_master',
}

export interface AgentSkills {
  negotiation: number // 1-10
  intimidation: number // 1-10
  networking: number // 1-10
  languages: number // 1-10
  combat: number // 1-10
  stealth: number // 1-10
  technical: number // 1-10
  finance: number // 1-10
}

export interface RegionalBonus {
  region: string
  bonus: number // percentage bonus to success
  description: string
}
