import { PotatoScene } from '@potato-golem/ui'
import Phaser from 'phaser'
import type { Dependencies } from '../../diConfig.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { ShipIndicatorContainer } from './views/ShipIndicatorContainer.ts'

// === SLOT MACHINE SPRITESHEET CONFIG ===
const SLOT_SPRITESHEET_KEY = 'SLOT_MACHINE'
const SLOT_FRAME_WIDTH = 64
const SLOT_FRAME_HEIGHT = 64
const SLOT_COLUMNS = 9
const SLOT_ROWS = 1

// Example enemy slots - will be replaced with dynamic enemy data later
const exampleEnemySlots = [
  {
    name: 'Enemy Laser',
    reelSides: [
      { frame: 0, description: 'Miss', image: 'jam' },
      { frame: 1, description: 'Damage', image: 'damage' },
      { frame: 2, description: 'Damage', image: 'damage' },
      { frame: 3, description: 'Critical', image: 'critical' },
      { frame: 4, description: 'Miss', image: 'jam' },
      { frame: 5, description: 'Overheat', image: 'overheat' },
    ],
  },
  {
    name: 'Enemy Missile',
    reelSides: [
      { frame: 0, description: 'Damage', image: 'damage' },
      { frame: 1, description: 'Miss', image: 'jam' },
      { frame: 2, description: 'Double Damage', image: 'damage' },
      { frame: 3, description: 'Damage', image: 'damage' },
      { frame: 4, description: 'Critical', image: 'critical' },
      { frame: 5, description: 'Pierce', image: 'shield_pierce' },
    ],
  },
]

// --- Slot machine animation keys ---
const SLOT_ROLL_FRAMES = [0, 1, 2, 3, 4, 5, 6, 7, 8] // rolling animation frames

export class SpaceCombatScene extends PotatoScene {
  private playerSlotSprites: Phaser.GameObjects.Image[] = []
  private playerSlotsSelected: boolean[] = [] // index by flat list of all slots

  private enemySlotSprites: Phaser.GameObjects.Image[] = []
  private slotSidesOverlay?: Phaser.GameObjects.Container
  private slotSidesTooltip?: Phaser.GameObjects.Text

  private spinButton!: Phaser.GameObjects.Text
  private spinning = false
  private shipIndicatorContainer!: ShipIndicatorContainer
  private worldModel: WorldModel

  constructor(dependencies: Dependencies) {
    super(dependencies.globalSceneEventEmitter, { key: sceneRegistry.SPACE_COMBAT })
    this.worldModel = dependencies.worldModel
  }

  private getPlayerWeaponSections() {
    const weapons = this.worldModel.playerShip.weapons.map((weapon, index) => ({
      name: weapon.definition.name,
      reelSides: weapon.definition.defaultSlots.map((slot, slotIndex) => ({
        frame: slotIndex,
        description: slot.id,
        image: slot.image,
      })),
      enabled: true,
    }))

    return [
      {
        label: 'Weapons',
        slots: weapons,
      },
    ]
  }

  preload() {
    this.load.setPath('assets')
      /*
    this.load.spritesheet(SLOT_SPRITESHEET_KEY, 'rolll_slot.png', {
      frameWidth: SLOT_FRAME_WIDTH,
      frameHeight: SLOT_FRAME_HEIGHT,
    })

       */
    // Load individual slot side images
    this.load.setPath('assets/sides')
    console.log('[PRELOAD] Slot machine sprite sheet and side images queued for loading.')
  }

  create() {
    // --- SLOT SPINNING ANIMATION SETUP ---
    if (!this.anims.exists('slot-spin')) {
      this.anims.create({
        key: 'slot-spin',
        frames: this.anims.generateFrameNumbers(SLOT_SPRITESHEET_KEY, {
          start: 0,
          end: SLOT_ROLL_FRAMES.length - 1,
        }),
        frameRate: 20,
        repeat: -1,
      })
      console.log('[ANIM] Created slot-spin animation')
    }

    // Divide screen
    const midX = this.scale.width / 2
    this.add.rectangle(midX, this.scale.height / 2, 2, this.scale.height, 0x2a2a2a, 0.6)

    // --- ENEMY (RIGHT) ---
    const enemyAreaX = midX + 80 // add margin to right
    this.enemySlotSprites = []
    for (let i = 0; i < exampleEnemySlots.length; i++) {
      const slot = exampleEnemySlots[i]
      const x = enemyAreaX + i * 110 // more spacing between slots
      const y = 140
      const sprite = this.add
        .image(x, y, slot.reelSides[0].image)
        .setScale(0.2)
        .setInteractive({ cursor: 'pointer' })
        .setData('slotIndex', i)
        .setData('isEnemy', true)
        .on('pointerdown', () => this.showSlotSides(slot, x, y))
      this.enemySlotSprites.push(sprite)

      // Slot label (lower to y+60 so it's not touching slot)
      this.add
        .text(x, y + 60, slot.name, {
          fontSize: '15px',
          color: '#eaeaff',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5, 0)
    }

    // --- PLAYER (LEFT) ---
    let playerSlotY = 84 // room for indicators
    let slotIdx = 0
    this.playerSlotSprites = []
    this.playerSlotsSelected = []

    const playerSections = this.getPlayerWeaponSections()
    playerSections.forEach((section, sectionIdx) => {
      this.add.text(40, playerSlotY, section.label, {
        fontSize: '20px',
        color: '#fff9c0',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      })
      playerSlotY += 30 // slightly more vertical gap after section title

      section.slots.forEach((slot, i) => {
        const x = 110 + i * 120
        const y = playerSlotY
        const idx = slotIdx
        const sprite = this.add
          .image(x, y, slot.reelSides[0].image)
          .setScale(0.2)
          .setInteractive({
            cursor: (pointer: Phaser.Input.Pointer) =>
              pointer.rightButtonDown() ? 'pointer' : slot.enabled ? 'pointer' : 'not-allowed',
          })
          .setData('slotSection', sectionIdx)
          .setData('slotIndex', i)
          .setData('enabled', slot.enabled)
          .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) {
              this.showSlotSides(slot, x, y)
            } else if (slot.enabled) {
              this.playerSlotsSelected[idx] = !this.playerSlotsSelected[idx]
              sprite.setAlpha(this.playerSlotsSelected[idx] ? 1.0 : 0.7)
              console.log(
                `[SLOT SELECT] Player slot ${slot.name} selected = ${this.playerSlotsSelected[idx]}`,
              )
            }
          })
          .on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) pointer.event.preventDefault()
          })
        this.playerSlotSprites.push(sprite)

        this.add
          .text(x, y + 60, slot.name, {
            fontSize: '15px',
            color: slot.enabled ? '#baffc0' : '#aaaabb',
            fontFamily: 'monospace',
          })
          .setOrigin(0.5, 0)

        slotIdx++
      })

      playerSlotY += 98 // more vertical room per section (was 84)
    })

    this.playerSlotsSelected = this.playerSlotSprites.map(() => false)
    this.playerSlotSprites.forEach((sprite) => sprite.setAlpha(0.7))

    // --- SPIN BUTTON & REST UNCHANGED ---
    this.spinButton = this.add
      .text(this.scale.width / 2, this.scale.height - 56, 'Spin slots', {
        fontSize: '32px',
        color: '#e0ffbb',
        backgroundColor: '#222',
        fontFamily: 'monospace',
        padding: { x: 42, y: 16 },
      })
      .setOrigin(0.5, 0.5)
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => this.startSpinning())
      .setDepth(20)

    this.slotSidesTooltip = this.add
      .text(0, 0, '', {
        fontSize: '16px',
        color: '#fff8c0',
        backgroundColor: '#2a2a50',
        padding: { x: 8, y: 4 },
        wordWrap: { width: 200 },
      })
      .setDepth(40)
      .setVisible(false)

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, currentlyOver: any[]) => {
      if (!currentlyOver.length) this.hideSlotSides()
    })

    // --- SHIP INDICATORS ---
    this.shipIndicatorContainer = new ShipIndicatorContainer(this, { isShown: true })
    this.shipIndicatorContainer.renderShipIndicators(midX)

    console.log('[CREATE] Scene created. Slots and spin button initialized.')
  }

  // --- SLOT SIDES OVERLAY ---
  showSlotSides(slot: any, baseX: number, baseY: number) {
    this.hideSlotSides()
    console.log('[SLOT SIDES] Showing slot sides overlay for', slot.name)

    // Container: 2 columns x 3 rows grid, 48px cells
    const rows = 3,
      cols = 2,
      cell = 48,
      padding = 18
    const overlayX = Math.min(baseX, this.scale.width - (cols * cell + padding * 2))
    const overlayY = Math.max(24, baseY - 40)

    this.slotSidesOverlay = this.add.container(overlayX, overlayY).setDepth(30)
    // Background
    const bg = this.add
      .rectangle(0, 0, cols * cell + padding * 2, rows * cell + padding * 2, 0x222244, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffffff, 0.8)
    this.slotSidesOverlay.add(bg)

    // Add slot reel sides in grid
    for (let s = 0; s < 6; s++) {
      const sx = padding + (s % cols) * cell
      const sy = padding + Math.floor(s / cols) * cell
      const side = this.add
        .image(sx + cell / 2, sy + cell / 2, slot.reelSides[s].image)
        .setScale(0.15)

      // Tooltip logic
      side
        .setInteractive({ cursor: 'pointer' })
        .on('pointerover', () => {
          this.slotSidesTooltip!.setText(slot.reelSides[s].description)
          this.slotSidesTooltip!.setPosition(overlayX + cols * cell + 26, overlayY + sy)
          this.slotSidesTooltip!.setVisible(true)
          console.log(`[SLOT SIDES] Hovered on side ${s}: ${slot.reelSides[s].description}`)
        })
        .on('pointerout', () => {
          this.slotSidesTooltip!.setVisible(false)
        })

      this.slotSidesOverlay.add(side)
    }
    // Bring to front
    this.children.bringToTop(this.slotSidesOverlay)
  }

  hideSlotSides() {
    if (this.slotSidesOverlay) {
      this.slotSidesOverlay.destroy()
      this.slotSidesOverlay = undefined
      if (this.slotSidesTooltip) this.slotSidesTooltip.setVisible(false)
    }
  }

  // --- SPINNING LOGIC ---
  startSpinning() {
    if (this.spinning) {
      console.log('[SPIN] Already spinning, ignoring click.')
      return
    }
    this.spinning = true
    console.log('[SPIN] Spinning started!')

    // Find which player slots are selected
    const selectedSprites: Phaser.GameObjects.Image[] = []
    const playerSections = this.getPlayerWeaponSections()
    let idx = 0
    for (const section of playerSections) {
      for (const slot of section.slots) {
        if (this.playerSlotsSelected[idx]) {
          selectedSprites.push(this.playerSlotSprites[idx])
          console.log(`[SPIN] Will spin player slot at idx ${idx}`)
        }
        idx++
      }
    }
    if (!selectedSprites.length) {
      // No player slots selected, but still spin enemy slots
      this.spinEnemySlots()
      return
    }

    // --- SPIN player slots ---
    let slotSpinsDone = 0
    selectedSprites.forEach((sprite, i) => {
      if (!sprite) {
        console.error(`[SPIN] Sprite at ${i} missing!`)
        return
      }
      // Create spinning effect by rapidly changing the texture
      let spinCount = 0
      const spinInterval = this.time.addEvent({
        delay: 100,
        callback: () => {
          const randomSideIdx = Phaser.Math.Between(0, 8)
          const allSides = [
            'damage',
            'jam',
            'critical',
            'overheat',
            'shield_pierce',
            'shield_restore',
            'cooldown',
            'armour_restore',
            'stun',
          ]
          sprite.setTexture(allSides[randomSideIdx])
          spinCount++
          if (spinCount >= 8) {
            spinInterval.destroy()
          }
        },
        repeat: 7,
      })
      console.log(`[SPIN] Started slot spinning for sprite at idx ${i}`)

      // Animate position a little (scatter)
      const startX = sprite.x
      const startY = sprite.y
      const offsetX = Phaser.Math.Between(-18, 18)
      const offsetY = Phaser.Math.Between(-8, 8)

      this.tweens.add({
        targets: sprite,
        x: startX + offsetX,
        y: startY + offsetY,
        duration: 260,
        ease: 'Sine.InOut',
      })

      this.time.delayedCall(950 + i * 120, () => {
        const slotIdx = this.playerSlotSprites.indexOf(sprite)
        const playerSections = this.getPlayerWeaponSections()
        const slot = playerSections.flatMap((s) => s.slots)[slotIdx]
        const resultSide = Phaser.Math.Between(0, 5)
        sprite.setTexture(slot.reelSides[resultSide].image)
        this.tweens.add({
          targets: sprite,
          x: startX,
          y: startY,
          duration: 180,
          ease: 'Sine.InOut',
        })
        slotSpinsDone++
        console.log(
          `[SPIN] Player slot at idx ${i} stopped at side ${resultSide} (${slot.reelSides[resultSide].description})`,
        )
        if (slotSpinsDone === selectedSprites.length) {
          // After all player slots spin, spin enemy slots
          this.spinEnemySlots()
        }
      })
    })
  }

  spinEnemySlots() {
    // Spin all enemy slots at once, animation similar to player slots
    let done = 0
    this.enemySlotSprites.forEach((sprite, idx) => {
      // Create spinning effect for enemy slots
      let spinCount = 0
      const spinInterval = this.time.addEvent({
        delay: 120,
        callback: () => {
          const randomSideIdx = Phaser.Math.Between(0, 8)
          const allSides = [
            'damage',
            'jam',
            'critical',
            'overheat',
            'shield_pierce',
            'shield_restore',
            'cooldown',
            'armour_restore',
            'stun',
          ]
          sprite.setTexture(allSides[randomSideIdx])
          spinCount++
          if (spinCount >= 7) {
            spinInterval.destroy()
          }
        },
        repeat: 6,
      })
      console.log(`[ENEMY] Spinning enemy slot at idx ${idx}`)
      const startX = sprite.x
      const startY = sprite.y
      const offsetX = Phaser.Math.Between(-16, 16)
      const offsetY = Phaser.Math.Between(-10, 10)
      this.tweens.add({
        targets: sprite,
        x: startX + offsetX,
        y: startY + offsetY,
        duration: 260,
        ease: 'Sine.InOut',
      })
      this.time.delayedCall(900 + idx * 140, () => {
        const slot = exampleEnemySlots[idx]
        const resultSide = Phaser.Math.Between(0, 5)
        sprite.setTexture(slot.reelSides[resultSide].image)
        this.tweens.add({
          targets: sprite,
          x: startX,
          y: startY,
          duration: 180,
          ease: 'Sine.InOut',
        })
        done++
        console.log(
          `[ENEMY] Enemy slot at idx ${idx} stopped at side ${resultSide} (${slot.reelSides[resultSide].description})`,
        )
        if (done === this.enemySlotSprites.length) {
          this.spinning = false
          console.log('[ENEMY] Enemy slots done. Spinning finished.')
        }
      })
    })

    this.playerSlotsSelected = this.playerSlotSprites.map(() => false)
    this.playerSlotSprites.forEach((sprite) => sprite.setAlpha(0.7))
  }
}
