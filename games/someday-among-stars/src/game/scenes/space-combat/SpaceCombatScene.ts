import { PotatoScene } from '@potato-golem/ui'
import Phaser from 'phaser'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { ShipIndicatorContainer } from './views/ShipIndicatorContainer.ts'

// === DICE SPRITESHEET CONFIG ===
const DICE_SPRITESHEET_KEY = 'SCIFI_DICE'
const DICE_FRAME_WIDTH = 16
const DICE_FRAME_HEIGHT = 16
const DICE_COLUMNS = 6
const DICE_ROWS = 15
const DICE_FINAL_ROWS = 12

// Example dice data for demo
const examplePlayerSections = [
  {
    label: 'Weapons',
    dice: [
      {
        name: 'Laser',
        colorIndex: 1,
        faces: [
          { frame: 1 * 6 + 0, description: 'Miss' },
          { frame: 1 * 6 + 1, description: 'Hit' },
          { frame: 1 * 6 + 2, description: 'Overhit' },
          { frame: 1 * 6 + 3, description: 'Jam' },
          { frame: 1 * 6 + 4, description: 'Crit' },
          { frame: 1 * 6 + 5, description: 'Miss' },
        ],
        enabled: true,
      },
      {
        name: 'Missile',
        colorIndex: 2,
        faces: [
          { frame: 2 * 6 + 0, description: 'Hit' },
          { frame: 2 * 6 + 1, description: 'Miss' },
          { frame: 2 * 6 + 2, description: 'Hit' },
          { frame: 2 * 6 + 3, description: 'Miss' },
          { frame: 2 * 6 + 4, description: 'Hit' },
          { frame: 2 * 6 + 5, description: 'Double Hit' },
        ],
        enabled: true,
      },
    ],
  },
  {
    label: 'Shields',
    dice: [
      {
        name: 'Barrier',
        colorIndex: 3,
        faces: [
          { frame: 3 * 6 + 0, description: 'Block' },
          { frame: 3 * 6 + 1, description: 'Block' },
          { frame: 3 * 6 + 2, description: 'Leak' },
          { frame: 3 * 6 + 3, description: 'Break' },
          { frame: 3 * 6 + 4, description: 'Block' },
          { frame: 3 * 6 + 5, description: 'Crit Block' },
        ],
        enabled: false,
      },
    ],
  },
]

const exampleEnemyDice = [
  {
    name: 'Enemy Laser',
    colorIndex: 5,
    faces: [
      { frame: 5 * 6 + 0, description: 'Miss' },
      { frame: 5 * 6 + 1, description: 'Hit' },
      { frame: 5 * 6 + 2, description: 'Hit' },
      { frame: 5 * 6 + 3, description: 'Crit' },
      { frame: 5 * 6 + 4, description: 'Miss' },
      { frame: 5 * 6 + 5, description: 'Jam' },
    ],
  },
  {
    name: 'Enemy Missile',
    colorIndex: 6,
    faces: [
      { frame: 6 * 6 + 0, description: 'Hit' },
      { frame: 6 * 6 + 1, description: 'Miss' },
      { frame: 6 * 6 + 2, description: 'Double Hit' },
      { frame: 6 * 6 + 3, description: 'Hit' },
      { frame: 6 * 6 + 4, description: 'Crit' },
      { frame: 6 * 6 + 5, description: 'Hit' },
    ],
  },
]

// --- Sprite animation keys ---
const DICE_ROLL_ROW = 14 // last row for animation

export class SpaceCombatScene extends PotatoScene {
  private playerDiceSprites: Phaser.GameObjects.Sprite[] = []
  private playerDiceSelected: boolean[] = [] // index by flat list of all dice

  private enemyDiceSprites: Phaser.GameObjects.Sprite[] = []
  private unravelOverlay?: Phaser.GameObjects.Container
  private unravelTooltip?: Phaser.GameObjects.Text

  private rollButton!: Phaser.GameObjects.Text
  private rolling = false
  private shipIndicatorContainer!: ShipIndicatorContainer

  constructor(dependencies: any) {
    super(dependencies.globalSceneEventEmitter, { key: sceneRegistry.SPACE_COMBAT })
  }

  preload() {
    this.load.setPath('assets')
    this.load.spritesheet(DICE_SPRITESHEET_KEY, 'six-sided-die.png', {
      frameWidth: DICE_FRAME_WIDTH,
      frameHeight: DICE_FRAME_HEIGHT,
    })
    console.log('[PRELOAD] Sprite sheet queued for loading.')
  }

  create() {
    // --- ROLLING ANIMATION SETUP ---
    if (!this.anims.exists('dice-roll')) {
      this.anims.create({
        key: 'dice-roll',
        frames: this.anims.generateFrameNumbers(DICE_SPRITESHEET_KEY, {
          start: DICE_ROLL_ROW * DICE_COLUMNS,
          end: DICE_ROLL_ROW * DICE_COLUMNS + DICE_COLUMNS - 1,
        }),
        frameRate: 18,
        repeat: -1,
      })
      console.log('[ANIM] Created dice-roll animation')
    }

    // Divide screen
    const midX = this.scale.width / 2
    this.add.rectangle(midX, this.scale.height / 2, 2, this.scale.height, 0x2a2a2a, 0.6)

    // --- ENEMY (RIGHT) ---
    const enemyAreaX = midX + 80 // add margin to right
    this.enemyDiceSprites = []
    for (let i = 0; i < exampleEnemyDice.length; i++) {
      const d = exampleEnemyDice[i]
      const x = enemyAreaX + i * 110 // more spacing between dice
      const y = 140
      const sprite = this.add
        .sprite(x, y, DICE_SPRITESHEET_KEY, d.faces[0].frame)
        .setScale(4)
        .setInteractive({ cursor: 'pointer' })
        .setData('diceIndex', i)
        .setData('isEnemy', true)
        .on('pointerdown', () => this.showUnravel(d, x, y))
      this.enemyDiceSprites.push(sprite)

      // Dice label (lower to y+60 so it's not touching dice)
      this.add
        .text(x, y + 60, d.name, {
          fontSize: '15px',
          color: '#eaeaff',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5, 0)
    }

    // --- PLAYER (LEFT) ---
    let playerDiceY = 84 // room for indicators
    let diceIdx = 0
    this.playerDiceSprites = []
    this.playerDiceSelected = []

    examplePlayerSections.forEach((section, sectionIdx) => {
      this.add.text(40, playerDiceY, section.label, {
        fontSize: '20px',
        color: '#fff9c0',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      })
      playerDiceY += 30 // slightly more vertical gap after section title

      section.dice.forEach((d, i) => {
        const x = 110 + i * 120
        const y = playerDiceY
        const idx = diceIdx
        const sprite = this.add
          .sprite(x, y, DICE_SPRITESHEET_KEY, d.faces[0].frame)
          .setScale(4)
          .setInteractive({
            cursor: (pointer: Phaser.Input.Pointer) =>
              pointer.rightButtonDown() ? 'pointer' : d.enabled ? 'pointer' : 'not-allowed',
          })
          .setData('diceSection', sectionIdx)
          .setData('diceIndex', i)
          .setData('enabled', d.enabled)
          .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) {
              this.showUnravel(d, x, y)
            } else if (d.enabled) {
              this.playerDiceSelected[idx] = !this.playerDiceSelected[idx]
              sprite.setAlpha(this.playerDiceSelected[idx] ? 1.0 : 0.7)
              console.log(
                `[DICE SELECT] Player dice ${d.name} selected = ${this.playerDiceSelected[idx]}`,
              )
            }
          })
          .on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) pointer.event.preventDefault()
          })
        this.playerDiceSprites.push(sprite)

        this.add
          .text(x, y + 60, d.name, {
            fontSize: '15px',
            color: d.enabled ? '#baffc0' : '#aaaabb',
            fontFamily: 'monospace',
          })
          .setOrigin(0.5, 0)

        diceIdx++
      })

      playerDiceY += 98 // more vertical room per section (was 84)
    })

    this.playerDiceSelected = this.playerDiceSprites.map(() => false)
    this.playerDiceSprites.forEach((sprite) => sprite.setAlpha(0.7))

    // --- ROLL BUTTON & REST UNCHANGED ---
    this.rollButton = this.add
      .text(this.scale.width / 2, this.scale.height - 56, 'Roll dice', {
        fontSize: '32px',
        color: '#e0ffbb',
        backgroundColor: '#222',
        fontFamily: 'monospace',
        padding: { x: 42, y: 16 },
      })
      .setOrigin(0.5, 0.5)
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => this.startRolling())
      .setDepth(20)

    this.unravelTooltip = this.add
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
      if (!currentlyOver.length) this.hideUnravel()
    })

    // --- SHIP INDICATORS ---
    this.shipIndicatorContainer = new ShipIndicatorContainer(this, { isShown: true })
    this.shipIndicatorContainer.renderShipIndicators(midX)

    console.log('[CREATE] Scene created. Dice and roll button initialized.')
  }

  // --- UNRAVEL OVERLAY ---
  showUnravel(dice: any, baseX: number, baseY: number) {
    this.hideUnravel()
    console.log('[UNRAVEL] Showing unravel overlay for', dice.name)

    // Container: 2 columns x 3 rows grid, 48px cells
    const rows = 3,
      cols = 2,
      cell = 48,
      padding = 18
    const overlayX = Math.min(baseX, this.scale.width - (cols * cell + padding * 2))
    const overlayY = Math.max(24, baseY - 40)

    this.unravelOverlay = this.add.container(overlayX, overlayY).setDepth(30)
    // Background
    const bg = this.add
      .rectangle(0, 0, cols * cell + padding * 2, rows * cell + padding * 2, 0x222244, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffffff, 0.8)
    this.unravelOverlay.add(bg)

    // Add dice faces in grid
    for (let f = 0; f < 6; f++) {
      const fx = padding + (f % cols) * cell
      const fy = padding + Math.floor(f / cols) * cell
      const face = this.add
        .sprite(fx + cell / 2, fy + cell / 2, DICE_SPRITESHEET_KEY, dice.faces[f].frame)
        .setScale(2.2)

      // Tooltip logic
      face
        .setInteractive({ cursor: 'pointer' })
        .on('pointerover', () => {
          this.unravelTooltip!.setText(dice.faces[f].description)
          this.unravelTooltip!.setPosition(overlayX + cols * cell + 26, overlayY + fy)
          this.unravelTooltip!.setVisible(true)
          console.log(`[UNRAVEL] Hovered on face ${f}: ${dice.faces[f].description}`)
        })
        .on('pointerout', () => {
          this.unravelTooltip!.setVisible(false)
        })

      this.unravelOverlay.add(face)
    }
    // Bring to front
    this.children.bringToTop(this.unravelOverlay)
  }

  hideUnravel() {
    if (this.unravelOverlay) {
      this.unravelOverlay.destroy()
      this.unravelOverlay = undefined
      if (this.unravelTooltip) this.unravelTooltip.setVisible(false)
    }
  }

  // --- ROLLING LOGIC ---
  startRolling() {
    if (this.rolling) {
      console.log('[ROLL] Already rolling, ignoring click.')
      return
    }
    this.rolling = true
    console.log('[ROLL] Rolling started!')

    // Find which player dice are selected
    const selectedSprites: Phaser.GameObjects.Sprite[] = []
    let idx = 0
    for (const section of examplePlayerSections) {
      for (const d of section.dice) {
        if (this.playerDiceSelected[idx]) {
          selectedSprites.push(this.playerDiceSprites[idx])
          console.log(`[ROLL] Will roll player dice at idx ${idx}`)
        }
        idx++
      }
    }
    if (!selectedSprites.length) {
      // No player dice selected, but still roll enemy dice
      this.rollEnemyDice()
      return
    }

    // --- ROLL player dice ---
    let diceRollsDone = 0
    selectedSprites.forEach((sprite, i) => {
      if (!sprite) {
        console.error(`[ROLL] Sprite at ${i} missing!`)
        return
      }
      sprite.play('dice-roll')
      console.log(`[ROLL] Started dice animation for sprite at idx ${i}`)
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

      this.time.delayedCall(650 + i * 120, () => {
        const diceIdx = this.playerDiceSprites.indexOf(sprite)
        const dice = examplePlayerSections.flatMap((s) => s.dice)[diceIdx]
        const resultFace = Phaser.Math.Between(0, 5)
        sprite.setFrame(dice.faces[resultFace].frame)
        sprite.stop()
        this.tweens.add({
          targets: sprite,
          x: startX,
          y: startY,
          duration: 180,
          ease: 'Sine.InOut',
        })
        diceRollsDone++
        console.log(
          `[ROLL] Player dice at idx ${i} stopped at face ${resultFace} (frame ${dice.faces[resultFace].frame})`,
        )
        if (diceRollsDone === selectedSprites.length) {
          // After all player dice roll, roll enemy
          this.rollEnemyDice()
        }
      })
    })
  }

  rollEnemyDice() {
    // Roll all enemy dice at once, animation similar to player dice
    let done = 0
    this.enemyDiceSprites.forEach((sprite, idx) => {
      sprite.play('dice-roll')
      console.log(`[ENEMY] Rolling enemy dice at idx ${idx}`)
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
      this.time.delayedCall(800 + idx * 140, () => {
        const dice = exampleEnemyDice[idx]
        const resultFace = Phaser.Math.Between(0, 5)
        sprite.setFrame(dice.faces[resultFace].frame)
        sprite.stop()
        this.tweens.add({
          targets: sprite,
          x: startX,
          y: startY,
          duration: 180,
          ease: 'Sine.InOut',
        })
        done++
        console.log(
          `[ENEMY] Enemy dice at idx ${idx} stopped at face ${resultFace} (frame ${dice.faces[resultFace].frame})`,
        )
        if (done === this.enemyDiceSprites.length) {
          this.rolling = false
          console.log('[ENEMY] Enemy dice done. Rolling finished.')
        }
      })
    })

    this.playerDiceSelected = this.playerDiceSprites.map(() => false)
    this.playerDiceSprites.forEach((sprite) => sprite.setAlpha(0.7))
  }
}
