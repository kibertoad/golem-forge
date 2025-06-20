import * as Phaser from 'phaser'
import { AbstractUIBuilder } from '../AbstractUIBuilder.ts'

import Graphics = Phaser.GameObjects.Graphics
import Rectangle = Phaser.Geom.Rectangle
import Zone = Phaser.GameObjects.Zone
import type { PotatoScene } from '../../common/PotatoScene.ts'
import Container = Phaser.GameObjects.Container

export type RectangularGraphicsContainer = {
  graphics: Graphics
  rectangle: Rectangle
  zone?: Zone
}

/**
 * Used for displaying a single-colour rectangular
 */
export class RectangularBuilder extends AbstractUIBuilder {
  private text?: string

  private baseColour: number
  private dragHoverColour: number
  private hoverColour: number
  private borderWidth: number

  private alpha: number
  private zone = false

  constructor(scene: PotatoScene) {
    super(scene)

    this.width = 20
    this.height = 20
    this.borderWidth = 10

    // Gray color
    this.alpha = 1.0
    this.baseColour = 0xd3d3d3

    // Red color
    this.hoverColour = 0xff0000

    this.dragHoverColour = this.hoverColour
  }

  public setBorderWidth(value: number): this {
    this.borderWidth = value
    return this
  }

  public addZone() {
    this.zone = true
    return this
  }

  public setBaseColour(colour: number) {
    this.baseColour = colour
    return this
  }

  build(): RectangularGraphicsContainer {
    return this.addRectangular()
  }

  private addRectangular(): RectangularGraphicsContainer {
    const graphics = this.scene.add.graphics()

    console.log(
      `Adding new rectangular: ${JSON.stringify({
        borderWidth: this.borderWidth,
        x: this.position.x,
        y: this.position.y,
        width: this.width,
        height: this.height,
      })}`,
    )

    // Set the fill style for the rectangle
    graphics.fillStyle(this.baseColour, this.alpha)

    // Set the line style for the border (red color, 5 pixels thick)
    graphics.lineStyle(this.borderWidth, this.baseColour, this.alpha) // Red color, fully opaque, 5 pixels thick

    // Draw the filled rectangle
    graphics.fillRect(this.position.x, this.position.y, this.width, this.height)

    // Draw the rectangle border using the same coordinates and dimensions
    graphics.strokeRect(this.position.x, this.position.y, this.width, this.height)

    /*
    graphics.addListener(DRAG_EVENTS.ENTER_HOVER, (draggedItem: unknown) => {
      graphics.fillStyle(this.hoverColour, this.alpha);
      //graphics.fillRect(this.position.x, this.position.y, this.width, this.height);
    })

    graphics.addListener(DRAG_EVENTS.LEAVE_HOVER, (draggedItem: unknown) => {
      graphics.fillStyle(this.baseColour, this.alpha);
      //graphics.fillRect(this.position.x, this.position.y, this.width, this.height);
    })

     */

    let zone: Zone | undefined
    const rectangle = new Phaser.Geom.Rectangle(
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    )
    if (this.zone) {
      zone = this.scene.add
        .zone(this.position.x, this.position.y, this.width, this.height)
        .setOrigin(0, 0)
        .setInteractive()
      //zone.setRectangleDropZone(this.width, this.height)
      //zone.setRectangleDropZone(1, 1)
    }

    console.log('zone')
    console.log(JSON.stringify(this.zone))

    return {
      graphics,
      rectangle,
      zone,
    }

    // ToDo future optimization
    // this.texture = this.graphics.generateTexture()
  }

  static instance(scene: PotatoScene) {
    return new RectangularBuilder(scene)
  }

  static fromSprite(
    scene: PotatoScene,
    sourceSprite: Phaser.GameObjects.Sprite,
    sourceSpriteContainer?: Container,
  ) {
    const resolvedX = sourceSpriteContainer
      ? sourceSprite.x + sourceSpriteContainer.x
      : sourceSprite.x
    const resolvedY = sourceSpriteContainer
      ? sourceSprite.y + sourceSpriteContainer.y
      : sourceSprite.y

    /*
    console.log(`Source sprite: ${JSON.stringify({
      width: sourceSprite.width,
      height: sourceSprite.height,
      displayHeight: sourceSprite.displayHeight,
      displayWidth: sourceSprite.displayWidth
    })}`)

     */

    return new RectangularBuilder(scene)
      .setPosition({
        x: resolvedX,
        y: resolvedY,
      })
      .setOrigin(0, 0)
      .setWidth(sourceSprite.displayWidth)
      .setHeight(sourceSprite.displayHeight)
  }
}
