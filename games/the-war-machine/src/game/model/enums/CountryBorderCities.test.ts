import { describe, it, expect } from 'vitest'
import { CountryBorderCities, getBorderCitiesForDirection } from './CountryBorderCities'
import { Country } from './Countries'
import { CountryCities } from './Cities'
import { CountryNeighborDirections, BorderDirection } from './CountryNeighborDirections'
import {
  calculateCityPosition,
  calculateAttackerBlockPosition,
  doesLinePassNearPoint,
} from '../constants/MapPositionConstants'

describe('CountryBorderCities', () => {
  describe('Border City Validation', () => {
    // For each country with border cities defined
    Object.entries(CountryBorderCities).forEach(([countryKey, borderCities]) => {
      const country = countryKey as Country
      const cityData = CountryCities[country]

      if (!cityData || borderCities.length === 0) {
        return // Skip countries without city data or border cities
      }

      describe(`${country}`, () => {
        // Get all neighbors and their directions
        const neighborDirections = CountryNeighborDirections[country] || []

        neighborDirections.forEach((neighborInfo) => {
          const { country: neighborCountry, direction } = neighborInfo
          const borderCitiesForDirection = getBorderCitiesForDirection(country, direction)

          if (borderCitiesForDirection.length === 0) {
            return // Skip if no border cities for this direction
          }

          it(`should have correct border cities facing ${neighborCountry} (${direction})`, () => {
            // Calculate the attacker block position for this direction
            const attackerPos = calculateAttackerBlockPosition(direction, { x: 0, y: 0 })

            borderCitiesForDirection.forEach((borderCity) => {
              // Find the border city in the city data
              const borderCityData = cityData.find(c => c.name === borderCity.cityName)

              if (!borderCityData) {
                throw new Error(`Border city ${borderCity.cityName} not found in city data for ${country}`)
              }

              // Calculate the border city's actual position
              const borderCityPos = calculateCityPosition(borderCityData.x, borderCityData.y)

              // Check all other cities to ensure none are between the attacker and this border city
              cityData.forEach((otherCity) => {
                if (otherCity.name === borderCity.cityName) {
                  return // Skip the border city itself
                }

                const otherCityPos = calculateCityPosition(otherCity.x, otherCity.y)

                // Check if the other city is on the line between attacker and border city
                const isOnLine = doesLinePassNearPoint(attackerPos, borderCityPos, otherCityPos, 30)

                if (isOnLine) {
                  // If another city is on the attack line, it should also be a border city
                  const otherCityIsBorder = borderCitiesForDirection.some(
                    bc => bc.cityName === otherCity.name
                  )

                  // Calculate distances to determine which is closer to the attacker
                  const distToBorder = Math.sqrt(
                    Math.pow(borderCityPos.x - attackerPos.x, 2) +
                    Math.pow(borderCityPos.y - attackerPos.y, 2)
                  )
                  const distToOther = Math.sqrt(
                    Math.pow(otherCityPos.x - attackerPos.x, 2) +
                    Math.pow(otherCityPos.y - attackerPos.y, 2)
                  )

                  if (distToOther < distToBorder) {
                    // The other city is closer to the attacker than the declared border city
                    expect(otherCityIsBorder).toBe(true,
                      `City "${otherCity.name}" at (${otherCity.x}, ${otherCity.y}) is between ` +
                      `attacker position and border city "${borderCity.cityName}" at (${borderCityData.x}, ${borderCityData.y}). ` +
                      `"${otherCity.name}" should be marked as a border city facing ${direction}, ` +
                      `and "${borderCity.cityName}" should not be.`
                    )
                  }
                }
              })
            })
          })
        })

        // Additional test: Check that all border cities actually exist in the city data
        it('should only reference cities that exist', () => {
          borderCities.forEach((borderCity) => {
            const exists = cityData.some(c => c.name === borderCity.cityName)
            expect(exists).toBe(true,
              `Border city "${borderCity.cityName}" for ${country} does not exist in city data`
            )
          })
        })

        // Check that border cities match their declared direction
        it('should have border cities in the correct direction', () => {
          borderCities.forEach((borderCity) => {
            const cityInfo = cityData.find(c => c.name === borderCity.cityName)
            if (!cityInfo) return

            const cityPos = calculateCityPosition(cityInfo.x, cityInfo.y)

            // Verify the city is actually in the declared direction from center
            switch (borderCity.direction) {
              case BorderDirection.NORTH:
                expect(cityPos.y).toBeLessThan(0,
                  `City "${borderCity.cityName}" declared as NORTH border but has positive Y coordinate`
                )
                break
              case BorderDirection.SOUTH:
                expect(cityPos.y).toBeGreaterThan(0,
                  `City "${borderCity.cityName}" declared as SOUTH border but has negative Y coordinate`
                )
                break
              case BorderDirection.EAST:
                expect(cityPos.x).toBeGreaterThan(0,
                  `City "${borderCity.cityName}" declared as EAST border but has negative X coordinate`
                )
                break
              case BorderDirection.WEST:
                expect(cityPos.x).toBeLessThan(0,
                  `City "${borderCity.cityName}" declared as WEST border but has positive X coordinate`
                )
                break
            }
          })
        })

        // Check that no inland city is further in the border direction than a border city
        it('should not have inland cities further out than border cities', () => {
          // Group border cities by direction
          const bordersByDirection = new Map<BorderDirection, string[]>()
          borderCities.forEach(bc => {
            if (!bordersByDirection.has(bc.direction)) {
              bordersByDirection.set(bc.direction, [])
            }
            bordersByDirection.get(bc.direction)!.push(bc.cityName)
          })

          bordersByDirection.forEach((borderCityNames, direction) => {
            // Find the extreme position for this direction among border cities
            let extremeValue: number | null = null
            borderCityNames.forEach(cityName => {
              const city = cityData.find(c => c.name === cityName)
              if (!city) return

              const value = direction === BorderDirection.NORTH || direction === BorderDirection.SOUTH
                ? city.y
                : city.x

              if (extremeValue === null) {
                extremeValue = value
              } else {
                if (direction === BorderDirection.NORTH || direction === BorderDirection.WEST) {
                  extremeValue = Math.min(extremeValue, value)
                } else {
                  extremeValue = Math.max(extremeValue, value)
                }
              }
            })

            if (extremeValue === null) return

            // Check if any non-border city is further out
            cityData.forEach(city => {
              if (borderCityNames.includes(city.name)) return // Skip border cities

              const value = direction === BorderDirection.NORTH || direction === BorderDirection.SOUTH
                ? city.y
                : city.x

              let isFurtherOut = false
              if (direction === BorderDirection.NORTH) {
                isFurtherOut = value < extremeValue
              } else if (direction === BorderDirection.SOUTH) {
                isFurtherOut = value > extremeValue
              } else if (direction === BorderDirection.EAST) {
                isFurtherOut = value > extremeValue
              } else if (direction === BorderDirection.WEST) {
                isFurtherOut = value < extremeValue
              }

              if (isFurtherOut) {
                expect(isFurtherOut).toBe(false,
                  `City "${city.name}" at (${city.x}, ${city.y}) is further ${direction} ` +
                  `than border city/cities: ${borderCityNames.join(', ')}. ` +
                  `"${city.name}" should be marked as a border city for ${direction}.`
                )
              }
            })
          })
        })
      })
    })
  })

  describe('Border city helper functions', () => {
    it('should return correct border cities for a given direction', () => {
      // Test with a known country
      const ukraineBorderCities = CountryBorderCities[Country.UKRAINE]
      if (ukraineBorderCities) {
        const eastBorderCities = getBorderCitiesForDirection(Country.UKRAINE, BorderDirection.EAST)

        // Should only return cities marked as EAST
        eastBorderCities.forEach(city => {
          expect(city.direction).toBe(BorderDirection.EAST)
        })

        // Should contain expected cities (based on our data)
        const eastCityNames = eastBorderCities.map(c => c.cityName)
        expect(eastCityNames).toContain('Kharkiv')
      }
    })

    it('should return empty array for countries without border cities', () => {
      // Test with a country that might not have border cities defined
      const result = getBorderCitiesForDirection(Country.USA, BorderDirection.NORTH)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Data integrity checks', () => {
    it('should not have duplicate border city entries for the same direction', () => {
      Object.entries(CountryBorderCities).forEach(([countryKey, borderCities]) => {
        // Group by direction
        const byDirection = new Map<string, string[]>()

        borderCities.forEach(bc => {
          const key = bc.direction
          if (!byDirection.has(key)) {
            byDirection.set(key, [])
          }
          byDirection.get(key)!.push(bc.cityName)
        })

        // Check for duplicates within each direction
        byDirection.forEach((cities, direction) => {
          const uniqueCities = new Set(cities)
          if (cities.length !== uniqueCities.size) {
            const duplicates = cities.filter((name, index) =>
              cities.indexOf(name) !== index
            )
            expect(cities.length).toBe(uniqueCities.size,
              `Country ${countryKey} has duplicate border cities for direction ${direction}: ${duplicates.join(', ')}`
            )
          }
        })
      })
    })

    it('should not mark capital cities as border cities unless they truly are', () => {
      Object.entries(CountryBorderCities).forEach(([countryKey, borderCities]) => {
        const country = countryKey as Country
        const cityData = CountryCities[country]

        if (!cityData) return

        borderCities.forEach((borderCity) => {
          const cityInfo = cityData.find(c => c.name === borderCity.cityName)
          if (cityInfo?.isCapital) {
            // Capital is marked as border city - this should be rare
            // Log a warning (not a failure) as some capitals might actually be on borders
            console.warn(
              `Warning: Capital city "${borderCity.cityName}" of ${country} is marked as a border city. ` +
              `Verify this is correct (some capitals like Jerusalem might actually be border cities).`
            )
          }
        })
      })
    })
  })
})