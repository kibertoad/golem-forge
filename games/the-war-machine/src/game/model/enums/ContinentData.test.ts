import { describe, expect, it } from 'vitest'
import { ContinentCountries, type CountryInfo } from './ContinentData.ts'
import type { Country } from './Countries.ts'
import type { EarthRegion } from './EarthRegions.ts'
import { blockFitsInFrame, blocksOverlap } from './MapConstants.ts'

describe('ContinentData Country Positions', () => {
  describe('Country visual overlap detection', () => {
    // Test each continent for actual visual overlaps based on block sizes
    Object.entries(ContinentCountries).forEach(([continentKey, countries]) => {
      const continent = continentKey as EarthRegion

      it(`should have no visually overlapping countries in ${continent}`, () => {
        const overlaps: Array<{
          country1: Country
          country2: Country
          pos1: string
          pos2: string
        }> = []

        // Check each pair of countries for overlap
        for (let i = 0; i < countries.length; i++) {
          for (let j = i + 1; j < countries.length; j++) {
            const country1 = countries[i]
            const country2 = countries[j]

            if (
              blocksOverlap(
                country1.gridX,
                country1.gridY,
                country1.relativeSize,
                country2.gridX,
                country2.gridY,
                country2.relativeSize,
              )
            ) {
              overlaps.push({
                country1: country1.country,
                country2: country2.country,
                pos1: `(${country1.gridX},${country1.gridY}) size:${country1.relativeSize}`,
                pos2: `(${country2.gridX},${country2.gridY}) size:${country2.relativeSize}`,
              })
            }
          }
        }

        // Assert no overlaps found
        if (overlaps.length > 0) {
          const overlapMessages = overlaps
            .map((o) => `  ${o.country1} ${o.pos1} overlaps ${o.country2} ${o.pos2}`)
            .join('\n')

          expect.fail(
            `Found ${overlaps.length} visual overlaps in ${continent}:\n${overlapMessages}`,
          )
        } else {
          expect(overlaps.length).toBe(0)
        }
      })
    })
  })

  describe('Country frame boundary validation', () => {
    Object.entries(ContinentCountries).forEach(([continentKey, countries]) => {
      const continent = continentKey as EarthRegion

      it(`should have all countries in ${continent} fit within the map frame`, () => {
        const outOfFrame: Array<{
          country: Country
          gridX: number
          gridY: number
          size: number
        }> = []

        countries.forEach((countryInfo: CountryInfo) => {
          if (!blockFitsInFrame(countryInfo.gridX, countryInfo.gridY, countryInfo.relativeSize)) {
            outOfFrame.push({
              country: countryInfo.country,
              gridX: countryInfo.gridX,
              gridY: countryInfo.gridY,
              size: countryInfo.relativeSize,
            })
          }
        })

        if (outOfFrame.length > 0) {
          const messages = outOfFrame
            .map((o) => `  ${o.country} at (${o.gridX},${o.gridY}) size:${o.size}`)
            .join('\n')

          expect.fail(
            `Found ${outOfFrame.length} countries outside frame in ${continent}:\n${messages}`,
          )
        } else {
          expect(outOfFrame.length).toBe(0)
        }
      })
    })
  })

  describe('Country grid boundary validation', () => {
    it('should have all countries within valid grid bounds (0-9 for both X and Y)', () => {
      const outOfBounds: Array<{
        continent: EarthRegion
        country: Country
        gridX: number
        gridY: number
      }> = []

      Object.entries(ContinentCountries).forEach(([continentKey, countries]) => {
        const continent = continentKey as EarthRegion

        countries.forEach((countryInfo: CountryInfo) => {
          if (
            countryInfo.gridX < 0 ||
            countryInfo.gridX > 9 ||
            countryInfo.gridY < 0 ||
            countryInfo.gridY > 9
          ) {
            outOfBounds.push({
              continent,
              country: countryInfo.country,
              gridX: countryInfo.gridX,
              gridY: countryInfo.gridY,
            })
          }
        })
      })

      if (outOfBounds.length > 0) {
        const messages = outOfBounds
          .map((o) => `${o.continent}: ${o.country} at (${o.gridX}, ${o.gridY})`)
          .join('\n')

        expect.fail(`Found ${outOfBounds.length} countries outside grid bounds:\n${messages}`)
      } else {
        expect(outOfBounds.length).toBe(0)
      }
    })
  })

  describe('Country uniqueness', () => {
    it('should have each country appear in exactly one continent', () => {
      const countryContinent = new Map<Country, EarthRegion>()
      const duplicates: Array<{ country: Country; continents: EarthRegion[] }> = []

      Object.entries(ContinentCountries).forEach(([continentKey, countries]) => {
        const continent = continentKey as EarthRegion

        countries.forEach((countryInfo: CountryInfo) => {
          if (countryContinent.has(countryInfo.country)) {
            // Found duplicate
            const existing = countryContinent.get(countryInfo.country)!
            duplicates.push({
              country: countryInfo.country,
              continents: [existing, continent],
            })
          } else {
            countryContinent.set(countryInfo.country, continent)
          }
        })
      })

      if (duplicates.length > 0) {
        const messages = duplicates
          .map((d) => `${d.country} appears in: ${d.continents.join(' and ')}`)
          .join('\n')

        expect.fail(`Found ${duplicates.length} countries in multiple continents:\n${messages}`)
      } else {
        expect(duplicates.length).toBe(0)
      }
    })
  })

  describe('Country size validation', () => {
    it('should have all countries with valid relative sizes (1-5)', () => {
      const invalidSizes: Array<{ continent: EarthRegion; country: Country; size: number }> = []

      Object.entries(ContinentCountries).forEach(([continentKey, countries]) => {
        const continent = continentKey as EarthRegion

        countries.forEach((countryInfo: CountryInfo) => {
          if (countryInfo.relativeSize < 1 || countryInfo.relativeSize > 5) {
            invalidSizes.push({
              continent,
              country: countryInfo.country,
              size: countryInfo.relativeSize,
            })
          }
        })
      })

      expect(invalidSizes.length).toBe(0)
    })
  })

  describe('Continent statistics', () => {
    it('should display continent country counts and overlap summary', () => {
      console.log('\nContinent country distribution:')

      Object.entries(ContinentCountries).forEach(([continentKey, countries]) => {
        console.log(`  ${continentKey}: ${countries.length} countries`)

        // Count overlaps for information
        let overlapCount = 0
        for (let i = 0; i < countries.length; i++) {
          for (let j = i + 1; j < countries.length; j++) {
            if (
              blocksOverlap(
                countries[i].gridX,
                countries[i].gridY,
                countries[i].relativeSize,
                countries[j].gridX,
                countries[j].gridY,
                countries[j].relativeSize,
              )
            ) {
              overlapCount++
            }
          }
        }
        if (overlapCount > 0) {
          console.log(`    ⚠️  ${overlapCount} overlapping pairs detected`)
        }
      })

      // This test always passes, it's just for information
      expect(true).toBe(true)
    })
  })
})
