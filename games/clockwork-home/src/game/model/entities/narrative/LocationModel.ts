import { type EventSink, generateUuid } from '@potato-golem/core'
import type { CommonEntity } from '@potato-golem/core'
import type { LocationDefinition } from '../../../definitions/zones/common/LocationDefinition.ts'
import { EntityTypeRegistry } from '../../registries/entityTypeRegistry.ts'

export type CardModelParams = {
  definition: LocationDefinition
}

/**
 * Location gives a list of stories to pick from
 * Usually location is connected to a specific zone and can be entered and left freely
 * Location typically has conditions to become visible, but do not have prerequisites
 * or consequences from doing so
 */
export class LocationModel implements CommonEntity {
  type = EntityTypeRegistry.DEFAULT

  private readonly parentEventSink: EventSink
  readonly name: string
  readonly definition: LocationDefinition

  id: string
  uuid: string

  constructor(params: CardModelParams) {
    this.uuid = generateUuid()
    this.definition = params.definition
    this.id = this.definition.id
    this.name = this.definition.name
  }
}
