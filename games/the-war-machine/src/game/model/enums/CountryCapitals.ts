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
  [Country.NEW_ZEALAND]: { x: 475, y: 275, name: 'Wellington' },

  // Additional North America
  [Country.MEXICO]: { x: -475, y: -100, name: 'Mexico City' },

  // Additional South America
  [Country.ARGENTINA]: { x: -475, y: 175, name: 'Buenos Aires' },
  [Country.CHILE]: { x: -500, y: 150, name: 'Santiago' },
  [Country.COLOMBIA]: { x: -475, y: 0, name: 'Bogotá' },

  // Additional Asia
  [Country.INDONESIA]: { x: 375, y: 25, name: 'Jakarta' },
  [Country.THAILAND]: { x: 350, y: -25, name: 'Bangkok' },
  [Country.VIETNAM]: { x: 375, y: -50, name: 'Hanoi' },
  [Country.PHILIPPINES]: { x: 425, y: -25, name: 'Manila' },
  [Country.MALAYSIA]: { x: 350, y: 0, name: 'Kuala Lumpur' },

  // Additional Europe
  [Country.GREECE]: { x: -75, y: -175, name: 'Athens' },
  [Country.ROMANIA]: { x: -25, y: -200, name: 'Bucharest' },
  [Country.FINLAND]: { x: -75, y: -275, name: 'Helsinki' },
  [Country.DENMARK]: { x: -100, y: -260, name: 'Copenhagen' },
  [Country.AUSTRIA]: { x: -50, y: -210, name: 'Vienna' },
  [Country.HUNGARY]: { x: -25, y: -210, name: 'Budapest' },
  [Country.BULGARIA]: { x: -25, y: -185, name: 'Sofia' },
  [Country.SERBIA]: { x: -50, y: -195, name: 'Belgrade' },
  [Country.CROATIA]: { x: -75, y: -200, name: 'Zagreb' },
  [Country.PORTUGAL]: { x: -175, y: -200, name: 'Lisbon' },

  // Middle East additions
  [Country.IRAN]: { x: 225, y: -100, name: 'Tehran' },
  [Country.IRAQ]: { x: 175, y: -100, name: 'Baghdad' },
  [Country.SYRIA]: { x: 150, y: -125, name: 'Damascus' },
  [Country.JORDAN]: { x: 150, y: -100, name: 'Amman' },
  [Country.LEBANON]: { x: 150, y: -125, name: 'Beirut' },

  // Africa additions
  [Country.NIGERIA]: { x: -100, y: 0, name: 'Abuja' },
  [Country.KENYA]: { x: -50, y: 0, name: 'Nairobi' },
  [Country.ETHIOPIA]: { x: -50, y: -25, name: 'Addis Ababa' },
  [Country.MOROCCO]: { x: -150, y: -100, name: 'Rabat' },
  [Country.ALGERIA]: { x: -125, y: -75, name: 'Algiers' },

  // South America additions
  [Country.PERU]: { x: -500, y: 25, name: 'Lima' },
  [Country.VENEZUELA]: { x: -450, y: -25, name: 'Caracas' },
  [Country.ECUADOR]: { x: -500, y: 0, name: 'Quito' },
  // Africa additions
  [Country.TANZANIA]: { x: 175, y: 50, name: 'Dodoma' },
  [Country.SUDAN]: { x: 125, y: 0, name: 'Khartoum' },
  [Country.LIBYA]: { x: 75, y: -50, name: 'Tripoli' },
  [Country.TUNISIA]: { x: 50, y: -100, name: 'Tunis' },
  [Country.GHANA]: { x: -25, y: 25, name: 'Accra' },
  [Country.UGANDA]: { x: 125, y: 25, name: 'Kampala' },
  [Country.ZAMBIA]: { x: 100, y: 100, name: 'Lusaka' },
  [Country.ZIMBABWE]: { x: 125, y: 125, name: 'Harare' },
  [Country.SENEGAL]: { x: -75, y: 0, name: 'Dakar' },
  [Country.ANGOLA]: { x: 75, y: 100, name: 'Luanda' },
  // Oceania additions
  [Country.PAPUA_NEW_GUINEA]: { x: 500, y: 200, name: 'Port Moresby' },
  [Country.FIJI]: { x: 550, y: 250, name: 'Suva' },
  [Country.SOLOMON_ISLANDS]: { x: 525, y: 225, name: 'Honiara' },
  [Country.VANUATU]: { x: 525, y: 250, name: 'Port Vila' },
  [Country.SAMOA]: { x: 575, y: 250, name: 'Apia' },
  [Country.TONGA]: { x: 575, y: 275, name: 'Nuku\'alofa' },
  [Country.KIRIBATI]: { x: 550, y: 200, name: 'Tarawa' },
  [Country.MICRONESIA]: { x: 525, y: 175, name: 'Palikir' },
  [Country.PALAU]: { x: 475, y: 175, name: 'Ngerulmud' },
  [Country.MARSHALL_ISLANDS]: { x: 550, y: 175, name: 'Majuro' },
}
