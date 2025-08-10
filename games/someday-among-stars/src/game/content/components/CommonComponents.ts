import type { CommonSlotSide } from '../../model/slot_sides/CommonSlotSide.ts'
import type { ImageId } from '../../registries/imageRegistry.ts'

export type CommonComponentDefinition<SlotTypes extends CommonSlotSide> = {
  id: string
  name: string
  description: string
  image: ImageId
  maxSlots: number
  maxDurability: number
  defaultSlots: SlotTypes[]
}
