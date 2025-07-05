import {
  AbstractChoicesDirector,
  type CommonChoice,
  type CommonResolvedChoices,
} from '@potato-golem/prefab-scenes'
import type { WorldModel } from '../../model/entities/WorldModel.ts'

export class ChoiceDirector extends AbstractChoicesDirector<WorldModel> {
  resolveAvailableChoices(): CommonResolvedChoices {
    const choices: CommonChoice[] = []

    choices.push({
      name: 'Test',
      effects: [],
    })

    return {
      choices,
    }
  }
}
