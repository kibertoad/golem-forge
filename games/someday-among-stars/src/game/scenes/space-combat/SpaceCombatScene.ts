import {PotatoScene} from "@potato-golem/ui";
import type {Dependencies} from "../../diConfig.ts";
import {sceneRegistry} from "../../registries/sceneRegistry.ts";

export class SpaceCombatScene extends PotatoScene {

    constructor(dependencies: Dependencies) {
        super(dependencies.globalSceneEventEmitter, { key: sceneRegistry.SPACE_COMBAT });
    }

}
