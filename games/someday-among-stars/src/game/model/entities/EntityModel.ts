import { type TurnProcessor, generateUuid } from '@potato-golem/core'
import type { CommonEntity } from '@potato-golem/core'
import { EntityTypeRegistry } from '../../registries/entityTypeRegistry.ts'
import { type BoardEmitter, eventEmitters } from '../../registries/eventEmitterRegistry.ts'
import type { EntityDefinition } from '../definitions/entityDefinitions.ts'

export type CardModelParams = {
  definition: EntityDefinition
}

export class EntityModel implements TurnProcessor, CommonEntity {
  type = EntityTypeRegistry.DEFAULT

  private readonly boardEventSink: BoardEmitter
  readonly name: string
  readonly definition: EntityDefinition

  uuid: string

  constructor(params: CardModelParams) {
    this.uuid = generateUuid()
    this.definition = params.definition
    this.name = this.definition.name
    this.boardEventSink = eventEmitters.boardEmitter
  }

  get id() {
    return this.definition.id
  }

  destroy() {
    this.boardEventSink.emit('destroyEntity', {
      entityUuid: this.uuid,
    })
  }

  processTurn(): void {}
}
