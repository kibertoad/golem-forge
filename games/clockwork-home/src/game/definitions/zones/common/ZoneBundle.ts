import type { RegistryEntityId } from '@potato-golem/core'
import type { StoryDefinition } from '../../definitionInterfaces.ts'
import type { LocationDefinition } from './LocationDefinition.ts'

export const zoneRegistry = {
  Cattery: 'cattery',
  RecentYork: 'recent_york', // human town
  SprocketForest: 'sprocket_forest',
  GrayBeach: 'gray_beach',
  BigBlue: 'big_blue',
  Junkyard: 'junkyard',
  Labyrinth: 'labyrinth',
} as const

export type ZoneBundle = {
  id: RegistryEntityId<typeof zoneRegistry>
  name: string
  zoneStories: Record<string, StoryDefinition>
  zoneLocations: Record<string, LocationDefinition>
}
