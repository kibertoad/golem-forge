import type { GameObjects, Input } from 'phaser'
import { getEntityType } from '../data/ElementDataManipulator.ts'
import { getActiveDraggedItem } from '../globals/globalState.ts'

export type OnHoverConfig = {
  onHoverCallback?: (draggedItem: any) => void
  onUnhoverCallback?: (draggedItem: any) => void
  tolerance?: number
}

export function buildOnHover(
  item: GameObjects.GameObject,
  onHoverCallback: (pointer: Input.Pointer) => void,
  onUnhoverCallback: (pointer: Input.Pointer) => void,
  _config: OnHoverConfig,
) {
  //item.setInteractive({ pixelPerfect: config.tolerance !== undefined, alphaTolerance: config.tolerance })

  item.on('pointerover', onHoverCallback)
  item.on('pointerout', onUnhoverCallback)
}

/**
 * This gets invoked if mouse cursor runs over an object while drag is active. generally this is not what you want
 * @param item
 * @param draggedItemType
 * @param config
 */
export function buildOnDragHover(
  item: GameObjects.GameObject,
  draggedItemType: string,
  config: OnHoverConfig,
) {
  //  item.setInteractive({ pixelPerfect: config.tolerance !== undefined, alphaTolerance: config.tolerance })

  if (config.onHoverCallback) {
    item.on('pointerover', (_pointer) => {
      console.log(`point: ${getEntityType(getActiveDraggedItem())}`)

      if (getEntityType(getActiveDraggedItem()) !== draggedItemType) {
        return
      }
      config.onHoverCallback!(getActiveDraggedItem())
    })
  }

  if (config.onUnhoverCallback) {
    item.on('pointerout', (_pointer) => {
      console.log(`pointout: ${getEntityType(getActiveDraggedItem())}`)

      if (getEntityType(getActiveDraggedItem()) !== draggedItemType) {
        return
      }
      config.onUnhoverCallback!(getActiveDraggedItem())
    })
  }
}
