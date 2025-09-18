import type { CityData } from '../model/enums/Cities.ts'
import { CountryCities } from '../model/enums/Cities.ts'
import type { Country } from '../model/enums/Countries.ts'

export interface CityLocation {
  country: Country
  city: string
}

/**
 * Calculate the distance between two cities based on their grid positions.
 * Returns a normalized distance value between 0 and 1.
 */
export function calculateCityDistance(
  from: CityLocation,
  to: CityLocation
): number {
  // If same city, distance is 0
  if (from.country === to.country && from.city === to.city) {
    return 0
  }

  const fromCities = CountryCities[from.country]
  const toCities = CountryCities[to.country]

  if (!fromCities || !toCities) {
    // Max distance if country not found
    return 1
  }

  const fromCity = fromCities.find(c => c.name === from.city)
  const toCity = toCities.find(c => c.name === to.city)

  if (!fromCity || !toCity) {
    // Max distance if city not found
    return 1
  }

  // Cities in same country - use grid distance
  if (from.country === to.country) {
    const dx = Math.abs(fromCity.x - toCity.x)
    const dy = Math.abs(fromCity.y - toCity.y)
    const maxGridDistance = Math.sqrt(9 * 9 + 9 * 9) // Max possible distance in 10x10 grid
    const gridDistance = Math.sqrt(dx * dx + dy * dy)
    // Normalize to 0-0.5 range for same country
    return (gridDistance / maxGridDistance) * 0.5
  }

  // Cities in different countries - use country neighbor relationships
  // This is simplified - in reality we'd need continent positions
  // For now, neighboring countries have distance 0.6, non-neighbors 0.9
  return isNeighboringCountry(from.country, to.country) ? 0.6 : 0.9
}

/**
 * Calculate transfer cost based on distance and number of items
 */
export function calculateTransferCost(
  from: CityLocation,
  to: CityLocation,
  itemCount: number
): number {
  const distance = calculateCityDistance(from, to)

  // Base cost per item: $100-$5000 based on distance
  const baseCostPerItem = 100 + (distance * 4900)

  // Volume discount for larger transfers
  const volumeDiscount = Math.max(0.5, 1 - (itemCount / 1000) * 0.3)

  return Math.round(baseCostPerItem * itemCount * volumeDiscount)
}

/**
 * Find the closest warehouse to a given location from a list of warehouses
 */
export function findClosestWarehouse(
  from: CityLocation,
  warehouses: CityLocation[]
): { warehouse: CityLocation; distance: number } | null {
  if (warehouses.length === 0) return null

  let closest = warehouses[0]
  let minDistance = calculateCityDistance(from, closest)

  for (const warehouse of warehouses) {
    const distance = calculateCityDistance(from, warehouse)
    if (distance < minDistance) {
      minDistance = distance
      closest = warehouse
    }
  }

  return { warehouse: closest, distance: minDistance }
}

/**
 * Check if two countries are neighbors (simplified version)
 * In a full implementation, this would use the CountryNeighborDirections data
 */
function isNeighboringCountry(country1: Country, country2: Country): boolean {
  // This is a simplified check - you'd want to import and use
  // the actual neighbor data from CountryNeighborDirections.ts
  // For now, we'll return a default value
  return false
}