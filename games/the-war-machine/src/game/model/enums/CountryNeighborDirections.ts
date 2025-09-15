import { Country } from './Countries.ts'

export enum BorderDirection {
  NORTH = 'north',
  SOUTH = 'south',
  EAST = 'east',
  WEST = 'west',
}

export type DirectionalNeighbor = {
  country: Country
  direction: BorderDirection
}

// Define which direction each neighbor is relative to the country
// This maps how to approach the neighbor FROM the perspective of the attacker
export const CountryNeighborDirections: Record<Country, DirectionalNeighbor[]> = {
  // North America
  [Country.USA]: [
    { country: Country.CANADA, direction: BorderDirection.NORTH },
    { country: Country.MEXICO, direction: BorderDirection.SOUTH },
  ],
  [Country.CANADA]: [{ country: Country.USA, direction: BorderDirection.SOUTH }],
  [Country.MEXICO]: [{ country: Country.USA, direction: BorderDirection.NORTH }],

  // South America
  [Country.BRAZIL]: [
    { country: Country.ARGENTINA, direction: BorderDirection.SOUTH },
    { country: Country.VENEZUELA, direction: BorderDirection.NORTH },
    { country: Country.COLOMBIA, direction: BorderDirection.NORTH },
    { country: Country.PERU, direction: BorderDirection.WEST },
  ],
  [Country.ARGENTINA]: [
    { country: Country.BRAZIL, direction: BorderDirection.NORTH },
    { country: Country.CHILE, direction: BorderDirection.WEST },
  ],
  [Country.VENEZUELA]: [
    { country: Country.COLOMBIA, direction: BorderDirection.WEST },
    { country: Country.BRAZIL, direction: BorderDirection.SOUTH },
  ],
  [Country.COLOMBIA]: [
    { country: Country.VENEZUELA, direction: BorderDirection.EAST },
    { country: Country.BRAZIL, direction: BorderDirection.SOUTH },
    { country: Country.PERU, direction: BorderDirection.SOUTH },
    { country: Country.ECUADOR, direction: BorderDirection.SOUTH },
  ],
  [Country.CHILE]: [
    { country: Country.ARGENTINA, direction: BorderDirection.EAST },
    { country: Country.PERU, direction: BorderDirection.NORTH },
  ],
  [Country.PERU]: [
    { country: Country.ECUADOR, direction: BorderDirection.NORTH },
    { country: Country.COLOMBIA, direction: BorderDirection.NORTH },
    { country: Country.BRAZIL, direction: BorderDirection.EAST },
    { country: Country.CHILE, direction: BorderDirection.SOUTH },
  ],
  [Country.ECUADOR]: [
    { country: Country.COLOMBIA, direction: BorderDirection.NORTH },
    { country: Country.PERU, direction: BorderDirection.SOUTH },
  ],

  // Europe
  [Country.UK]: [{ country: Country.FRANCE, direction: BorderDirection.SOUTH }],
  [Country.FRANCE]: [
    { country: Country.UK, direction: BorderDirection.NORTH },
    { country: Country.SPAIN, direction: BorderDirection.SOUTH },
    { country: Country.ITALY, direction: BorderDirection.EAST },
    { country: Country.GERMANY, direction: BorderDirection.EAST },
    { country: Country.SWITZERLAND, direction: BorderDirection.EAST },
    { country: Country.BELGIUM, direction: BorderDirection.NORTH },
  ],
  [Country.SPAIN]: [
    { country: Country.FRANCE, direction: BorderDirection.NORTH },
    { country: Country.PORTUGAL, direction: BorderDirection.WEST },
  ],
  [Country.PORTUGAL]: [{ country: Country.SPAIN, direction: BorderDirection.EAST }],
  [Country.GERMANY]: [
    { country: Country.FRANCE, direction: BorderDirection.WEST },
    { country: Country.POLAND, direction: BorderDirection.EAST },
    { country: Country.CZECH_REPUBLIC, direction: BorderDirection.SOUTH },
    { country: Country.AUSTRIA, direction: BorderDirection.SOUTH },
    { country: Country.SWITZERLAND, direction: BorderDirection.SOUTH },
    { country: Country.NETHERLANDS, direction: BorderDirection.NORTH },
    { country: Country.BELGIUM, direction: BorderDirection.WEST },
    { country: Country.DENMARK, direction: BorderDirection.NORTH },
  ],
  [Country.ITALY]: [
    { country: Country.FRANCE, direction: BorderDirection.WEST },
    { country: Country.SWITZERLAND, direction: BorderDirection.NORTH },
    { country: Country.AUSTRIA, direction: BorderDirection.NORTH },
  ],
  [Country.POLAND]: [
    { country: Country.GERMANY, direction: BorderDirection.WEST },
    { country: Country.CZECH_REPUBLIC, direction: BorderDirection.SOUTH },
    { country: Country.UKRAINE, direction: BorderDirection.EAST },
    { country: Country.LITHUANIA, direction: BorderDirection.NORTH },
  ],
  [Country.NORWAY]: [
    { country: Country.SWEDEN, direction: BorderDirection.EAST },
    { country: Country.FINLAND, direction: BorderDirection.EAST },
    { country: Country.RUSSIA, direction: BorderDirection.EAST },
  ],
  [Country.SWEDEN]: [
    { country: Country.NORWAY, direction: BorderDirection.WEST },
    { country: Country.FINLAND, direction: BorderDirection.EAST },
    { country: Country.DENMARK, direction: BorderDirection.SOUTH },
  ],
  [Country.FINLAND]: [
    { country: Country.SWEDEN, direction: BorderDirection.WEST },
    { country: Country.NORWAY, direction: BorderDirection.WEST },
    { country: Country.RUSSIA, direction: BorderDirection.EAST },
    { country: Country.ESTONIA, direction: BorderDirection.SOUTH },
  ],
  [Country.DENMARK]: [
    { country: Country.GERMANY, direction: BorderDirection.SOUTH },
    { country: Country.SWEDEN, direction: BorderDirection.NORTH },
  ],
  [Country.NETHERLANDS]: [
    { country: Country.GERMANY, direction: BorderDirection.EAST },
    { country: Country.BELGIUM, direction: BorderDirection.SOUTH },
  ],
  [Country.BELGIUM]: [
    { country: Country.NETHERLANDS, direction: BorderDirection.NORTH },
    { country: Country.GERMANY, direction: BorderDirection.EAST },
    { country: Country.FRANCE, direction: BorderDirection.SOUTH },
  ],
  [Country.SWITZERLAND]: [
    { country: Country.FRANCE, direction: BorderDirection.WEST },
    { country: Country.GERMANY, direction: BorderDirection.NORTH },
    { country: Country.AUSTRIA, direction: BorderDirection.EAST },
    { country: Country.ITALY, direction: BorderDirection.SOUTH },
  ],
  [Country.AUSTRIA]: [
    { country: Country.GERMANY, direction: BorderDirection.NORTH },
    { country: Country.SWITZERLAND, direction: BorderDirection.WEST },
    { country: Country.ITALY, direction: BorderDirection.SOUTH },
    { country: Country.CZECH_REPUBLIC, direction: BorderDirection.NORTH },
    { country: Country.HUNGARY, direction: BorderDirection.EAST },
  ],
  [Country.CZECH_REPUBLIC]: [
    { country: Country.GERMANY, direction: BorderDirection.NORTH },
    { country: Country.POLAND, direction: BorderDirection.NORTH },
    { country: Country.AUSTRIA, direction: BorderDirection.SOUTH },
  ],
  [Country.HUNGARY]: [
    { country: Country.AUSTRIA, direction: BorderDirection.WEST },
    { country: Country.ROMANIA, direction: BorderDirection.EAST },
    { country: Country.SERBIA, direction: BorderDirection.SOUTH },
    { country: Country.CROATIA, direction: BorderDirection.SOUTH },
  ],
  [Country.ROMANIA]: [
    { country: Country.HUNGARY, direction: BorderDirection.WEST },
    { country: Country.SERBIA, direction: BorderDirection.SOUTH },
    { country: Country.BULGARIA, direction: BorderDirection.SOUTH },
    { country: Country.UKRAINE, direction: BorderDirection.NORTH },
  ],
  [Country.BULGARIA]: [
    { country: Country.ROMANIA, direction: BorderDirection.NORTH },
    { country: Country.SERBIA, direction: BorderDirection.WEST },
    { country: Country.GREECE, direction: BorderDirection.SOUTH },
    { country: Country.TURKEY, direction: BorderDirection.EAST },
  ],
  [Country.GREECE]: [
    { country: Country.BULGARIA, direction: BorderDirection.NORTH },
    { country: Country.TURKEY, direction: BorderDirection.EAST },
  ],
  [Country.SERBIA]: [
    { country: Country.HUNGARY, direction: BorderDirection.NORTH },
    { country: Country.ROMANIA, direction: BorderDirection.NORTH },
    { country: Country.BULGARIA, direction: BorderDirection.EAST },
    { country: Country.CROATIA, direction: BorderDirection.WEST },
  ],
  [Country.CROATIA]: [
    { country: Country.HUNGARY, direction: BorderDirection.NORTH },
    { country: Country.SERBIA, direction: BorderDirection.EAST },
  ],
  [Country.UKRAINE]: [
    { country: Country.POLAND, direction: BorderDirection.WEST },
    { country: Country.ROMANIA, direction: BorderDirection.SOUTH },
    { country: Country.RUSSIA, direction: BorderDirection.EAST },
  ],
  [Country.ESTONIA]: [
    { country: Country.LATVIA, direction: BorderDirection.SOUTH },
    { country: Country.RUSSIA, direction: BorderDirection.EAST },
    { country: Country.FINLAND, direction: BorderDirection.NORTH },
  ],
  [Country.LATVIA]: [
    { country: Country.ESTONIA, direction: BorderDirection.NORTH },
    { country: Country.LITHUANIA, direction: BorderDirection.SOUTH },
    { country: Country.RUSSIA, direction: BorderDirection.EAST },
  ],

  // Asia
  [Country.RUSSIA]: [
    { country: Country.NORWAY, direction: BorderDirection.WEST },
    { country: Country.FINLAND, direction: BorderDirection.WEST },
    { country: Country.ESTONIA, direction: BorderDirection.WEST },
    { country: Country.LATVIA, direction: BorderDirection.WEST },
    { country: Country.LITHUANIA, direction: BorderDirection.WEST },
    { country: Country.UKRAINE, direction: BorderDirection.WEST },
    { country: Country.CHINA, direction: BorderDirection.SOUTH },
    { country: Country.JAPAN, direction: BorderDirection.EAST },
  ],
  [Country.CHINA]: [
    { country: Country.RUSSIA, direction: BorderDirection.NORTH },
    { country: Country.INDIA, direction: BorderDirection.SOUTH },
    { country: Country.PAKISTAN, direction: BorderDirection.WEST },
    { country: Country.VIETNAM, direction: BorderDirection.SOUTH },
    { country: Country.SOUTH_KOREA, direction: BorderDirection.EAST },
    { country: Country.JAPAN, direction: BorderDirection.EAST },
  ],
  [Country.JAPAN]: [
    { country: Country.SOUTH_KOREA, direction: BorderDirection.WEST },
    { country: Country.CHINA, direction: BorderDirection.WEST },
    { country: Country.RUSSIA, direction: BorderDirection.WEST },
  ],
  [Country.SOUTH_KOREA]: [
    { country: Country.CHINA, direction: BorderDirection.WEST },
    { country: Country.JAPAN, direction: BorderDirection.EAST },
  ],
  [Country.INDIA]: [
    { country: Country.PAKISTAN, direction: BorderDirection.WEST },
    { country: Country.CHINA, direction: BorderDirection.NORTH },
  ],
  [Country.VIETNAM]: [
    { country: Country.CHINA, direction: BorderDirection.NORTH },
    { country: Country.THAILAND, direction: BorderDirection.WEST },
  ],
  [Country.THAILAND]: [
    { country: Country.VIETNAM, direction: BorderDirection.EAST },
    { country: Country.MALAYSIA, direction: BorderDirection.SOUTH },
  ],
  [Country.MALAYSIA]: [
    { country: Country.THAILAND, direction: BorderDirection.NORTH },
    { country: Country.SINGAPORE, direction: BorderDirection.SOUTH },
    { country: Country.INDONESIA, direction: BorderDirection.SOUTH },
  ],
  [Country.SINGAPORE]: [
    { country: Country.MALAYSIA, direction: BorderDirection.NORTH },
    { country: Country.INDONESIA, direction: BorderDirection.SOUTH },
  ],
  [Country.INDONESIA]: [
    { country: Country.MALAYSIA, direction: BorderDirection.NORTH },
    { country: Country.SINGAPORE, direction: BorderDirection.NORTH },
    { country: Country.PHILIPPINES, direction: BorderDirection.NORTH },
    { country: Country.PAPUA_NEW_GUINEA, direction: BorderDirection.EAST },
    { country: Country.AUSTRALIA, direction: BorderDirection.SOUTH },
  ],
  [Country.PHILIPPINES]: [{ country: Country.INDONESIA, direction: BorderDirection.SOUTH }],

  // Middle East
  [Country.TURKEY]: [
    { country: Country.GREECE, direction: BorderDirection.WEST },
    { country: Country.BULGARIA, direction: BorderDirection.WEST },
    { country: Country.SYRIA, direction: BorderDirection.SOUTH },
    { country: Country.IRAQ, direction: BorderDirection.SOUTH },
    { country: Country.IRAN, direction: BorderDirection.EAST },
  ],
  [Country.SYRIA]: [
    { country: Country.TURKEY, direction: BorderDirection.NORTH },
    { country: Country.IRAQ, direction: BorderDirection.EAST },
    { country: Country.JORDAN, direction: BorderDirection.SOUTH },
    { country: Country.LEBANON, direction: BorderDirection.WEST },
    { country: Country.ISRAEL, direction: BorderDirection.SOUTH },
  ],
  [Country.LEBANON]: [
    { country: Country.SYRIA, direction: BorderDirection.EAST },
    { country: Country.ISRAEL, direction: BorderDirection.SOUTH },
  ],
  [Country.ISRAEL]: [
    { country: Country.LEBANON, direction: BorderDirection.NORTH },
    { country: Country.SYRIA, direction: BorderDirection.NORTH },
    { country: Country.JORDAN, direction: BorderDirection.EAST },
    { country: Country.EGYPT, direction: BorderDirection.SOUTH },
  ],
  [Country.JORDAN]: [
    { country: Country.SYRIA, direction: BorderDirection.NORTH },
    { country: Country.IRAQ, direction: BorderDirection.EAST },
    { country: Country.SAUDI_ARABIA, direction: BorderDirection.SOUTH },
    { country: Country.ISRAEL, direction: BorderDirection.WEST },
  ],
  [Country.SAUDI_ARABIA]: [
    { country: Country.JORDAN, direction: BorderDirection.NORTH },
    { country: Country.IRAQ, direction: BorderDirection.NORTH },
    { country: Country.UAE, direction: BorderDirection.EAST },
  ],
  [Country.UAE]: [{ country: Country.SAUDI_ARABIA, direction: BorderDirection.WEST }],

  // Africa
  [Country.EGYPT]: [
    { country: Country.ISRAEL, direction: BorderDirection.NORTH },
    { country: Country.LIBYA, direction: BorderDirection.WEST },
    { country: Country.SUDAN, direction: BorderDirection.SOUTH },
  ],
  [Country.LIBYA]: [
    { country: Country.EGYPT, direction: BorderDirection.EAST },
    { country: Country.TUNISIA, direction: BorderDirection.WEST },
    { country: Country.ALGERIA, direction: BorderDirection.WEST },
    { country: Country.SUDAN, direction: BorderDirection.SOUTH },
  ],
  [Country.TUNISIA]: [
    { country: Country.ALGERIA, direction: BorderDirection.WEST },
    { country: Country.LIBYA, direction: BorderDirection.EAST },
  ],
  [Country.ALGERIA]: [
    { country: Country.MOROCCO, direction: BorderDirection.WEST },
    { country: Country.TUNISIA, direction: BorderDirection.EAST },
    { country: Country.LIBYA, direction: BorderDirection.EAST },
  ],
  [Country.MOROCCO]: [{ country: Country.ALGERIA, direction: BorderDirection.EAST }],
  [Country.ETHIOPIA]: [
    { country: Country.SUDAN, direction: BorderDirection.WEST },
    { country: Country.KENYA, direction: BorderDirection.SOUTH },
  ],
  [Country.KENYA]: [
    { country: Country.ETHIOPIA, direction: BorderDirection.NORTH },
    { country: Country.SUDAN, direction: BorderDirection.NORTH },
    { country: Country.TANZANIA, direction: BorderDirection.SOUTH },
    { country: Country.UGANDA, direction: BorderDirection.WEST },
  ],
  [Country.TANZANIA]: [
    { country: Country.KENYA, direction: BorderDirection.NORTH },
    { country: Country.UGANDA, direction: BorderDirection.NORTH },
    { country: Country.ZAMBIA, direction: BorderDirection.SOUTH },
  ],
  [Country.UGANDA]: [
    { country: Country.KENYA, direction: BorderDirection.EAST },
    { country: Country.TANZANIA, direction: BorderDirection.SOUTH },
  ],
  [Country.ZAMBIA]: [
    { country: Country.TANZANIA, direction: BorderDirection.NORTH },
    { country: Country.ZIMBABWE, direction: BorderDirection.SOUTH },
    { country: Country.ANGOLA, direction: BorderDirection.WEST },
  ],
  [Country.ZIMBABWE]: [
    { country: Country.ZAMBIA, direction: BorderDirection.NORTH },
    { country: Country.SOUTH_AFRICA, direction: BorderDirection.SOUTH },
  ],
  [Country.ANGOLA]: [{ country: Country.ZAMBIA, direction: BorderDirection.EAST }],
  [Country.SOUTH_AFRICA]: [{ country: Country.ZIMBABWE, direction: BorderDirection.NORTH }],
  [Country.NIGERIA]: [{ country: Country.GHANA, direction: BorderDirection.WEST }],
  [Country.GHANA]: [
    { country: Country.NIGERIA, direction: BorderDirection.EAST },
    { country: Country.SENEGAL, direction: BorderDirection.WEST },
  ],
  [Country.SENEGAL]: [{ country: Country.GHANA, direction: BorderDirection.EAST }],

  // Oceania
  [Country.AUSTRALIA]: [
    { country: Country.INDONESIA, direction: BorderDirection.NORTH },
    { country: Country.PAPUA_NEW_GUINEA, direction: BorderDirection.NORTH },
    { country: Country.NEW_ZEALAND, direction: BorderDirection.EAST },
  ],
  [Country.NEW_ZEALAND]: [{ country: Country.AUSTRALIA, direction: BorderDirection.WEST }],
  [Country.PAPUA_NEW_GUINEA]: [
    { country: Country.INDONESIA, direction: BorderDirection.WEST },
    { country: Country.AUSTRALIA, direction: BorderDirection.SOUTH },
    { country: Country.SOLOMON_ISLANDS, direction: BorderDirection.EAST },
  ],
  [Country.FIJI]: [
    { country: Country.VANUATU, direction: BorderDirection.WEST },
    { country: Country.TONGA, direction: BorderDirection.EAST },
  ],
  [Country.SOLOMON_ISLANDS]: [
    { country: Country.PAPUA_NEW_GUINEA, direction: BorderDirection.WEST },
    { country: Country.VANUATU, direction: BorderDirection.SOUTH },
  ],
  [Country.VANUATU]: [
    { country: Country.SOLOMON_ISLANDS, direction: BorderDirection.NORTH },
    { country: Country.FIJI, direction: BorderDirection.EAST },
  ],
  [Country.SAMOA]: [{ country: Country.TONGA, direction: BorderDirection.SOUTH }],
  [Country.TONGA]: [
    { country: Country.FIJI, direction: BorderDirection.WEST },
    { country: Country.SAMOA, direction: BorderDirection.NORTH },
  ],
  [Country.KIRIBATI]: [],
  [Country.MICRONESIA]: [
    { country: Country.PALAU, direction: BorderDirection.WEST },
    { country: Country.MARSHALL_ISLANDS, direction: BorderDirection.EAST },
  ],
  [Country.PALAU]: [{ country: Country.MICRONESIA, direction: BorderDirection.EAST }],
  [Country.MARSHALL_ISLANDS]: [{ country: Country.MICRONESIA, direction: BorderDirection.WEST }],

  // Middle East additions
  [Country.IRAN]: [
    { country: Country.IRAQ, direction: BorderDirection.WEST },
    { country: Country.TURKEY, direction: BorderDirection.WEST },
    { country: Country.PAKISTAN, direction: BorderDirection.EAST },
    { country: Country.SAUDI_ARABIA, direction: BorderDirection.SOUTH },
  ],
  [Country.IRAQ]: [
    { country: Country.IRAN, direction: BorderDirection.EAST },
    { country: Country.TURKEY, direction: BorderDirection.NORTH },
    { country: Country.SYRIA, direction: BorderDirection.WEST },
    { country: Country.SAUDI_ARABIA, direction: BorderDirection.SOUTH },
  ],
  [Country.SUDAN]: [
    { country: Country.EGYPT, direction: BorderDirection.NORTH },
    { country: Country.LIBYA, direction: BorderDirection.WEST },
    { country: Country.ETHIOPIA, direction: BorderDirection.EAST },
    { country: Country.KENYA, direction: BorderDirection.SOUTH },
  ],
  [Country.PAKISTAN]: [
    { country: Country.IRAN, direction: BorderDirection.WEST },
    { country: Country.INDIA, direction: BorderDirection.EAST },
    { country: Country.CHINA, direction: BorderDirection.NORTH },
  ],
  [Country.LITHUANIA]: [
    { country: Country.LATVIA, direction: BorderDirection.NORTH },
    { country: Country.POLAND, direction: BorderDirection.SOUTH },
    { country: Country.RUSSIA, direction: BorderDirection.EAST },
  ],
}

// Helper function to get opposite direction
export function getOppositeDirection(direction: BorderDirection): BorderDirection {
  switch (direction) {
    case BorderDirection.NORTH:
      return BorderDirection.SOUTH
    case BorderDirection.SOUTH:
      return BorderDirection.NORTH
    case BorderDirection.EAST:
      return BorderDirection.WEST
    case BorderDirection.WEST:
      return BorderDirection.EAST
  }
}
