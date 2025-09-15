import type { TurnProcessor } from '@potato-golem/core'
import type { Dependencies } from '../diConfig.ts'
import type { WorldModel } from '../entities/WorldModel.ts'
import type { WarDirector } from './WarDirector.ts'

export class EndTurnProcessor implements TurnProcessor {
  private readonly worldModel: WorldModel
  private readonly warDirector: WarDirector

  constructor({ worldModel, warDirector }: Dependencies) {
    this.worldModel = worldModel
    this.warDirector = warDirector
  }

  processTurn(): void {
    console.log('Next turn')

    // Process war operations first
    this.warDirector.processTurn()

    // Check for trait reveals on directors hired with standard fee
    const currentTurn = this.worldModel.gameStatus.turn
    const revealedDirectors: string[] = []

    this.worldModel.researchDirectors.forEach((director) => {
      if (director.checkTraitReveal(currentTurn)) {
        revealedDirectors.push(director.name)
      }
    })

    if (revealedDirectors.length > 0) {
      console.log(`Traits revealed for: ${revealedDirectors.join(', ')}`)
      // TODO: Could emit an event here to notify UI
    }

    // Process research facility progress (weekly)
    this.worldModel.researchFacilities.forEach((facility) => {
      // Process lab upgrades
      if (facility.isUpgrading) {
        const completed = facility.processUpgrade()
        if (completed) {
          console.log(`${facility.name}: Upgrade to tech level ${facility.techLevel} completed`)
        }
      }

      // Process research projects
      if (facility.currentProject && facility.director) {
        // Advance research returns percentage progress made
        const progress = facility.advanceResearch()
        if (progress > 0) {
          console.log(`${facility.name}: Research advanced by ${progress.toFixed(1)}%`)
        }
      }
    })
  }
}
