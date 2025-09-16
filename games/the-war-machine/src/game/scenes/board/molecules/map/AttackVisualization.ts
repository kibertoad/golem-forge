import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'
import {
  ATTACKER_BLOCK_HORIZONTAL_OFFSET,
  ATTACKER_BLOCK_VERTICAL_OFFSET,
  calculateCityPosition,
} from '../../../../model/constants/MapPositionConstants.ts'
import type { WorldModel } from '../../../../model/entities/WorldModel.ts'
import { CountryCities } from '../../../../model/enums/Cities.ts'
import { type Country, CountryNames } from '../../../../model/enums/Countries.ts'
import {
  type BorderCity,
  CountryBorderCities,
  getBorderCitiesForDirection,
} from '../../../../model/enums/CountryBorderCities.ts'
import {
  BorderDirection,
  CountryNeighborDirections,
  getOppositeDirection,
} from '../../../../model/enums/CountryNeighborDirections.ts'

export interface AttackInfo {
  attacker: Country
  defender: Country
  direction: BorderDirection // Direction from attacker's perspective
  assaultUnits: number
}

export class AttackVisualization extends GameObjects.Container {
  private attackerBlocks: Map<string, GameObjects.Container> = new Map()
  private attackLines: GameObjects.Graphics[] = []
  private worldModel: WorldModel
  private countryPositions: Map<Country, { x: number; y: number }> = new Map()
  private viewedCountry: Country | null = null

  constructor(scene: PotatoScene, x: number, y: number, worldModel: WorldModel) {
    super(scene, x, y)
    this.worldModel = worldModel
    scene.add.existing(this)
  }

  // Set country positions on the map (called by CityZoomView)
  setCountryPosition(country: Country, x: number, y: number) {
    this.countryPositions.set(country, { x, y })
    this.viewedCountry = country
  }

  // Update attack visualizations based on current wars
  updateAttacks() {
    console.log(`[AttackVisualization] updateAttacks() called for ${this.viewedCountry}`)

    // Clear existing visualizations
    this.clearVisualizations()

    if (!this.viewedCountry) {
      console.log('[AttackVisualization] No viewed country set')
      return
    }

    // Log the country model state
    const countryModel = this.worldModel.getCountry(this.viewedCountry)
    console.log(`[AttackVisualization] Country model for ${this.viewedCountry}:`, {
      exists: !!countryModel,
      isAtWar: countryModel?.isAtWar,
      warsWith: countryModel?.warsWith,
    })

    // Only show incoming attacks (when this country is being attacked)
    // We don't show outgoing attacks from the attacker's perspective
    const incomingAttacks = this.getIncomingAttacks(this.viewedCountry)

    console.log(
      `[AttackVisualization] Incoming attacks on ${this.viewedCountry}:`,
      incomingAttacks.length,
    )
    incomingAttacks.forEach((attack) => {
      console.log(
        `  Incoming attack: ${attack.attacker} -> ${attack.defender} (${attack.assaultUnits} units, direction: ${attack.direction})`,
      )
      this.createAttackVisualization(attack)
    })
  }

  // Get incoming attacks on a country (where the country is the defender)
  private getIncomingAttacks(targetCountry: Country): AttackInfo[] {
    const attacks: AttackInfo[] = []

    // Get the target country model to check who is attacking it
    const targetCountryModel = this.worldModel.getCountry(targetCountry)
    if (!targetCountryModel) return attacks

    // Check all countries that are attacking the target country
    targetCountryModel.isDefending.forEach((attackerCountry) => {
      const attacker = this.worldModel.getCountry(attackerCountry)
      if (attacker) {
        // Check if this country has assault units targeting us
        const assaultUnitsTargetingThis = attacker.getAssaultUnitsTargeting(targetCountry)

        if (assaultUnitsTargetingThis.length > 0) {
          // This country is actively attacking the target country
          // Find the direction from attacker to defender
          const neighborInfo = CountryNeighborDirections[attacker.country]?.find(
            (n) => n.country === targetCountry,
          )

          console.log(
            `[AttackVisualization] Found incoming attack ${attacker.country} -> ${targetCountry}:`,
            {
              hasNeighborInfo: !!neighborInfo,
              direction: neighborInfo?.direction,
              assaultUnits: assaultUnitsTargetingThis.length,
            },
          )

          if (neighborInfo) {
            attacks.push({
              attacker: attacker.country,
              defender: targetCountry,
              direction: neighborInfo.direction,
              assaultUnits: assaultUnitsTargetingThis.length,
            })
          }
        }
      }
    })

    return attacks
  }

  private createAttackVisualization(attack: AttackInfo) {
    console.log(`[AttackVisualization] createAttackVisualization() called for attack:`, attack)

    const defenderPos = this.countryPositions.get(attack.defender)
    console.log(`[AttackVisualization] Defender positions map:`, this.countryPositions)
    console.log(`[AttackVisualization] Defender ${attack.defender} position:`, defenderPos)

    if (!defenderPos) {
      console.log(`[AttackVisualization] ERROR: No defender position for ${attack.defender}`)
      return
    }

    // The direction is from attacker's perspective, we need the opposite for defender's view
    const defenderDirection = getOppositeDirection(attack.direction)
    console.log(
      `[AttackVisualization] Attack direction: ${attack.direction}, Defender perspective: ${defenderDirection}`,
    )

    // Calculate attacker block position based on direction from defender's perspective
    const blockPos = this.calculateAttackerBlockPosition(defenderPos, defenderDirection)
    console.log(`[AttackVisualization] Calculated block position:`, blockPos)

    // Create attacker block
    const attackerBlock = this.createAttackerBlock(
      attack.attacker,
      attack.assaultUnits,
      blockPos.x,
      blockPos.y,
    )
    console.log(`[AttackVisualization] Created attacker block:`, !!attackerBlock)

    // Get border cities that are being attacked (using the defenderDirection we already calculated)
    const borderCities = getBorderCitiesForDirection(attack.defender, defenderDirection)
    console.log(
      `[AttackVisualization] Border cities for ${attack.defender} in direction ${defenderDirection}:`,
      borderCities,
    )

    // Draw attack lines to border cities
    this.drawAttackLines(blockPos, borderCities, defenderPos)

    // Store the block for later cleanup
    const blockKey = `${attack.attacker}-${attack.defender}`
    this.attackerBlocks.set(blockKey, attackerBlock)
  }

  private calculateAttackerBlockPosition(
    defenderPos: { x: number; y: number },
    direction: BorderDirection,
  ): { x: number; y: number } {
    // Position attacker blocks just outside the country grid
    // Using constants from MapPositionConstants for consistency

    // The direction indicates where the attacker is relative to the defender
    // So if direction is EAST, the attacker is to the east of the defender
    switch (direction) {
      case BorderDirection.NORTH:
        // Attacker is north of defender, so place block above
        return { x: defenderPos.x, y: -ATTACKER_BLOCK_VERTICAL_OFFSET }
      case BorderDirection.SOUTH:
        // Attacker is south of defender, so place block below
        return { x: defenderPos.x, y: ATTACKER_BLOCK_VERTICAL_OFFSET }
      case BorderDirection.EAST:
        // Attacker is east of defender, so place block to the right
        return { x: ATTACKER_BLOCK_HORIZONTAL_OFFSET, y: defenderPos.y }
      case BorderDirection.WEST:
        // Attacker is west of defender, so place block to the left
        return { x: -ATTACKER_BLOCK_HORIZONTAL_OFFSET, y: defenderPos.y }
    }
  }

  private createAttackerBlock(
    attacker: Country,
    unitCount: number,
    x: number,
    y: number,
  ): GameObjects.Container {
    const container = this.scene.add.container(x, y)

    // Background box
    const background = this.scene.add.graphics()
    background.fillStyle(0x880000, 0.9) // Dark red
    background.fillRoundedRect(-80, -30, 160, 60, 8)
    background.lineStyle(2, 0xff0000, 1) // Bright red border
    background.strokeRoundedRect(-80, -30, 160, 60, 8)

    // Country name
    const countryName = CountryNames[attacker] || attacker
    const nameText = this.scene.add.text(0, -10, countryName, {
      fontSize: '14px',
      fontFamily: 'Courier',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    nameText.setOrigin(0.5)

    // Unit count
    const unitText = this.scene.add.text(0, 10, `${unitCount} Assault Units`, {
      fontSize: '12px',
      fontFamily: 'Courier',
      color: '#ffaaaa',
    })
    unitText.setOrigin(0.5)

    // Attack indicator arrows
    const arrow = this.scene.add.text(-70, 0, '⚔️', {
      fontSize: '20px',
    })
    arrow.setOrigin(0.5)

    const arrow2 = this.scene.add.text(70, 0, '⚔️', {
      fontSize: '20px',
    })
    arrow2.setOrigin(0.5)

    container.add([background, nameText, unitText, arrow, arrow2])
    this.add(container)

    console.log(`[AttackVisualization] Added attacker block container to scene at (${x}, ${y})`)
    console.log(`[AttackVisualization] Container visible:`, container.visible)
    console.log(`[AttackVisualization] Parent container visible:`, this.visible)

    return container
  }

  private drawAttackLines(
    attackerPos: { x: number; y: number },
    borderCities: BorderCity[],
    defenderPos: { x: number; y: number },
  ) {
    const graphics = this.scene.add.graphics()

    // Set line style for attack lines
    graphics.lineStyle(3, 0xff0000, 0.8) // Red attack lines

    if (borderCities.length === 0) {
      // If no border cities defined, draw a single line to country center
      graphics.beginPath()
      graphics.moveTo(attackerPos.x, attackerPos.y)

      // Create a dashed line effect
      const distance = Phaser.Math.Distance.Between(
        attackerPos.x,
        attackerPos.y,
        defenderPos.x,
        defenderPos.y,
      )
      const steps = Math.floor(distance / 20)

      for (let i = 0; i < steps; i++) {
        const t = i / steps
        const x = Phaser.Math.Linear(attackerPos.x, defenderPos.x, t)
        const y = Phaser.Math.Linear(attackerPos.y, defenderPos.y, t)

        if (i % 2 === 0) {
          graphics.lineTo(x, y)
        } else {
          graphics.moveTo(x, y)
        }
      }

      graphics.strokePath()

      // Draw arrow head for the single line
      this.drawArrowHead(graphics, attackerPos, defenderPos)
    } else {
      // Get the defender's country for looking up city positions
      const defenderCountry = this.viewedCountry
      if (!defenderCountry) return

      // Draw lines to each border city
      borderCities.forEach((city) => {
        // Get actual city position from city data
        const cityPosition = this.getCityActualPosition(defenderCountry, city.cityName)
        const cityX = cityPosition.x
        const cityY = cityPosition.y

        // Draw attack line
        graphics.beginPath()
        graphics.moveTo(attackerPos.x, attackerPos.y)

        // Animated dashed line
        const distance = Phaser.Math.Distance.Between(attackerPos.x, attackerPos.y, cityX, cityY)
        const dashLength = 15
        const steps = Math.floor(distance / dashLength)

        for (let i = 0; i < steps; i++) {
          const t = i / steps
          const x = Phaser.Math.Linear(attackerPos.x, cityX, t)
          const y = Phaser.Math.Linear(attackerPos.y, cityY, t)

          if (i % 2 === 0) {
            graphics.lineTo(x, y)
          } else {
            graphics.moveTo(x, y)
          }
        }

        // Ensure the line reaches the city by completing the last segment
        if (steps % 2 === 0) {
          graphics.lineTo(cityX, cityY)
        }

        graphics.strokePath()

        // Draw arrow head for this specific line pointing to this city
        this.drawArrowHead(graphics, attackerPos, { x: cityX, y: cityY })

        // Draw city marker
        graphics.fillStyle(0xffff00, 0.8) // Yellow for cities under attack
        graphics.fillCircle(cityX, cityY, 5)

        // Add city name label
        const cityLabel = this.scene.add.text(cityX, cityY - 15, city.cityName, {
          fontSize: '10px',
          fontFamily: 'Courier',
          color: '#ffff00',
          backgroundColor: '#000000',
          padding: { x: 2, y: 1 },
        })
        cityLabel.setOrigin(0.5)
        this.add(cityLabel)
      })
    }

    this.add(graphics)
    this.attackLines.push(graphics)
  }

  private getCityActualPosition(country: Country, cityName: string): { x: number; y: number } {
    // Get the city data for this country
    const cityData = CountryCities[country]
    if (!cityData) {
      // Fallback to generic position if no city data
      return { x: 0, y: 0 }
    }

    // Find the specific city
    const city = cityData.find((c) => c.name === cityName)
    if (!city) {
      // Fallback to generic position if city not found
      console.warn(`[AttackVisualization] City ${cityName} not found for ${country}`)
      return { x: 0, y: 0 }
    }

    // Use the shared calculation function for consistency
    return calculateCityPosition(city.x, city.y)
  }

  private getCityOffset(direction: BorderDirection): { x: number; y: number } {
    const offset = 50 // Distance from country center to place city

    switch (direction) {
      case BorderDirection.NORTH:
        return { x: 0, y: -offset }
      case BorderDirection.SOUTH:
        return { x: 0, y: offset }
      case BorderDirection.EAST:
        return { x: offset, y: 0 }
      case BorderDirection.WEST:
        return { x: -offset, y: 0 }
    }
  }

  private drawArrowHead(
    graphics: GameObjects.Graphics,
    startPos: { x: number; y: number },
    endPos: { x: number; y: number },
  ) {
    // Calculate angle for arrow head
    const angle = Phaser.Math.Angle.Between(startPos.x, startPos.y, endPos.x, endPos.y)

    // Draw arrow head closer to the city (15 pixels away instead of 50)
    const arrowSize = 10
    const arrowDistance = 15
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
  }

  private clearVisualizations() {
    // Clear attacker blocks
    this.attackerBlocks.forEach((block) => block.destroy())
    this.attackerBlocks.clear()

    // Clear attack lines
    this.attackLines.forEach((line) => line.destroy())
    this.attackLines = []

    // Clear all children
    this.removeAll(true)
  }

  destroy() {
    this.clearVisualizations()
    super.destroy()
  }
}
