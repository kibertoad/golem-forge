import type { ZoneBundle } from '../common/ZoneBundle.ts'
import { district1LocationDefinitions } from './district1LocationDefinitions.ts'
import { district1StoryDefinitions } from './district1StoryDefinitions.ts'

export const district1Bundle = {
  id: 'junkyard',
  name: 'District 1',
  zoneStories: district1StoryDefinitions,
  zoneLocations: district1LocationDefinitions,
} satisfies ZoneBundle
