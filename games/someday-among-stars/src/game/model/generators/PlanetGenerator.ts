import {BIOMES, PlanetModel} from "../entities/PlanetModel.ts";
import {RaceModel} from "../entities/RaceModel.ts";

export function generatePlanet(race: RaceModel): PlanetModel {
    return {
        name: 'Planet X',
        biome: BIOMES.terran,
        race: race
    }
}
