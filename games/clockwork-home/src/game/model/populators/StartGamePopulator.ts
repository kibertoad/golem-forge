import type { WorldModel } from '../entities/WorldModel.ts'
import { district1Bundle } from '../../definitions/zones/01_district1/district1Bundle.ts'

export function populateStartGame(worldModel: WorldModel) {
  worldModel.setZone(district1Bundle)
}
