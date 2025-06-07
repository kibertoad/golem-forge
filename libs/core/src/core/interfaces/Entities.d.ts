import type { EventSink } from '../messages/EventBus.ts'
import type { LimitedNumber } from '../primitives/LimitedNumber.ts'
export interface IdHolder {
  id: string
}
export interface HPHolder {
  hp: LimitedNumber
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
export declare function isDynamicDescriptionsHolder(
  entity: unknown,
): entity is DynamicDescriptionHolder
export interface EventReceiver<T extends string = string> {
  eventSink: EventSink<T>
}
export interface TypeHolder {
  type: string
}
export interface Destroyable {
  destroy: () => void
}
export interface CommonEntity extends IdHolder, TypeHolder {}
export interface CommonView {
  model: IdHolder
}
//# sourceMappingURL=Entities.d.ts.map
