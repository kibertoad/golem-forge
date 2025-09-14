import { describe, expect, it } from 'vitest'
import { CountryCities } from './Cities.ts'
import { CountryCityNeighbors, validateCityNeighbors } from './CityNeighbors.ts'
import { type Country, CountryNames } from './Countries.ts'

describe('City Neighbors', () => {
  describe('Neighbor validation', () => {
    Object.entries(CountryCityNeighbors).forEach(([countryKey, neighbors]) => {
      const country = countryKey as Country
      const countryName = CountryNames[country] || country
      const cities = CountryCities[country]

      if (!cities) {
        return
      }

      describe(countryName, () => {
        it('should have valid bidirectional connections', () => {
          const validation = validateCityNeighbors(neighbors)
          if (!validation.valid) {
            console.log(`\nErrors in ${countryName}:`)
            validation.errors.forEach((error) => console.log(`  - ${error}`))
          }
          expect(validation.valid).toBe(true)
        })

        it('should have all cities connected in a single network', () => {
          const cityNames = cities.map((c) => c.name)
          const neighborCities = Object.keys(neighbors)

          // Check all cities are in neighbors
          for (const cityName of cityNames) {
            expect(neighborCities).toContain(cityName)
          }

          // Check network connectivity
          const visited = new Set<string>()
          const queue = [cityNames[0]]
          visited.add(cityNames[0])

          while (queue.length > 0) {
            const current = queue.shift()!
            for (const neighbor of neighbors[current] || []) {
              if (!visited.has(neighbor)) {
                visited.add(neighbor)
                queue.push(neighbor)
              }
            }
          }

          expect(visited.size).toBe(cityNames.length)
        })

        it('should have each city with at least 1 neighbor', () => {
          const lowConnectivity: string[] = []

          for (const city of cities) {
            const cityNeighbors = neighbors[city.name] || []
            if (cityNeighbors.length === 0) {
              lowConnectivity.push(`${city.name}: ${cityNeighbors.length} neighbors`)
            }
          }

          if (lowConnectivity.length > 0) {
            console.log(`\nLow connectivity cities in ${countryName}:`)
            lowConnectivity.forEach((city) => console.log(`  - ${city}`))
          }

          expect(lowConnectivity.length).toBe(0)
        })

        it('should not have more than 3 neighbors in same direction', () => {
          const cityMap = new Map(cities.map((c) => [c.name, c]))
          const violations: string[] = []

          for (const [cityName, cityNeighbors] of Object.entries(neighbors)) {
            const city = cityMap.get(cityName)
            if (!city) continue

            const directions = {
              north: 0, // y less than city
              south: 0, // y greater than city
              east: 0, // x greater than city
              west: 0, // x less than city
            }

            for (const neighborName of cityNeighbors) {
              const neighbor = cityMap.get(neighborName)
              if (!neighbor) continue

              // Determine primary direction
              const dx = neighbor.x - city.x
              const dy = neighbor.y - city.y

              if (Math.abs(dx) > Math.abs(dy)) {
                // Primarily horizontal
                if (dx > 0) directions.east++
                else directions.west++
              } else {
                // Primarily vertical
                if (dy > 0) directions.south++
                else directions.north++
              }
            }

            // Check for violations
            for (const [dir, count] of Object.entries(directions)) {
              if (count > 3) {
                violations.push(`${cityName} has ${count} neighbors to the ${dir}`)
              }
            }
          }

          if (violations.length > 0) {
            console.log(`\nDirection violations in ${countryName}:`)
            violations.forEach((v) => console.log(`  - ${v}`))
          }

          expect(violations.length).toBe(0)
        })

        it('should not have connections crossing over other cities', () => {
          const cityMap = new Map(cities.map((c) => [c.name, c]))
          const crossings: string[] = []

          // Check each connection
          for (const [cityName, cityNeighbors] of Object.entries(neighbors)) {
            const city1 = cityMap.get(cityName)
            if (!city1) continue

            for (const neighborName of cityNeighbors) {
              const city2 = cityMap.get(neighborName)
              if (!city2) continue

              // Check if any other city lies on the line between city1 and city2
              for (const otherCity of cities) {
                if (otherCity.name === cityName || otherCity.name === neighborName) continue

                // Check if otherCity is on the line segment between city1 and city2
                if (isPointOnLineSegment(city1, city2, otherCity)) {
                  crossings.push(`${cityName} -> ${neighborName} crosses over ${otherCity.name}`)
                }
              }
            }
          }

          if (crossings.length > 0) {
            console.log(`\nCrossing violations in ${countryName}:`)
            crossings.forEach((c) => console.log(`  - ${c}`))
          }

          expect(crossings.length).toBe(0)
        })
      })
    })
  })

  describe('Network statistics', () => {
    it('should display network statistics for all countries', () => {
      console.log('\n=== CITY NETWORK STATISTICS ===')

      Object.entries(CountryCityNeighbors).forEach(([countryKey, neighbors]) => {
        const country = countryKey as Country
        const countryName = CountryNames[country] || country
        const cities = CountryCities[country]

        if (!cities) return

        const totalConnections = Object.values(neighbors).reduce((sum, n) => sum + n.length, 0) / 2
        const avgConnections = (
          Object.values(neighbors).reduce((sum, n) => sum + n.length, 0) / cities.length
        ).toFixed(1)

        console.log(`\n${countryName}:`)
        console.log(`  Cities: ${cities.length}`)
        console.log(`  Total connections: ${totalConnections}`)
        console.log(`  Average connections per city: ${avgConnections}`)
      })
    })
  })
})

// Helper function to check if a point is on a line segment
function isPointOnLineSegment(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  point: { x: number; y: number },
): boolean {
  // Check if point is within bounding box
  const minX = Math.min(p1.x, p2.x)
  const maxX = Math.max(p1.x, p2.x)
  const minY = Math.min(p1.y, p2.y)
  const maxY = Math.max(p1.y, p2.y)

  if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
    return false
  }

  // Check if point is on the line using cross product
  // If cross product is 0, points are collinear
  const crossProduct = (p2.x - p1.x) * (point.y - p1.y) - (p2.y - p1.y) * (point.x - p1.x)

  return Math.abs(crossProduct) < 0.01 // Allow small tolerance for floating point
}
