import type { GlobalSceneEvents } from '@potato-golem/core'
import { PotatoScene } from '@potato-golem/ui'
import type { EventEmitter } from 'emitix'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import {
  Borders,
  Colors,
  Dimensions,
  Opacity,
  Spacing,
  StylePresets,
  Typography,
} from '../../registries/styleRegistry.ts'
import { WarehouseView } from './tabs/WarehouseView.ts'

interface AssetsSceneDependencies {
  globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>
  worldModel: WorldModel
}

export enum AssetTab {
  LOCATIONS = 'Locations',
  WAREHOUSES = 'Warehouses',
  FACILITIES = 'Facilities',
  SAFEHOUSES = 'Safehouses',
  BASES = 'Bases',
}

export class AssetsScene extends PotatoScene {
  private worldModel: WorldModel
  private currentTab: AssetTab = AssetTab.WAREHOUSES
  private tabButtons: Map<AssetTab, Phaser.GameObjects.Container> = new Map()
  public contentContainer?: Phaser.GameObjects.Container
  private currentView?: Phaser.GameObjects.Container
  private selectedLocationId?: string
  private locationBackgrounds: Map<string, Phaser.GameObjects.Rectangle> = new Map()

  constructor({ globalSceneEventEmitter, worldModel }: AssetsSceneDependencies) {
    super(globalSceneEventEmitter, sceneRegistry.ASSETS_SCENE)
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

    // Create tabs
    this.createTabs()

    // Create content area
    this.createContentArea()

    // Show initial tab
    this.switchTab(AssetTab.WAREHOUSES)

    // Create back button
    this.createBackButton()

    // Add right-click to go back
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.goBack()
      }
    })
  }

  private createHeader() {
    const headerBg = this.add.rectangle(
      740,
      50,
      Dimensions.scene.width,
      100,
      Colors.background.secondary,
    )
    headerBg.setDepth(DepthRegistry.UI_BACKGROUND)

    const title = this.add.text(740, 30, 'ASSETS MANAGEMENT', {
      fontSize: Typography.fontSize.title,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    title.setOrigin(0.5)
    title.setDepth(DepthRegistry.UI_TEXT)

    // Show money
    const money = this.add.text(1400, 70, `$${this.worldModel.gameStatus.money.toLocaleString()}`, {
      fontSize: Typography.fontSize.h4,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.money.positive,
    })
    money.setOrigin(1, 0.5)
    money.setDepth(DepthRegistry.UI_TEXT)
  }

  private createTabs() {
    const tabs = Object.values(AssetTab)
    const tabWidth = Dimensions.tab.width
    const startX = 740 - (tabs.length * tabWidth) / 2 + tabWidth / 2

    tabs.forEach((tab, index) => {
      const x = startX + index * tabWidth
      const y = 120

      const container = this.add.container(x, y)

      // Tab background
      const bg = this.add.rectangle(
        0,
        0,
        tabWidth - Dimensions.tab.gap,
        Dimensions.tab.height,
        Colors.background.cardHover,
      )
      bg.setInteractive()
      container.add(bg)

      // Tab text
      const text = this.add.text(0, 0, tab, {
        fontSize: Typography.fontSize.button,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.primary,
      })
      text.setOrigin(0.5)
      container.add(text)

      // Add hover effect
      bg.on('pointerover', () => {
        if (this.currentTab !== tab) {
          bg.setFillStyle(Colors.background.card)
        }
      })

      bg.on('pointerout', () => {
        if (this.currentTab !== tab) {
          bg.setFillStyle(Colors.background.cardHover)
        }
      })

      bg.on('pointerdown', () => {
        this.switchTab(tab as AssetTab)
      })

      container.setDepth(DepthRegistry.UI_ELEMENTS)
      this.tabButtons.set(tab as AssetTab, container)
    })
  }

  private createContentArea() {
    // Content background
    const contentBg = this.add.rectangle(740, 440, 1400, 500, Colors.background.tertiary)
    contentBg.setDepth(DepthRegistry.UI_BACKGROUND)

    // Content container
    this.contentContainer = this.add.container(740, 440)
    this.contentContainer.setDepth(DepthRegistry.UI_ELEMENTS)
  }

  private switchTab(tab: AssetTab) {
    // Update tab visual states
    this.tabButtons.forEach((button, tabKey) => {
      const bg = button.getAt(0) as Phaser.GameObjects.Rectangle
      const text = button.getAt(1) as Phaser.GameObjects.Text

      if (tabKey === tab) {
        bg.setFillStyle(Colors.primary.main)
        text.setColor(Colors.text.primary)
      } else {
        bg.setFillStyle(Colors.background.cardHover)
        text.setColor(Colors.text.muted)
      }
    })

    this.currentTab = tab

    // Clear current view
    if (this.currentView) {
      this.currentView.destroy()
    }

    // Clear selections when switching tabs
    this.selectedLocationId = undefined
    this.locationBackgrounds.clear()

    // Create new view based on tab
    switch (tab) {
      case AssetTab.LOCATIONS:
        this.showLocationsView()
        break
      case AssetTab.WAREHOUSES:
        this.showWarehousesView()
        break
      case AssetTab.FACILITIES:
        this.showFacilitiesView()
        break
      case AssetTab.SAFEHOUSES:
        this.showSafehousesView()
        break
      case AssetTab.BASES:
        this.showBasesView()
        break
    }
  }

  private showLocationsView() {
    this.currentView = this.add.container(0, 0)

    const locations = this.worldModel.playerLocations

    const titleText = this.add.text(0, -200, `All Locations (${locations.length})`, {
      fontSize: Typography.fontSize.h3,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    titleText.setOrigin(0.5)
    this.currentView.add(titleText)

    // List all locations with improved layout
    locations.forEach((location, index) => {
      const y = -140 + index * 100

      // Location container with wider frame
      const locationContainer = this.add.container(-650, y)

      // Background
      const bg = this.add.rectangle(
        350,
        25,
        Dimensions.card.location.width,
        Dimensions.card.location.height,
        Colors.background.card,
      )
      bg.setStrokeStyle(Borders.width.normal, Colors.ui.border)
      bg.setInteractive()
      locationContainer.add(bg)

      // Store background reference for selection highlighting
      this.locationBackgrounds.set(location.id, bg)

      // Location type and name
      const nameText = this.add.text(
        10,
        5,
        `${location.type.toUpperCase()} - ${location.city}, ${location.country}`,
        {
          fontSize: '20px',
          fontFamily: 'Arial',
          color: '#ffffff',
          fontStyle: 'bold',
        },
      )
      locationContainer.add(nameText)

      // Stats on second line
      const statsText = this.add.text(
        10,
        35,
        `Size: ${location.size.toUpperCase()} | Legal: ${location.legality}/5 | Heat: ${location.heat}/10 | Concealment: ${location.concealment}/5 | Infrastructure: ${location.infrastructure}/5`,
        {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#94a3b8',
        },
      )
      locationContainer.add(statsText)

      // Maintenance cost
      const costText = this.add.text(
        600,
        20,
        `Upkeep: $${location.getMaintenanceCost().toLocaleString()}/week`,
        {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#fbbf24',
        },
      )
      costText.setOrigin(1, 0.5)
      locationContainer.add(costText)

      bg.on('pointerdown', () => {
        this.selectLocation(location.id)
      })

      bg.on('pointerover', () => {
        if (this.selectedLocationId !== location.id) {
          bg.setFillStyle(Colors.background.cardHover)
        }
      })

      bg.on('pointerout', () => {
        if (this.selectedLocationId !== location.id) {
          bg.setFillStyle(Colors.background.card)
        }
      })

      this.currentView?.add(locationContainer)
    })

    if (locations.length === 0) {
      const emptyText = this.add.text(0, 0, 'No locations owned', {
        fontSize: Typography.fontSize.h4,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.disabled,
      })
      emptyText.setOrigin(0.5)
      this.currentView.add(emptyText)
    }

    this.contentContainer?.add(this.currentView)
  }

  private showWarehousesView() {
    this.currentView = new WarehouseView(this, this.worldModel)
    this.contentContainer?.add(this.currentView)
  }

  private showFacilitiesView() {
    this.currentView = this.add.container(0, 0)

    const text = this.add.text(0, 0, 'Manufacturing Facilities\n\nComing Soon', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#64748b',
      align: 'center',
    })
    text.setOrigin(0.5)
    this.currentView.add(text)

    this.contentContainer?.add(this.currentView)
  }

  private showSafehousesView() {
    this.currentView = this.add.container(0, 0)

    const text = this.add.text(0, 0, 'Safehouses\n\nComing Soon', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#64748b',
      align: 'center',
    })
    text.setOrigin(0.5)
    this.currentView.add(text)

    this.contentContainer?.add(this.currentView)
  }

  private showBasesView() {
    this.currentView = this.add.container(0, 0)

    const text = this.add.text(0, 0, 'Military Bases\n\nComing Soon', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#64748b',
      align: 'center',
    })
    text.setOrigin(0.5)
    this.currentView.add(text)

    this.contentContainer?.add(this.currentView)
  }

  private createBackButton() {
    const backButton = this.add.container(100, 650)

    const bg = this.add.rectangle(
      0,
      0,
      Dimensions.button.default.width,
      Dimensions.button.default.height,
      Colors.background.cardHover,
    )
    bg.setInteractive()
    backButton.add(bg)

    const text = this.add.text(0, 0, 'BACK', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    text.setOrigin(0.5)
    backButton.add(text)

    bg.on('pointerover', () => bg.setFillStyle(Colors.background.card))
    bg.on('pointerout', () => bg.setFillStyle(Colors.background.cardHover))
    bg.on('pointerdown', () => this.goBack())

    backButton.setDepth(DepthRegistry.UI_ELEMENTS)
  }

  private goBack() {
    this.scene.stop() // Stop current scene
    this.scene.wake(sceneRegistry.BOARD_SCENE) // Wake the board scene
  }

  private selectLocation(locationId: string) {
    // Clear previous selection
    this.locationBackgrounds.forEach((bg, id) => {
      if (id === locationId) {
        // Highlight selected location
        bg.setFillStyle(Colors.primary.main, Opacity.selection) // Blue tinted background
        bg.setStrokeStyle(Borders.width.thick, Colors.primary.light) // Brighter blue border
      } else {
        // Reset non-selected locations
        bg.setFillStyle(Colors.background.card)
        bg.setStrokeStyle(Borders.width.normal, Colors.ui.border)
      }
    })

    this.selectedLocationId = locationId
  }

  update() {
    // Update logic if needed
  }
}
