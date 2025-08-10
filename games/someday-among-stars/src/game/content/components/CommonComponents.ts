import {ImageId} from "../../registries/imageRegistry.ts";
import {CommonSlotSide} from "../../model/slot_sides/CommonSlotSide.ts";

export type CommonComponentDefinition<SlotTypes extends CommonSlotSide> = {
    id: string
    name: string
    description: string
    image: ImageId
    maxSlots: number
    maxDurability: number
    defaultSlots: SlotTypes[]
}
