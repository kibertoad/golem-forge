import { BIOMES, type PlanetModel } from '../entities/PlanetModel.ts'
import type { RaceModel } from '../entities/RaceModel.ts'

export function generatePlanet(race: RaceModel): PlanetModel {
  return {
    name: 'Planet X',
    biome: BIOMES.terran,
    race: race,
  }
}
