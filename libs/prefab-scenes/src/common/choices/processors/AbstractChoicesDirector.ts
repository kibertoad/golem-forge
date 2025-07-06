import type {
  ChoiceDefinition,
  EffectsHolder,
  MenuTextItem,
  OptionWithPreconditions,
} from '@potato-golem/core'

export type CommonChoice = MenuTextItem & EffectsHolder & OptionWithPreconditions

export type CommonResolvedChoices = {
  choices: readonly CommonChoice[]
}

export abstract class AbstractChoicesDirector<
  WorldModel,
  ResolvedChoices extends CommonResolvedChoices = CommonResolvedChoices,
> {
  protected readonly worldModel: WorldModel

  constructor(worldModel: WorldModel) {
    this.worldModel = worldModel
  }

  public filterRelevantChoices(choices: Record<string, ChoiceDefinition>): CommonChoice[] {
    return Object.values(choices).filter((entry) => this.isOptionShown(entry))
  }

  public isOptionShown(option: OptionWithPreconditions): boolean {
    if (!option.conditionsToShow) {
      return true
    }

    for (const precondition of option.conditionsToShow) {
      if (!precondition.isSatisfied()) return false
    }

    return true
  }

  // Context is resolved from worldModel
  public abstract resolveAvailableChoices(): ResolvedChoices
}
