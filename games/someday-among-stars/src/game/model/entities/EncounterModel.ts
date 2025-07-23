import type { ChoiceDefinition } from '@potato-golem/core'

export class EncounterModel {
  id: string
  name: string // displayed to the user
  choices: ChoiceDefinition[]
}
