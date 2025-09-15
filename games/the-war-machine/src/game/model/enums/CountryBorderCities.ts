import { Country } from './Countries.ts'
import { BorderDirection } from './CountryNeighborDirections.ts'

export type BorderCity = {
  cityId: string
  cityName: string
  direction: BorderDirection
}

// Define 1-3 border cities for each side of each country
// These are the cities that will be attacked when the country is invaded from that direction
export const CountryBorderCities: Record<Country, BorderCity[]> = {
  // North America
  [Country.USA]: [
    // Northern border (with Canada)
    { cityId: 'usa-seattle', cityName: 'Seattle', direction: BorderDirection.NORTH },
    { cityId: 'usa-detroit', cityName: 'Detroit', direction: BorderDirection.NORTH },
    { cityId: 'usa-newyork', cityName: 'New York', direction: BorderDirection.NORTH },
    // Southern border (with Mexico)
    { cityId: 'usa-sandiego', cityName: 'San Diego', direction: BorderDirection.SOUTH },
    { cityId: 'usa-elpaso', cityName: 'El Paso', direction: BorderDirection.SOUTH },
    { cityId: 'usa-houston', cityName: 'Houston', direction: BorderDirection.SOUTH },
  ],
  [Country.CANADA]: [
    // Southern border (with USA)
    { cityId: 'canada-vancouver', cityName: 'Vancouver', direction: BorderDirection.SOUTH },
    { cityId: 'canada-toronto', cityName: 'Toronto', direction: BorderDirection.SOUTH },
    { cityId: 'canada-montreal', cityName: 'Montreal', direction: BorderDirection.SOUTH },
  ],
  [Country.MEXICO]: [
    // Northern border (with USA)
    { cityId: 'mexico-tijuana', cityName: 'Tijuana', direction: BorderDirection.NORTH },
    { cityId: 'mexico-juarez', cityName: 'Juárez', direction: BorderDirection.NORTH },
    { cityId: 'mexico-monterrey', cityName: 'Monterrey', direction: BorderDirection.NORTH },
  ],

  // Europe
  [Country.UK]: [
    // Southern connection (with France via Channel)
    { cityId: 'uk-dover', cityName: 'Dover', direction: BorderDirection.SOUTH },
    { cityId: 'uk-london', cityName: 'London', direction: BorderDirection.SOUTH },
  ],
  [Country.FRANCE]: [
    // Northern border
    { cityId: 'france-lille', cityName: 'Lille', direction: BorderDirection.NORTH },
    { cityId: 'france-calais', cityName: 'Calais', direction: BorderDirection.NORTH },
    // Eastern border
    { cityId: 'france-strasbourg', cityName: 'Strasbourg', direction: BorderDirection.EAST },
    { cityId: 'france-lyon', cityName: 'Lyon', direction: BorderDirection.EAST },
    // Southern border
    { cityId: 'france-perpignan', cityName: 'Perpignan', direction: BorderDirection.SOUTH },
    { cityId: 'france-nice', cityName: 'Nice', direction: BorderDirection.SOUTH },
    // Western border
    { cityId: 'france-brest', cityName: 'Brest', direction: BorderDirection.WEST },
  ],
  [Country.GERMANY]: [
    // Northern border
    { cityId: 'germany-hamburg', cityName: 'Hamburg', direction: BorderDirection.NORTH },
    { cityId: 'germany-berlin', cityName: 'Berlin', direction: BorderDirection.NORTH },
    // Eastern border
    { cityId: 'germany-dresden', cityName: 'Dresden', direction: BorderDirection.EAST },
    { cityId: 'germany-frankfurt-oder', cityName: 'Frankfurt (Oder)', direction: BorderDirection.EAST },
    // Southern border
    { cityId: 'germany-munich', cityName: 'Munich', direction: BorderDirection.SOUTH },
    { cityId: 'germany-stuttgart', cityName: 'Stuttgart', direction: BorderDirection.SOUTH },
    // Western border
    { cityId: 'germany-cologne', cityName: 'Cologne', direction: BorderDirection.WEST },
    { cityId: 'germany-frankfurt', cityName: 'Frankfurt', direction: BorderDirection.WEST },
  ],
  [Country.POLAND]: [
    // Northern border
    { cityId: 'poland-gdansk', cityName: 'Gdańsk', direction: BorderDirection.NORTH },
    // Eastern border
    { cityId: 'poland-bialystok', cityName: 'Białystok', direction: BorderDirection.EAST },
    { cityId: 'poland-lublin', cityName: 'Lublin', direction: BorderDirection.EAST },
    // Southern border
    { cityId: 'poland-krakow', cityName: 'Kraków', direction: BorderDirection.SOUTH },
    // Western border
    { cityId: 'poland-poznan', cityName: 'Poznań', direction: BorderDirection.WEST },
    { cityId: 'poland-wroclaw', cityName: 'Wrocław', direction: BorderDirection.WEST },
  ],
  [Country.SPAIN]: [
    // Northern border
    { cityId: 'spain-bilbao', cityName: 'Bilbao', direction: BorderDirection.NORTH },
    { cityId: 'spain-barcelona', cityName: 'Barcelona', direction: BorderDirection.NORTH },
    // Western border
    { cityId: 'spain-vigo', cityName: 'Vigo', direction: BorderDirection.WEST },
    { cityId: 'spain-badajoz', cityName: 'Badajoz', direction: BorderDirection.WEST },
  ],
  [Country.ITALY]: [
    // Northern border
    { cityId: 'italy-milan', cityName: 'Milan', direction: BorderDirection.NORTH },
    { cityId: 'italy-turin', cityName: 'Turin', direction: BorderDirection.NORTH },
    { cityId: 'italy-venice', cityName: 'Venice', direction: BorderDirection.NORTH },
    // Western border
    { cityId: 'italy-genoa', cityName: 'Genoa', direction: BorderDirection.WEST },
  ],

  // Russia (major borders)
  [Country.RUSSIA]: [
    // Western border
    { cityId: 'russia-stpetersburg', cityName: 'St. Petersburg', direction: BorderDirection.WEST },
    { cityId: 'russia-smolensk', cityName: 'Smolensk', direction: BorderDirection.WEST },
    { cityId: 'russia-rostov', cityName: 'Rostov', direction: BorderDirection.WEST },
    // Southern border
    { cityId: 'russia-vladivostok', cityName: 'Vladivostok', direction: BorderDirection.SOUTH },
    { cityId: 'russia-irkutsk', cityName: 'Irkutsk', direction: BorderDirection.SOUTH },
    // Eastern border
    { cityId: 'russia-khabarovsk', cityName: 'Khabarovsk', direction: BorderDirection.EAST },
  ],

  // China
  [Country.CHINA]: [
    // Northern border
    { cityId: 'china-harbin', cityName: 'Harbin', direction: BorderDirection.NORTH },
    { cityId: 'china-beijing', cityName: 'Beijing', direction: BorderDirection.NORTH },
    // Southern border
    { cityId: 'china-guangzhou', cityName: 'Guangzhou', direction: BorderDirection.SOUTH },
    { cityId: 'china-kunming', cityName: 'Kunming', direction: BorderDirection.SOUTH },
    // Eastern border
    { cityId: 'china-shanghai', cityName: 'Shanghai', direction: BorderDirection.EAST },
    { cityId: 'china-qingdao', cityName: 'Qingdao', direction: BorderDirection.EAST },
    // Western border
    { cityId: 'china-urumqi', cityName: 'Urumqi', direction: BorderDirection.WEST },
    { cityId: 'china-lhasa', cityName: 'Lhasa', direction: BorderDirection.WEST },
  ],

  // India
  [Country.INDIA]: [
    // Northern border
    { cityId: 'india-srinagar', cityName: 'Srinagar', direction: BorderDirection.NORTH },
    { cityId: 'india-delhi', cityName: 'New Delhi', direction: BorderDirection.NORTH },
    // Western border
    { cityId: 'india-amritsar', cityName: 'Amritsar', direction: BorderDirection.WEST },
    { cityId: 'india-jaipur', cityName: 'Jaipur', direction: BorderDirection.WEST },
    // Eastern border
    { cityId: 'india-kolkata', cityName: 'Kolkata', direction: BorderDirection.EAST },
  ],

  // Japan
  [Country.JAPAN]: [
    // Western border (towards mainland Asia)
    { cityId: 'japan-fukuoka', cityName: 'Fukuoka', direction: BorderDirection.WEST },
    { cityId: 'japan-hiroshima', cityName: 'Hiroshima', direction: BorderDirection.WEST },
    { cityId: 'japan-osaka', cityName: 'Osaka', direction: BorderDirection.WEST },
  ],

  // Middle East
  [Country.TURKEY]: [
    // Western border
    { cityId: 'turkey-istanbul', cityName: 'Istanbul', direction: BorderDirection.WEST },
    { cityId: 'turkey-izmir', cityName: 'Izmir', direction: BorderDirection.WEST },
    // Southern border
    { cityId: 'turkey-adana', cityName: 'Adana', direction: BorderDirection.SOUTH },
    { cityId: 'turkey-gaziantep', cityName: 'Gaziantep', direction: BorderDirection.SOUTH },
    // Eastern border
    { cityId: 'turkey-erzurum', cityName: 'Erzurum', direction: BorderDirection.EAST },
  ],
  [Country.IRAN]: [
    // Western border
    { cityId: 'iran-tabriz', cityName: 'Tabriz', direction: BorderDirection.WEST },
    { cityId: 'iran-kermanshah', cityName: 'Kermanshah', direction: BorderDirection.WEST },
    // Eastern border
    { cityId: 'iran-mashhad', cityName: 'Mashhad', direction: BorderDirection.EAST },
    { cityId: 'iran-zahedan', cityName: 'Zahedan', direction: BorderDirection.EAST },
  ],
  [Country.SAUDI_ARABIA]: [
    // Northern border
    { cityId: 'saudi-tabuk', cityName: 'Tabuk', direction: BorderDirection.NORTH },
    { cityId: 'saudi-arar', cityName: 'Arar', direction: BorderDirection.NORTH },
    // Eastern border
    { cityId: 'saudi-dammam', cityName: 'Dammam', direction: BorderDirection.EAST },
  ],
  [Country.ISRAEL]: [
    // Northern border
    { cityId: 'israel-haifa', cityName: 'Haifa', direction: BorderDirection.NORTH },
    // Southern border
    { cityId: 'israel-eilat', cityName: 'Eilat', direction: BorderDirection.SOUTH },
    // Eastern border
    { cityId: 'israel-jerusalem', cityName: 'Jerusalem', direction: BorderDirection.EAST },
  ],

  // Africa
  [Country.EGYPT]: [
    // Northern border
    { cityId: 'egypt-alexandria', cityName: 'Alexandria', direction: BorderDirection.NORTH },
    // Western border
    { cityId: 'egypt-marsamatruh', cityName: 'Marsa Matruh', direction: BorderDirection.WEST },
    // Southern border
    { cityId: 'egypt-aswan', cityName: 'Aswan', direction: BorderDirection.SOUTH },
  ],
  [Country.SOUTH_AFRICA]: [
    // Northern border
    { cityId: 'southafrica-johannesburg', cityName: 'Johannesburg', direction: BorderDirection.NORTH },
    { cityId: 'southafrica-pretoria', cityName: 'Pretoria', direction: BorderDirection.NORTH },
  ],
  [Country.NIGERIA]: [
    // Northern border
    { cityId: 'nigeria-kano', cityName: 'Kano', direction: BorderDirection.NORTH },
    // Eastern border
    { cityId: 'nigeria-calabar', cityName: 'Calabar', direction: BorderDirection.EAST },
    // Western border
    { cityId: 'nigeria-lagos', cityName: 'Lagos', direction: BorderDirection.WEST },
  ],

  // South America
  [Country.BRAZIL]: [
    // Northern border
    { cityId: 'brazil-manaus', cityName: 'Manaus', direction: BorderDirection.NORTH },
    { cityId: 'brazil-belem', cityName: 'Belém', direction: BorderDirection.NORTH },
    // Southern border
    { cityId: 'brazil-portoalegre', cityName: 'Porto Alegre', direction: BorderDirection.SOUTH },
    // Western border
    { cityId: 'brazil-riobranco', cityName: 'Rio Branco', direction: BorderDirection.WEST },
  ],
  [Country.ARGENTINA]: [
    // Northern border
    { cityId: 'argentina-salta', cityName: 'Salta', direction: BorderDirection.NORTH },
    { cityId: 'argentina-cordoba', cityName: 'Córdoba', direction: BorderDirection.NORTH },
    // Western border
    { cityId: 'argentina-mendoza', cityName: 'Mendoza', direction: BorderDirection.WEST },
  ],

  // Australia/Oceania
  [Country.AUSTRALIA]: [
    // Northern border
    { cityId: 'australia-darwin', cityName: 'Darwin', direction: BorderDirection.NORTH },
    { cityId: 'australia-cairns', cityName: 'Cairns', direction: BorderDirection.NORTH },
    // Eastern border
    { cityId: 'australia-brisbane', cityName: 'Brisbane', direction: BorderDirection.EAST },
  ],

  // Default empty arrays for smaller countries (can be expanded as needed)
  [Country.PORTUGAL]: [
    { cityId: 'portugal-porto', cityName: 'Porto', direction: BorderDirection.EAST },
    { cityId: 'portugal-lisbon', cityName: 'Lisbon', direction: BorderDirection.EAST },
  ],
  [Country.NORWAY]: [
    { cityId: 'norway-oslo', cityName: 'Oslo', direction: BorderDirection.EAST },
  ],
  [Country.SWEDEN]: [
    { cityId: 'sweden-stockholm', cityName: 'Stockholm', direction: BorderDirection.WEST },
    { cityId: 'sweden-malmo', cityName: 'Malmö', direction: BorderDirection.SOUTH },
  ],
  [Country.FINLAND]: [
    { cityId: 'finland-helsinki', cityName: 'Helsinki', direction: BorderDirection.EAST },
    { cityId: 'finland-lappeenranta', cityName: 'Lappeenranta', direction: BorderDirection.EAST },
  ],
  [Country.UKRAINE]: [
    { cityId: 'ukraine-kiev', cityName: 'Kyiv', direction: BorderDirection.WEST },
    { cityId: 'ukraine-kharkiv', cityName: 'Kharkiv', direction: BorderDirection.EAST },
    { cityId: 'ukraine-odessa', cityName: 'Odessa', direction: BorderDirection.SOUTH },
  ],

  // Fill in remaining countries with at least one border city
  [Country.DENMARK]: [{ cityId: 'denmark-copenhagen', cityName: 'Copenhagen', direction: BorderDirection.SOUTH }],
  [Country.NETHERLANDS]: [{ cityId: 'netherlands-amsterdam', cityName: 'Amsterdam', direction: BorderDirection.EAST }],
  [Country.BELGIUM]: [{ cityId: 'belgium-brussels', cityName: 'Brussels', direction: BorderDirection.NORTH }],
  [Country.SWITZERLAND]: [{ cityId: 'switzerland-zurich', cityName: 'Zürich', direction: BorderDirection.NORTH }],
  [Country.AUSTRIA]: [{ cityId: 'austria-vienna', cityName: 'Vienna', direction: BorderDirection.NORTH }],
  [Country.CZECH_REPUBLIC]: [{ cityId: 'czech-prague', cityName: 'Prague', direction: BorderDirection.NORTH }],
  [Country.HUNGARY]: [{ cityId: 'hungary-budapest', cityName: 'Budapest', direction: BorderDirection.WEST }],
  [Country.ROMANIA]: [{ cityId: 'romania-bucharest', cityName: 'Bucharest', direction: BorderDirection.WEST }],
  [Country.BULGARIA]: [{ cityId: 'bulgaria-sofia', cityName: 'Sofia', direction: BorderDirection.NORTH }],
  [Country.GREECE]: [{ cityId: 'greece-athens', cityName: 'Athens', direction: BorderDirection.NORTH }],
  [Country.SERBIA]: [{ cityId: 'serbia-belgrade', cityName: 'Belgrade', direction: BorderDirection.NORTH }],
  [Country.CROATIA]: [{ cityId: 'croatia-zagreb', cityName: 'Zagreb', direction: BorderDirection.NORTH }],
  [Country.ESTONIA]: [{ cityId: 'estonia-tallinn', cityName: 'Tallinn', direction: BorderDirection.EAST }],
  [Country.LATVIA]: [{ cityId: 'latvia-riga', cityName: 'Riga', direction: BorderDirection.EAST }],
  [Country.LITHUANIA]: [{ cityId: 'lithuania-vilnius', cityName: 'Vilnius', direction: BorderDirection.EAST }],
  [Country.PAKISTAN]: [{ cityId: 'pakistan-karachi', cityName: 'Karachi', direction: BorderDirection.EAST }],
  [Country.INDONESIA]: [{ cityId: 'indonesia-jakarta', cityName: 'Jakarta', direction: BorderDirection.NORTH }],
  [Country.SOUTH_KOREA]: [{ cityId: 'southkorea-seoul', cityName: 'Seoul', direction: BorderDirection.WEST }],
  [Country.VIETNAM]: [{ cityId: 'vietnam-hanoi', cityName: 'Hanoi', direction: BorderDirection.NORTH }],
  [Country.THAILAND]: [{ cityId: 'thailand-bangkok', cityName: 'Bangkok', direction: BorderDirection.EAST }],
  [Country.MALAYSIA]: [{ cityId: 'malaysia-kualalumpur', cityName: 'Kuala Lumpur', direction: BorderDirection.NORTH }],
  [Country.SINGAPORE]: [{ cityId: 'singapore-singapore', cityName: 'Singapore', direction: BorderDirection.NORTH }],
  [Country.PHILIPPINES]: [{ cityId: 'philippines-manila', cityName: 'Manila', direction: BorderDirection.SOUTH }],
  [Country.IRAQ]: [{ cityId: 'iraq-baghdad', cityName: 'Baghdad', direction: BorderDirection.NORTH }],
  [Country.SYRIA]: [{ cityId: 'syria-damascus', cityName: 'Damascus', direction: BorderDirection.NORTH }],
  [Country.JORDAN]: [{ cityId: 'jordan-amman', cityName: 'Amman', direction: BorderDirection.NORTH }],
  [Country.LEBANON]: [{ cityId: 'lebanon-beirut', cityName: 'Beirut', direction: BorderDirection.EAST }],
  [Country.UAE]: [{ cityId: 'uae-dubai', cityName: 'Dubai', direction: BorderDirection.WEST }],
  [Country.LIBYA]: [{ cityId: 'libya-tripoli', cityName: 'Tripoli', direction: BorderDirection.EAST }],
  [Country.TUNISIA]: [{ cityId: 'tunisia-tunis', cityName: 'Tunis', direction: BorderDirection.WEST }],
  [Country.ALGERIA]: [{ cityId: 'algeria-algiers', cityName: 'Algiers', direction: BorderDirection.EAST }],
  [Country.MOROCCO]: [{ cityId: 'morocco-casablanca', cityName: 'Casablanca', direction: BorderDirection.EAST }],
  [Country.SUDAN]: [{ cityId: 'sudan-khartoum', cityName: 'Khartoum', direction: BorderDirection.NORTH }],
  [Country.ETHIOPIA]: [{ cityId: 'ethiopia-addisababa', cityName: 'Addis Ababa', direction: BorderDirection.WEST }],
  [Country.KENYA]: [{ cityId: 'kenya-nairobi', cityName: 'Nairobi', direction: BorderDirection.NORTH }],
  [Country.TANZANIA]: [{ cityId: 'tanzania-daressalaam', cityName: 'Dar es Salaam', direction: BorderDirection.NORTH }],
  [Country.UGANDA]: [{ cityId: 'uganda-kampala', cityName: 'Kampala', direction: BorderDirection.EAST }],
  [Country.ZAMBIA]: [{ cityId: 'zambia-lusaka', cityName: 'Lusaka', direction: BorderDirection.NORTH }],
  [Country.ZIMBABWE]: [{ cityId: 'zimbabwe-harare', cityName: 'Harare', direction: BorderDirection.NORTH }],
  [Country.ANGOLA]: [{ cityId: 'angola-luanda', cityName: 'Luanda', direction: BorderDirection.EAST }],
  [Country.GHANA]: [{ cityId: 'ghana-accra', cityName: 'Accra', direction: BorderDirection.EAST }],
  [Country.SENEGAL]: [{ cityId: 'senegal-dakar', cityName: 'Dakar', direction: BorderDirection.EAST }],
  [Country.COLOMBIA]: [{ cityId: 'colombia-bogota', cityName: 'Bogotá', direction: BorderDirection.NORTH }],
  [Country.VENEZUELA]: [{ cityId: 'venezuela-caracas', cityName: 'Caracas', direction: BorderDirection.WEST }],
  [Country.CHILE]: [{ cityId: 'chile-santiago', cityName: 'Santiago', direction: BorderDirection.EAST }],
  [Country.PERU]: [{ cityId: 'peru-lima', cityName: 'Lima', direction: BorderDirection.NORTH }],
  [Country.ECUADOR]: [{ cityId: 'ecuador-quito', cityName: 'Quito', direction: BorderDirection.NORTH }],
  [Country.NEW_ZEALAND]: [{ cityId: 'newzealand-auckland', cityName: 'Auckland', direction: BorderDirection.WEST }],
  [Country.PAPUA_NEW_GUINEA]: [{ cityId: 'png-portmoresby', cityName: 'Port Moresby', direction: BorderDirection.WEST }],
  [Country.FIJI]: [{ cityId: 'fiji-suva', cityName: 'Suva', direction: BorderDirection.WEST }],
  [Country.SOLOMON_ISLANDS]: [{ cityId: 'solomon-honiara', cityName: 'Honiara', direction: BorderDirection.WEST }],
  [Country.VANUATU]: [{ cityId: 'vanuatu-portvila', cityName: 'Port Vila', direction: BorderDirection.NORTH }],
  [Country.SAMOA]: [{ cityId: 'samoa-apia', cityName: 'Apia', direction: BorderDirection.SOUTH }],
  [Country.TONGA]: [{ cityId: 'tonga-nukualofa', cityName: 'Nukuʻalofa', direction: BorderDirection.WEST }],
  [Country.KIRIBATI]: [{ cityId: 'kiribati-tarawa', cityName: 'Tarawa', direction: BorderDirection.WEST }],
  [Country.MICRONESIA]: [{ cityId: 'micronesia-palikir', cityName: 'Palikir', direction: BorderDirection.WEST }],
  [Country.PALAU]: [{ cityId: 'palau-koror', cityName: 'Koror', direction: BorderDirection.EAST }],
  [Country.MARSHALL_ISLANDS]: [{ cityId: 'marshall-majuro', cityName: 'Majuro', direction: BorderDirection.WEST }],

  // Middle East and new regions
  [Country.IRAN]: [
    // Western border (with Iraq and Turkey)
    { cityId: 'iran-tabriz', cityName: 'Tabriz', direction: BorderDirection.WEST },
    { cityId: 'iran-kermanshah', cityName: 'Kermanshah', direction: BorderDirection.WEST },
    { cityId: 'iran-ahvaz', cityName: 'Ahvaz', direction: BorderDirection.WEST },
    // Eastern border (with Pakistan)
    { cityId: 'iran-zahedan', cityName: 'Zahedan', direction: BorderDirection.EAST },
    { cityId: 'iran-mashhad', cityName: 'Mashhad', direction: BorderDirection.EAST },
    // Southern border (with Saudi Arabia/Persian Gulf)
    { cityId: 'iran-bushehr', cityName: 'Bushehr', direction: BorderDirection.SOUTH },
    { cityId: 'iran-bandarabbas', cityName: 'Bandar Abbas', direction: BorderDirection.SOUTH },
    // Northern border
    { cityId: 'iran-rasht', cityName: 'Rasht', direction: BorderDirection.NORTH },
    { cityId: 'iran-gorgan', cityName: 'Gorgan', direction: BorderDirection.NORTH },
  ],
  [Country.IRAQ]: [
    // Eastern border (with Iran)
    { cityId: 'iraq-sulaymaniyah', cityName: 'Sulaymaniyah', direction: BorderDirection.EAST },
    { cityId: 'iraq-kirkuk', cityName: 'Kirkuk', direction: BorderDirection.EAST },
    { cityId: 'iraq-amarah', cityName: 'Amarah', direction: BorderDirection.EAST },
    // Northern border (with Turkey)
    { cityId: 'iraq-mosul', cityName: 'Mosul', direction: BorderDirection.NORTH },
    { cityId: 'iraq-dohuk', cityName: 'Dohuk', direction: BorderDirection.NORTH },
    { cityId: 'iraq-zakho', cityName: 'Zakho', direction: BorderDirection.NORTH },
    // Western border (with Syria)
    { cityId: 'iraq-ramadi', cityName: 'Ramadi', direction: BorderDirection.WEST },
    { cityId: 'iraq-fallujah', cityName: 'Fallujah', direction: BorderDirection.WEST },
    // Southern border (with Saudi Arabia and Kuwait)
    { cityId: 'iraq-basra', cityName: 'Basra', direction: BorderDirection.SOUTH },
    { cityId: 'iraq-nasiriyah', cityName: 'Nasiriyah', direction: BorderDirection.SOUTH },
  ],
  [Country.SUDAN]: [
    // Northern border (with Egypt)
    { cityId: 'sudan-wadihalfa', cityName: 'Wadi Halfa', direction: BorderDirection.NORTH },
    { cityId: 'sudan-dongola', cityName: 'Dongola', direction: BorderDirection.NORTH },
    { cityId: 'sudan-atbara', cityName: 'Atbara', direction: BorderDirection.NORTH },
    // Eastern border (with Ethiopia)
    { cityId: 'sudan-kassala', cityName: 'Kassala', direction: BorderDirection.EAST },
    { cityId: 'sudan-gedaref', cityName: 'Gedaref', direction: BorderDirection.EAST },
    { cityId: 'sudan-portsudaan', cityName: 'Port Sudan', direction: BorderDirection.EAST },
    // Western border (with Libya)
    { cityId: 'sudan-elgeneina', cityName: 'El Geneina', direction: BorderDirection.WEST },
    { cityId: 'sudan-elfasher', cityName: 'El Fasher', direction: BorderDirection.WEST },
    // Southern border (with Kenya/South Sudan)
    { cityId: 'sudan-juba', cityName: 'Juba', direction: BorderDirection.SOUTH },
    { cityId: 'sudan-malakal', cityName: 'Malakal', direction: BorderDirection.SOUTH },
    { cityId: 'sudan-wau', cityName: 'Wau', direction: BorderDirection.SOUTH },
  ],
  [Country.PAKISTAN]: [
    // Western border (with Iran)
    { cityId: 'pakistan-quetta', cityName: 'Quetta', direction: BorderDirection.WEST },
    { cityId: 'pakistan-gwadar', cityName: 'Gwadar', direction: BorderDirection.WEST },
    // Eastern border (with India)
    { cityId: 'pakistan-lahore', cityName: 'Lahore', direction: BorderDirection.EAST },
    { cityId: 'pakistan-sialkot', cityName: 'Sialkot', direction: BorderDirection.EAST },
    { cityId: 'pakistan-mirpurkhas', cityName: 'Mirpur Khas', direction: BorderDirection.EAST },
    // Northern border (with China)
    { cityId: 'pakistan-gilgit', cityName: 'Gilgit', direction: BorderDirection.NORTH },
    { cityId: 'pakistan-peshawar', cityName: 'Peshawar', direction: BorderDirection.NORTH },
    // Southern border (Arabian Sea)
    { cityId: 'pakistan-karachi', cityName: 'Karachi', direction: BorderDirection.SOUTH },
    { cityId: 'pakistan-hyderabad', cityName: 'Hyderabad', direction: BorderDirection.SOUTH },
  ],
  [Country.LITHUANIA]: [
    // Northern border (with Latvia)
    { cityId: 'lithuania-siauliai', cityName: 'Siauliai', direction: BorderDirection.NORTH },
    { cityId: 'lithuania-panevezys', cityName: 'Panevezys', direction: BorderDirection.NORTH },
    { cityId: 'lithuania-mazeikiai', cityName: 'Mazeikiai', direction: BorderDirection.NORTH },
    // Eastern border (with Belarus and Russia)
    { cityId: 'lithuania-vilnius', cityName: 'Vilnius', direction: BorderDirection.EAST },
    { cityId: 'lithuania-visaginas', cityName: 'Visaginas', direction: BorderDirection.EAST },
    { cityId: 'lithuania-utena', cityName: 'Utena', direction: BorderDirection.EAST },
    // Southern border (with Poland)
    { cityId: 'lithuania-marijampole', cityName: 'Marijampole', direction: BorderDirection.SOUTH },
    { cityId: 'lithuania-alytus', cityName: 'Alytus', direction: BorderDirection.SOUTH },
    { cityId: 'lithuania-druskininkai', cityName: 'Druskininkai', direction: BorderDirection.SOUTH },
    // Western border (Baltic Sea)
    { cityId: 'lithuania-klaipeda', cityName: 'Klaipeda', direction: BorderDirection.WEST },
    { cityId: 'lithuania-palanga', cityName: 'Palanga', direction: BorderDirection.WEST },
    { cityId: 'lithuania-kretinga', cityName: 'Kretinga', direction: BorderDirection.WEST },
  ],
}

// Helper function to get border cities for a specific direction
export function getBorderCitiesForDirection(country: Country, direction: BorderDirection): BorderCity[] {
  return CountryBorderCities[country]?.filter(city => city.direction === direction) || []
}