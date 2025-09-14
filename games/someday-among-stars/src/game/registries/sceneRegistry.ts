import type { RegistryEntityId } from '@potato-golem/core'

export type SceneId = RegistryEntityId<typeof sceneRegistry>

export const sceneRegistry = {
  MAIN_MENU_SCENE: 'mainMenu',
  CHOICES_SCENE: 'choices',
  SPACE_SCENE: 'space',
  STARMAP_SCENE: 'starmap',
  STARMAP_UI_SCENE: 'starmapUI',
  SPACE_COMBAT: 'spaceCombat',
  SYSTEM_VISIT_SCENE: 'systemVisit',
  STARPORT_TRADE_SCENE: 'starportTrade',
  SHIPYARD_SCENE: 'shipyard',
} as const
