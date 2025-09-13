import { Country } from './Countries.ts'

export interface CapitalPosition {
  x: number
  y: number
  name: string
}

// Positions are relative to the Earth map center (0,0)
// Based on our custom Earth map projection
export const CountryCapitals: Record<Country, CapitalPosition> = {
  [Country.USA]: { x: -95, y: -38, name: 'Washington D.C.' },
  [Country.RUSSIA]: { x: 37, y: -56, name: 'Moscow' },
  [Country.CHINA]: { x: 116, y: -40, name: 'Beijing' },
  [Country.UK]: { x: 0, y: -51, name: 'London' },
  [Country.FRANCE]: { x: 2, y: -49, name: 'Paris' },
  [Country.GERMANY]: { x: 13, y: -52, name: 'Berlin' },
  [Country.ISRAEL]: { x: 35, y: -32, name: 'Jerusalem' },
  [Country.INDIA]: { x: 77, y: -28, name: 'New Delhi' },
  [Country.JAPAN]: { x: 140, y: -36, name: 'Tokyo' },
  [Country.SOUTH_KOREA]: { x: 127, y: -37, name: 'Seoul' },
  [Country.TURKEY]: { x: 33, y: -40, name: 'Ankara' },
  [Country.ITALY]: { x: 12, y: -42, name: 'Rome' },
  [Country.SWEDEN]: { x: 18, y: -59, name: 'Stockholm' },
  [Country.SWITZERLAND]: { x: 7, y: -47, name: 'Bern' },
  [Country.UAE]: { x: 54, y: -24, name: 'Abu Dhabi' },
  [Country.CANADA]: { x: -75, y: -45, name: 'Ottawa' },
  [Country.AUSTRALIA]: { x: 149, y: 35, name: 'Canberra' },
  [Country.BRAZIL]: { x: -48, y: 16, name: 'Brasília' },
  [Country.SOUTH_AFRICA]: { x: 28, y: 26, name: 'Pretoria' },
  [Country.POLAND]: { x: 21, y: -52, name: 'Warsaw' },
  [Country.SPAIN]: { x: -4, y: -40, name: 'Madrid' },
  [Country.NETHERLANDS]: { x: 5, y: -52, name: 'Amsterdam' },
  [Country.BELGIUM]: { x: 4, y: -51, name: 'Brussels' },
  [Country.NORWAY]: { x: 11, y: -60, name: 'Oslo' },
  [Country.SINGAPORE]: { x: 104, y: -1, name: 'Singapore' },
  [Country.SAUDI_ARABIA]: { x: 47, y: -25, name: 'Riyadh' },
  [Country.EGYPT]: { x: 31, y: -30, name: 'Cairo' },
  [Country.PAKISTAN]: { x: 73, y: -34, name: 'Islamabad' },
  [Country.UKRAINE]: { x: 31, y: -50, name: 'Kyiv' },
  [Country.CZECH_REPUBLIC]: { x: 14, y: -50, name: 'Prague' },
}
