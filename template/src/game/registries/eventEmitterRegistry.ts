import { EventEmitter } from 'emitix'
import type { EntityId } from '../model/definitions/entityDefinitions.ts'

export type SpawnEntityParams = {
  entityId: EntityId
}

export type DestroyEntityParams = {
  entityUuid: string
}

const boardEmitter = new EventEmitter<{
  spawnEntity: [SpawnEntityParams]
  destroyEntity: [DestroyEntityParams]
}>()

export type BoardEmitter = typeof boardEmitter

export const eventEmitters = {
  boardEmitter,
} as const satisfies Record<string, EventEmitter>
