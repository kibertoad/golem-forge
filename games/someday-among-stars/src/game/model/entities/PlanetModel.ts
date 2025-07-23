import type { RaceModel } from './RaceModel.ts'

export type PlanetBiome = {
  name: string
}

export const BIOMES = {
  terran: {
    name: 'Terran',
  },
} satisfies Record<string, PlanetBiome>

export class PlanetModel {
  name: string
  biome: PlanetBiome
  race: RaceModel
}
