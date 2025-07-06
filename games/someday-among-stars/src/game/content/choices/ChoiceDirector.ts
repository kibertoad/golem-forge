import {
  AbstractChoicesDirector,
  type CommonChoice,
  type CommonResolvedChoices,
} from '@potato-golem/prefab-scenes'
import type { Dependencies } from '../../model/diConfig.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { COMMON_PLANET_CHOICES } from './planets/CommonPlanetChoices.ts'
import { COMMON_SPACE_CHOICES } from './space/CommonSpaceChoices.ts'

export class ChoiceDirector extends AbstractChoicesDirector<WorldModel> {
  constructor(dependencies: Dependencies) {
    super(dependencies.worldModel)
  }

  override resolveAvailableChoices(): CommonResolvedChoices {
    const choices: CommonChoice[] = []

    if (this.worldModel.state.mainState === 'planet') {
      choices.push(...this.filterRelevantChoices(COMMON_PLANET_CHOICES))
    }

    if (this.worldModel.state.mainState === 'space') {
      choices.push(...this.filterRelevantChoices(COMMON_SPACE_CHOICES))
    }

    /*
    choices.push({
      name: 'Test',
      effects: [],
    })

     */

    return {
      choices,
    }
  }
}
