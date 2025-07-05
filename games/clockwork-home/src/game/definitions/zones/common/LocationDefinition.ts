import type { EffectsHolder, OptionWithPreconditions } from '@potato-golem/core'
import type { MenuItem, StoryDefinition } from '../../definitionInterfaces.ts'

export type LocationDefinition = {
  id: string
  stories: StoryDefinition[]
  parentLocation?: string // if not set, location is only available from the zone root
} & MenuItem &
  OptionWithPreconditions &
  Partial<EffectsHolder>
