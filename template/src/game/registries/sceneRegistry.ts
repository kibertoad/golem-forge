import type { RegistryEntityId } from '@potato-golem/core'

export type SceneId = RegistryEntityId<typeof sceneRegistry>

export const sceneRegistry = {
  MAIN_MENU_SCENE: 'mainMenu',
  BOARD_SCENE: 'board',
} as const
