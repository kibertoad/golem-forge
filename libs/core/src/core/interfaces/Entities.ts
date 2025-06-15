import type { EventSink } from '../messages/EventBus.ts'
import type { Coords } from '../primitives/Coords.ts'
import type { LimitedNumber } from '../primitives/LimitedNumber.ts'

export interface TypeHolder {
  type: string
}

export interface IdHolder {
  id: string
}

export interface UuidHolder {
  uuid: string
}

export interface HPHolder {
  hp: LimitedNumber
}

export interface CoordsHolder {
  coords: Coords
}

export interface DynamicDescriptionHolder {
  getDescription(): string
}

export interface StaticDescriptionHolder {
  description: string
}

export interface DynamicDescriptionsHolder {
  getDescriptions(): string[]
}

export function isDynamicDescriptionsHolder(entity: unknown): entity is DynamicDescriptionHolder {
  return 'getDescriptions' in (entity as DynamicDescriptionHolder)
}

export interface EventReceiver<T extends string = string> {
  eventSink: EventSink<T>
}

export interface Destroyable {
  destroy: () => void
}

export interface CommonEntity extends IdHolder, UuidHolder, TypeHolder {}

export interface CommonView {
  model: UuidHolder & IdHolder
}
