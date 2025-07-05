import { AbstractChoicesDirector } from '@potato-golem/prefab-scenes'
import type { StoryDefinition } from '../../definitions/definitionInterfaces.ts'
import type { LocationDefinition } from '../../definitions/zones/common/LocationDefinition.ts'
import type { Dependencies } from '../diConfig.ts'
import type { WorldModel } from '../entities/WorldModel.ts'

export type ResolvedChoices = {
  stories: StoryDefinition[]
  locations: LocationDefinition[]
}

export class ChoicesDirector extends AbstractChoicesDirector<WorldModel, ResolvedChoices> {
  constructor({ worldModel }: Dependencies) {
    super(worldModel)
  }

  resolveAvailableChoices(): ResolvedChoices {
    return {
      locations: this.resolveAvailableLocations(),
      stories: this.resolveAvailableStories(),
    }
  }

  resolveAvailableStories(): StoryDefinition[] {
    const availableStories: StoryDefinition[] = []

    if (location) {
      const locationChoices = location.stories.filter((option) => this.isOptionShown(option))
      availableStories.push(...locationChoices)
    }

    return availableStories
  }

  resolveAvailableLocations(): LocationDefinition[] {
    const zone = this.worldModel.currentZone
    const currentLocation = this.worldModel.currentLocation

    const availableLocations = Object.values(zone.zoneLocations)
      .filter((entry) => {
        return (
          (!currentLocation && !entry.parentLocation) ||
          entry.parentLocation === currentLocation!.id
        )
      })
      .filter((option) => this.isOptionShown(option))

    /*
        if (this.worldModel.currentLocation && this.worldModel.playerStates.restricted_movement.value === 0) {
            this.addOption({
                image: 'rocket',
                name: 'Leave',
                effects: [new LeaveLocationActivation()]
            })
        }

         */

    return availableLocations
  }
}
