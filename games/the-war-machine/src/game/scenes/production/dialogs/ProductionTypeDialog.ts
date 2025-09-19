import { GameObjects } from 'phaser'
import type { PotatoScene } from '@potato-golem/ui'
import { ProductionType } from '../../../model/enums/ProductionEnums.ts'
import { Colors, Typography, Borders } from '../../../registries/styleRegistry.ts'
import { DepthRegistry } from '../../../registries/depthRegistry.ts'

interface ProductionTypeCallbacks {
  onProductionSelected: (type: ProductionType) => void
  onCancel: () => void
}

interface ProductionTypeInfo {
  type: ProductionType
  name: string
  description: string
  monthlyOutput: number
  requiredTech: number
}

export class ProductionTypeDialog extends GameObjects.Container {
  private callbacks: ProductionTypeCallbacks
  private currentProduction: ProductionType
  private facilityTech: number
  private productionTypes: ProductionTypeInfo[]

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    currentProduction: ProductionType,
    facilityTech: number,
    callbacks: ProductionTypeCallbacks
  ) {
    super(scene, x, y)
    this.callbacks = callbacks
    this.currentProduction = currentProduction
    this.facilityTech = facilityTech

    this.productionTypes = this.getAvailableProductionTypes()
    this.setDepth(DepthRegistry.RESEARCH_DIALOG)
    this.createDialog()
    scene.add.existing(this)
  }

  private getAvailableProductionTypes(): ProductionTypeInfo[] {
    return [
      {
        type: ProductionType.NONE,
        name: 'Idle (No Production)',
        description: 'Facility is not producing anything',
        monthlyOutput: 0,
        requiredTech: 1,
      },
      {
        type: ProductionType.SMALL_ARMS,
        name: 'Small Arms',
        description: 'Rifles, pistols, and light weapons',
        monthlyOutput: 100,
        requiredTech: 1,
      },
      {
        type: ProductionType.AMMUNITION,
        name: 'Ammunition',
        description: 'Bullets, shells, and explosives',
        monthlyOutput: 500,
        requiredTech: 1,
      },
      {
        type: ProductionType.EXPLOSIVES,
        name: 'Explosives',
        description: 'Grenades, mines, and bombs',
        monthlyOutput: 50,
        requiredTech: 2,
      },
      {
        type: ProductionType.HEAVY_WEAPONS,
        name: 'Heavy Weapons',
        description: 'Machine guns, mortars, and anti-tank weapons',
        monthlyOutput: 25,
        requiredTech: 2,
      },
      {
        type: ProductionType.VEHICLES,
        name: 'Vehicles',
        description: 'Trucks, APCs, and light vehicles',
        monthlyOutput: 10,
        requiredTech: 3,
      },
      {
        type: ProductionType.ARTILLERY,
        name: 'Artillery',
        description: 'Howitzers and rocket systems',
        monthlyOutput: 5,
        requiredTech: 3,
      },
      {
        type: ProductionType.TANKS,
        name: 'Tanks',
        description: 'Main battle tanks and armored vehicles',
        monthlyOutput: 3,
        requiredTech: 4,
      },
      {
        type: ProductionType.AIRCRAFT,
        name: 'Aircraft',
        description: 'Fighter jets and attack helicopters',
        monthlyOutput: 2,
        requiredTech: 5,
      },
      {
        type: ProductionType.MISSILES,
        name: 'Missiles',
        description: 'Guided missiles and air defense systems',
        monthlyOutput: 10,
        requiredTech: 4,
      },
      {
        type: ProductionType.NAVAL,
        name: 'Naval Equipment',
        description: 'Naval weapons and systems',
        monthlyOutput: 2,
        requiredTech: 5,
      },
      {
        type: ProductionType.ELECTRONICS,
        name: 'Electronics',
        description: 'Communications and surveillance equipment',
        monthlyOutput: 20,
        requiredTech: 3,
      },
      {
        type: ProductionType.DRONES,
        name: 'Drones',
        description: 'UAVs and autonomous systems',
        monthlyOutput: 15,
        requiredTech: 4,
      },
    ]
  }

  private createDialog() {
    const dialogWidth = 800
    const dialogHeight = 600

    // Semi-transparent overlay
    const overlay = this.scene.add.rectangle(0, 0, 2000, 2000, 0x000000, 0.7)
    overlay.setInteractive()
    this.add(overlay)

    // Dialog background
    const bg = this.scene.add.rectangle(0, 0, dialogWidth, dialogHeight, Colors.background.secondary, 0.95)
    bg.setStrokeStyle(Borders.width.thick, Colors.ui.border)
    this.add(bg)

    // Title
    const title = this.scene.add.text(0, -dialogHeight / 2 + 40, 'SELECT PRODUCTION TYPE', {
      fontSize: Typography.fontSize.h3,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    title.setOrigin(0.5)
    this.add(title)

    // Create production type grid
    this.createProductionGrid(-dialogHeight / 2 + 100)

    // Cancel button
    this.createCancelButton(0, dialogHeight / 2 - 50)

    // Setup right-click to close
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown() && this.visible) {
        this.callbacks.onCancel()
        this.destroy()
      }
    })
  }

  private createProductionGrid(startY: number) {
    const itemWidth = 350
    const itemHeight = 80
    const columns = 2
    const xSpacing = 380
    const ySpacing = 85

    this.productionTypes.forEach((prodType, index) => {
      const row = Math.floor(index / columns)
      const col = index % columns
      const x = -190 + col * xSpacing
      const y = startY + row * ySpacing

      this.createProductionItem(prodType, x, y, itemWidth, itemHeight)
    })
  }

  private createProductionItem(
    prodType: ProductionTypeInfo,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const isSelected = prodType.type === this.currentProduction
    const isAvailable = prodType.requiredTech <= this.facilityTech

    // Item container
    const itemContainer = this.scene.add.container(x, y)

    // Background
    const bg = this.scene.add.rectangle(
      0, 0, width, height,
      isSelected ? Colors.primary.main : Colors.background.card,
      isSelected ? 0.3 : (isAvailable ? 0.7 : 0.3)
    )
    bg.setStrokeStyle(
      Borders.width.normal,
      isSelected ? Colors.primary.light : (isAvailable ? Colors.ui.divider : Colors.status.danger)
    )

    if (isAvailable) {
      bg.setInteractive()
    }

    itemContainer.add(bg)

    // Production name
    const nameText = this.scene.add.text(-width / 2 + 15, -height / 2 + 20, prodType.name, {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: isAvailable ? Colors.text.primary : Colors.text.disabled,
      fontStyle: Typography.fontStyle.bold,
    })
    itemContainer.add(nameText)

    // Description
    const descText = this.scene.add.text(-width / 2 + 15, 0, prodType.description, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: isAvailable ? Colors.text.secondary : Colors.text.disabled,
    })
    itemContainer.add(descText)

    // Output rate (if producing)
    if (prodType.type !== ProductionType.NONE && isAvailable) {
      const outputText = this.scene.add.text(-width / 2 + 15, height / 2 - 20,
        `Output: ${prodType.monthlyOutput} units/month`, {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.muted,
      })
      itemContainer.add(outputText)
    }

    // Tech requirement indicator
    if (!isAvailable) {
      const techText = this.scene.add.text(width / 2 - 15, -height / 2 + 20,
        `Tech ${prodType.requiredTech}`, {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.danger,
      })
      techText.setOrigin(1, 0)
      itemContainer.add(techText)
    }

    // Current indicator
    if (isSelected) {
      const currentBadge = this.scene.add.text(width / 2 - 15, height / 2 - 20,
        'CURRENT', {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.accent,
        fontStyle: Typography.fontStyle.bold,
      })
      currentBadge.setOrigin(1, 0)
      itemContainer.add(currentBadge)
    }

    // Interactions
    if (isAvailable) {
      bg.on('pointerover', () => {
        if (!isSelected) {
          bg.setFillStyle(Colors.background.cardHover, 0.9)
        }
      })

      bg.on('pointerout', () => {
        if (!isSelected) {
          bg.setFillStyle(Colors.background.card, 0.7)
        }
      })

      bg.on('pointerdown', () => {
        if (!isSelected) {
          this.callbacks.onProductionSelected(prodType.type)
          this.destroy()
        }
      })
    }

    this.add(itemContainer)
  }

  private createCancelButton(x: number, y: number) {
    const button = this.scene.add.container(x, y)

    const bg = this.scene.add.rectangle(0, 0, 150, 40, Colors.background.cardHover, 0.9)
    bg.setStrokeStyle(Borders.width.normal, Colors.ui.border)
    bg.setInteractive()
    button.add(bg)

    const text = this.scene.add.text(0, 0, 'Cancel', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    text.setOrigin(0.5)
    button.add(text)

    bg.on('pointerover', () => {
      bg.setFillStyle(Colors.background.card, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(Colors.background.cardHover, 0.9)
    })

    bg.on('pointerdown', () => {
      this.callbacks.onCancel()
      this.destroy()
    })

    this.add(button)
  }
}