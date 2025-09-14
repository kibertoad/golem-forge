import { Country } from './Countries.ts'
import { EarthRegion } from './EarthRegions.ts'

export interface CountryInfo {
  country: Country
  relativeSize: number // 1-5 scale for visual block size
  gridX: number // Position in continent grid (0-9)
  gridY: number // Position in continent grid (0-9)
}

export const ContinentCountries: Record<EarthRegion, CountryInfo[]> = {
  [EarthRegion.NORTH_AMERICA]: [
    { country: Country.USA, relativeSize: 5, gridX: 4, gridY: 5 },
    { country: Country.CANADA, relativeSize: 5, gridX: 4, gridY: 2 },
    { country: Country.MEXICO, relativeSize: 3, gridX: 4, gridY: 7 },
  ],

  [EarthRegion.SOUTH_AMERICA]: [
    { country: Country.BRAZIL, relativeSize: 5, gridX: 5, gridY: 4 },
    { country: Country.ARGENTINA, relativeSize: 4, gridX: 4, gridY: 7 },
    { country: Country.CHILE, relativeSize: 2, gridX: 2, gridY: 8 },
    { country: Country.COLOMBIA, relativeSize: 3, gridX: 3, gridY: 1 },
    { country: Country.PERU, relativeSize: 2, gridX: 1, gridY: 4 }, // Moved from (2,3) to avoid Ecuador
    { country: Country.VENEZUELA, relativeSize: 2, gridX: 5, gridY: 1 },
    { country: Country.ECUADOR, relativeSize: 1, gridX: 2, gridY: 2 },
  ],

  [EarthRegion.EUROPE]: [
    { country: Country.RUSSIA, relativeSize: 5, gridX: 8, gridY: 2 },
    { country: Country.UK, relativeSize: 2, gridX: 0, gridY: 2 },
    { country: Country.FRANCE, relativeSize: 3, gridX: 2, gridY: 5 },
    { country: Country.GERMANY, relativeSize: 3, gridX: 4, gridY: 2 }, // Moved up to avoid Poland
    { country: Country.ITALY, relativeSize: 2, gridX: 3, gridY: 7 },
    { country: Country.SPAIN, relativeSize: 3, gridX: 1, gridY: 7 }, // Moved to (1,7) to fit frame
    { country: Country.POLAND, relativeSize: 2, gridX: 6, gridY: 3 }, // Moved right
    { country: Country.UKRAINE, relativeSize: 3, gridX: 8, gridY: 4 }, // Moved right to avoid Romania
    { country: Country.SWEDEN, relativeSize: 2, gridX: 4, gridY: 0 },
    { country: Country.NORWAY, relativeSize: 2, gridX: 2, gridY: 0 },
    { country: Country.NETHERLANDS, relativeSize: 1, gridX: 1, gridY: 3 },
    { country: Country.BELGIUM, relativeSize: 1, gridX: 2, gridY: 3 }, // Moved right
    { country: Country.SWITZERLAND, relativeSize: 1, gridX: 3, gridY: 4 }, // Moved up
    { country: Country.CZECH_REPUBLIC, relativeSize: 1, gridX: 5, gridY: 3 }, // Moved up to avoid Hungary
    { country: Country.GREECE, relativeSize: 1, gridX: 5, gridY: 7 }, // Moved up
    { country: Country.ROMANIA, relativeSize: 2, gridX: 7, gridY: 6 },
    { country: Country.FINLAND, relativeSize: 2, gridX: 6, gridY: 0 },
    { country: Country.DENMARK, relativeSize: 1, gridX: 3, gridY: 1 },
    { country: Country.AUSTRIA, relativeSize: 1, gridX: 4, gridY: 4 }, // Moved up
    { country: Country.HUNGARY, relativeSize: 1, gridX: 5, gridY: 5 },
    { country: Country.BULGARIA, relativeSize: 1, gridX: 6, gridY: 8 }, // Moved down
    { country: Country.SERBIA, relativeSize: 1, gridX: 6, gridY: 6 },
    { country: Country.CROATIA, relativeSize: 1, gridX: 4, gridY: 6 },
    { country: Country.PORTUGAL, relativeSize: 2, gridX: 0, gridY: 5 },
    // Baltic states
    { country: Country.ESTONIA, relativeSize: 1, gridX: 8, gridY: 0 }, // Moved to top to avoid Russia
    { country: Country.LATVIA, relativeSize: 1, gridX: 7, gridY: 0 }, // Moved to top to avoid overlaps
    { country: Country.LITHUANIA, relativeSize: 1, gridX: 5, gridY: 1 }, // Moved up to avoid Czech Republic
  ],

  [EarthRegion.AFRICA]: [
    { country: Country.EGYPT, relativeSize: 3, gridX: 7, gridY: 1 },
    { country: Country.SOUTH_AFRICA, relativeSize: 3, gridX: 5, gridY: 8 },
    { country: Country.NIGERIA, relativeSize: 3, gridX: 3, gridY: 4 },
    { country: Country.KENYA, relativeSize: 2, gridX: 6, gridY: 5 },
    { country: Country.ETHIOPIA, relativeSize: 2, gridX: 7, gridY: 3 },
    { country: Country.MOROCCO, relativeSize: 2, gridX: 1, gridY: 1 },
    { country: Country.ALGERIA, relativeSize: 3, gridX: 3, gridY: 1 },
    // New Africa countries
    { country: Country.TANZANIA, relativeSize: 2, gridX: 8, gridY: 6 }, // Moved right to avoid overlap
    { country: Country.SUDAN, relativeSize: 3, gridX: 5, gridY: 3 }, // Moved to center to avoid all overlaps
    { country: Country.LIBYA, relativeSize: 3, gridX: 5, gridY: 0 },
    { country: Country.TUNISIA, relativeSize: 1, gridX: 4, gridY: 0 },
    { country: Country.GHANA, relativeSize: 2, gridX: 1, gridY: 5 }, // Moved left to avoid Nigeria
    { country: Country.UGANDA, relativeSize: 1, gridX: 8, gridY: 4 }, // Moved more right to avoid Ethiopia
    { country: Country.ZAMBIA, relativeSize: 2, gridX: 4, gridY: 6 }, // Moved left
    { country: Country.ZIMBABWE, relativeSize: 2, gridX: 3, gridY: 8 }, // Moved more left to avoid South Africa
    { country: Country.SENEGAL, relativeSize: 1, gridX: 0, gridY: 3 },
    { country: Country.ANGOLA, relativeSize: 2, gridX: 2, gridY: 7 }, // Moved left to avoid overlaps
  ],

  [EarthRegion.ASIA]: [
    { country: Country.CHINA, relativeSize: 5, gridX: 6, gridY: 2 }, // Moved right
    { country: Country.INDIA, relativeSize: 5, gridX: 3, gridY: 6 }, // Moved right
    { country: Country.JAPAN, relativeSize: 2, gridX: 9, gridY: 3 },
    { country: Country.SOUTH_KOREA, relativeSize: 1, gridX: 8, gridY: 2 }, // Moved up
    { country: Country.TURKEY, relativeSize: 2, gridX: 0, gridY: 1 }, // Moved up
    { country: Country.ISRAEL, relativeSize: 1, gridX: 2, gridY: 4 }, // Moved up to avoid India
    { country: Country.UAE, relativeSize: 1, gridX: 3, gridY: 8 }, // Moved right
    { country: Country.SAUDI_ARABIA, relativeSize: 3, gridX: 1, gridY: 7 }, // Moved down to avoid Israel
    { country: Country.PAKISTAN, relativeSize: 2, gridX: 4, gridY: 4 }, // Moved right
    { country: Country.SINGAPORE, relativeSize: 1, gridX: 5, gridY: 8 }, // Moved up to fit in frame
    { country: Country.INDONESIA, relativeSize: 3, gridX: 8, gridY: 7 }, // Moved right to avoid Malaysia
    { country: Country.THAILAND, relativeSize: 2, gridX: 5, gridY: 6 }, // Moved right
    { country: Country.VIETNAM, relativeSize: 2, gridX: 7, gridY: 5 }, // Moved right to avoid overlaps
    { country: Country.PHILIPPINES, relativeSize: 2, gridX: 9, gridY: 5 }, // Moved up to avoid Indonesia
    { country: Country.MALAYSIA, relativeSize: 2, gridX: 6, gridY: 7 }, // Moved right
    { country: Country.IRAN, relativeSize: 3, gridX: 2, gridY: 1 }, // Moved up to avoid Iraq
    { country: Country.IRAQ, relativeSize: 2, gridX: 1, gridY: 3 }, // Moved up
    { country: Country.SYRIA, relativeSize: 1, gridX: 3, gridY: 3 }, // Moved to center to avoid overlaps
    { country: Country.JORDAN, relativeSize: 1, gridX: 0, gridY: 6 }, // Moved down to avoid Lebanon
    { country: Country.LEBANON, relativeSize: 1, gridX: 0, gridY: 4 }, // Moved left
  ],

  [EarthRegion.OCEANIA]: [
    { country: Country.AUSTRALIA, relativeSize: 5, gridX: 5, gridY: 5 },
    { country: Country.NEW_ZEALAND, relativeSize: 2, gridX: 8, gridY: 7 },
    // New Oceania countries
    { country: Country.PAPUA_NEW_GUINEA, relativeSize: 2, gridX: 3, gridY: 2 },
    { country: Country.FIJI, relativeSize: 1, gridX: 8, gridY: 4 },
    { country: Country.SOLOMON_ISLANDS, relativeSize: 1, gridX: 5, gridY: 2 }, // Moved more left to avoid Micronesia
    { country: Country.VANUATU, relativeSize: 1, gridX: 7, gridY: 3 },
    { country: Country.SAMOA, relativeSize: 1, gridX: 7, gridY: 1 }, // Moved left and up to avoid Marshall Islands
    { country: Country.TONGA, relativeSize: 1, gridX: 9, gridY: 4 },
    { country: Country.KIRIBATI, relativeSize: 1, gridX: 9, gridY: 1 },
    { country: Country.MICRONESIA, relativeSize: 1, gridX: 6, gridY: 1 },
    { country: Country.PALAU, relativeSize: 1, gridX: 4, gridY: 1 },
    { country: Country.MARSHALL_ISLANDS, relativeSize: 1, gridX: 8, gridY: 1 },
  ],
}

// Helper to get the continent for a country
export function getCountryContinent(country: Country): EarthRegion | null {
  for (const [continent, countries] of Object.entries(ContinentCountries)) {
    if (countries.some((c) => c.country === country)) {
      return continent as EarthRegion
    }
  }
  return null
}

// Helper to get relative GDP/military power for scaling
export function getCountryPowerScale(country: Country): number {
  const powerScales: Partial<Record<Country, number>> = {
    [Country.USA]: 5,
    [Country.CHINA]: 5,
    [Country.RUSSIA]: 4,
    [Country.INDIA]: 4,
    [Country.JAPAN]: 3,
    [Country.GERMANY]: 3,
    [Country.UK]: 3,
    [Country.FRANCE]: 3,
    [Country.BRAZIL]: 3,
    [Country.CANADA]: 3,
    [Country.AUSTRALIA]: 3,
    [Country.SOUTH_KOREA]: 2,
    [Country.ITALY]: 2,
    [Country.SPAIN]: 2,
    [Country.MEXICO]: 2,
    [Country.INDONESIA]: 2,
    [Country.TURKEY]: 2,
    [Country.SAUDI_ARABIA]: 2,
    [Country.ARGENTINA]: 2,
    [Country.POLAND]: 2,
    [Country.NETHERLANDS]: 1,
    [Country.SWEDEN]: 1,
    [Country.BELGIUM]: 1,
    [Country.SWITZERLAND]: 1,
    [Country.SINGAPORE]: 1,
    [Country.UAE]: 1,
    [Country.ISRAEL]: 1,
  }

  return powerScales[country] || 1
}
