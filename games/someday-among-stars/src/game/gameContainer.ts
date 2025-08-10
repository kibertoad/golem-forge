import type { Types as PhaserTypes } from 'phaser'
import { AUTO, Game, Scale } from 'phaser'
import { instantiateContainer } from './diConfig.ts'

const GameResolutions = {
  default: {
    width: 2560,
    height: 1440,
  },
}

const resolution = GameResolutions.default

const container = instantiateContainer()

const scenes = [
  container.cradle.mainMenuScene,
  container.cradle.spaceScene,
  container.cradle.choicesScene,
  container.cradle.starmapScene,
  container.cradle.starmapUIScene,
  container.cradle.spaceCombatScene,
]

const config: PhaserTypes.Core.GameConfig = {
  type: AUTO,
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  parent: undefined,
  width: resolution.width,
  height: resolution.height,
  plugins: {},
  scene: scenes,
}

const StartGame = (parent: string) => {
  return new Game({ ...config, parent })
}

// biome-ignore lint/style/noDefaultExport: This is required by Phaser
export default StartGame
