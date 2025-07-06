import type { GlobalSceneEvents, StateHolder } from '@potato-golem/core'
import { PotatoScene } from '@potato-golem/ui'
import type { EventEmitter } from 'emitix'
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
  globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>
  worldModel: WorldModel
  choicesDirector: AbstractChoicesDirector<WorldModel, ResolvedChoices>
}

export abstract class PrefabChoicesScene<
  WorldModel extends StateHolder<any, any>,
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
    super(dependencies.globalSceneEventEmitter, params.choicesSceneId)
    this.params = params
    this.worldModel = dependencies.worldModel
    this.choicesDirector = dependencies.choicesDirector
  }

  override init() {
    super.init()
    console.log(`Current state: ${JSON.stringify(this.worldModel.state)}`)

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
