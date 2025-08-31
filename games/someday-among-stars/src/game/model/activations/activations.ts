import type { ShipModel } from '../entities/ShipModel.ts'
import type { CommonComponentModel } from '../entities/ComponentModel.ts'

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

// Damage activation that gets base damage from the weapon component
export class DamageActivation implements TargettedActivation {
  public readonly type = 'damage' as const

  execute(target: ShipModel, source?: ActivationSource): ActivationResult {
    if (!source) {
      console.error('[DAMAGE ACTIVATION] No source provided - cannot determine base damage!')
      return {
        success: false,
        message: 'No weapon source provided for damage calculation'
      }
    }

    // Get base damage from the weapon component
    const weaponDefinition = source.sourceComponent.definition as any // Cast to access baseDamage
    const baseDamage = weaponDefinition.baseDamage || 1 // Fallback to 1 if not defined
    
    // Calculate final damage with potential buffs/debuffs
    let totalDamage = this.calculateFinalDamage(baseDamage, source, target)
    
    let remainingDamage = totalDamage
    let shieldDamage = 0
    let hullDamage = 0

    // Damage shield first
    if (target.currentShield > 0 && remainingDamage > 0) {
      shieldDamage = Math.min(remainingDamage, target.currentShield)
      target.currentShield -= shieldDamage
      remainingDamage -= shieldDamage
    }

    // Then damage hull
    if (target.currentHull > 0 && remainingDamage > 0) {
      hullDamage = Math.min(remainingDamage, target.currentHull)
      target.currentHull -= hullDamage
      remainingDamage -= hullDamage
    }

    // Check for entity destruction
    const entityDestroyed = target.currentShield <= 0 && target.currentHull <= 0

    const actualDamage = totalDamage - remainingDamage
    return {
      success: true,
      damageDealt: actualDamage,
      shieldDamage,
      hullDamage,
      entityDestroyed,
      message: entityDestroyed 
        ? 'Target destroyed!' 
        : `Dealt ${actualDamage} damage (Shield: ${shieldDamage}, Hull: ${hullDamage})`
    }
  }

  private calculateFinalDamage(baseDamage: number, source?: ActivationSource, target?: ShipModel): number {
    let finalDamage = baseDamage
    
    if (source) {
      // Apply source ship buffs/debuffs (placeholder for future implementation)
      // Example: finalDamage *= source.sourceShip.damageMultiplier || 1
      
      // Apply source component condition/buffs
      const componentCondition = source.sourceComponent.durability.value / source.sourceComponent.durability.maxValue
      if (componentCondition < 0.5) {
        // Damaged components deal less damage
        finalDamage *= 0.7
        console.log(`[DAMAGE CALC] Component damaged, damage reduced to ${finalDamage}`)
      }
      
      console.log(`[DAMAGE CALC] Weapon: ${source.sourceComponent.definition.name}, Base: ${baseDamage}, Component condition: ${Math.round(componentCondition * 100)}%, Final: ${finalDamage}`)
    }
    
    // Apply target defensive buffs/debuffs (placeholder for future implementation)
    if (target) {
      // Example: finalDamage *= (1 - (target.defensiveBonus || 0))
    }
    
    return Math.round(finalDamage)
  }
}

// Single damage activation instance - damage comes from weapon component
export const DAMAGE_ACTIVATION = new DamageActivation()
