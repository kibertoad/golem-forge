import { Country } from './Countries.ts'

// Define neighboring countries for each country
// Neighbors are countries that share a land border or are very close by sea
export const CountryNeighbors: Record<Country, Country[]> = {
  // North America
  [Country.USA]: [Country.CANADA, Country.MEXICO],
  [Country.CANADA]: [Country.USA],
  [Country.MEXICO]: [Country.USA],

  // South America
  [Country.BRAZIL]: [
    Country.ARGENTINA,
    Country.PERU,
    Country.COLOMBIA,
    Country.VENEZUELA,
    Country.ECUADOR,
  ],
  [Country.ARGENTINA]: [Country.BRAZIL, Country.CHILE, Country.PERU],
  [Country.CHILE]: [Country.ARGENTINA, Country.PERU],
  [Country.COLOMBIA]: [Country.BRAZIL, Country.VENEZUELA, Country.PERU, Country.ECUADOR],
  [Country.PERU]: [Country.BRAZIL, Country.CHILE, Country.COLOMBIA, Country.ECUADOR],
  [Country.VENEZUELA]: [Country.BRAZIL, Country.COLOMBIA],
  [Country.ECUADOR]: [Country.COLOMBIA, Country.PERU, Country.BRAZIL],

  // Europe - Western
  [Country.UK]: [Country.FRANCE, Country.NETHERLANDS, Country.BELGIUM],
  [Country.FRANCE]: [
    Country.UK,
    Country.SPAIN,
    Country.GERMANY,
    Country.ITALY,
    Country.BELGIUM,
    Country.SWITZERLAND,
  ],
  [Country.GERMANY]: [
    Country.FRANCE,
    Country.POLAND,
    Country.CZECH_REPUBLIC,
    Country.AUSTRIA,
    Country.SWITZERLAND,
    Country.DENMARK,
    Country.NETHERLANDS,
    Country.BELGIUM,
  ],
  [Country.ITALY]: [Country.FRANCE, Country.SWITZERLAND, Country.AUSTRIA],
  [Country.SPAIN]: [Country.FRANCE, Country.PORTUGAL],
  [Country.PORTUGAL]: [Country.SPAIN],

  // Europe - Northern
  [Country.NORWAY]: [Country.SWEDEN, Country.FINLAND, Country.DENMARK],
  [Country.SWEDEN]: [Country.NORWAY, Country.FINLAND, Country.DENMARK],
  [Country.FINLAND]: [Country.SWEDEN, Country.NORWAY, Country.RUSSIA, Country.ESTONIA],
  [Country.DENMARK]: [Country.GERMANY, Country.SWEDEN, Country.NORWAY],

  // Europe - Low Countries
  [Country.NETHERLANDS]: [Country.GERMANY, Country.BELGIUM, Country.UK],
  [Country.BELGIUM]: [Country.FRANCE, Country.GERMANY, Country.NETHERLANDS, Country.UK],
  [Country.SWITZERLAND]: [Country.FRANCE, Country.GERMANY, Country.ITALY, Country.AUSTRIA],

  // Europe - Central
  [Country.POLAND]: [
    Country.GERMANY,
    Country.CZECH_REPUBLIC,
    Country.UKRAINE,
    Country.RUSSIA,
    Country.LITHUANIA,
  ],
  [Country.CZECH_REPUBLIC]: [Country.GERMANY, Country.POLAND, Country.AUSTRIA, Country.HUNGARY],
  [Country.AUSTRIA]: [
    Country.GERMANY,
    Country.CZECH_REPUBLIC,
    Country.HUNGARY,
    Country.ITALY,
    Country.SWITZERLAND,
  ],
  [Country.HUNGARY]: [
    Country.AUSTRIA,
    Country.CZECH_REPUBLIC,
    Country.ROMANIA,
    Country.SERBIA,
    Country.CROATIA,
    Country.UKRAINE,
  ],

  // Europe - Baltic
  [Country.ESTONIA]: [Country.RUSSIA, Country.LATVIA, Country.FINLAND],
  [Country.LATVIA]: [Country.ESTONIA, Country.LITHUANIA, Country.RUSSIA],
  [Country.LITHUANIA]: [Country.LATVIA, Country.POLAND, Country.RUSSIA],

  // Europe - Eastern
  [Country.RUSSIA]: [
    Country.FINLAND,
    Country.ESTONIA,
    Country.LATVIA,
    Country.LITHUANIA,
    Country.POLAND,
    Country.UKRAINE,
    Country.CHINA,
    Country.JAPAN,
  ],
  [Country.UKRAINE]: [Country.RUSSIA, Country.POLAND, Country.HUNGARY, Country.ROMANIA],

  // Europe - Balkans
  [Country.ROMANIA]: [Country.UKRAINE, Country.HUNGARY, Country.SERBIA, Country.BULGARIA],
  [Country.BULGARIA]: [Country.ROMANIA, Country.SERBIA, Country.GREECE, Country.TURKEY],
  [Country.SERBIA]: [Country.HUNGARY, Country.ROMANIA, Country.BULGARIA, Country.CROATIA],
  [Country.CROATIA]: [Country.HUNGARY, Country.SERBIA],
  [Country.GREECE]: [Country.BULGARIA, Country.TURKEY],

  // Middle East
  [Country.TURKEY]: [Country.GREECE, Country.BULGARIA, Country.SYRIA, Country.IRAQ, Country.IRAN],
  [Country.IRAN]: [Country.TURKEY, Country.IRAQ, Country.PAKISTAN],
  [Country.IRAQ]: [
    Country.TURKEY,
    Country.IRAN,
    Country.SYRIA,
    Country.JORDAN,
    Country.SAUDI_ARABIA,
  ],
  [Country.SYRIA]: [Country.TURKEY, Country.IRAQ, Country.JORDAN, Country.LEBANON, Country.ISRAEL],
  [Country.JORDAN]: [Country.SYRIA, Country.IRAQ, Country.SAUDI_ARABIA, Country.ISRAEL],
  [Country.LEBANON]: [Country.SYRIA, Country.ISRAEL],
  [Country.ISRAEL]: [Country.LEBANON, Country.SYRIA, Country.JORDAN, Country.EGYPT],
  [Country.SAUDI_ARABIA]: [Country.JORDAN, Country.IRAQ, Country.UAE],
  [Country.UAE]: [Country.SAUDI_ARABIA],

  // Africa
  [Country.EGYPT]: [Country.ISRAEL, Country.LIBYA, Country.SUDAN],
  [Country.LIBYA]: [Country.EGYPT, Country.TUNISIA, Country.ALGERIA, Country.SUDAN],
  [Country.TUNISIA]: [Country.LIBYA, Country.ALGERIA],
  [Country.ALGERIA]: [Country.TUNISIA, Country.LIBYA, Country.MOROCCO],
  [Country.MOROCCO]: [Country.ALGERIA, Country.SPAIN],
  [Country.SUDAN]: [Country.EGYPT, Country.LIBYA, Country.ETHIOPIA, Country.KENYA],
  [Country.ETHIOPIA]: [Country.SUDAN, Country.KENYA, Country.UGANDA],
  [Country.KENYA]: [Country.ETHIOPIA, Country.SUDAN, Country.UGANDA, Country.TANZANIA],
  [Country.UGANDA]: [Country.KENYA, Country.ETHIOPIA, Country.TANZANIA],
  [Country.TANZANIA]: [Country.KENYA, Country.UGANDA, Country.ZAMBIA],
  [Country.NIGERIA]: [Country.GHANA, Country.SENEGAL],
  [Country.GHANA]: [Country.NIGERIA, Country.SENEGAL],
  [Country.SENEGAL]: [Country.GHANA, Country.NIGERIA],
  [Country.SOUTH_AFRICA]: [Country.ZIMBABWE, Country.ZAMBIA],
  [Country.ZIMBABWE]: [Country.SOUTH_AFRICA, Country.ZAMBIA, Country.ANGOLA],
  [Country.ZAMBIA]: [Country.TANZANIA, Country.ZIMBABWE, Country.SOUTH_AFRICA, Country.ANGOLA],
  [Country.ANGOLA]: [Country.ZAMBIA, Country.ZIMBABWE],

  // Asia
  [Country.CHINA]: [
    Country.RUSSIA,
    Country.INDIA,
    Country.PAKISTAN,
    Country.VIETNAM,
    Country.SOUTH_KOREA,
    Country.JAPAN,
  ],
  [Country.INDIA]: [Country.CHINA, Country.PAKISTAN],
  [Country.PAKISTAN]: [Country.INDIA, Country.CHINA, Country.IRAN],
  [Country.JAPAN]: [Country.RUSSIA, Country.CHINA, Country.SOUTH_KOREA],
  [Country.SOUTH_KOREA]: [Country.CHINA, Country.JAPAN],

  // Southeast Asia
  [Country.VIETNAM]: [Country.CHINA, Country.THAILAND],
  [Country.THAILAND]: [Country.VIETNAM, Country.MALAYSIA],
  [Country.MALAYSIA]: [Country.THAILAND, Country.SINGAPORE, Country.INDONESIA],
  [Country.SINGAPORE]: [Country.MALAYSIA, Country.INDONESIA],
  [Country.INDONESIA]: [
    Country.MALAYSIA,
    Country.SINGAPORE,
    Country.PHILIPPINES,
    Country.PAPUA_NEW_GUINEA,
  ],
  [Country.PHILIPPINES]: [Country.INDONESIA],

  // Oceania
  [Country.AUSTRALIA]: [Country.NEW_ZEALAND, Country.PAPUA_NEW_GUINEA],
  [Country.NEW_ZEALAND]: [Country.AUSTRALIA],
  [Country.PAPUA_NEW_GUINEA]: [Country.INDONESIA, Country.AUSTRALIA, Country.SOLOMON_ISLANDS],
  [Country.FIJI]: [Country.VANUATU, Country.TONGA, Country.SAMOA],
  [Country.SOLOMON_ISLANDS]: [Country.PAPUA_NEW_GUINEA, Country.VANUATU],
  [Country.VANUATU]: [Country.SOLOMON_ISLANDS, Country.FIJI],
  [Country.SAMOA]: [Country.FIJI, Country.TONGA],
  [Country.TONGA]: [Country.FIJI, Country.SAMOA],
  [Country.KIRIBATI]: [Country.MARSHALL_ISLANDS],
  [Country.MICRONESIA]: [Country.PALAU, Country.MARSHALL_ISLANDS],
  [Country.PALAU]: [Country.MICRONESIA, Country.PHILIPPINES],
  [Country.MARSHALL_ISLANDS]: [Country.KIRIBATI, Country.MICRONESIA],
}
