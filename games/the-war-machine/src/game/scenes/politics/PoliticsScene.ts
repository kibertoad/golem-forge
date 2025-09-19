import type { GlobalSceneEvents } from '@potato-golem/core'
import { PotatoScene } from '@potato-golem/ui'
import type { EventEmitter } from 'emitix'
import { StatusBar } from '../../components/StatusBar.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import type { WarSystem } from '../../model/WarSystem.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { Borders, Colors, Dimensions, Typography } from '../../registries/styleRegistry.ts'
import { StabilityView } from './tabs/StabilityView.ts'
import { WarsView } from './tabs/WarsView.ts'

interface PoliticsSceneDependencies {
  globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>
  worldModel: WorldModel
  warSystem: WarSystem
}

export enum PoliticsTab {
  STABILITY = 'Stability',
  WARS = 'Wars',
  INSURGENCY = 'Insurgency',
  ALLIANCES = 'Alliances',
}

export class PoliticsScene extends PotatoScene {
  private worldModel: WorldModel
  private warSystem: WarSystem
  private currentTab: PoliticsTab = PoliticsTab.STABILITY
  private tabButtons: Map<PoliticsTab, Phaser.GameObjects.Container> = new Map()
  public contentContainer?: Phaser.GameObjects.Container
  public contentBg?: Phaser.GameObjects.Rectangle
  private currentView?: Phaser.GameObjects.Container

  constructor({ globalSceneEventEmitter, worldModel, warSystem }: PoliticsSceneDependencies) {
    super(globalSceneEventEmitter, sceneRegistry.POLITICS_SCENE)
    this.worldModel = worldModel
    this.warSystem = warSystem
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
    this.switchTab(PoliticsTab.STABILITY)

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

    const title = this.add.text(740, 30, 'POLITICS & DIPLOMACY', {
      fontSize: Typography.fontSize.title,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    title.setOrigin(0.5)
    title.setDepth(DepthRegistry.UI_TEXT)

    // Show money using StatusBar that auto-updates
    const statusBar = new StatusBar(this, this.worldModel)
    statusBar.setDepth(DepthRegistry.UI_TEXT)
  }

  private createTabs() {
    const tabs = Object.values(PoliticsTab)
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
        this.switchTab(tab as PoliticsTab)
      })

      container.setDepth(DepthRegistry.UI_ELEMENTS)
      this.tabButtons.set(tab as PoliticsTab, container)
    })
  }

  private createContentArea() {
    // Content background
    this.contentBg = this.add.rectangle(740, 440, 1400, 500, Colors.background.tertiary)
    this.contentBg.setDepth(DepthRegistry.UI_BACKGROUND)

    // Content container
    this.contentContainer = this.add.container(740, 440)
    this.contentContainer.setDepth(DepthRegistry.UI_ELEMENTS)
  }

  private switchTab(tab: PoliticsTab) {
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

    // Create new view based on tab
    switch (tab) {
      case PoliticsTab.STABILITY:
        this.currentView = new StabilityView(this, 0, 0, this.worldModel)
        break
      case PoliticsTab.WARS:
        this.currentView = new WarsView(this, 0, 0, this.worldModel, this.warSystem)
        break
      case PoliticsTab.INSURGENCY:
        this.showComingSoon('Insurgency Tracking')
        break
      case PoliticsTab.ALLIANCES:
        this.showComingSoon('Alliance Management')
        break
    }

    if (this.currentView && this.contentContainer) {
      this.contentContainer.add(this.currentView)
    }
  }

  private showComingSoon(feature: string) {
    const text = this.add.text(0, 0, `${feature} - Coming Soon`, {
      fontSize: Typography.fontSize.h3,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.muted,
    })
    text.setOrigin(0.5)

    this.currentView = this.add.container(0, 0)
    this.currentView.add(text)
  }

  private createBackButton() {
    const { width } = this.cameras.main
    const backButton = this.add.container(width - 100, 170)

    const bg = this.add.rectangle(0, 0, 150, 50, Colors.background.cardHover)
    bg.setInteractive()
    backButton.add(bg)

    const text = this.add.text(0, 0, '← Back', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    text.setOrigin(0.5)
    backButton.add(text)

    bg.on('pointerover', () => bg.setFillStyle(Colors.background.card))
    bg.on('pointerout', () => bg.setFillStyle(Colors.background.cardHover))
    bg.on('pointerdown', () => this.goBack())

    backButton.setDepth(DepthRegistry.UI_ELEMENTS)
  }

  private goBack() {
    this.scene.stop()
    this.scene.wake(sceneRegistry.BOARD_SCENE)
  }
}