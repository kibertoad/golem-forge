import type { Types as PhaserTypes } from 'phaser'
import { AUTO, Game, Scale } from 'phaser'
import { instantiateContainer } from './model/diConfig.ts'

const GameResolutions = {
  default: {
    width: 2560,
    height: 1440,
  },
}

const resolution = GameResolutions.default

const container = instantiateContainer()

// Initialize the game state before Phaser starts
const gameInitializer = container.cradle.gameInitializer
gameInitializer.initializeGame()

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
    container.cradle.armsShowScene,
    container.cradle.assetsScene,
    container.cradle.researchScene,
    container.cradle.personnelScene,
  ],
}

const StartGame = (parent: string) => {
  return new Game({ ...config, parent })
}

// this must be provided by a main file
// biome-ignore lint/style/noDefaultExport: Required for Vite module structure
export default StartGame
