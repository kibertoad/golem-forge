import { Country } from './Countries.ts'

export interface CapitalPosition {
  x: number
  y: number
  name: string
}

// Positions are relative to the flat map center (0,0)
// Based on simplified continent shapes
export const CountryCapitals: Record<Country, CapitalPosition> = {
  // North America (-550 to -350 x, -300 to -100 y)
  [Country.USA]: { x: -450, y: -200, name: 'Washington D.C.' },
  [Country.CANADA]: { x: -450, y: -250, name: 'Ottawa' },

  // South America (-500 to -400 x, -50 to 200 y)
  [Country.BRAZIL]: { x: -450, y: 50, name: 'Brasília' },

  // Europe (-200 to 0 x, -300 to -150 y)
  [Country.UK]: { x: -150, y: -250, name: 'London' },
  [Country.FRANCE]: { x: -100, y: -225, name: 'Paris' },
  [Country.GERMANY]: { x: -50, y: -225, name: 'Berlin' },
  [Country.ITALY]: { x: -100, y: -175, name: 'Rome' },
  [Country.SPAIN]: { x: -150, y: -200, name: 'Madrid' },
  [Country.POLAND]: { x: -50, y: -250, name: 'Warsaw' },
  [Country.UKRAINE]: { x: -25, y: -225, name: 'Kyiv' },
  [Country.SWEDEN]: { x: -100, y: -275, name: 'Stockholm' },
  [Country.NORWAY]: { x: -125, y: -275, name: 'Oslo' },
  [Country.NETHERLANDS]: { x: -125, y: -250, name: 'Amsterdam' },
  [Country.BELGIUM]: { x: -100, y: -250, name: 'Brussels' },
  [Country.SWITZERLAND]: { x: -100, y: -200, name: 'Bern' },
  [Country.CZECH_REPUBLIC]: { x: -75, y: -225, name: 'Prague' },

  // Africa (-150 to -50 x, -100 to 200 y)
  [Country.EGYPT]: { x: -100, y: -50, name: 'Cairo' },
  [Country.SOUTH_AFRICA]: { x: -100, y: 150, name: 'Pretoria' },

  // Asia (100 to 500 x, -300 to 50 y)
  [Country.RUSSIA]: { x: 200, y: -250, name: 'Moscow' },
  [Country.CHINA]: { x: 400, y: -100, name: 'Beijing' },
  [Country.INDIA]: { x: 300, y: -50, name: 'New Delhi' },
  [Country.JAPAN]: { x: 450, y: -150, name: 'Tokyo' },
  [Country.SOUTH_KOREA]: { x: 425, y: -125, name: 'Seoul' },
  [Country.PAKISTAN]: { x: 250, y: -75, name: 'Islamabad' },
  [Country.SINGAPORE]: { x: 350, y: 0, name: 'Singapore' },

  // Middle East (part of Asia boundaries)
  [Country.TURKEY]: { x: 150, y: -150, name: 'Ankara' },
  [Country.ISRAEL]: { x: 150, y: -100, name: 'Jerusalem' },
  [Country.UAE]: { x: 200, y: -50, name: 'Abu Dhabi' },
  [Country.SAUDI_ARABIA]: { x: 175, y: -75, name: 'Riyadh' },

  // Oceania (250 to 450 x, 150 to 300 y)
  [Country.AUSTRALIA]: { x: 350, y: 225, name: 'Canberra' },
}