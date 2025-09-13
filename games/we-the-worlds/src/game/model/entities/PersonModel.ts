// Types
/*
export type CharacterStats = {
    name: string
    age: number
    health: number
    looks: number
    smarts: number
    energy: number
    emotional: number
    status: string
}

export type CharacterState = {
    health: number
    energy: number
    emotional: number
    time: number
}

 */

import { Computable, LimitedNumber } from "@potato-golem/core"
import {PlayerModel} from "./PlayerModel.ts";

export type PlayerComputable = Computable<'player', PlayerModel>

export type CharacterStats = {
    looks: PlayerComputable
}

export class CharacterSelfCareSubStats {
    public readonly haircut = new LimitedNumber(0, 100, false, 'haircut')
    public readonly shave = new LimitedNumber(0, 100, false, 'shave')
    public readonly skincare = new LimitedNumber(0, 100, false, 'skincare')
    public readonly hygiene = new LimitedNumber(0, 100, false, 'hygiene')
}

export const EyeColour = {
    GREEN: 'green',
    BLUE: 'blue',
    RED: 'brown',
    BLACK: 'black',
} as const

export const HairColour = {
    GREEN: 'red',
    BLUE: 'blonde',
    RED: 'brown',
    BLACK: 'black',
} as const

export type CharacterLooks = {
    hairColour: typeof HairColour[keyof typeof HairColour]
    eyeColour: typeof EyeColour[keyof typeof EyeColour]
}
