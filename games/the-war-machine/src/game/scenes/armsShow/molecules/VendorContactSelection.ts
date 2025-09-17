import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import { GameObjects } from 'phaser'
import {
  type ArmsManufacturer,
  type ManufacturerInfo,
  manufacturerDetails,
} from '../../../model/enums/ArmsManufacturer.ts'
import { DepthRegistry } from '../../../registries/depthRegistry.ts'
import { getScreenCenter, LayoutRegistry } from '../../../registries/layoutRegistry.ts'
import { Borders, Colors, colorToString, Typography } from '../../../registries/styleRegistry.ts'

export interface VendorCard {
  manufacturer: ArmsManufacturer
  info: ManufacturerInfo
}

export class VendorContactSelection extends GameObjects.Container {
  private overlay: GameObjects.Graphics
  private cards: GameObjects.Container[] = []
  private selectedCard: VendorCard | null = null
  private onSelectCallback: (manufacturer: ArmsManufacturer | null) => void

  constructor(
    scene: PotatoScene,
    vendors: ArmsManufacturer[],
    onSelect: (manufacturer: ArmsManufacturer | null) => void,
  ) {
    // Use actual camera center instead of hardcoded values
    const center = getScreenCenter(scene)
    super(scene, center.x, center.y)
    this.onSelectCallback = onSelect

    // Create overlay
    this.overlay = scene.add.graphics()
    this.overlay.fillStyle(Colors.selection.overlayBg, Colors.selection.overlayAlpha)
    this.overlay.fillRect(-center.width / 2, -center.height / 2, center.width, center.height)
    this.add(this.overlay)

    // Title
    const title = scene.add.text(0, LayoutRegistry.selection.title.y, 'SELECT VENDOR CONTACT', {
      fontSize: Typography.fontSize.h2,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: Typography.fontStyle.bold,
    })
    title.setOrigin(0.5)
    this.add(title)

    const subtitle = scene.add.text(
      0,
      LayoutRegistry.selection.title.y + 40,
      'Choose one manufacturer to establish contact with',
      {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.secondary,
      },
    )
    subtitle.setOrigin(0.5)
    this.add(subtitle)

    // Create cards
    this.createVendorCards(scene, vendors)

    // Skip button if no new contacts available
    if (vendors.length === 0) {
      this.showNoContactsMessage(scene)
    }

    scene.add.existing(this)
    this.setDepth(DepthRegistry.MODAL)
  }

  private createVendorCards(scene: PotatoScene, vendors: ArmsManufacturer[]) {
    const cardWidth = LayoutRegistry.selection.tierCards.width
    const cardHeight = 400 // Taller for vendor cards

    vendors.forEach((vendor, index) => {
      const info = manufacturerDetails[vendor]
      const cardX = LayoutRegistry.selection.tierCards.getXPosition(index, vendors.length)
      const card = this.createCard(scene, cardX, 0, vendor, info, cardWidth, cardHeight)
      this.cards.push(card)
      this.add(card)
    })
  }

  private createCard(
    scene: PotatoScene,
    x: number,
    y: number,
    manufacturer: ArmsManufacturer,
    info: ManufacturerInfo,
    width: number,
    height: number,
  ): GameObjects.Container {
    const card = scene.add.container(x, y)

    // Card background
    const bg = scene.add.graphics()
    bg.fillStyle(Colors.selection.titleBg, 0.95)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, Borders.radius.medium)
    bg.lineStyle(Borders.width.thick, Colors.selection.cardBorder, 1)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, Borders.radius.medium)
    card.add(bg)

    // Glow effect for hover
    const glowBg = scene.add.graphics()
    glowBg.lineStyle(Borders.width.heavy, Colors.selection.vendorGlow, 0)
    glowBg.strokeRoundedRect(-width / 2, -height / 2, width, height, Borders.radius.medium)
    glowBg.setVisible(false)
    card.add(glowBg)

    // Manufacturer name
    const nameText = scene.add.text(0, -height / 2 + 30, info.displayName, {
      fontSize: Typography.fontSize.h5,
      fontFamily: Typography.fontFamily.monospace,
      color: colorToString(Colors.selection.vendorGlow),
      fontStyle: Typography.fontStyle.bold,
      align: 'center',
      wordWrap: { width: width - 20 },
    })
    nameText.setOrigin(0.5)
    card.add(nameText)

    // Country
    const countryText = scene.add.text(0, -height / 2 + 65, info.country, {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.text.muted,
    })
    countryText.setOrigin(0.5)
    card.add(countryText)

    // Prestige stars
    const prestigeY = -height / 2 + 100
    const starText = '★'.repeat(info.prestigeLevel) + '☆'.repeat(5 - info.prestigeLevel)
    const prestigeText = scene.add.text(0, prestigeY, starText, {
      fontSize: Typography.fontSize.h4,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.selection.salaryText,
    })
    prestigeText.setOrigin(0.5)
    card.add(prestigeText)

    // Technology level
    const techY = prestigeY + 35
    const techLabel = scene.add.text(-width / 2 + 20, techY, 'Tech:', {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.text.secondary,
    })
    card.add(techLabel)

    const techLevels = this.createLevelIndicators(
      scene,
      -width / 2 + 85,
      techY,
      info.technologyLevel,
      5,
      Colors.selection.techLevelFill,
    )
    card.add(techLevels)

    // Manufacturing scale - increased spacing from 30 to 45
    const scaleY = techY + 45
    const scaleLabel = scene.add.text(-width / 2 + 20, scaleY, 'Scale:', {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.text.secondary,
    })
    card.add(scaleLabel)

    const scaleLevels = this.createLevelIndicators(
      scene,
      -width / 2 + 85,
      scaleY,
      info.manufacturingScale,
      5,
      Colors.selection.scaleLevelFill,
    )
    card.add(scaleLevels)

    // Specialties - adjusted spacing due to increased scale row position
    const specY = scaleY + 45
    const specTitle = scene.add.text(0, specY, 'SPECIALTIES', {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.text.muted,
      fontStyle: Typography.fontStyle.bold,
    })
    specTitle.setOrigin(0.5)
    card.add(specTitle)

    // Branch tags
    const branches = info.branches.slice(0, 3) // Show max 3 branches
    let lastTagY = specY + 30
    branches.forEach((branch: string, idx: number) => {
      const tagY = specY + 30 + idx * 25
      lastTagY = tagY
      const tagBg = scene.add.graphics()
      tagBg.fillStyle(Colors.selection.specialtyBadge, 0.6)
      tagBg.fillRoundedRect(-width / 2 + 20, tagY - 10, width - 40, 22, Borders.radius.small)
      card.add(tagBg)

      const branchText = scene.add.text(0, tagY, branch.replace(/_/g, ' '), {
        fontSize: Typography.fontSize.tiny,
        fontFamily: Typography.fontFamily.monospace,
        color: colorToString(Colors.selection.vendorGlow),
      })
      branchText.setOrigin(0.5)
      card.add(branchText)
    })

    // Description - positioned below the last specialty tag
    const descY = lastTagY + 35
    const maxDescY = height / 2 - 30 // Maximum Y position to stay within card
    const actualDescY = Math.min(descY, maxDescY)

    const descText = scene.add.text(0, actualDescY, `${info.description.substring(0, 80)}...`, {
      fontSize: Typography.fontSize.tiny,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.text.secondary,
      align: 'center',
      wordWrap: { width: width - 30 },
    })
    descText.setOrigin(0.5, 0) // Top-aligned instead of center
    card.add(descText)

    // Make card interactive
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains,
    )

    bg.on('pointerover', () => {
      glowBg.clear()
      glowBg.lineStyle(Borders.width.heavy, Colors.selection.vendorGlow, 0.8)
      glowBg.strokeRoundedRect(-width / 2, -height / 2, width, height, Borders.radius.medium)
      glowBg.setVisible(true)
      card.setScale(1.05)
    })

    bg.on('pointerout', () => {
      glowBg.setVisible(false)
      card.setScale(1)
    })

    bg.on('pointerdown', () => {
      this.selectCard(manufacturer, info)
    })

    return card
  }

  private createLevelIndicators(
    scene: PotatoScene,
    x: number,
    y: number,
    value: number,
    maxValue: number,
    color: number,
  ): GameObjects.Container {
    const container = scene.add.container(x, y)
    const boxSize = 28
    const spacing = 6

    for (let i = 0; i < maxValue; i++) {
      const boxX = i * (boxSize + spacing)
      const box = scene.add.graphics()

      if (i < value) {
        // Filled box
        box.fillStyle(color, 0.9)
        box.fillRoundedRect(boxX, -boxSize / 2, boxSize, boxSize, Borders.radius.small)
        box.lineStyle(Borders.width.thin, color, 1)
        box.strokeRoundedRect(boxX, -boxSize / 2, boxSize, boxSize, Borders.radius.small)
      } else {
        // Empty box
        box.fillStyle(Colors.selection.emptyLevelBox, 0.4)
        box.fillRoundedRect(boxX, -boxSize / 2, boxSize, boxSize, Borders.radius.small)
        box.lineStyle(Borders.width.thin, Colors.selection.emptyLevelBorder, 0.6)
        box.strokeRoundedRect(boxX, -boxSize / 2, boxSize, boxSize, Borders.radius.small)
      }

      container.add(box)
    }

    return container
  }

  private selectCard(manufacturer: ArmsManufacturer, info: ManufacturerInfo) {
    this.selectedCard = { manufacturer, info }

    // Show confirmation
    const confirmContainer = this.scene.add.container(0, 200)

    const confirmBg = this.scene.add.graphics()
    confirmBg.fillStyle(Colors.selection.confirmButton, 0.8)
    confirmBg.fillRoundedRect(-100, -25, 200, 50, Borders.radius.small)
    confirmBg.lineStyle(Borders.width.normal, Colors.selection.confirmButtonHover, 1)
    confirmBg.strokeRoundedRect(-100, -25, 200, 50, Borders.radius.small)
    confirmContainer.add(confirmBg)

    const confirmText = this.scene.add.text(0, 0, 'ESTABLISH CONTACT', {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.text.primary,
    })
    confirmText.setOrigin(0.5)
    confirmContainer.add(confirmText)

    this.add(confirmContainer)

    confirmBg.setInteractive(
      new Phaser.Geom.Rectangle(-100, -25, 200, 50),
      Phaser.Geom.Rectangle.Contains,
    )

    confirmBg.on('pointerdown', () => {
      this.onSelectCallback(manufacturer)
      this.destroy()
    })
  }

  private showNoContactsMessage(scene: PotatoScene) {
    const msgBg = scene.add.graphics()
    msgBg.fillStyle(Colors.status.danger, 0.9)
    msgBg.fillRoundedRect(-300, -100, 600, 200, Borders.radius.medium)
    msgBg.lineStyle(Borders.width.normal, Colors.status.danger, 0.8)
    msgBg.strokeRoundedRect(-300, -100, 600, 200, Borders.radius.medium)
    this.add(msgBg)

    const msgText = scene.add.text(0, -30, 'NO NEW CONTACTS AVAILABLE', {
      fontSize: Typography.fontSize.h3,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.status.dangerText,
      fontStyle: Typography.fontStyle.bold,
    })
    msgText.setOrigin(0.5)
    this.add(msgText)

    const subText = scene.add.text(
      0,
      20,
      'You failed to establish any new vendor contacts.\nAll eligible manufacturers are already known to you.',
      {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.monospace,
        color: Colors.text.primary,
        align: 'center',
      },
    )
    subText.setOrigin(0.5)
    this.add(subText)

    const closeBtn = scene.add.container(0, 100)
    const btnBg = scene.add.graphics()
    btnBg.fillStyle(Colors.selection.skipButton, 0.8)
    btnBg.fillRoundedRect(-80, -20, 160, 40, Borders.radius.small)
    btnBg.lineStyle(Borders.width.normal, Colors.selection.skipButtonHover, 1)
    btnBg.strokeRoundedRect(-80, -20, 160, 40, Borders.radius.small)
    closeBtn.add(btnBg)

    const btnText = scene.add.text(0, 0, 'CONTINUE', {
      fontSize: Typography.fontSize.button,
      fontFamily: Typography.fontFamily.monospace,
      color: Colors.text.primary,
    })
    btnText.setOrigin(0.5)
    closeBtn.add(btnText)
    this.add(closeBtn)

    btnBg.setInteractive(
      new Phaser.Geom.Rectangle(-80, -20, 160, 40),
      Phaser.Geom.Rectangle.Contains,
    )

    btnBg.on('pointerdown', () => {
      this.onSelectCallback(null)
      this.destroy()
    })
  }
}
