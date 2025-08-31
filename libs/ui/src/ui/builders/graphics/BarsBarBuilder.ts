import { LimitedNumber } from '@potato-golem/core'
import * as Phaser from 'phaser'
import type { PotatoScene } from '../../common/PotatoScene.ts'
import { AbstractUIBuilder } from '../AbstractUIBuilder.ts'

import Container = Phaser.GameObjects.Container

/**
 * Used for displaying small values as a row of filled/empty bars
 */
export class BarsBarBuilder extends AbstractUIBuilder {
  private text?: string
  private offsetX: number
  private offsetY: number
  private emptyColour: number
  private fillColour: number
  private borderColour: number
  private alpha: number
  private borderWidth: number
  private readonly value: LimitedNumber
  //private readonly graphics: Phaser.GameObjects.Graphics

  constructor(scene: PotatoScene) {
    super(scene)

    this.value = new LimitedNumber(0, 0)
    this.offsetX = 0
    this.offsetY = 0
    this.width = 20
    this.height = 20

    // Red color, fully opaque
    this.alpha = 1.0
    this.fillColour = 0xff0000
    this.borderColour = 0xff0000

    // Black color, fully opaque
    this.emptyColour = 0x000000
    this.borderWidth = 5
  }

    /**
     * Set the maximum value of the bar
     * @param maxValue
     */
  public setMaxValue(maxValue: number) {
    this.value.maxValue = maxValue
    return this
  }

    /**
     * Set the width of the bar
     * @param value
     */
  public setBorderWidth(value: number) {
    this.borderWidth = value
    return this
  }

    /**
     * Set the value of the bar
     * @param value
     */
  public setValue(value: number) {
    this.value.setValue(value)
    return this
  }

    /**
     * Set the X offset of the bar elements
     * @param value
     */
  public setOffsetX(value: number) {
    this.offsetX = value
    return this
  }

    /**
     * Set the Y offset of the bar elements
     * @param value
     */
  public setOffsetY(value: number) {
    this.offsetY = value
    return this
  }

  /**
   * Set the colors for the bars
   * @param colors Object containing fill, background, and optional border colors in hex format (e.g., '#ffaa00')
   * @param colors.fill Hex color for filled bars (e.g., '#ffaa00')
   * @param colors.background Hex color for empty bars (e.g., '#333333') 
   * @param colors.border Optional hex color for borders (e.g., '#ffffff'). If not provided, uses fill color
   */
  public setColors(colors: { fill: string; background: string; border?: string }) {
    this.fillColour = parseInt(colors.fill.replace('#', ''), 16)
    this.emptyColour = parseInt(colors.background.replace('#', ''), 16)
    // Use fill color for border if not provided
    const borderColor = colors.border || colors.fill
    this.borderColour = parseInt(borderColor.replace('#', ''), 16)
    return this
  }

  /**
   * Set the label text for the bars
   * @param label The label text to display
   */
  public setLabel(label: string) {
    this.text = label
    return this
  }

  build() {
    const container = new Container(this.scene)

    let counter = 0
    for (; counter < this.value.value; counter++) {
      this.addFilledBar(counter, container)
    }
    for (; counter < this.value.maxValue; counter++) {
      this.addEmptyBar(counter, container)
    }

    return container
  }

  private addEmptyBar(count: number, container: Container) {
    const graphics = this.scene.add.graphics()

    const x = this.offsetX
      ? this.position.x + count * (this.offsetX + this.width + this.borderWidth * 2)
      : this.position.x
    const y = this.offsetY
      ? this.position.y + count * (this.offsetY + this.height + this.borderWidth * 2)
      : this.position.y

    // Set the fill style for the rectangle (black color)
    graphics.fillStyle(this.emptyColour, this.alpha) // Black color, fully opaque

    // Set the line style for the border
    graphics.lineStyle(this.borderWidth, this.borderColour, this.alpha)

    // Draw the filled rectangle (x, y, width, height)
    graphics.fillRect(x, y, this.width, this.height)

    // Draw the rectangle border using the same coordinates and dimensions
    graphics.strokeRect(x, y, this.width, this.height)

    container.add(graphics)

    // ToDo future optimization
    // this.texture = this.graphics.generateTexture()
  }

  private addFilledBar(count: number, container: Container) {
    const graphics = this.scene.add.graphics()

    const x = this.offsetX
      ? this.position.x + count * (this.offsetX + this.width + this.borderWidth * 2)
      : this.position.x
    const y = this.offsetY
      ? this.position.y + count * (this.offsetY + this.height + this.borderWidth * 2)
      : this.position.y

    // Set the fill style for the rectangle
    graphics.fillStyle(this.fillColour, this.alpha)

    // Set the line style for the border
    graphics.lineStyle(this.borderWidth, this.borderColour, this.alpha)

    // Draw the filled rectangle (x, y, width, height)
    graphics.fillRect(x, y, this.width, this.height)

    // Draw the rectangle border using the same coordinates and dimensions
    graphics.strokeRect(x, y, this.width, this.height)

    container.add(graphics)

    // ToDo future optimization
    // this.texture = this.graphics.generateTexture()
  }

  static instance(scene: PotatoScene) {
    return new BarsBarBuilder(scene)
  }
}
