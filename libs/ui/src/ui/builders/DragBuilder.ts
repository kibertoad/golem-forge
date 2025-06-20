import * as Phaser from 'phaser'
import type { AbstractUIElementLite } from '../elements/UIGroup.ts'

import Pointer = Phaser.Input.Pointer
import type { TargettedActivation, TargettedActivationCallback } from '@potato-golem/core'
import {
  DEFAULT_ENTITY_TYPE,
  getEntityType,
  storeStartPosition,
} from '../data/ElementDataManipulator.ts'
import { doShapesIntersect } from '../utils/shapeIntersectionUtils.ts'
import GameObject = Phaser.GameObjects.GameObject
import { dragCoords, setActiveDraggedItem } from '../globals/globalState.ts'
import Rectangle = Phaser.Geom.Rectangle
import Container = Phaser.GameObjects.Container
export enum DRAG_EVENTS {
  ENTER_HOVER = 'ENTER_HOVER',
  LEAVE_HOVER = 'LEAVE_HOVER',
}

export type DragConfig = {
  tolerance?: number
}

type DragOptions = {
  dragStartItem: AbstractUIElementLite
  draggedItem: AbstractUIElementLite

  /**
   * Callback executed on hovered item after dragged item is dropped
   */
  onDropCallback: (pointer: Pointer) => void

  onHoverCallback?: (hoveredObject: any) => void

  potentialHoverTargets: readonly (GameObject | Rectangle)[]
  config: DragConfig
}

function calculateContainerBounds(container: Container) {
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  // biome-ignore lint/complexity/noForEach: <explanation>
  container.list.forEach((childx) => {
    const child: any = childx

    // Ensure the child has dimensions and position
    if (
      child.x !== undefined &&
      child.y !== undefined &&
      child.displayWidth !== undefined &&
      child.displayHeight !== undefined
    ) {
      minX = Math.min(minX, child.x - child.displayOriginX)
      maxX = Math.max(maxX, child.x - child.displayOriginX + child.displayWidth)
      minY = Math.min(minY, child.y - child.displayOriginY)
      maxY = Math.max(maxY, child.y - child.displayOriginY + child.displayHeight)
    }
  })

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

function isContainer(object: unknown): object is Container {
  return (object as Container).type === 'Container'
}

// ToDo Some of these things don't need to be recalculated constantly
function resolveDraggedObjectBoundaries(draggedItem: AbstractUIElementLite): Rectangle {
  let width = 0
  let height = 0
  if (isContainer(draggedItem)) {
    // ToDo this could be cached within container
    const bounds = calculateContainerBounds(draggedItem as Container)
    width = bounds.width
    height = bounds.height
  } else {
    width = draggedItem.displayWidth
    height = draggedItem.displayHeight
  }

  return new Rectangle(draggedItem.x, draggedItem.y, width, height)
}

export function buildDrag(options: DragOptions) {
  let dragDeltaX = 0
  let dragDeltaY = 0

  options.dragStartItem
    .setInteractive({
      draggable: true,
      pixelPerfect: options.config.tolerance !== undefined,
      alphaTolerance: options.config.tolerance,
    })

    .on('dragstart', (pointer, _dragX, _dragY) => {
      setActiveDraggedItem(options.dragStartItem)

      //console.log(`dragstart ${draggedItem.x}/${draggedItem.y}`)
      //console.log(`dragstart pointer ${pointer.x}/${pointer.y}`)
      dragDeltaX = pointer.x - options.draggedItem.x
      dragDeltaY = pointer.y - options.draggedItem.y

      // this is used to have a spot to jump back if drag is cancelled
      storeStartPosition(options.draggedItem)
    })
    .on('drag', (pointer, dragX, dragY) => {
      //console.log(`Drag: ${dragX}/${dragY}`)
      //console.log(`Drag pointer: ${pointer.x}/${pointer.y}`)

      dragCoords.x = dragX
      dragCoords.y = dragY

      //console.log('potential hover targets')
      //console.log(options.potentialHoverTargets)

      if (options.onHoverCallback && options.potentialHoverTargets) {
        const draggedObjectBoundaries = resolveDraggedObjectBoundaries(options.draggedItem)

        const overlappingObject = options.potentialHoverTargets.find((potentialOverlap) => {
          return doShapesIntersect(potentialOverlap, draggedObjectBoundaries)
        })

        if (overlappingObject) {
          // @ts-ignore
          //console.log(`Graphics hover overlap found: ${overlappingObject.x}/${overlappingObject.y}`)
          options.onHoverCallback(overlappingObject)
        } else {
          //console.log('No overlap :-/')
          options.onHoverCallback(undefined)
        }
      }

      options.draggedItem.setPosition(pointer.x - dragDeltaX, pointer.y - dragDeltaY)
    })
    .on('dragend', (pointer: Pointer, _dragX, _dragY, dropped) => {
      if (dropped) {
        // Process 'drop' event
        return
      }
      options.onDropCallback(pointer)

      console.log('dragend')
      setActiveDraggedItem(undefined)
    })
    .on('drop', (_pointer, _target) => {
      console.log('drop')
    })
}

export type DragActivationOptions<T, U> = {
  dragStartItem: T // this interactive element starts drag when clicked and dragged
  draggedItem: U // this item changes position during drag

  // rule of a thumb - background image is a `dragStartItem`, but container which combines together
  // background with other elements on it is `draggedItem`

  config: DragConfig

  potentialDropTargets: readonly AbstractUIElementLite[]
  dropActivations: Record<string, TargettedActivation<any> | TargettedActivationCallback<any>>

  potentialHoverTargets: readonly (GameObject | Rectangle)[]
}

export function buildDragWithActivations<
  T extends AbstractUIElementLite,
  U extends AbstractUIElementLite,
>(options: DragActivationOptions<T, U>) {
  let currentlyHoveredObject: AbstractUIElementLite | undefined

  buildDrag({
    potentialHoverTargets: options.potentialHoverTargets ?? [],
    dragStartItem: options.dragStartItem,
    draggedItem: options.draggedItem,
    config: options.config,
    onDropCallback: (_pointer: Pointer) => {
      console.log('potential drop targets:')
      console.log(options.potentialDropTargets)

      const draggedObjectBoundaries = resolveDraggedObjectBoundaries(options.draggedItem)

      const overlappingObject = options.potentialDropTargets.find((potentialOverlap) => {
        return doShapesIntersect(potentialOverlap, draggedObjectBoundaries)
      })

      const entityType = overlappingObject ? getEntityType(overlappingObject) : DEFAULT_ENTITY_TYPE
      console.log(`Drag drop target entity type: ${entityType}`)

      const activation = options.dropActivations[entityType]
      if (!activation) {
        throw new Error(`Unsupported entity type ${entityType}`)
      }

      if (typeof activation === 'function') {
        activation(overlappingObject)
      } else {
        activation.activateTargetted(overlappingObject)
      }
    },

    onHoverCallback: (overlappingObject: any) => {
      if (overlappingObject === currentlyHoveredObject) {
        return
      }

      if (!overlappingObject && !currentlyHoveredObject) {
        return
      }

      if (!overlappingObject) {
        console.log('EMIT LEAVE HOVER')
        currentlyHoveredObject!.emit(DRAG_EVENTS.LEAVE_HOVER, options.draggedItem)
        currentlyHoveredObject = undefined
        return
      }

      currentlyHoveredObject = overlappingObject
      console.log('EMIT ENTER HOVER')
      currentlyHoveredObject?.emit(DRAG_EVENTS.ENTER_HOVER, options.draggedItem)
    },
  })
}
