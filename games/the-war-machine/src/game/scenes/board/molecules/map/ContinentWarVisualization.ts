import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'
import type { WorldModel } from '../../../../model/entities/WorldModel.ts'
import type { CountryInfo } from '../../../../model/enums/ContinentData.ts'
import type { Country } from '../../../../model/enums/Countries.ts'
import type { EarthRegion } from '../../../../model/enums/EarthRegions.ts'

export class ContinentWarVisualization extends GameObjects.Container {
  private warLines: GameObjects.Graphics[] = []
  private worldModel: WorldModel
  private continent: EarthRegion
  private countryPositions: Map<Country, { x: number; y: number }> = new Map()

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    worldModel: WorldModel,
    continent: EarthRegion,
  ) {
    super(scene, x, y)
    this.worldModel = worldModel
    this.continent = continent
    scene.add.existing(this)
  }

  // Set country positions from the continent view
  setCountryPosition(country: Country, x: number, y: number) {
    this.countryPositions.set(country, { x, y })
  }

  // Update war visualizations for the continent
  updateWarVisualization(continentCountries: CountryInfo[]) {
    // Clear existing visualizations
    this.clearVisualizations()

    // Get all countries in this continent
    const continentCountrySet = new Set(continentCountries.map((ci) => ci.country))

    // Check each country in the continent
    continentCountries.forEach((countryInfo) => {
      const countryModel = this.worldModel.getCountry(countryInfo.country)
      if (!countryModel || !countryModel.isAtWar) return

      // Check who this country is attacking (only show attacks within the same continent)
      countryModel.isAttacking.forEach((targetCountry) => {
        // Only show if the target is also in this continent
        if (continentCountrySet.has(targetCountry)) {
          this.drawAttackLine(countryInfo.country, targetCountry)
        }
      })
    })
  }

  private drawAttackLine(attacker: Country, defender: Country) {
    const attackerPos = this.countryPositions.get(attacker)
    const defenderPos = this.countryPositions.get(defender)

    if (!attackerPos || !defenderPos) return

    const graphics = this.scene.add.graphics()

    // Set line style for attack lines - thicker and more visible on continent view
    graphics.lineStyle(4, 0xff0000, 0.9) // Red attack lines

    // Calculate angle and arrow position first
    const angle = Phaser.Math.Angle.Between(
      attackerPos.x,
      attackerPos.y,
      defenderPos.x,
      defenderPos.y,
    )
    const arrowDistance = 30
    const lineEndX = defenderPos.x - Math.cos(angle) * (arrowDistance - 10) // Stop line just before arrow
    const lineEndY = defenderPos.y - Math.sin(angle) * (arrowDistance - 10)

    // Draw the main line
    graphics.beginPath()
    graphics.moveTo(attackerPos.x, attackerPos.y)

    // Create a dashed line effect to the adjusted end point
    const distance = Phaser.Math.Distance.Between(attackerPos.x, attackerPos.y, lineEndX, lineEndY)
    const dashLength = 20
    const steps = Math.floor(distance / dashLength)

    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const x = Phaser.Math.Linear(attackerPos.x, lineEndX, t)
      const y = Phaser.Math.Linear(attackerPos.y, lineEndY, t)

      if (i % 2 === 1) {
        graphics.lineTo(x, y)
      } else {
        graphics.moveTo(x, y)
      }
    }

    // Always complete the line to the calculated end point
    graphics.lineTo(lineEndX, lineEndY)

    graphics.strokePath()

    // Draw arrow head pointing to defender
    this.drawArrowHead(graphics, attackerPos, defenderPos)

    // Add war indicator at midpoint
    const midX = (attackerPos.x + defenderPos.x) / 2
    const midY = (attackerPos.y + defenderPos.y) / 2

    // Add crossed swords emoji at midpoint
    const warIcon = this.scene.add.text(midX, midY, '⚔️', {
      fontSize: '24px',
      color: '#ff0000',
    })
    warIcon.setOrigin(0.5)
    warIcon.setDepth(100)

    // Add pulsing animation to war icon
    this.scene.tweens.add({
      targets: warIcon,
      scale: { from: 1, to: 1.3 },
      alpha: { from: 1, to: 0.7 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    })

    this.add(graphics)
    this.add(warIcon)
    this.warLines.push(graphics)
  }

  private drawArrowHead(
    graphics: GameObjects.Graphics,
    startPos: { x: number; y: number },
    endPos: { x: number; y: number },
  ) {
    // Calculate angle for arrow head
    const angle = Phaser.Math.Angle.Between(startPos.x, startPos.y, endPos.x, endPos.y)

    // Draw arrow head closer to the target
    const arrowSize = 15
    const arrowDistance = 30
    const arrowX = endPos.x - Math.cos(angle) * arrowDistance
    const arrowY = endPos.y - Math.sin(angle) * arrowDistance

    graphics.fillStyle(0xff0000, 1)
    graphics.beginPath()
    graphics.moveTo(arrowX, arrowY)
    graphics.lineTo(
      arrowX - Math.cos(angle - 0.5) * arrowSize,
      arrowY - Math.sin(angle - 0.5) * arrowSize,
    )
    graphics.lineTo(
      arrowX - Math.cos(angle + 0.5) * arrowSize,
      arrowY - Math.sin(angle + 0.5) * arrowSize,
    )
    graphics.closePath()
    graphics.fillPath()

    // Add a circle at the arrow tip for better visibility
    graphics.fillStyle(0xffaa00, 0.8)
    graphics.fillCircle(arrowX, arrowY, 5)
  }

  private clearVisualizations() {
    // Clear war lines
    this.warLines.forEach((line) => line.destroy())
    this.warLines = []

    // Clear all children
    this.removeAll(true)
  }

  destroy() {
    this.clearVisualizations()
    super.destroy()
  }
}
