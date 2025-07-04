import type {WorldModel} from "../entities/WorldModel";
import type {Dependencies} from "../diConfig";
import type {OptionWithPreconditions} from "@potato-golem/core";
import type {ZoneBundle} from "../../definitions/zones/common/ZoneBundle.ts";
import type {StoryDefinition} from "../../definitions/definitionInterfaces.ts";
import type {LocationDefinition} from "../../definitions/zones/common/LocationDefinition.ts";

function isOptionShown(option: OptionWithPreconditions): boolean {
    if (!option.conditionsToShow) {
        return true
    }

    for (const precondition of option.conditionsToShow) {
        if (!precondition.isSatisfied()) return false
    }

    return true
}

export class ChoicesDirector {
    private readonly worldModel: WorldModel

    constructor({ worldModel }: Dependencies) {
        this.worldModel = worldModel;
    }

    resolveAvailableStories(_zone: ZoneBundle, location?: LocationDefinition): StoryDefinition[] {
        const availableStories: StoryDefinition[] = []

        if (location) {
            const locationChoices = location.stories.filter(isOptionShown)
            availableStories.push(...locationChoices)
        }

        return availableStories
    }

    resolveAvailableLocations(zone: ZoneBundle, currentLocation?: LocationDefinition): LocationDefinition[] {
        const availableLocations = Object.values(zone.zoneLocations)
          .filter((entry) => {
              return (
                (!currentLocation && !entry.parentLocation) ||
                (entry.parentLocation === currentLocation!.id)
              )
          })
          .filter(isOptionShown)

        return availableLocations
    }
}
