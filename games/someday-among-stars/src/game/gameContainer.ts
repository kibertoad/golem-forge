import { AUTO, Game, Scale } from 'phaser'
import type { Types as PhaserTypes } from 'phaser'
import { instantiateContainer } from './model/diConfig.ts'

const GameResolutions = {
  default: {
    width: 2560,
    height: 1440,
  },
}

const resolution = GameResolutions.default

const container = instantiateContainer()

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
  scene: [
    container.cradle.mainMenuScene,
    container.cradle.boardScene,
    container.cradle.choicesScene,
  ],
}

const StartGame = (parent: string) => {
  return new Game({ ...config, parent })
}

// this must be provided by a main file
// biome-ignore lint/style/noDefaultExport: <explanation>
export default StartGame
