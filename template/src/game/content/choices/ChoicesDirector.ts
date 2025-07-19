import {
  AbstractChoicesDirector,
  type CommonChoice,
  type CommonResolvedChoices,
} from '@potato-golem/prefab-scenes'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import {COMMON_TRAVEL_CHOICES} from "./travel/CommonTravelChoices.ts";
import {Dependencies} from "../../model/diConfig.ts";

export class ChoicesDirector extends AbstractChoicesDirector<WorldModel> {
  constructor(dependencies: Dependencies) {
    super(dependencies.worldModel)
  }

  override resolveAvailableChoices(): CommonResolvedChoices {
    const choices: CommonChoice[] = []

    if (this.worldModel.state.mainState === 'travel') {
      choices.push(...this.filterRelevantChoices(COMMON_TRAVEL_CHOICES))
    }

    return {
      choices,
    }
  }
}
