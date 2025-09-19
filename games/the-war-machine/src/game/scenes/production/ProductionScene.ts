import type { GlobalSceneEvents } from '@potato-golem/core'
import { PotatoScene } from '@potato-golem/ui'
import type { EventEmitter } from 'emitix'
import { StatusBar } from '../../components/StatusBar.ts'
import type { ProductionFacilityModel } from '../../model/entities/ProductionFacilityModel.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { Colors, Typography, Dimensions, Borders } from '../../registries/styleRegistry.ts'
import { FacilityDetailsView } from './views/FacilityDetailsView.ts'
import { CountryNames } from '../../model/enums/Countries.ts'

interface ProductionSceneDependencies {
  globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>
  worldModel: WorldModel
}

export class ProductionScene extends PotatoScene {
  private worldModel: WorldModel
  private facilitiesPanel?: Phaser.GameObjects.Container
  private detailsPanel?: Phaser.GameObjects.Container
  private selectedFacility?: ProductionFacilityModel
  private facilityDetailsView?: FacilityDetailsView
  private statusBar?: StatusBar
  private backButton?: Phaser.GameObjects.Container

  constructor({ globalSceneEventEmitter, worldModel }: ProductionSceneDependencies) {
    super(globalSceneEventEmitter, sceneRegistry.PRODUCTION_SCENE)
    this.worldModel = worldModel
  }

  init() {
    // Initialize scene
  }

  preload() {
    // Load any required assets
  }

  create() {
    this.cameras.main.setBackgroundColor(
      `#${Colors.background.primary.toString(16).padStart(6, '0')}`,
    )

    // Create header
    this.createHeader()

    // Create facilities list panel
    this.createFacilitiesPanel()

    // Create details panel
    this.createDetailsPanel()

    // Back button
    this.createBackButton()

    // Status bar
    this.statusBar = new StatusBar(this, this.worldModel)
    this.statusBar.setDepth(DepthRegistry.UI_TEXT)

    // Add right-click to go back
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.goBack()
      }
    })

    // Select first facility if available
    if (this.worldModel.productionFacilities.length > 0) {
      this.selectFacility(this.worldModel.productionFacilities[0])
    }
  }

  private createHeader() {
    const { width } = this.cameras.main

    const headerBg = this.add.rectangle(
      width / 2,
      50,
      width,
      100,
      Colors.background.secondary,
    )
    headerBg.setDepth(DepthRegistry.UI_BACKGROUND)

    const title = this.add.text(width / 2, 30, 'PRODUCTION FACILITIES', {
      fontSize: Typography.fontSize.title,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    title.setOrigin(0.5)
    title.setDepth(DepthRegistry.UI_TEXT)

    const subtitle = this.add.text(width / 2, 60, 'Manage your arms production facilities', {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.secondary,
    })
    subtitle.setOrigin(0.5)
    subtitle.setDepth(DepthRegistry.UI_TEXT)
  }

  private createFacilitiesPanel() {
    const { height } = this.cameras.main

    this.facilitiesPanel = this.add.container(300, height / 2)

    // Panel background
    const panelBg = this.add.rectangle(0, 0, 500, height - 200, Colors.background.secondary, 0.95)
    panelBg.setStrokeStyle(Borders.width.normal, Colors.ui.border)
    this.facilitiesPanel.add(panelBg)

    // Panel title
    const panelTitle = this.add.text(0, -height / 2 + 150, 'YOUR FACILITIES', {
      fontSize: Typography.fontSize.h4,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    panelTitle.setOrigin(0.5)
    this.facilitiesPanel.add(panelTitle)

    // Statistics
    const totalFacilities = this.worldModel.productionFacilities.length
    const activeFacilities = this.worldModel.productionFacilities.filter(f => f.currentProduction !== 'none').length

    const stats = [
      `Total Facilities: ${totalFacilities}`,
      `Active Production: ${activeFacilities}`,
      `Idle: ${totalFacilities - activeFacilities}`,
    ]

    stats.forEach((stat, index) => {
      const statText = this.add.text(-200, -height / 2 + 200 + index * 25, stat, {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.secondary,
      })
      this.facilitiesPanel!.add(statText)
    })

    // List facilities
    this.refreshFacilitiesList()

    // Add new facility button
    const addButton = this.createAddFacilityButton()
    addButton.setPosition(0, height / 2 - 100)
    this.facilitiesPanel.add(addButton)
  }

  private refreshFacilitiesList() {
    if (!this.facilitiesPanel) return

    const { height } = this.cameras.main
    let yOffset = -height / 2 + 300

    // Remove old facility cards
    this.facilitiesPanel.list
      .filter(child => child.getData('facilityCard'))
      .forEach(child => child.destroy())

    // Add facility cards
    this.worldModel.productionFacilities.forEach((facility) => {
      const card = this.createFacilityCard(facility, 0, yOffset)
      this.facilitiesPanel!.add(card)
      yOffset += 110
    })
  }

  private createFacilityCard(facility: ProductionFacilityModel, x: number, y: number): Phaser.GameObjects.Container {
    const isSelected = this.selectedFacility === facility
    const card = this.add.container(x, y)
    card.setData('facilityCard', true)

    // Background
    const cardBg = this.add.rectangle(
      0, 0, 460, 100,
      isSelected ? Colors.primary.main : Colors.background.card,
      isSelected ? 0.3 : 0.9
    )
    cardBg.setStrokeStyle(
      Borders.width.normal,
      isSelected ? Colors.primary.light : Colors.ui.divider
    )
    cardBg.setInteractive()
    card.add(cardBg)

    // Facility name
    const nameText = this.add.text(-210, -35, facility.name, {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    card.add(nameText)

    // Location
    const locationText = this.add.text(-210, -10, `${facility.city}, ${CountryNames[facility.country]}`, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.secondary,
    })
    card.add(locationText)

    // Size and tech
    const sizeText = this.add.text(-210, 10,
      `Size: ${facility.size.toUpperCase()} | Tech: Level ${facility.technology}`,
      {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.muted,
      }
    )
    card.add(sizeText)

    // Production status
    const productionColor = facility.currentProduction === 'none'
      ? Colors.text.muted
      : Colors.text.accent
    const productionText = this.add.text(-210, 30,
      facility.currentProduction === 'none'
        ? 'IDLE'
        : `Producing: ${facility.currentProduction.replace('_', ' ').toUpperCase()}`,
      {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: productionColor,
      }
    )
    card.add(productionText)

    // Heat indicator
    const heatColor = facility.heat <= 3 ? '#10b981' : facility.heat <= 7 ? '#f59e0b' : '#ef4444'
    const heatText = this.add.text(180, -20, `Heat: ${facility.heat}/10`, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: heatColor,
    })
    heatText.setOrigin(0.5)
    card.add(heatText)

    // Monthly cost
    const costText = this.add.text(180, 20, `$${facility.monthlyUpkeep.toLocaleString()}/mo`, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.money.negative,
    })
    costText.setOrigin(0.5)
    card.add(costText)

    // Interactions
    cardBg.on('pointerover', () => {
      if (!isSelected) {
        cardBg.setFillStyle(Colors.background.cardHover, 1)
      }
    })

    cardBg.on('pointerout', () => {
      if (!isSelected) {
        cardBg.setFillStyle(Colors.background.card, 0.9)
      }
    })

    cardBg.on('pointerdown', () => {
      this.selectFacility(facility)
    })

    return card
  }

  private createAddFacilityButton(): Phaser.GameObjects.Container {
    const button = this.add.container(0, 0)

    const bg = this.add.rectangle(0, 0, 460, 60, Colors.primary.dark, 0.9)
    bg.setStrokeStyle(Borders.width.normal, Colors.primary.main)
    bg.setInteractive()
    button.add(bg)

    const text = this.add.text(0, 0, '+ Purchase New Facility', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.accent,
    })
    text.setOrigin(0.5)
    button.add(text)

    bg.on('pointerover', () => {
      bg.setFillStyle(Colors.primary.main, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(Colors.primary.dark, 0.9)
    })

    bg.on('pointerdown', () => {
      this.showFacilityPurchase()
    })

    return button
  }

  private createDetailsPanel() {
    const { width, height } = this.cameras.main

    this.detailsPanel = this.add.container(width - 400, height / 2)
    this.detailsPanel.setDepth(DepthRegistry.UI_ELEMENTS)
  }

  private selectFacility(facility: ProductionFacilityModel) {
    this.selectedFacility = facility
    this.refreshFacilitiesList()

    // Clear old details view
    if (this.facilityDetailsView) {
      this.facilityDetailsView.destroy()
    }

    // Create new details view
    if (this.detailsPanel && this.selectedFacility) {
      this.facilityDetailsView = new FacilityDetailsView(
        this,
        0,
        0,
        this.selectedFacility,
        this.worldModel,
        {
          onProductionChange: (newType) => {
            this.selectedFacility!.changeProduction(newType)
            this.refreshFacilitiesList()
          },
          onWarehouseChange: (warehouseId) => {
            this.selectedFacility!.setOutputWarehouse(warehouseId)
          },
          onUpgrade: () => {
            this.showUpgradeDialog()
          },
          onSell: () => {
            this.sellFacility()
          },
        }
      )
      this.detailsPanel.add(this.facilityDetailsView)
    }
  }

  private showFacilityPurchase() {
    // TODO: Implement facility purchase dialog
    console.log('Show facility purchase dialog')
  }

  private showUpgradeDialog() {
    // TODO: Implement upgrade dialog
    console.log('Show upgrade dialog')
  }

  private sellFacility() {
    if (!this.selectedFacility) return

    const sellValue = this.selectedFacility.getSellValue()
    this.worldModel.addMoney(sellValue)

    // Remove facility
    const index = this.worldModel.productionFacilities.indexOf(this.selectedFacility)
    if (index > -1) {
      this.worldModel.productionFacilities.splice(index, 1)
    }

    this.selectedFacility = undefined
    this.refreshFacilitiesList()

    if (this.facilityDetailsView) {
      this.facilityDetailsView.destroy()
      this.facilityDetailsView = undefined
    }
  }

  private createBackButton() {
    const { width } = this.cameras.main

    this.backButton = this.add.container(width - 100, 170)

    const bg = this.add.rectangle(0, 0, 120, 40, Colors.background.cardHover, 0.9)
    bg.setStrokeStyle(Borders.width.normal, Colors.ui.border)
    bg.setInteractive()
    this.backButton.add(bg)

    const text = this.add.text(0, 0, 'Back', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    text.setOrigin(0.5)
    this.backButton.add(text)

    bg.on('pointerover', () => {
      bg.setFillStyle(Colors.background.card, 1)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(Colors.background.cardHover, 0.9)
    })

    bg.on('pointerdown', () => {
      this.goBack()
    })

    this.backButton.setDepth(DepthRegistry.UI_ELEMENTS)
  }

  private goBack() {
    this.scene.stop()
    this.scene.wake(sceneRegistry.BOARD_SCENE)
  }

  update() {
    // Update logic if needed
  }
}