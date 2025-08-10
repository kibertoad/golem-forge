import { LimitedNumber } from '@potato-golem/core'
import type { CommonComponentDefinition } from '../../content/components/CommonComponents.ts'

export type ComponentModelTypes = 'weapon' | 'shield' | 'generator' | 'other'

export class CommonComponentModel {
  public readonly type: ComponentModelTypes

  public readonly definition: CommonComponentDefinition<any>
  public readonly durability: LimitedNumber

  constructor(type: ComponentModelTypes, definition: CommonComponentDefinition<any>) {
    this.type = type
    this.definition = definition

    this.durability = new LimitedNumber(
      definition.maxDurability,
      definition.maxDurability,
      false,
      'Component durability',
    )
  }
}
