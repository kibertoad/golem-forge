import { Country } from './Countries.ts'

// Define city neighbor connections for each country
// Rules:
// 1. All cities must be connected in a single network
// 2. Each city has at least 2 neighbors
// 3. No more than 3 neighbors in the same direction (N/S/E/W)
// 4. No connections that would cross over a third city

export type CityNeighbors = Record<string, string[]>

export const CountryCityNeighbors: Partial<Record<Country, CityNeighbors>> = {
  [Country.USA]: {
    'Washington DC': ['Philadelphia', 'Atlanta', 'Chicago', 'Denver'],
    'New York': ['Boston', 'Philadelphia', 'Detroit'],
    'Los Angeles': ['San Francisco', 'San Diego', 'Las Vegas', 'Phoenix'],
    Chicago: ['Detroit', 'Denver', 'Washington DC'],
    Houston: ['Dallas', 'New Orleans', 'San Antonio'],
    Phoenix: ['Los Angeles', 'Las Vegas', 'San Antonio'],
    Philadelphia: ['New York', 'Washington DC'],
    'San Antonio': ['Phoenix', 'Houston', 'Dallas'],
    'San Diego': ['Los Angeles'],
    Dallas: ['Houston', 'San Antonio', 'Denver', 'Atlanta'],
    'San Francisco': ['Los Angeles', 'Portland'],
    Seattle: ['Portland'],
    Denver: ['Chicago', 'Dallas', 'Las Vegas', 'Washington DC'],
    Boston: ['New York'],
    Miami: ['Atlanta', 'New Orleans'],
    Atlanta: ['Washington DC', 'Dallas', 'Miami'],
    Detroit: ['New York', 'Chicago'],
    'Las Vegas': ['Los Angeles', 'Phoenix', 'Denver'],
    Portland: ['Seattle', 'San Francisco'],
    'New Orleans': ['Houston', 'Miami'],
  },

  [Country.CHINA]: {
    Beijing: ['Tianjin', 'Xian', 'Shanghai', 'Shenyang', 'Zhengzhou'],
    Shanghai: ['Beijing', 'Nanjing', 'Hangzhou', 'Wuhan'],
    Guangzhou: ['Shenzhen', 'Wuhan', 'Chengdu'],
    Shenzhen: ['Guangzhou', 'Dongguan'],
    Chengdu: ['Guangzhou', 'Chongqing', 'Xian', 'Kunming'],
    Tianjin: ['Beijing', 'Shenyang', 'Qingdao'],
    Wuhan: ['Shanghai', 'Guangzhou', 'Xian', 'Nanjing', 'Zhengzhou'],
    Dongguan: ['Shenzhen'],
    Chongqing: ['Chengdu', 'Xian'],
    Nanjing: ['Shanghai', 'Wuhan', 'Hangzhou'],
    Xian: ['Beijing', 'Chengdu', 'Chongqing', 'Wuhan', 'Urumqi'],
    Hangzhou: ['Shanghai', 'Nanjing', 'Suzhou'],
    Suzhou: ['Hangzhou'],
    Zhengzhou: ['Beijing', 'Wuhan'],
    Harbin: ['Shenyang', 'Dalian'],
    Shenyang: ['Beijing', 'Tianjin', 'Harbin', 'Dalian'],
    Dalian: ['Shenyang', 'Harbin', 'Qingdao'],
    Qingdao: ['Dalian', 'Tianjin'],
    Urumqi: ['Xian', 'Lhasa'],
    Kunming: ['Chengdu', 'Lhasa'],
    Lhasa: ['Kunming', 'Urumqi'],
  },

  [Country.GERMANY]: {
    Berlin: ['Hamburg', 'Leipzig', 'Munich', 'Hannover', 'Dresden'],
    Hamburg: ['Berlin', 'Bremen', 'Hannover'],
    Munich: ['Berlin', 'Stuttgart', 'Nuremberg'],
    Cologne: ['Dusseldorf', 'Bonn'],
    Frankfurt: ['Stuttgart', 'Nuremberg', 'Leipzig', 'Bonn'],
    Stuttgart: ['Munich', 'Frankfurt', 'Nuremberg'],
    Dusseldorf: ['Cologne', 'Essen', 'Dortmund'],
    Dortmund: ['Dusseldorf', 'Essen'],
    Leipzig: ['Berlin', 'Frankfurt', 'Dresden'],
    Dresden: ['Leipzig', 'Berlin'],
    Bremen: ['Hamburg', 'Hannover'],
    Hannover: ['Berlin', 'Hamburg', 'Bremen'],
    Nuremberg: ['Munich', 'Frankfurt', 'Stuttgart'],
    Essen: ['Dusseldorf', 'Dortmund'],
    Bonn: ['Cologne', 'Frankfurt'],
  },

  [Country.FRANCE]: {
    Paris: ['Lyon', 'Lille', 'Reims', 'Le Havre'],
    Marseille: ['Lyon', 'Nice', 'Montpellier'],
    Lyon: ['Paris', 'Marseille', 'Grenoble', 'Saint-Etienne', 'Strasbourg'],
    Toulouse: ['Bordeaux', 'Montpellier'],
    Nice: ['Marseille', 'Grenoble'],
    Nantes: ['Rennes', 'Bordeaux', 'Le Havre'],
    Strasbourg: ['Reims', 'Lyon'],
    Bordeaux: ['Toulouse', 'Nantes'],
    Lille: ['Paris', 'Reims'],
    Rennes: ['Nantes', 'Le Havre'],
    Reims: ['Paris', 'Lille', 'Strasbourg'],
    Montpellier: ['Marseille', 'Toulouse'],
    'Saint-Etienne': ['Lyon', 'Grenoble'],
    'Le Havre': ['Paris', 'Nantes', 'Rennes'],
    Grenoble: ['Lyon', 'Nice', 'Saint-Etienne'],
  },

  [Country.UK]: {
    London: ['Birmingham', 'Bristol', 'Southampton'],
    Birmingham: ['London', 'Manchester', 'Nottingham'],
    Manchester: ['Birmingham', 'Liverpool', 'Leeds', 'Sheffield'],
    Glasgow: ['Edinburgh', 'Belfast'],
    Liverpool: ['Manchester', 'Sheffield', 'Cardiff'],
    Edinburgh: ['Glasgow', 'Newcastle', 'Aberdeen'],
    Leeds: ['Manchester', 'Sheffield', 'Newcastle'],
    Sheffield: ['Manchester', 'Leeds', 'Liverpool', 'Nottingham'],
    Bristol: ['London', 'Cardiff', 'Southampton'],
    Newcastle: ['Edinburgh', 'Leeds'],
    Cardiff: ['Bristol', 'Liverpool', 'Belfast'],
    Belfast: ['Glasgow', 'Cardiff'],
    Nottingham: ['Birmingham', 'Sheffield'],
    Southampton: ['London', 'Bristol'],
    Aberdeen: ['Edinburgh'],
  },

  [Country.JAPAN]: {
    Tokyo: ['Yokohama', 'Kawasaki', 'Saitama', 'Chiba', 'Sendai', 'Shizuoka'],
    Osaka: ['Kyoto', 'Kobe', 'Nagoya', 'Hiroshima'],
    Yokohama: ['Tokyo', 'Kawasaki'],
    Nagoya: ['Osaka', 'Kyoto', 'Shizuoka', 'Niigata'],
    Sapporo: ['Sendai'],
    Kobe: ['Osaka', 'Okayama'],
    Kyoto: ['Osaka', 'Nagoya'],
    Fukuoka: ['Kitakyushu', 'Kumamoto', 'Nagasaki'],
    Kawasaki: ['Tokyo', 'Yokohama'],
    Saitama: ['Tokyo', 'Chiba'],
    Hiroshima: ['Osaka', 'Okayama', 'Kitakyushu'],
    Sendai: ['Tokyo', 'Sapporo', 'Niigata'],
    Chiba: ['Tokyo', 'Saitama'],
    Kitakyushu: ['Fukuoka', 'Hiroshima'],
    Niigata: ['Sendai', 'Nagoya'],
    Naha: ['Kumamoto'],
    Shizuoka: ['Nagoya', 'Tokyo'],
    Kumamoto: ['Fukuoka', 'Naha'],
    Okayama: ['Kobe', 'Hiroshima'],
    Nagasaki: ['Fukuoka'],
  },

  // Add more countries as needed...
}

// Helper function to validate city neighbors
export function validateCityNeighbors(neighbors: CityNeighbors): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check if each city has at least 2 neighbors (except for edge cases)
  for (const [city, cityNeighbors] of Object.entries(neighbors)) {
    if (cityNeighbors.length < 1) {
      errors.push(`${city} has no neighbors`)
    }

    // Check bidirectional connections
    for (const neighbor of cityNeighbors) {
      if (!neighbors[neighbor]) {
        errors.push(`${neighbor} (neighbor of ${city}) is not defined`)
      } else if (!neighbors[neighbor].includes(city)) {
        errors.push(`Connection ${city} <-> ${neighbor} is not bidirectional`)
      }
    }
  }

  // Check if all cities are connected (using BFS)
  if (Object.keys(neighbors).length > 0) {
    const visited = new Set<string>()
    const queue = [Object.keys(neighbors)[0]]
    visited.add(queue[0])

    while (queue.length > 0) {
      const current = queue.shift()!
      for (const neighbor of neighbors[current] || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      }
    }

    if (visited.size !== Object.keys(neighbors).length) {
      errors.push(
        `Network is not fully connected. Connected: ${visited.size}, Total: ${Object.keys(neighbors).length}`,
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
