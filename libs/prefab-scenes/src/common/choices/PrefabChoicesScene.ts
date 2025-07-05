import { PotatoScene } from '@potato-golem/ui'
import { ChoicesView } from './organisms/ChoicesView.js'
import type {
  AbstractChoicesDirector,
  CommonResolvedChoices,
} from './processors/AbstractChoicesDirector.js'

export type ChoicesSceneParams = {
  choicesSceneId: string
  buttonTextureKey: string
}

export type ChoicesSceneDependencies<
  WorldModel,
  ResolvedChoices extends CommonResolvedChoices = CommonResolvedChoices,
> = {
  worldModel: WorldModel
  choicesDirector: AbstractChoicesDirector<WorldModel, ResolvedChoices>
}

export abstract class PrefabChoicesScene<
  WorldModel,
  ResolvedChoices extends CommonResolvedChoices = CommonResolvedChoices,
> extends PotatoScene {
  private readonly params: ChoicesSceneParams
  private choicesView!: ChoicesView<WorldModel, ResolvedChoices>
  private readonly worldModel: WorldModel
  private choicesDirector: AbstractChoicesDirector<WorldModel, ResolvedChoices>

  constructor(
    params: ChoicesSceneParams,
    dependencies: ChoicesSceneDependencies<WorldModel, ResolvedChoices>,
  ) {
    super(params.choicesSceneId)
    this.params = params
    this.worldModel = dependencies.worldModel
    this.choicesDirector = dependencies.choicesDirector
  }

  init() {
    this.choicesView = new ChoicesView(
      this,
      {
        buttonTextureKey: this.params.buttonTextureKey,
      },
      {
        worldModel: this.worldModel,
        choicesDirector: this.choicesDirector,
      },
    )
    this.choicesView.init()
  }

  create() {}
}
