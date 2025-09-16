import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import { GameObjects } from 'phaser'
import type { ArmsStockModel } from '../../../../model/entities/ArmsStockModel.ts'
import { ArmsBranchNames } from '../../../../model/enums/ArmsBranches.ts'
import {
  getManufacturerDisplayName,
  manufacturerDetails,
} from '../../../../model/enums/ArmsManufacturer.ts'
import { DepthRegistry } from '../../../../registries/depthRegistry.ts'

export class ArmsDetailView extends GameObjects.Container {
  private background: GameObjects.Graphics
  private closeButton: GameObjects.Container
  private titleText: GameObjects.Text
  private currentItem: ArmsStockModel | null = null

  constructor(scene: PotatoScene, x: number, y: number) {
    super(scene, x, y)

    // Create semi-transparent overlay background
    const overlayBg = scene.add.graphics()
    overlayBg.fillStyle(0x000000, 0.7)
    overlayBg.fillRect(
      -scene.cameras.main.width / 2,
      -scene.cameras.main.height / 2,
      scene.cameras.main.width,
      scene.cameras.main.height,
    )
    this.add(overlayBg)

    // Create main detail window
    this.background = scene.add.graphics()
    this.background.fillStyle(0x1a1a1a, 0.98)
    this.background.fillRoundedRect(-400, -300, 800, 600, 10)
    this.background.lineStyle(3, 0x444444, 1)
    this.background.strokeRoundedRect(-400, -300, 800, 600, 10)
    this.add(this.background)

    // Title
    this.titleText = scene.add.text(0, -260, 'ARMS DETAILS', {
      fontSize: '32px',
      fontFamily: 'Courier',
      color: '#00ff00',
      fontStyle: 'bold',
    })
    this.titleText.setOrigin(0.5)
    this.add(this.titleText)

    // Close button
    this.closeButton = this.createCloseButton(scene)
    this.add(this.closeButton)

    // Make overlay interactive to block clicks
    overlayBg.setInteractive(
      new Phaser.Geom.Rectangle(
        -scene.cameras.main.width / 2,
        -scene.cameras.main.height / 2,
        scene.cameras.main.width,
        scene.cameras.main.height,
      ),
      Phaser.Geom.Rectangle.Contains,
    )

    scene.add.existing(this)
    this.setDepth(DepthRegistry.STOCK_DETAIL)
    this.setVisible(false)

    // Setup right-click to close
    this.setupRightClickClose(scene)
  }

  private createCloseButton(scene: PotatoScene): GameObjects.Container {
    const container = scene.add.container(360, -260)

    const bg = scene.add.graphics()
    bg.fillStyle(0x660000, 0.8)
    bg.fillRoundedRect(-15, -15, 30, 30, 4)
    bg.lineStyle(2, 0xaa0000, 1)
    bg.strokeRoundedRect(-15, -15, 30, 30, 4)

    const text = scene.add.text(0, 0, 'X', {
      fontSize: '24px',
      fontFamily: 'Courier',
      color: '#ff0000',
      fontStyle: 'bold',
    })
    text.setOrigin(0.5)

    container.add([bg, text])

    bg.setInteractive(new Phaser.Geom.Rectangle(-15, -15, 30, 30), Phaser.Geom.Rectangle.Contains)
    bg.on('pointerdown', () => {
      this.hide()
    })
    bg.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(0x880000, 1)
      bg.fillRoundedRect(-15, -15, 30, 30, 4)
      bg.lineStyle(2, 0xff0000, 1)
      bg.strokeRoundedRect(-15, -15, 30, 30, 4)
    })
    bg.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(0x660000, 0.8)
      bg.fillRoundedRect(-15, -15, 30, 30, 4)
      bg.lineStyle(2, 0xaa0000, 1)
      bg.strokeRoundedRect(-15, -15, 30, 30, 4)
    })

    return container
  }

  public showItemDetails(item: ArmsStockModel) {
    this.currentItem = item
    const def = item.getDefinition()
    if (!def) return

    // Clear previous content (except background and close button)
    this.list.forEach((child) => {
      if (
        child !== this.background &&
        child !== this.closeButton &&
        child !== this.titleText &&
        child !== this.list[0]
      ) {
        child.destroy()
      }
    })

    const scene = this.scene as PotatoScene
    let yPos = -200

    // Weapon name and branch
    const nameText = scene.add.text(0, yPos, def.name, {
      fontSize: '36px',
      fontFamily: 'Courier',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    nameText.setOrigin(0.5)
    this.add(nameText)
    yPos += 50

    // Branch
    const branchText = scene.add.text(0, yPos, `${ArmsBranchNames[def.branch]}`, {
      fontSize: '24px',
      fontFamily: 'Courier',
      color: '#00ffff',
    })
    branchText.setOrigin(0.5)
    this.add(branchText)
    yPos += 40

    // Divider
    const divider1 = scene.add.graphics()
    divider1.lineStyle(1, 0x444444, 0.8)
    divider1.lineBetween(-350, yPos, 350, yPos)
    this.add(divider1)
    yPos += 30

    // Two columns layout
    const leftX = -350
    const rightX = 20

    // Left column - Manufacturer info
    const manufInfo = manufacturerDetails[def.manufacturer]

    const manufTitle = scene.add.text(leftX, yPos, 'MANUFACTURER', {
      fontSize: '20px',
      fontFamily: 'Courier',
      color: '#888888',
      fontStyle: 'bold',
    })
    this.add(manufTitle)
    yPos += 30

    const manufName = scene.add.text(leftX, yPos, getManufacturerDisplayName(def.manufacturer), {
      fontSize: '22px',
      fontFamily: 'Courier',
      color: '#ffffff',
    })
    this.add(manufName)
    yPos += 30

    const manufCountry = scene.add.text(leftX, yPos, `Country: ${manufInfo.country}`, {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#aaaaaa',
    })
    this.add(manufCountry)
    yPos += 25

    const manufPrestige = scene.add.text(
      leftX,
      yPos,
      `Prestige: ${'★'.repeat(manufInfo.prestigeLevel)}${'☆'.repeat(5 - manufInfo.prestigeLevel)}`,
      {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: '#ffaa00',
      },
    )
    this.add(manufPrestige)
    yPos += 25

    const manufTech = scene.add.text(
      leftX,
      yPos,
      `Technology: ${'▮'.repeat(manufInfo.technologyLevel)}${'▯'.repeat(5 - manufInfo.technologyLevel)}`,
      {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: '#00aaff',
      },
    )
    this.add(manufTech)
    yPos += 40

    // Stock info section
    const stockTitle = scene.add.text(leftX, yPos, 'STOCK INFO', {
      fontSize: '20px',
      fontFamily: 'Courier',
      color: '#888888',
      fontStyle: 'bold',
    })
    this.add(stockTitle)
    yPos += 30

    const quantity = scene.add.text(leftX, yPos, `Quantity: ${item.quantity} units`, {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#ffffff',
    })
    this.add(quantity)
    yPos += 25

    const condition = scene.add.text(leftX, yPos, `Condition: ${item.condition}`, {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: this.getConditionColor(item.condition),
    })
    this.add(condition)
    yPos += 25

    const purchasePrice = scene.add.text(
      leftX,
      yPos,
      `Purchase Price: $${item.purchasePrice.toLocaleString()}/unit`,
      {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: '#aaaaaa',
      },
    )
    this.add(purchasePrice)
    yPos += 25

    const marketValue = scene.add.text(
      leftX,
      yPos,
      `Market Value: $${def.basePrice.toLocaleString()}/unit`,
      {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: '#00ff00',
      },
    )
    this.add(marketValue)

    // Right column - Quality attributes
    yPos = -200 + 70 + 40 + 30 // Reset to after divider

    const qualityTitle = scene.add.text(rightX, yPos, 'QUALITY ATTRIBUTES', {
      fontSize: '20px',
      fontFamily: 'Courier',
      color: '#888888',
      fontStyle: 'bold',
    })
    this.add(qualityTitle)
    yPos += 30

    if (def.qualityAttributes) {
      Object.entries(def.qualityAttributes).forEach(([key, value]) => {
        if (typeof value === 'number') {
          const attrName = this.formatAttributeName(key)
          const barWidth = 250
          const filledWidth = (value / 100) * barWidth

          // Attribute name
          const attrText = scene.add.text(rightX, yPos, attrName, {
            fontSize: '16px',
            fontFamily: 'Courier',
            color: '#cccccc',
          })
          this.add(attrText)

          // Value
          const valueText = scene.add.text(rightX + 200, yPos, `${value}`, {
            fontSize: '16px',
            fontFamily: 'Courier',
            color: this.getAttributeColor(value),
          })
          this.add(valueText)
          yPos += 20

          // Progress bar
          const barBg = scene.add.graphics()
          barBg.fillStyle(0x222222, 0.8)
          barBg.fillRoundedRect(rightX, yPos, barWidth, 8, 2)
          this.add(barBg)

          const barFill = scene.add.graphics()
          barFill.fillStyle(this.getAttributeColorHex(value), 0.9)
          barFill.fillRoundedRect(rightX, yPos, filledWidth, 8, 2)
          this.add(barFill)
          yPos += 20
        }
      })
    }

    // Subcategories
    if (def.subcategories && def.subcategories.size > 0) {
      yPos = Math.max(yPos, 100) // Ensure we're below other content

      const divider2 = scene.add.graphics()
      divider2.lineStyle(1, 0x444444, 0.8)
      divider2.lineBetween(-350, yPos, 350, yPos)
      this.add(divider2)
      yPos += 20

      const subcatTitle = scene.add.text(-350, yPos, 'CATEGORIES:', {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: '#888888',
      })
      this.add(subcatTitle)

      let xOffset = -350
      let subcatY = yPos + 30
      Array.from(def.subcategories).forEach((subcat, index) => {
        if (index > 0 && index % 4 === 0) {
          subcatY += 35
          xOffset = -350
        }

        const subcatBg = scene.add.graphics()
        subcatBg.fillStyle(0x004444, 0.6)
        subcatBg.fillRoundedRect(xOffset, subcatY, 170, 30, 3)
        subcatBg.lineStyle(1, 0x008888, 0.8)
        subcatBg.strokeRoundedRect(xOffset, subcatY, 170, 30, 3)
        this.add(subcatBg)

        const subcatText = scene.add.text(xOffset + 85, subcatY + 15, subcat.replace(/_/g, ' '), {
          fontSize: '14px',
          fontFamily: 'Courier',
          color: '#00ffff',
        })
        subcatText.setOrigin(0.5)
        this.add(subcatText)

        xOffset += 180
      })
      yPos = subcatY + 40
    }

    // Description if available
    if (def.description) {
      yPos = Math.max(yPos, 150)

      const descText = scene.add.text(0, yPos, def.description, {
        fontSize: '16px',
        fontFamily: 'Courier',
        color: '#aaaaaa',
        wordWrap: { width: 700 },
        align: 'center',
      })
      descText.setOrigin(0.5, 0)
      this.add(descText)
    }

    this.setVisible(true)
  }

  private formatAttributeName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  private getAttributeColor(value: number): string {
    if (value >= 80) return '#00ff00'
    if (value >= 60) return '#88ff00'
    if (value >= 40) return '#ffff00'
    if (value >= 20) return '#ff8800'
    return '#ff0000'
  }

  private getAttributeColorHex(value: number): number {
    if (value >= 80) return 0x00ff00
    if (value >= 60) return 0x88ff00
    if (value >= 40) return 0xffff00
    if (value >= 20) return 0xff8800
    return 0xff0000
  }

  private getConditionColor(condition: string): string {
    const conditionColors: Record<string, string> = {
      new: '#00ff00',
      excellent: '#88ff00',
      good: '#ffff00',
      fair: '#ff8800',
      poor: '#ff4400',
      salvage: '#ff0000',
    }
    return conditionColors[condition.toLowerCase()] || '#ffffff'
  }

  private setupRightClickClose(scene: PotatoScene) {
    // Right-click anywhere to close the detail view
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Check if right mouse button and detail view is visible
      if (pointer.rightButtonDown() && this.visible) {
        this.hide()
      }
    })
  }

  public hide() {
    this.setVisible(false)
    this.emit('detail-closed')
  }

  public show() {
    this.setVisible(true)
  }
}
