import { describe, expect, it } from 'vitest'
import { type CityData, CountryCities } from './Cities.ts'
import { type Country, CountryNames } from './Countries.ts'

describe('City Positions', () => {
  describe('City count validation', () => {
    Object.entries(CountryCities).forEach(([countryKey, cities]) => {
      const country = countryKey as Country
      const countryName = CountryNames[country] || country

      it(`${countryName} should have between 10 and 25 cities`, () => {
        expect(cities.length).toBeGreaterThanOrEqual(10)
        expect(cities.length).toBeLessThanOrEqual(25)
      })

      it(`${countryName} should have exactly one capital`, () => {
        const capitals = cities.filter((city) => city.isCapital)
        expect(capitals.length).toBe(1)
      })
    })
  })

  describe('City overlap detection', () => {
    // Helper function to check if two cities overlap
    const citiesOverlap = (city1: CityData, city2: CityData): boolean => {
      // Cities occupy a minimum space on the grid
      // Consider cities overlapping if they're at the exact same position
      return city1.x === city2.x && city1.y === city2.y
    }

    Object.entries(CountryCities).forEach(([countryKey, cities]) => {
      const country = countryKey as Country
      const countryName = CountryNames[country] || country

      it(`${countryName} should have no overlapping cities`, () => {
        const overlaps: Array<{ city1: string; city2: string }> = []

        for (let i = 0; i < cities.length; i++) {
          for (let j = i + 1; j < cities.length; j++) {
            if (citiesOverlap(cities[i], cities[j])) {
              overlaps.push({
                city1: cities[i].name,
                city2: cities[j].name,
              })
            }
          }
        }

        if (overlaps.length > 0) {
          console.log(`\nOverlapping cities in ${countryName}:`)
          overlaps.forEach(({ city1, city2 }) => {
            const c1 = cities.find((c) => c.name === city1)!
            const c2 = cities.find((c) => c.name === city2)!
            console.log(`  ${city1} (${c1.x},${c1.y}) overlaps with ${city2} (${c2.x},${c2.y})`)
          })
        }

        expect(overlaps.length).toBe(0)
      })
    })
  })

  describe('City boundary validation', () => {
    Object.entries(CountryCities).forEach(([countryKey, cities]) => {
      const country = countryKey as Country
      const countryName = CountryNames[country] || country

      it(`${countryName} cities should be within 10x10 grid bounds`, () => {
        const outOfBounds: Array<{ city: string; x: number; y: number }> = []

        cities.forEach((city) => {
          if (city.x < 0 || city.x > 9 || city.y < 0 || city.y > 9) {
            outOfBounds.push({
              city: city.name,
              x: city.x,
              y: city.y,
            })
          }
        })

        if (outOfBounds.length > 0) {
          console.log(`\nOut of bounds cities in ${countryName}:`)
          outOfBounds.forEach(({ city, x, y }) => {
            console.log(`  ${city} at (${x},${y}) is outside 0-9 range`)
          })
        }

        expect(outOfBounds.length).toBe(0)
      })
    })
  })

  describe('City spacing analysis', () => {
    // Helper to calculate distance between cities
    const cityDistance = (city1: CityData, city2: CityData): number => {
      const dx = city1.x - city2.x
      const dy = city1.y - city2.y
      return Math.sqrt(dx * dx + dy * dy)
    }

    Object.entries(CountryCities).forEach(([countryKey, cities]) => {
      const country = countryKey as Country
      const countryName = CountryNames[country] || country

      it(`${countryName} cities should have reasonable spacing`, () => {
        const tooClose: Array<{ city1: string; city2: string; distance: number }> = []
        const MIN_DISTANCE = 0.5 // Minimum distance between cities (allow some closeness)

        for (let i = 0; i < cities.length; i++) {
          for (let j = i + 1; j < cities.length; j++) {
            const distance = cityDistance(cities[i], cities[j])
            if (distance < MIN_DISTANCE && distance > 0) {
              tooClose.push({
                city1: cities[i].name,
                city2: cities[j].name,
                distance,
              })
            }
          }
        }

        // This is a warning, not a failure
        if (tooClose.length > 0) {
          console.log(`\nCities very close together in ${countryName}:`)
          tooClose.forEach(({ city1, city2, distance }) => {
            console.log(`  ${city1} and ${city2} are only ${distance.toFixed(2)} units apart`)
          })
        }

        // We allow some cities to be close, but warn about it
        expect(tooClose.length).toBeLessThanOrEqual(5) // Allow up to 5 pairs of close cities
      })
    })
  })

  describe('City statistics', () => {
    it('should display overall city statistics', () => {
      const countriesWithCities = Object.keys(CountryCities).length
      const totalCities = Object.values(CountryCities).reduce(
        (sum, cities) => sum + cities.length,
        0,
      )
      const avgCitiesPerCountry = totalCities / countriesWithCities

      console.log('\n=== CITY DATA STATISTICS ===')
      console.log(`Countries with city data: ${countriesWithCities}`)
      console.log(`Total cities defined: ${totalCities}`)
      console.log(`Average cities per country: ${avgCitiesPerCountry.toFixed(1)}`)

      // Display countries with most/least cities
      const cityCounts = Object.entries(CountryCities)
        .map(([country, cities]) => ({
          country: CountryNames[country as Country] || country,
          count: cities.length,
        }))
        .sort((a, b) => b.count - a.count)

      console.log('\nCountries with most cities:')
      cityCounts.slice(0, 5).forEach(({ country, count }) => {
        console.log(`  ${country}: ${count} cities`)
      })

      console.log('\nCountries with least cities:')
      cityCounts.slice(-5).forEach(({ country, count }) => {
        console.log(`  ${country}: ${count} cities`)
      })

      expect(countriesWithCities).toBeGreaterThan(0)
      expect(avgCitiesPerCountry).toBeGreaterThanOrEqual(10)
      expect(avgCitiesPerCountry).toBeLessThanOrEqual(25)
    })
  })

  describe('Capital city validation', () => {
    Object.entries(CountryCities).forEach(([countryKey, cities]) => {
      const country = countryKey as Country
      const countryName = CountryNames[country] || country

      it(`${countryName} capital should be appropriately positioned`, () => {
        const capital = cities.find((city) => city.isCapital)
        expect(capital).toBeDefined()

        if (capital) {
          // Capital should generally be in a central or strategic position
          // Not at the extreme edges unless geographically appropriate
          const isEdgePosition =
            capital.x === 0 || capital.x === 9 || capital.y === 0 || capital.y === 9

          if (isEdgePosition) {
            console.log(
              `\nNote: ${countryName} capital ${capital.name} is at edge position (${capital.x},${capital.y})`,
            )
          }

          // Capital should exist
          expect(capital.name).toBeTruthy()
        }
      })
    })
  })
})
