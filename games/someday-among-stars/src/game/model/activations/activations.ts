import type { CommonComponentModel } from '../entities/ComponentModel.ts'
import type { ShipModel } from '../entities/ShipModel.ts'

export interface ActivationSource {
  sourceShip: ShipModel
  sourceComponent: CommonComponentModel
}

export interface TargettedActivation {
  type: 'damage' | 'heal' | 'status' | 'special'
  execute: (target: ShipModel, source?: ActivationSource) => ActivationResult
}

export interface ActivationResult {
  success: boolean
  damageDealt?: number
  shieldDamage?: number
  hullDamage?: number
  entityDestroyed?: boolean
  message?: string
}

interface DamageApplicationOptions {
  bypassShield?: boolean
  damageMultiplier?: number
  logPrefix?: string
  hitMessage?: string
  destroyMessage?: string
}

// Base class with shared damage calculation and application logic
abstract class BaseDamageActivation implements TargettedActivation {
  public readonly type = 'damage' as const

  protected abstract getDamageOptions(): DamageApplicationOptions

  execute(target: ShipModel, source?: ActivationSource): ActivationResult {
    if (!source) {
      const options = this.getDamageOptions()
      console.error(
        `[${options.logPrefix || 'DAMAGE'} ACTIVATION] No source provided - cannot determine base damage!`,
      )
      return {
        success: false,
        message: 'No weapon source provided for damage calculation',
      }
    }

    // Get base damage from the weapon component
    const weaponDefinition = source.sourceComponent.definition as any
    const baseDamage = weaponDefinition.baseDamage || 1

    const options = this.getDamageOptions()
    const adjustedBaseDamage = Math.round(baseDamage * (options.damageMultiplier || 1))

    // Calculate final damage with potential buffs/debuffs
    const totalDamage = this.calculateFinalDamage(
      adjustedBaseDamage,
      source,
      target,
      options.logPrefix || 'DAMAGE',
    )

    // Apply damage using the shared function
    const damageResult = this.applyDamage(target, totalDamage, options.bypassShield || false)

    return {
      success: true,
      damageDealt: damageResult.actualDamage,
      shieldDamage: damageResult.shieldDamage,
      hullDamage: damageResult.hullDamage,
      entityDestroyed: damageResult.entityDestroyed,
      message: damageResult.entityDestroyed
        ? options.destroyMessage || 'Target destroyed!'
        : `${options.hitMessage || 'Dealt'} ${damageResult.actualDamage} damage (Shield: ${damageResult.shieldDamage}, Hull: ${damageResult.hullDamage})`,
    }
  }

  private applyDamage(target: ShipModel, totalDamage: number, bypassShield: boolean) {
    let remainingDamage = totalDamage
    let shieldDamage = 0
    let hullDamage = 0

    if (bypassShield) {
      // Pierce: damage goes directly to hull
      if (target.currentHull > 0 && remainingDamage > 0) {
        hullDamage = Math.min(remainingDamage, target.currentHull)
        target.currentHull -= hullDamage
        remainingDamage -= hullDamage
      }
    } else {
      // Normal damage: shield first, then hull
      if (target.currentShield > 0 && remainingDamage > 0) {
        shieldDamage = Math.min(remainingDamage, target.currentShield)
        target.currentShield -= shieldDamage
        remainingDamage -= shieldDamage
      }

      if (target.currentHull > 0 && remainingDamage > 0) {
        hullDamage = Math.min(remainingDamage, target.currentHull)
        target.currentHull -= hullDamage
        remainingDamage -= hullDamage
      }
    }

    const entityDestroyed = target.currentShield <= 0 && target.currentHull <= 0
    const actualDamage = totalDamage - remainingDamage

    return { actualDamage, shieldDamage, hullDamage, entityDestroyed }
  }

  private calculateFinalDamage(
    baseDamage: number,
    source?: ActivationSource,
    target?: ShipModel,
    logPrefix = 'DAMAGE',
  ): number {
    let finalDamage = baseDamage

    if (source) {
      // Apply source component condition/buffs
      const componentCondition =
        source.sourceComponent.durability.value / source.sourceComponent.durability.maxValue
      if (componentCondition < 0.5) {
        // Damaged components deal less damage
        finalDamage *= 0.7
        console.log(`[${logPrefix} CALC] Component damaged, damage reduced to ${finalDamage}`)
      }

      console.log(
        `[${logPrefix} CALC] Weapon: ${source.sourceComponent.definition.name}, Base: ${baseDamage}, Component condition: ${Math.round(componentCondition * 100)}%, Final: ${finalDamage}`,
      )
    }

    // Apply target defensive buffs/debuffs (placeholder for future implementation)
    if (target) {
      // Example: finalDamage *= (1 - (target.defensiveBonus || 0))
    }

    return Math.round(finalDamage)
  }
}

// Regular damage activation
export class DamageActivation extends BaseDamageActivation {
  protected getDamageOptions(): DamageApplicationOptions {
    return {
      bypassShield: false,
      damageMultiplier: 1,
      logPrefix: 'DAMAGE',
      hitMessage: 'Dealt',
      destroyMessage: 'Target destroyed!',
    }
  }
}

// Critical damage activation that deals double damage
export class CriticalDamageActivation extends BaseDamageActivation {
  protected getDamageOptions(): DamageApplicationOptions {
    return {
      bypassShield: false,
      damageMultiplier: 2,
      logPrefix: 'CRITICAL DAMAGE',
      hitMessage: 'Critical hit! Dealt',
      destroyMessage: 'Target destroyed by critical hit!',
    }
  }
}

// Pierce damage activation that bypasses shields
export class PierceDamageActivation extends BaseDamageActivation {
  protected getDamageOptions(): DamageApplicationOptions {
    return {
      bypassShield: true,
      damageMultiplier: 1,
      logPrefix: 'PIERCE DAMAGE',
      hitMessage: 'Piercing hit! Dealt',
      destroyMessage: 'Target pierced and destroyed!',
    }
  }
}

// Single damage activation instance - damage comes from weapon component
export const DAMAGE_ACTIVATION = new DamageActivation()

// Critical damage activation instance - double damage from weapon component
export const CRITICAL_DAMAGE_ACTIVATION = new CriticalDamageActivation()

// Pierce damage activation instance - bypasses shields and hits hull directly
export const PIERCE_DAMAGE_ACTIVATION = new PierceDamageActivation()
