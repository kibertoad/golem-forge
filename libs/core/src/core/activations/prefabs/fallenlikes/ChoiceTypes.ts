import type { OptionWithPreconditions } from '../../../preconditions/Precondition.js'
import type { EffectsHolder } from '../../common/Activation.js'

export type MenuItem = {
  name: string // user-displayed text
  image: string // imageId
}

export type MenuTextItem = {
  name: string // user-displayed text
  image?: string // imageId
}

export type ChoiceDefinition = {
  id: string
  description?: string
} & OptionWithPreconditions &
  EffectsHolder &
  MenuTextItem
