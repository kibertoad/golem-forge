import { PotatoScene, BarsBarBuilder } from '@potato-golem/ui'
import { LimitedNumber } from '@potato-golem/core'
import Phaser from 'phaser'
import type { Dependencies } from '../../diConfig.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { WEAPON_SLOT_SIDES } from '../../model/slot_sides/WeaponSlotSides.ts'
import type { ActivationResult, ActivationSource } from '../../model/activations/activations.ts'
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
  private energyBar!: Phaser.GameObjects.Container
  private shieldBar!: Phaser.GameObjects.Container
  private hullBar!: Phaser.GameObjects.Container
  private enemyShieldBar!: Phaser.GameObjects.Container
  private enemyHullBar!: Phaser.GameObjects.Container
  private energyUsage!: LimitedNumber
  private weaponUsage!: LimitedNumber
  private componentUsage!: LimitedNumber

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
      energyUsage: weapon.definition.energyUsage,
    }))

    return [
      {
        label: 'Weapons',
        slots: weapons,
      },
    ]
  }

  private updateEnergyBar() {
    console.log(`[ENERGY BAR UPDATE] Current energy usage: ${this.energyUsage.value}/${this.worldModel.playerShip.maxEnergy}`)
    
    // Update the energy bar using BarsBarBuilder method
    this.energyBar.destroy()
    const energyBarBuilder = BarsBarBuilder.instance(this)
    energyBarBuilder.setPosition({ x: 40, y: 600 })
    energyBarBuilder.setMaxValue(this.worldModel.playerShip.maxEnergy)
    energyBarBuilder.setValue(this.energyUsage.value)
    energyBarBuilder.setColors({ fill: '#ffaa00', background: '#333333', border: '#ffffff' })
    energyBarBuilder.setLabel('Energy Usage')
    // Set horizontal spacing between bars
    energyBarBuilder.setOffsetX(5) // 5px spacing between bars
    this.energyBar = energyBarBuilder.build()
    this.energyBar.setDepth(1000)
    this.energyBar.setVisible(true)
    // Add the new energy bar to the scene's display list
    this.add.existing(this.energyBar)
    
    console.log(`[ENERGY BAR UPDATE] Energy bar recreated and added to scene - bars should be spaced horizontally`)
  }

  private updateShieldBar() {
    console.log(`[SHIELD BAR UPDATE] Current shield: ${this.worldModel.playerShip.currentShield}/${this.worldModel.playerShip.maxShield}`)
    
    this.shieldBar.destroy()
    const shieldBarBuilder = BarsBarBuilder.instance(this)
    shieldBarBuilder.setPosition({ x: 40, y: 550 })
    shieldBarBuilder.setMaxValue(this.worldModel.playerShip.maxShield)
    shieldBarBuilder.setValue(this.worldModel.playerShip.currentShield)
    shieldBarBuilder.setColors({ fill: '#0066ff', background: '#333333', border: '#ffffff' })
    shieldBarBuilder.setLabel('Shield')
    shieldBarBuilder.setOffsetX(5)
    this.shieldBar = shieldBarBuilder.build()
    this.shieldBar.setDepth(1000)
    this.shieldBar.setVisible(true)
    this.add.existing(this.shieldBar)
    
    console.log(`[SHIELD BAR UPDATE] Shield bar recreated and added to scene`)
  }

  private updateHullBar() {
    console.log(`[HULL BAR UPDATE] Current hull: ${this.worldModel.playerShip.currentHull}/${this.worldModel.playerShip.maxHull}`)
    
    this.hullBar.destroy()
    const hullBarBuilder = BarsBarBuilder.instance(this)
    hullBarBuilder.setPosition({ x: 40, y: 500 })
    hullBarBuilder.setMaxValue(this.worldModel.playerShip.maxHull)
    hullBarBuilder.setValue(this.worldModel.playerShip.currentHull)
    hullBarBuilder.setColors({ fill: '#ffdd00', background: '#333333', border: '#ffffff' })
    hullBarBuilder.setLabel('Hull')
    hullBarBuilder.setOffsetX(5)
    this.hullBar = hullBarBuilder.build()
    this.hullBar.setDepth(1000)
    this.hullBar.setVisible(true)
    this.add.existing(this.hullBar)
    
    console.log(`[HULL BAR UPDATE] Hull bar recreated and added to scene`)
  }

  private updateEnemyShieldBar() {
    console.log(`[ENEMY SHIELD BAR UPDATE] Current enemy shield: ${this.worldModel.enemyShip.currentShield}/${this.worldModel.enemyShip.maxShield}`)
    
    this.enemyShieldBar.destroy()
    const enemyShieldBarBuilder = BarsBarBuilder.instance(this)
    enemyShieldBarBuilder.setPosition({ x: this.scale.width - 200, y: 550 })
    enemyShieldBarBuilder.setMaxValue(this.worldModel.enemyShip.maxShield)
    enemyShieldBarBuilder.setValue(this.worldModel.enemyShip.currentShield)
    enemyShieldBarBuilder.setColors({ fill: '#0066ff', background: '#333333', border: '#ffffff' })
    enemyShieldBarBuilder.setLabel('Enemy Shield')
    enemyShieldBarBuilder.setOffsetX(5)
    this.enemyShieldBar = enemyShieldBarBuilder.build()
    this.enemyShieldBar.setDepth(1000)
    this.enemyShieldBar.setVisible(true)
    this.add.existing(this.enemyShieldBar)
    
    console.log(`[ENEMY SHIELD BAR UPDATE] Enemy shield bar recreated and added to scene`)
  }

  private updateEnemyHullBar() {
    console.log(`[ENEMY HULL BAR UPDATE] Current enemy hull: ${this.worldModel.enemyShip.currentHull}/${this.worldModel.enemyShip.maxHull}`)
    
    this.enemyHullBar.destroy()
    const enemyHullBarBuilder = BarsBarBuilder.instance(this)
    enemyHullBarBuilder.setPosition({ x: this.scale.width - 200, y: 500 })
    enemyHullBarBuilder.setMaxValue(this.worldModel.enemyShip.maxHull)
    enemyHullBarBuilder.setValue(this.worldModel.enemyShip.currentHull)
    enemyHullBarBuilder.setColors({ fill: '#ffdd00', background: '#333333', border: '#ffffff' })
    enemyHullBarBuilder.setLabel('Enemy Hull')
    enemyHullBarBuilder.setOffsetX(5)
    this.enemyHullBar = enemyHullBarBuilder.build()
    this.enemyHullBar.setDepth(1000)
    this.enemyHullBar.setVisible(true)
    this.add.existing(this.enemyHullBar)
    
    console.log(`[ENEMY HULL BAR UPDATE] Enemy hull bar recreated and added to scene`)
  }

  private takeDamage(damage: number) {
    console.log(`[DAMAGE] Taking ${damage} damage`)
    
    // Damage hits shield first, then hull
    if (this.worldModel.playerShip.currentShield > 0) {
      const shieldDamage = Math.min(damage, this.worldModel.playerShip.currentShield)
      this.worldModel.playerShip.currentShield -= shieldDamage
      damage -= shieldDamage
      this.updateShieldBar()
      console.log(`[DAMAGE] Shield took ${shieldDamage} damage, ${this.worldModel.playerShip.currentShield} shield remaining`)
    }
    
    if (damage > 0 && this.worldModel.playerShip.currentHull > 0) {
      const hullDamage = Math.min(damage, this.worldModel.playerShip.currentHull)
      this.worldModel.playerShip.currentHull -= hullDamage
      this.updateHullBar()
      console.log(`[DAMAGE] Hull took ${hullDamage} damage, ${this.worldModel.playerShip.currentHull} hull remaining`)
    }
  }

  private restoreShield(amount: number) {
    console.log(`[SHIELD RESTORE] Restoring ${amount} shield`)
    this.worldModel.playerShip.currentShield = Math.min(
      this.worldModel.playerShip.currentShield + amount,
      this.worldModel.playerShip.maxShield
    )
    this.updateShieldBar()
  }

  private repairHull(amount: number) {
    console.log(`[HULL REPAIR] Repairing ${amount} hull`)
    this.worldModel.playerShip.currentHull = Math.min(
      this.worldModel.playerShip.currentHull + amount,
      this.worldModel.playerShip.maxHull
    )
    this.updateHullBar()
  }

  private damageEnemy(damage: number) {
    console.log(`[ENEMY DAMAGE] Enemy taking ${damage} damage`)
    
    // Damage hits shield first, then hull
    if (this.worldModel.enemyShip.currentShield > 0) {
      const shieldDamage = Math.min(damage, this.worldModel.enemyShip.currentShield)
      this.worldModel.enemyShip.currentShield -= shieldDamage
      damage -= shieldDamage
      this.updateEnemyShieldBar()
      console.log(`[ENEMY DAMAGE] Enemy shield took ${shieldDamage} damage, ${this.worldModel.enemyShip.currentShield} shield remaining`)
    }
    
    if (damage > 0 && this.worldModel.enemyShip.currentHull > 0) {
      const hullDamage = Math.min(damage, this.worldModel.enemyShip.currentHull)
      this.worldModel.enemyShip.currentHull -= hullDamage
      this.updateEnemyHullBar()
      console.log(`[ENEMY DAMAGE] Enemy hull took ${hullDamage} damage, ${this.worldModel.enemyShip.currentHull} hull remaining`)
    }
  }

  private restoreEnemyShield(amount: number) {
    console.log(`[ENEMY SHIELD RESTORE] Restoring ${amount} enemy shield`)
    this.worldModel.enemyShip.currentShield = Math.min(
      this.worldModel.enemyShip.currentShield + amount,
      this.worldModel.enemyShip.maxShield
    )
    this.updateEnemyShieldBar()
  }

  private repairEnemyHull(amount: number) {
    console.log(`[ENEMY HULL REPAIR] Repairing ${amount} enemy hull`)
    this.worldModel.enemyShip.currentHull = Math.min(
      this.worldModel.enemyShip.currentHull + amount,
      this.worldModel.enemyShip.maxHull
    )
    this.updateEnemyHullBar()
  }

  private executeTargetEffects(slotSideId: string, target: 'player' | 'enemy', sourceShip: 'player' | 'enemy', weaponIndex: number): ActivationResult[] {
    console.log(`[TARGET EFFECTS] Executing effects for ${slotSideId} on ${target} from ${sourceShip} weapon ${weaponIndex}`)
    
    const slotSide = Object.values(WEAPON_SLOT_SIDES).find(side => side.id === slotSideId)
    if (!slotSide || slotSide.targetEffects.length === 0) {
      console.log(`[TARGET EFFECTS] No effects found for ${slotSideId}`)
      return []
    }

    const targetShip = target === 'player' ? this.worldModel.playerShip : this.worldModel.enemyShip
    const attackingShip = sourceShip === 'player' ? this.worldModel.playerShip : this.worldModel.enemyShip
    
    // Get the source component (weapon that's attacking)
    let sourceComponent = null
    if (sourceShip === 'player' && weaponIndex < attackingShip.weapons.length) {
      sourceComponent = attackingShip.weapons[weaponIndex]
    } else if (sourceShip === 'enemy') {
      // For enemy, we don't have actual weapon components, so we'll create a mock one
      // In a real implementation, enemy ships would also have weapon components
      console.log(`[TARGET EFFECTS] Enemy attack - no specific weapon component available`)
    }

    const source: ActivationSource | undefined = sourceComponent ? {
      sourceShip: attackingShip,
      sourceComponent: sourceComponent
    } : undefined

    const results: ActivationResult[] = []

    for (const effect of slotSide.targetEffects) {
      const result = effect.execute(targetShip, source)
      results.push(result)
      console.log(`[TARGET EFFECTS] ${effect.type} effect: ${result.message}`)
      
      if (result.entityDestroyed) {
        console.log(`[TARGET EFFECTS] ${target} ship destroyed!`)
        // Update both bars to show the destruction
        if (target === 'player') {
          this.updateShieldBar()
          this.updateHullBar()
        } else {
          this.updateEnemyShieldBar()
          this.updateEnemyHullBar()
        }
      } else {
        // Update bars to show damage
        if (target === 'player') {
          if (result.shieldDamage && result.shieldDamage > 0) this.updateShieldBar()
          if (result.hullDamage && result.hullDamage > 0) this.updateHullBar()
        } else {
          if (result.shieldDamage && result.shieldDamage > 0) this.updateEnemyShieldBar()
          if (result.hullDamage && result.hullDamage > 0) this.updateEnemyHullBar()
        }
      }
    }

    return results
  }

  private canSelectSlot(slotIndex: number): boolean {
    const playerSections = this.getPlayerWeaponSections()
    let currentSlotIndex = 0

    for (const section of playerSections) {
      for (const slot of section.slots) {
        if (currentSlotIndex === slotIndex) {
          const newUsage = this.energyUsage.value + slot.energyUsage
          console.log(`[ENERGY DEBUG] Current: ${this.energyUsage.value}, Adding: ${slot.energyUsage}, New: ${newUsage}, Max: ${this.worldModel.playerShip.maxEnergy}`)
          return newUsage <= this.worldModel.playerShip.maxEnergy
        }
        currentSlotIndex++
      }
    }

    return false
  }

  private selectSlot(slotIndex: number): boolean {
    const playerSections = this.getPlayerWeaponSections()
    let currentSlotIndex = 0

    for (const section of playerSections) {
      for (const slot of section.slots) {
        if (currentSlotIndex === slotIndex) {
          if (this.energyUsage.value + slot.energyUsage <= this.worldModel.playerShip.maxEnergy) {
            console.log(`[ENERGY SELECT] ${slot.name} selected - Energy cost: ${slot.energyUsage}, Before: ${this.energyUsage.value}`)
            this.energyUsage.increase(slot.energyUsage)
            // For weapons, also track weapon usage
            if (section.label === 'Weapons') {
              this.weaponUsage.increase(slot.energyUsage)
            }
            this.componentUsage.increase(slot.energyUsage)
            console.log(`[ENERGY SELECT] After: ${this.energyUsage.value}/${this.worldModel.playerShip.maxEnergy}`)
            this.updateEnergyBar()
            return true
          }
          console.log(`[ENERGY SELECT] ${slot.name} cannot be selected - would exceed energy limit (${this.energyUsage.value + slot.energyUsage}/${this.worldModel.playerShip.maxEnergy})`)
          return false
        }
        currentSlotIndex++
      }
    }

    return false
  }

  private deselectSlot(slotIndex: number): void {
    const playerSections = this.getPlayerWeaponSections()
    let currentSlotIndex = 0

    for (const section of playerSections) {
      for (const slot of section.slots) {
        if (currentSlotIndex === slotIndex) {
          console.log(`[ENERGY DESELECT] ${slot.name} deselected - Energy cost: ${slot.energyUsage}, Before: ${this.energyUsage.value}`)
          this.energyUsage.decrease(slot.energyUsage)
          // For weapons, also reduce weapon usage
          if (section.label === 'Weapons') {
            this.weaponUsage.decrease(slot.energyUsage)
          }
          this.componentUsage.decrease(slot.energyUsage)
          console.log(`[ENERGY DESELECT] After: ${this.energyUsage.value}/${this.worldModel.playerShip.maxEnergy}`)
          this.updateEnergyBar()
          return
        }
        currentSlotIndex++
      }
    }
  }

  private handleSlotSelection(slotIndex: number, sprite: Phaser.GameObjects.Image, slot: any): void {
    const isCurrentlySelected = this.playerSlotsSelected[slotIndex]

    if (isCurrentlySelected) {
      this.handleSlotDeselection(slotIndex, sprite, slot)
    } else {
      this.handleSlotSelectionAttempt(slotIndex, sprite, slot)
    }
  }

  private handleSlotDeselection(slotIndex: number, sprite: Phaser.GameObjects.Image, slot: any): void {
    console.log(`[CLICK DEBUG] Deselecting ${slot.name}`)
    this.playerSlotsSelected[slotIndex] = false
    sprite.setAlpha(0.7)
    this.deselectSlot(slotIndex)
  }

  private handleSlotSelectionAttempt(slotIndex: number, sprite: Phaser.GameObjects.Image, slot: any): void {
    if (this.canSelectSlot(slotIndex)) {
      console.log(`[CLICK DEBUG] Selecting ${slot.name}`)
      const success = this.selectSlot(slotIndex)
      if (success) {
        this.playerSlotsSelected[slotIndex] = true
        sprite.setAlpha(1.0)
      }
    } else {
      console.log(`[ENERGY] Cannot select ${slot.name} - would exceed energy limit`)
    }
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
          .setInteractive({ cursor: 'pointer' })
          .setData('slotSection', sectionIdx)
          .setData('slotIndex', i)
          .setData('enabled', slot.enabled)
          .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            console.log(`[CLICK DEBUG] Clicked on ${slot.name}`)
            console.log(`[CLICK DEBUG] Right button: ${pointer.rightButtonDown()}`)
            console.log(`[CLICK DEBUG] Slot enabled: ${slot.enabled}`)
            console.log(`[CLICK DEBUG] Spinning: ${this.spinning}`)
            console.log(`[CLICK DEBUG] Current selection state: ${this.playerSlotsSelected[idx]}`)

            if (pointer.rightButtonDown()) {
              this.showSlotSides(slot, x, y)
            } else if (slot.enabled && !this.spinning) {
              this.handleSlotSelection(idx, sprite, slot)
              console.log(
                `[SLOT SELECT] Player slot ${slot.name} selected = ${this.playerSlotsSelected[idx]}`,
              )
            } else {
              console.log(
                `[CLICK DEBUG] Click ignored - slot enabled: ${slot.enabled}, spinning: ${this.spinning}`,
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

    // Initialize selection state without overriding event listeners
    this.playerSlotsSelected = this.playerSlotSprites.map(() => false)
    this.playerSlotSprites.forEach((sprite) => {
      sprite.setAlpha(0.7)
    })

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

    // --- ENERGY TRACKING ---
    this.energyUsage = new LimitedNumber(0, this.worldModel.playerShip.maxEnergy, false, 'Energy Usage')
    this.weaponUsage = new LimitedNumber(0, this.worldModel.playerShip.maxEnergy, false, 'Weapon Usage')
    this.componentUsage = new LimitedNumber(0, this.worldModel.playerShip.maxEnergy, false, 'Component Usage')

    // --- ENERGY BAR ---
    console.log('[ENERGY BAR] Creating energy bar with max:', this.worldModel.playerShip.maxEnergy, 'current:', this.energyUsage.value)
    const energyBarBuilder = BarsBarBuilder.instance(this)
    energyBarBuilder.setPosition({ x: 40, y: 600 })
    energyBarBuilder.setMaxValue(this.worldModel.playerShip.maxEnergy)
    energyBarBuilder.setValue(this.energyUsage.value)
    energyBarBuilder.setColors({ fill: '#ffaa00', background: '#333333', border: '#ffffff' })
    energyBarBuilder.setLabel('Energy Usage')
    // Set horizontal spacing between bars
    energyBarBuilder.setOffsetX(5) // 5px spacing between bars
    this.energyBar = energyBarBuilder.build()
    this.energyBar.setDepth(1000)
    this.energyBar.setVisible(true)
    console.log('[ENERGY BAR] Energy bar created:', this.energyBar)
    console.log('[ENERGY BAR] Energy bar children:', this.energyBar.list?.length || 0)

    // --- SHIELD BAR ---
    console.log('[SHIELD BAR] Creating shield bar with max:', this.worldModel.playerShip.maxShield, 'current:', this.worldModel.playerShip.currentShield)
    const shieldBarBuilder = BarsBarBuilder.instance(this)
    shieldBarBuilder.setPosition({ x: 40, y: 550 })
    shieldBarBuilder.setMaxValue(this.worldModel.playerShip.maxShield)
    shieldBarBuilder.setValue(this.worldModel.playerShip.currentShield)
    shieldBarBuilder.setColors({ fill: '#0066ff', background: '#333333', border: '#ffffff' })
    shieldBarBuilder.setLabel('Shield')
    shieldBarBuilder.setOffsetX(5)
    this.shieldBar = shieldBarBuilder.build()
    this.shieldBar.setDepth(1000)
    this.shieldBar.setVisible(true)
    this.add.existing(this.shieldBar)

    // --- HULL BAR ---
    console.log('[HULL BAR] Creating hull bar with max:', this.worldModel.playerShip.maxHull, 'current:', this.worldModel.playerShip.currentHull)
    const hullBarBuilder = BarsBarBuilder.instance(this)
    hullBarBuilder.setPosition({ x: 40, y: 500 })
    hullBarBuilder.setMaxValue(this.worldModel.playerShip.maxHull)
    hullBarBuilder.setValue(this.worldModel.playerShip.currentHull)
    hullBarBuilder.setColors({ fill: '#ffdd00', background: '#333333', border: '#ffffff' })
    hullBarBuilder.setLabel('Hull')
    hullBarBuilder.setOffsetX(5)
    this.hullBar = hullBarBuilder.build()
    this.hullBar.setDepth(1000)
    this.hullBar.setVisible(true)
    this.add.existing(this.hullBar)

    // --- ENEMY SHIELD BAR ---
    console.log('[ENEMY SHIELD BAR] Creating enemy shield bar with max:', this.worldModel.enemyShip.maxShield, 'current:', this.worldModel.enemyShip.currentShield)
    const enemyShieldBarBuilder = BarsBarBuilder.instance(this)
    enemyShieldBarBuilder.setPosition({ x: this.scale.width - 200, y: 550 })
    enemyShieldBarBuilder.setMaxValue(this.worldModel.enemyShip.maxShield)
    enemyShieldBarBuilder.setValue(this.worldModel.enemyShip.currentShield)
    enemyShieldBarBuilder.setColors({ fill: '#0066ff', background: '#333333', border: '#ffffff' })
    enemyShieldBarBuilder.setLabel('Enemy Shield')
    enemyShieldBarBuilder.setOffsetX(5)
    this.enemyShieldBar = enemyShieldBarBuilder.build()
    this.enemyShieldBar.setDepth(1000)
    this.enemyShieldBar.setVisible(true)
    this.add.existing(this.enemyShieldBar)

    // --- ENEMY HULL BAR ---
    console.log('[ENEMY HULL BAR] Creating enemy hull bar with max:', this.worldModel.enemyShip.maxHull, 'current:', this.worldModel.enemyShip.currentHull)
    const enemyHullBarBuilder = BarsBarBuilder.instance(this)
    enemyHullBarBuilder.setPosition({ x: this.scale.width - 200, y: 500 })
    enemyHullBarBuilder.setMaxValue(this.worldModel.enemyShip.maxHull)
    enemyHullBarBuilder.setValue(this.worldModel.enemyShip.currentHull)
    enemyHullBarBuilder.setColors({ fill: '#ffdd00', background: '#333333', border: '#ffffff' })
    enemyHullBarBuilder.setLabel('Enemy Hull')
    enemyHullBarBuilder.setOffsetX(5)
    this.enemyHullBar = enemyHullBarBuilder.build()
    this.enemyHullBar.setDepth(1000)
    this.enemyHullBar.setVisible(true)
    this.add.existing(this.enemyHullBar)

    // --- DAMAGE/REPAIR CONTROLS (for testing) ---
    // Player controls
    this.input.keyboard?.on('keydown-D', () => {
      this.takeDamage(1)
    })
    this.input.keyboard?.on('keydown-S', () => {
      this.restoreShield(1)
    })
    this.input.keyboard?.on('keydown-H', () => {
      this.repairHull(1)
    })
    
    // Enemy controls
    this.input.keyboard?.on('keydown-E', () => {
      this.damageEnemy(1)
    })
    this.input.keyboard?.on('keydown-R', () => {
      this.restoreEnemyShield(1)
    })
    this.input.keyboard?.on('keydown-T', () => {
      this.repairEnemyHull(1)
    })
    
    // Weapon damage testing
    this.input.keyboard?.on('keydown-W', () => {
      if (this.worldModel.playerShip.weapons.length > 0) {
        const weapon = this.worldModel.playerShip.weapons[0]
        weapon.durability.decrease(1)
        console.log(`[WEAPON DAMAGE] Player weapon 0 damaged: ${weapon.durability.value}/${weapon.durability.maxValue}`)
      }
    })
    this.input.keyboard?.on('keydown-Q', () => {
      if (this.worldModel.playerShip.weapons.length > 0) {
        const weapon = this.worldModel.playerShip.weapons[0]
        weapon.durability.increase(1)
        console.log(`[WEAPON REPAIR] Player weapon 0 repaired: ${weapon.durability.value}/${weapon.durability.maxValue}`)
      }
    })

    console.log('[CREATE] Scene created. Slots, spin button, and all bars initialized.')
    console.log('[CREATE] Player: D=damage, S=shield, H=hull, W=damage weapon, Q=repair weapon')
    console.log('[CREATE] Enemy: E=damage, R=shield, T=hull')

    this.add.existing(this.energyBar)
  }

  // --- SLOT SIDES OVERLAY ---
  showSlotSides(slot: any, baseX: number, baseY: number) {
    this.hideSlotSides()
    console.log('[SLOT SIDES] Showing slot sides overlay for', slot.name)
    console.log('[SLOT SIDES] Available sides:', slot.reelSides?.length || 0)

    // Guard against invalid slot data
    if (!slot.reelSides || slot.reelSides.length === 0) {
      console.warn('[SLOT SIDES] No reel sides available for', slot.name)
      return
    }

    const numSides = slot.reelSides.length
    // Dynamic grid sizing based on number of sides
    const cols = Math.min(3, numSides) // Max 3 columns
    const rows = Math.ceil(numSides / cols)
    const cell = 48
    const padding = 18

    const overlayX = Math.min(baseX, this.scale.width - (cols * cell + padding * 2))
    const overlayY = Math.max(24, baseY - 40)

    this.slotSidesOverlay = this.add.container(overlayX, overlayY).setDepth(30)
    // Background sized to fit actual content
    const bg = this.add
      .rectangle(0, 0, cols * cell + padding * 2, rows * cell + padding * 2, 0x222244, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffffff, 0.8)
    this.slotSidesOverlay.add(bg)

    // Add slot reel sides in grid - only the sides that exist
    for (let s = 0; s < numSides; s++) {
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

        console.log(`[SPIN DEBUG] Player slot ${i}: slotIdx=${slotIdx}, slot exists=${!!slot}`)
        let resultSide = 0
        if (slot && slot.reelSides && slot.reelSides.length > 0) {
          resultSide = Phaser.Math.Between(0, Math.min(5, slot.reelSides.length - 1))
          console.log(
            `[SPIN DEBUG] resultSide=${resultSide}, reelSides.length=${slot.reelSides.length}`,
          )
          sprite.setTexture(slot.reelSides[resultSide].image)
        } else {
          console.error(`[SPIN ERROR] Invalid slot data for slotIdx ${slotIdx}:`, slot)
          // Fallback to default texture
          sprite.setTexture('damage')
        }
        this.tweens.add({
          targets: sprite,
          x: startX,
          y: startY,
          duration: 180,
          ease: 'Sine.InOut',
        })
        slotSpinsDone++
        if (slot && slot.reelSides && slot.reelSides[resultSide]) {
          const slotSideId = slot.reelSides[resultSide].description
          console.log(
            `[SPIN] Player slot at idx ${i} stopped at side ${resultSide} (${slotSideId})`,
          )
          
          // Execute target effects on enemy
          // Find which weapon this slot belongs to
          const weaponIndex = slotIdx // Since slots map directly to weapons in current implementation
          const results = this.executeTargetEffects(slotSideId, 'enemy', 'player', weaponIndex)
          if (results.length > 0) {
            console.log(`[SPIN] Player weapon ${weaponIndex} ${slotSideId} hit enemy:`, results)
          }
        } else {
          console.log(`[SPIN] Player slot at idx ${i} stopped with fallback texture`)
        }
        if (slotSpinsDone === selectedSprites.length) {
          // After all player slots spin, spin enemy slots
          this.spinEnemySlots()
        }
      })
    })
  }

  spinEnemySlots() {
    // Spin all enemy slots at once, animation similar to player slots
    console.log(
      `[ENEMY] *** STARTING ENEMY SPIN - enemySlotSprites length: ${this.enemySlotSprites.length}`,
    )
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
      console.log(
        `[ENEMY] Setting up delayed call for enemy slot ${idx} with delay ${900 + idx * 140}ms`,
      )
      this.time.delayedCall(900 + idx * 140, () => {
        console.log(`[ENEMY] *** DELAYED CALL EXECUTING for slot ${idx}`)
        const slot = exampleEnemySlots[idx]
        console.log(
          `[ENEMY DEBUG] slot exists=${!!slot}, reelSides exists=${!!(slot && slot.reelSides)}`,
        )
        let resultSide = 0
        if (slot && slot.reelSides && slot.reelSides.length > 0) {
          resultSide = Phaser.Math.Between(0, Math.min(5, slot.reelSides.length - 1))
          sprite.setTexture(slot.reelSides[resultSide].image)
        } else {
          console.error(`[ENEMY ERROR] Invalid enemy slot data for idx ${idx}:`, slot)
          sprite.setTexture('damage')
        }
        this.tweens.add({
          targets: sprite,
          x: startX,
          y: startY,
          duration: 180,
          ease: 'Sine.InOut',
        })
        done++
        if (slot && slot.reelSides && slot.reelSides[resultSide]) {
          const slotSideId = slot.reelSides[resultSide].description
          console.log(
            `[ENEMY] Enemy slot at idx ${idx} stopped at side ${resultSide} (${slotSideId})`,
          )
          
          // Execute target effects on player
          const results = this.executeTargetEffects(slotSideId, 'player', 'enemy', idx)
          if (results.length > 0) {
            console.log(`[ENEMY] Enemy weapon ${idx} ${slotSideId} hit player:`, results)
          }
        } else {
          console.log(`[ENEMY] Enemy slot at idx ${idx} stopped with fallback texture`)
        }
        if (done === this.enemySlotSprites.length) {
          console.log('[ENEMY] *** ALL ENEMY SLOTS DONE - about to reset')
          console.log('[ENEMY] *** spinning was:', this.spinning)
          this.spinning = false
          console.log('[ENEMY] *** spinning now:', this.spinning)
          console.log('[ENEMY] Enemy slots done. Spinning finished.')
          // Reset selection state after spinning is completely done
          this.resetPlayerSlotSelection()
          this.restoreEnemySlotTextures()
          console.log('[ENEMY] *** FINISHED ALL RESETS')
        }
      })
    })
  }

  private resetPlayerSlotSelection() {
    console.log(
      '[RESET] *** STARTING RESET - playerSlotsSelected length:',
      this.playerSlotsSelected.length,
    )
    console.log('[RESET] *** spinning state:', this.spinning)
    console.log('[RESET] *** playerSlotSprites length:', this.playerSlotSprites.length)

    // Reset energy usage
    console.log(`[RESET] Energy before reset: ${this.energyUsage.value}/${this.worldModel.playerShip.maxEnergy}`)
    this.energyUsage.setValue(0)
    this.weaponUsage.setValue(0)
    this.componentUsage.setValue(0)
    console.log(`[RESET] Energy after reset: ${this.energyUsage.value}/${this.worldModel.playerShip.maxEnergy}`)

    // Reset selection state
    this.playerSlotsSelected = this.playerSlotSprites.map(() => false)

    // Reset visual state and restore textures
    const playerSections = this.getPlayerWeaponSections()
    const flatSlots = playerSections.flatMap((s) => s.slots)

    this.playerSlotSprites.forEach((sprite, spriteIndex) => {
      console.log(`[RESET] Processing sprite ${spriteIndex}`)

      // Reset visual state
      sprite.setAlpha(0.7)

      // Restore original weapon texture
      const slot = flatSlots[spriteIndex]
      if (slot?.reelSides?.[0]) {
        sprite.setTexture(slot.reelSides[0].image)
        console.log(
          `[RESET] Restored texture for sprite ${spriteIndex}: ${slot.reelSides[0].image}`,
        )
      }
    })

    // Update energy bar to reflect reset values
    this.updateEnergyBar()

    console.log('[RESET] *** RESET COMPLETE')
  }

  private restoreEnemySlotTextures() {
    console.log('[RESTORE] Restoring enemy slot textures')
    this.enemySlotSprites.forEach((sprite, spriteIndex) => {
      const slot = exampleEnemySlots[spriteIndex]
      if (slot?.reelSides?.[0]) {
        sprite.setTexture(slot.reelSides[0].image)
      }
    })
  }
}
