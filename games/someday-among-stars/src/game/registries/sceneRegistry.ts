import type { RegistryEntityId } from '@potato-golem/core'

export type SceneId = RegistryEntityId<typeof sceneRegistry>

export const sceneRegistry = {
  MAIN_MENU_SCENE: 'mainMenu',
  CHOICES_SCENE: 'choices',
  SPACE_SCENE: 'space',
  STARMAP_SCENE: 'starmap',
  STARMAP_UI_SCENE: 'starmapUI',
  SPACE_COMBAT: 'spaceCombat',
} as const
