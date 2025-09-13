import { GameObjects } from 'phaser'
import type { PotatoScene } from '@potato-golem/ui'
import { ArmsManufacturer, manufacturerDetails, type ManufacturerInfo } from '../../../model/enums/ArmsManufacturer.ts'
import { DepthRegistry } from '../../../registries/depthRegistry.ts'

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
    onSelect: (manufacturer: ArmsManufacturer | null) => void
  ) {
    super(scene, scene.cameras.main.width / 2, scene.cameras.main.height / 2)
    this.onSelectCallback = onSelect

    // Create overlay
    this.overlay = scene.add.graphics()
    this.overlay.fillStyle(0x000000, 0.8)
    this.overlay.fillRect(
      -scene.cameras.main.width / 2,
      -scene.cameras.main.height / 2,
      scene.cameras.main.width,
      scene.cameras.main.height
    )
    this.add(this.overlay)

    // Title
    const title = scene.add.text(0, -250, 'SELECT VENDOR CONTACT', {
      fontSize: '36px',
      fontFamily: 'Courier',
      color: '#ffff00',
      fontStyle: 'bold',
    })
    title.setOrigin(0.5)
    this.add(title)

    const subtitle = scene.add.text(0, -210, 'Choose one manufacturer to establish contact with', {
      fontSize: '20px',
      fontFamily: 'Courier',
      color: '#ffffff',
    })
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
    const cardWidth = 280
    const cardHeight = 400
    const spacing = 30
    const totalWidth = vendors.length * cardWidth + (vendors.length - 1) * spacing
    const startX = -totalWidth / 2 + cardWidth / 2

    vendors.forEach((vendor, index) => {
      const info = manufacturerDetails[vendor]
      const cardX = startX + index * (cardWidth + spacing)
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
    height: number
  ): GameObjects.Container {
    const card = scene.add.container(x, y)

    // Card background
    const bg = scene.add.graphics()
    bg.fillStyle(0x1a1a1a, 0.95)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10)
    bg.lineStyle(3, 0x444444, 1)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10)
    card.add(bg)

    // Glow effect for hover
    const glowBg = scene.add.graphics()
    glowBg.lineStyle(4, 0x00ffff, 0)
    glowBg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10)
    glowBg.setVisible(false)
    card.add(glowBg)

    // Manufacturer name
    const nameText = scene.add.text(0, -height / 2 + 30, info.displayName, {
      fontSize: '22px',
      fontFamily: 'Courier',
      color: '#00ffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 20 },
    })
    nameText.setOrigin(0.5)
    card.add(nameText)

    // Country
    const countryText = scene.add.text(0, -height / 2 + 65, info.country, {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#888888',
    })
    countryText.setOrigin(0.5)
    card.add(countryText)

    // Prestige stars
    const prestigeY = -height / 2 + 100
    const starText = '★'.repeat(info.prestigeLevel) + '☆'.repeat(5 - info.prestigeLevel)
    const prestigeText = scene.add.text(0, prestigeY, starText, {
      fontSize: '24px',
      fontFamily: 'Courier',
      color: '#ffaa00',
    })
    prestigeText.setOrigin(0.5)
    card.add(prestigeText)

    // Technology level
    const techY = prestigeY + 35
    const techLabel = scene.add.text(-width / 2 + 20, techY, 'Tech:', {
      fontSize: '16px',
      fontFamily: 'Courier',
      color: '#aaaaaa',
    })
    card.add(techLabel)

    const techLevels = this.createLevelIndicators(scene, -width / 2 + 85, techY, info.technologyLevel, 5, 0x00aaff)
    card.add(techLevels)

    // Manufacturing scale - increased spacing from 30 to 45
    const scaleY = techY + 45
    const scaleLabel = scene.add.text(-width / 2 + 20, scaleY, 'Scale:', {
      fontSize: '16px',
      fontFamily: 'Courier',
      color: '#aaaaaa',
    })
    card.add(scaleLabel)

    const scaleLevels = this.createLevelIndicators(scene, -width / 2 + 85, scaleY, info.manufacturingScale, 5, 0x00ff00)
    card.add(scaleLevels)

    // Specialties - adjusted spacing due to increased scale row position
    const specY = scaleY + 45
    const specTitle = scene.add.text(0, specY, 'SPECIALTIES', {
      fontSize: '16px',
      fontFamily: 'Courier',
      color: '#888888',
      fontStyle: 'bold',
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
      tagBg.fillStyle(0x004444, 0.6)
      tagBg.fillRoundedRect(-width / 2 + 20, tagY - 10, width - 40, 22, 3)
      card.add(tagBg)

      const branchText = scene.add.text(0, tagY, branch.replace(/_/g, ' '), {
        fontSize: '14px',
        fontFamily: 'Courier',
        color: '#00ffff',
      })
      branchText.setOrigin(0.5)
      card.add(branchText)
    })

    // Description - positioned below the last specialty tag
    const descY = lastTagY + 35
    const maxDescY = height / 2 - 30 // Maximum Y position to stay within card
    const actualDescY = Math.min(descY, maxDescY)

    const descText = scene.add.text(0, actualDescY, info.description.substring(0, 80) + '...', {
      fontSize: '14px',
      fontFamily: 'Courier',
      color: '#cccccc',
      align: 'center',
      wordWrap: { width: width - 30 },
    })
    descText.setOrigin(0.5, 0) // Top-aligned instead of center
    card.add(descText)

    // Make card interactive
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    )

    bg.on('pointerover', () => {
      glowBg.clear()
      glowBg.lineStyle(4, 0x00ffff, 0.8)
      glowBg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10)
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
    color: number
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
        box.fillRoundedRect(boxX, -boxSize / 2, boxSize, boxSize, 3)
        box.lineStyle(1, color, 1)
        box.strokeRoundedRect(boxX, -boxSize / 2, boxSize, boxSize, 3)
      } else {
        // Empty box
        box.fillStyle(0x222222, 0.4)
        box.fillRoundedRect(boxX, -boxSize / 2, boxSize, boxSize, 3)
        box.lineStyle(1, 0x444444, 0.6)
        box.strokeRoundedRect(boxX, -boxSize / 2, boxSize, boxSize, 3)
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
    confirmBg.fillStyle(0x00aa00, 0.8)
    confirmBg.fillRoundedRect(-100, -25, 200, 50, 5)
    confirmBg.lineStyle(2, 0x00ff00, 1)
    confirmBg.strokeRoundedRect(-100, -25, 200, 50, 5)
    confirmContainer.add(confirmBg)

    const confirmText = this.scene.add.text(0, 0, 'ESTABLISH CONTACT', {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#ffffff',
    })
    confirmText.setOrigin(0.5)
    confirmContainer.add(confirmText)

    this.add(confirmContainer)

    confirmBg.setInteractive(
      new Phaser.Geom.Rectangle(-100, -25, 200, 50),
      Phaser.Geom.Rectangle.Contains
    )

    confirmBg.on('pointerdown', () => {
      this.onSelectCallback(manufacturer)
      this.destroy()
    })
  }

  private showNoContactsMessage(scene: PotatoScene) {
    const msgBg = scene.add.graphics()
    msgBg.fillStyle(0x330000, 0.9)
    msgBg.fillRoundedRect(-300, -100, 600, 200, 10)
    msgBg.lineStyle(2, 0xff0000, 0.8)
    msgBg.strokeRoundedRect(-300, -100, 600, 200, 10)
    this.add(msgBg)

    const msgText = scene.add.text(0, -30, 'NO NEW CONTACTS AVAILABLE', {
      fontSize: '28px',
      fontFamily: 'Courier',
      color: '#ff4444',
      fontStyle: 'bold',
    })
    msgText.setOrigin(0.5)
    this.add(msgText)

    const subText = scene.add.text(0, 20, 'You failed to establish any new vendor contacts.\nAll eligible manufacturers are already known to you.', {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#ffffff',
      align: 'center',
    })
    subText.setOrigin(0.5)
    this.add(subText)

    const closeBtn = scene.add.container(0, 100)
    const btnBg = scene.add.graphics()
    btnBg.fillStyle(0x444444, 0.8)
    btnBg.fillRoundedRect(-80, -20, 160, 40, 5)
    btnBg.lineStyle(2, 0x888888, 1)
    btnBg.strokeRoundedRect(-80, -20, 160, 40, 5)
    closeBtn.add(btnBg)

    const btnText = scene.add.text(0, 0, 'CONTINUE', {
      fontSize: '20px',
      fontFamily: 'Courier',
      color: '#ffffff',
    })
    btnText.setOrigin(0.5)
    closeBtn.add(btnText)
    this.add(closeBtn)

    btnBg.setInteractive(
      new Phaser.Geom.Rectangle(-80, -20, 160, 40),
      Phaser.Geom.Rectangle.Contains
    )

    btnBg.on('pointerdown', () => {
      this.onSelectCallback(null)
      this.destroy()
    })
  }
}