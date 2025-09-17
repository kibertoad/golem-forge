import type { GlobalSceneEvents } from '@potato-golem/core'
import { PotatoScene } from '@potato-golem/ui'
import type { EventEmitter } from 'emitix'
import { StatusBar } from '../../components/StatusBar.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { Colors, Dimensions, Typography } from '../../registries/styleRegistry.ts'
import { BlackMarketView } from './tabs/BlackMarketView.ts'
import { VendorsView } from './tabs/VendorsView.ts'

interface ContactsSceneDependencies {
  globalSceneEventEmitter: EventEmitter<GlobalSceneEvents>
  worldModel: WorldModel
}

export enum ContactTab {
  BLACK_MARKET = 'Black Market',
  VENDORS = 'Vendors',
  INSURGENTS = 'Insurgents',
  STATE_ACTORS = 'State Actors',
  MERCENARIES = 'Mercenaries',
  BROKERS = 'Brokers',
}

export class ContactsScene extends PotatoScene {
  private worldModel: WorldModel
  private currentTab: ContactTab = ContactTab.BLACK_MARKET
  private tabButtons: Map<ContactTab, Phaser.GameObjects.Container> = new Map()
  private contentContainer?: Phaser.GameObjects.Container
  private contentBg?: Phaser.GameObjects.Rectangle
  private currentView?: Phaser.GameObjects.Container

  constructor({ globalSceneEventEmitter, worldModel }: ContactsSceneDependencies) {
    super(globalSceneEventEmitter, sceneRegistry.CONTACTS_SCENE)
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
    this.switchTab(ContactTab.BLACK_MARKET)

    // Create back button
    this.createBackButton()
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

    const title = this.add.text(740, 30, 'CONTACTS', {
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
    const tabs = Object.values(ContactTab)
    const tabWidth = Dimensions.tab.width - 60 // Narrower to fit 6 tabs
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
        this.switchTab(tab as ContactTab)
      })

      container.setDepth(DepthRegistry.UI_ELEMENTS)
      this.tabButtons.set(tab as ContactTab, container)
    })
  }

  private createContentArea() {
    // Content background - will be resized based on content
    this.contentBg = this.add.rectangle(740, 440, 1400, 500, Colors.background.tertiary)
    this.contentBg.setDepth(DepthRegistry.UI_BACKGROUND)

    // Content container
    this.contentContainer = this.add.container(740, 440)
    this.contentContainer.setDepth(DepthRegistry.UI_ELEMENTS)
  }

  private switchTab(tab: ContactTab) {
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
      case ContactTab.BLACK_MARKET:
        this.showBlackMarketView()
        break
      case ContactTab.VENDORS:
        this.showVendorsView()
        break
      case ContactTab.INSURGENTS:
        this.showInsurgentsView()
        break
      case ContactTab.STATE_ACTORS:
        this.showStateActorsView()
        break
      case ContactTab.MERCENARIES:
        this.showMercenariesView()
        break
      case ContactTab.BROKERS:
        this.showBrokersView()
        break
    }
  }

  private showBlackMarketView() {
    this.currentView = new BlackMarketView(this, this.worldModel)
    this.contentContainer?.add(this.currentView)

    if (this.contentBg && this.contentContainer) {
      // Elements in BlackMarketView relative to container center:
      // - Title at y: -230
      // - Filters at y: -180 (extend to about -30)
      // - Stock list at y: 20
      // - 10 items, each 45px = 450px total
      // - List bottom at: 20 + 450 = 470

      // Simple approach: make frame big enough and position both together
      const frameHeight = 950 // Extra large to definitely fit everything
      const frameTop = 190 // Just below tabs
      const frameCenterY = frameTop + frameHeight / 2 // 190 + 450 = 640

      // Position both frame and container at the same Y
      this.contentBg.setSize(1400, frameHeight)
      this.contentBg.y = frameCenterY
      this.contentContainer.y = frameCenterY
    }
  }

  private showVendorsView() {
    this.currentView = new VendorsView(this, this.worldModel)
    this.contentContainer?.add(this.currentView)

    // Reset content background to default size and position
    if (this.contentBg) {
      this.contentBg.setSize(1400, 500)
      this.contentBg.y = 440
    }
    if (this.contentContainer) {
      this.contentContainer.y = 440
    }
  }

  private showInsurgentsView() {
    this.currentView = this.add.container(0, 0)

    const text = this.add.text(0, 0, 'Insurgent Contacts\n\nComing Soon', {
      fontSize: Typography.fontSize.h4,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.disabled,
      align: 'center',
    })
    text.setOrigin(0.5)
    this.currentView.add(text)

    this.contentContainer?.add(this.currentView)

    // Reset content background to default size and position
    if (this.contentBg) {
      this.contentBg.setSize(1400, 500)
      this.contentBg.y = 440
    }
    if (this.contentContainer) {
      this.contentContainer.y = 440
    }
  }

  private showStateActorsView() {
    this.currentView = this.add.container(0, 0)

    const text = this.add.text(0, 0, 'State Actor Contacts\n\nComing Soon', {
      fontSize: Typography.fontSize.h4,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.disabled,
      align: 'center',
    })
    text.setOrigin(0.5)
    this.currentView.add(text)

    this.contentContainer?.add(this.currentView)

    // Reset content background to default size and position
    if (this.contentBg) {
      this.contentBg.setSize(1400, 500)
      this.contentBg.y = 440
    }
    if (this.contentContainer) {
      this.contentContainer.y = 440
    }
  }

  private showMercenariesView() {
    this.currentView = this.add.container(0, 0)

    const text = this.add.text(0, 0, 'Mercenary Contacts\n\nComing Soon', {
      fontSize: Typography.fontSize.h4,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.disabled,
      align: 'center',
    })
    text.setOrigin(0.5)
    this.currentView.add(text)

    this.contentContainer?.add(this.currentView)

    // Reset content background to default size and position
    if (this.contentBg) {
      this.contentBg.setSize(1400, 500)
      this.contentBg.y = 440
    }
    if (this.contentContainer) {
      this.contentContainer.y = 440
    }
  }

  private showBrokersView() {
    this.currentView = this.add.container(0, 0)

    const text = this.add.text(0, 0, 'Arms Brokers\n\nComing Soon', {
      fontSize: Typography.fontSize.h4,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.disabled,
      align: 'center',
    })
    text.setOrigin(0.5)
    this.currentView.add(text)

    this.contentContainer?.add(this.currentView)

    // Reset content background to default size and position
    if (this.contentBg) {
      this.contentBg.setSize(1400, 500)
      this.contentBg.y = 440
    }
    if (this.contentContainer) {
      this.contentContainer.y = 440
    }
  }

  private createBackButton() {
    // Position in top-right corner
    const backButton = this.add.container(1380, 50)

    const bg = this.add.rectangle(
      0,
      0,
      Dimensions.button.small.width,
      Dimensions.button.small.height,
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
    bg.on('pointerdown', () => {
      this.goBack()
    })

    backButton.setDepth(DepthRegistry.UI_ELEMENTS)

    // Add right-click to go back
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.goBack()
      }
    })
  }

  private goBack() {
    this.scene.stop() // Stop current scene
    this.scene.wake(sceneRegistry.BOARD_SCENE) // Wake the board scene
  }

  update() {
    // Update logic if needed
  }
}
