import { GameObjects } from 'phaser'
import type { PotatoScene } from '@potato-golem/ui'
import type { ProductionFacilityModel } from '../../../model/entities/ProductionFacilityModel.ts'
import type { WorldModel } from '../../../model/entities/WorldModel.ts'
import { ProductionType } from '../../../model/enums/ProductionEnums.ts'
import { CountryNames } from '../../../model/enums/Countries.ts'
import { Colors, Typography, Borders, Dimensions } from '../../../registries/styleRegistry.ts'
import type { WarehouseModel } from '../../../model/entities/locations/WarehouseModel.ts'
import { WarehouseSelectionDialog } from '../dialogs/WarehouseSelectionDialog.ts'
import { ProductionTypeDialog } from '../dialogs/ProductionTypeDialog.ts'

interface FacilityDetailsCallbacks {
  onProductionChange: (newType: ProductionType) => void
  onWarehouseChange: (warehouseId: string) => void
  onUpgrade: () => void
  onSell: () => void
}

export class FacilityDetailsView extends GameObjects.Container {
  private facility: ProductionFacilityModel
  private worldModel: WorldModel
  private callbacks: FacilityDetailsCallbacks

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    facility: ProductionFacilityModel,
    worldModel: WorldModel,
    callbacks: FacilityDetailsCallbacks
  ) {
    super(scene, x, y)
    this.facility = facility
    this.worldModel = worldModel
    this.callbacks = callbacks

    this.createView()
    scene.add.existing(this)
  }

  private createView() {
    const { height } = this.scene.cameras.main
    const panelHeight = height - 300

    // Background
    const bg = this.scene.add.rectangle(0, 0, 700, panelHeight, Colors.background.secondary, 0.95)
    bg.setStrokeStyle(Borders.width.normal, Colors.ui.border)
    this.add(bg)

    // Title
    const title = this.scene.add.text(0, -panelHeight / 2 + 40, 'FACILITY DETAILS', {
      fontSize: Typography.fontSize.h4,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    title.setOrigin(0.5)
    this.add(title)

    // Facility info section
    this.createInfoSection(-panelHeight / 2 + 80)

    // Production section
    this.createProductionSection(-panelHeight / 2 + 250)

    // Warehouse section
    this.createWarehouseSection(-panelHeight / 2 + 380)

    // Actions section
    this.createActionsSection(panelHeight / 2 - 100)
  }

  private createInfoSection(yStart: number) {
    // Facility name
    const nameText = this.scene.add.text(0, yStart, this.facility.name, {
      fontSize: Typography.fontSize.h5,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    nameText.setOrigin(0.5)
    this.add(nameText)

    // Location
    const locationText = this.scene.add.text(0, yStart + 30,
      `${this.facility.city}, ${CountryNames[this.facility.country]}`,
      {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.secondary,
      }
    )
    locationText.setOrigin(0.5)
    this.add(locationText)

    // Stats grid
    const stats = [
      { label: 'Size', value: this.facility.size.toUpperCase() },
      { label: 'Technology', value: `Level ${this.facility.technology}` },
      { label: 'Infrastructure', value: `Level ${this.facility.infrastructure}` },
      { label: 'Concealment', value: `${this.facility.concealment}/10` },
      { label: 'Heat', value: `${this.facility.heat}/10` },
      { label: 'Monthly Upkeep', value: `$${this.facility.monthlyUpkeep.toLocaleString()}` },
    ]

    stats.forEach((stat, index) => {
      const row = Math.floor(index / 2)
      const col = index % 2
      const xPos = -150 + col * 300
      const yPos = yStart + 70 + row * 30

      const label = this.scene.add.text(xPos - 50, yPos, `${stat.label}:`, {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.muted,
      })
      this.add(label)

      const value = this.scene.add.text(xPos + 50, yPos, stat.value, {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: stat.label === 'Heat'
          ? this.getHeatColor(this.facility.heat)
          : Colors.text.primary,
      })
      this.add(value)
    })
  }

  private createProductionSection(yStart: number) {
    // Section title
    const title = this.scene.add.text(-300, yStart, 'PRODUCTION', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    this.add(title)

    // Current production
    const currentProd = this.facility.currentProduction === ProductionType.NONE
      ? 'IDLE'
      : this.facility.currentProduction.replace('_', ' ').toUpperCase()

    const currentText = this.scene.add.text(-300, yStart + 30, `Current: ${currentProd}`, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: this.facility.currentProduction === ProductionType.NONE
        ? Colors.text.muted
        : Colors.text.accent,
    })
    this.add(currentText)

    // Production rate
    if (this.facility.currentProduction !== ProductionType.NONE) {
      const rateText = this.scene.add.text(-300, yStart + 55,
        `Rate: ${this.facility.getProductionCapacity()} units/month`,
        {
          fontSize: Typography.fontSize.small,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.text.secondary,
        }
      )
      this.add(rateText)

      // Progress bar
      this.createProgressBar(-150, yStart + 85, this.facility.productionProgress)
    }

    // Change production button
    const changeButton = this.createButton('Change Production', 150, yStart + 30, () => {
      this.showProductionMenu()
    })
    this.add(changeButton)
  }

  private createWarehouseSection(yStart: number) {
    // Section title
    const title = this.scene.add.text(-300, yStart, 'OUTPUT WAREHOUSE', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    this.add(title)

    // Current warehouse
    let warehouseName = 'None Selected'
    if (this.facility.outputWarehouseId) {
      const warehouse = this.worldModel.playerLocations.find(
        loc => loc.id === this.facility.outputWarehouseId
      ) as WarehouseModel

      if (warehouse) {
        warehouseName = `Warehouse in ${warehouse.city}, ${CountryNames[warehouse.country]}`
      }
    }

    const warehouseText = this.scene.add.text(-300, yStart + 30, warehouseName, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: this.facility.outputWarehouseId ? Colors.text.primary : Colors.text.danger,
    })
    this.add(warehouseText)

    // Select warehouse button
    const selectButton = this.createButton('Select Warehouse', 150, yStart + 30, () => {
      this.showWarehouseSelection()
    })
    this.add(selectButton)
  }

  private createActionsSection(yStart: number) {
    // Upgrade button
    const upgradeButton = this.createButton('Upgrade Facility', -150, yStart, () => {
      this.callbacks.onUpgrade()
    }, Colors.primary.main)
    this.add(upgradeButton)

    // Sell button
    const sellValue = this.facility.getSellValue()
    const sellButton = this.createButton(`Sell ($${sellValue.toLocaleString()})`, 150, yStart, () => {
      this.confirmSell()
    }, 0xef4444)
    this.add(sellButton)
  }

  private createButton(
    text: string,
    x: number,
    y: number,
    onClick: () => void,
    color: number = Colors.primary.main
  ): GameObjects.Container {
    const button = this.scene.add.container(x, y)

    const bg = this.scene.add.rectangle(0, 0, 200, 40, color, 0.9)
    bg.setStrokeStyle(Borders.width.normal, color)
    bg.setInteractive()
    button.add(bg)

    const buttonText = this.scene.add.text(0, 0, text, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    buttonText.setOrigin(0.5)
    button.add(buttonText)

    bg.on('pointerover', () => {
      bg.setFillStyle(color, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(color, 0.9)
    })

    bg.on('pointerdown', onClick)

    return button
  }

  private createProgressBar(x: number, y: number, progress: number) {
    // Background
    const bgBar = this.scene.add.rectangle(x, y, 300, 20, Colors.background.tertiary)
    bgBar.setOrigin(0, 0.5)
    bgBar.setStrokeStyle(1, Colors.ui.divider)
    this.add(bgBar)

    // Fill
    const fillWidth = (progress / 100) * 300
    const fillBar = this.scene.add.rectangle(x, y, fillWidth, 20, Colors.primary.main)
    fillBar.setOrigin(0, 0.5)
    this.add(fillBar)

    // Text
    const progressText = this.scene.add.text(x + 150, y, `${progress.toFixed(0)}%`, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    progressText.setOrigin(0.5)
    this.add(progressText)
  }

  private getHeatColor(heat: number): string {
    if (heat <= 3) return '#10b981' // Green
    if (heat <= 7) return '#f59e0b' // Orange
    return '#ef4444' // Red
  }

  private showProductionMenu() {
    const { width, height } = this.scene.cameras.main
    const dialog = new ProductionTypeDialog(
      this.scene as PotatoScene,
      width / 2,
      height / 2,
      this.facility.currentProduction,
      this.facility.technology,
      {
        onProductionSelected: (type: ProductionType) => {
          this.callbacks.onProductionChange(type)
          // Refresh the view to show the new production type
          this.removeAll(true)
          this.createView()
        },
        onCancel: () => {
          // Nothing to do on cancel
        }
      }
    )
  }

  private showWarehouseSelection() {
    const { width, height } = this.scene.cameras.main
    const dialog = new WarehouseSelectionDialog(
      this.scene as PotatoScene,
      width / 2,
      height / 2,
      this.worldModel,
      this.facility,
      {
        onWarehouseSelected: (warehouseId: string) => {
          this.callbacks.onWarehouseChange(warehouseId)
          // Refresh the view to show the new warehouse
          this.removeAll(true)
          this.createView()
        },
        onCancel: () => {
          // Nothing to do on cancel
        }
      }
    )
  }


  private confirmSell() {
    // Simple confirmation - in a real implementation, show a dialog
    this.callbacks.onSell()
  }
}