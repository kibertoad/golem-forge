import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'
import type { WorldModel } from '../../../model/entities/WorldModel.ts'
import { type Country, CountryNames } from '../../../model/enums/Countries.ts'
import { PoliticalStance, RegimeType } from '../../../model/enums/CountryAttributes.ts'
import { CountryCapitals } from '../../../model/enums/CountryCapitals.ts'
import type { WarSystem } from '../../../model/WarSystem.ts'

export class CountryInfoOverlay extends GameObjects.Container {
  private background: GameObjects.Graphics
  private titleText: GameObjects.Text
  private infoTexts: GameObjects.Text[] = []
  private instructionText: GameObjects.Text

  constructor(scene: PotatoScene, country: Country, worldModel: WorldModel, warSystem?: WarSystem) {
    super(scene, scene.cameras.main.width / 2, 120)

    const countryName = CountryNames[country] || country
    const countryModel = worldModel.getCountry(country)
    if (!countryModel) {
      console.error(`Country model not found for ${country}`)
      return
    }
    const capital = CountryCapitals[country]

    // Create larger semi-transparent background
    this.background = scene.add.graphics()
    this.background.fillStyle(0x000000, 0.95)
    this.background.fillRoundedRect(-500, -60, 1000, 280, 20)
    this.background.lineStyle(3, 0x00ffff, 1)
    this.background.strokeRoundedRect(-500, -60, 1000, 280, 20)

    // Country name and flag - bigger font
    this.titleText = scene.add.text(0, -30, `🏴 ${countryName}`, {
      fontSize: '36px',
      fontFamily: 'Courier',
      color: '#00ffff',
      fontStyle: 'bold',
    })
    this.titleText.setOrigin(0.5)

    // Create info columns with larger spacing
    const leftColumnX = -450
    const rightColumnX = 50
    const yPos = 20

    // Left column - Basic info with bigger fonts
    const capitalText = scene.add.text(
      leftColumnX,
      yPos,
      `Capital: ${capital?.name || 'Unknown'}`,
      {
        fontSize: '20px',
        fontFamily: 'Courier',
        color: '#ffffff',
      },
    )
    this.infoTexts.push(capitalText)

    const regimeText = scene.add.text(
      leftColumnX,
      yPos + 35,
      `Regime: ${this.getRegimeName(countryModel.regime as RegimeType)}`,
      {
        fontSize: '20px',
        fontFamily: 'Courier',
        color: '#ffffff',
      },
    )
    this.infoTexts.push(regimeText)

    const stanceText = scene.add.text(
      leftColumnX,
      yPos + 70,
      `Stance: ${this.getStanceName(countryModel.politicalStance as PoliticalStance)}`,
      {
        fontSize: '20px',
        fontFamily: 'Courier',
        color: this.getStanceColor(countryModel.politicalStance as PoliticalStance),
      },
    )
    this.infoTexts.push(stanceText)

    // Military ratings with visual bars
    const budgetText = scene.add.text(
      leftColumnX,
      yPos + 105,
      `Budget: ${this.createStars(countryModel.militaryBudget)}`,
      {
        fontSize: '20px',
        fontFamily: 'Courier',
        color: '#ffffff',
      },
    )
    this.infoTexts.push(budgetText)

    // Right column - Additional info with bigger fonts
    const corruptionText = scene.add.text(
      rightColumnX,
      yPos,
      `Corruption: ${this.createStars(countryModel.corruption, true)}`,
      {
        fontSize: '20px',
        fontFamily: 'Courier',
        color: '#ffffff',
      },
    )
    this.infoTexts.push(corruptionText)

    const visibilityText = scene.add.text(
      rightColumnX,
      yPos + 35,
      `Visibility: ${this.createStars(countryModel.visibility)}`,
      {
        fontSize: '20px',
        fontFamily: 'Courier',
        color: '#ffffff',
      },
    )
    this.infoTexts.push(visibilityText)

    const standardsText = scene.add.text(
      rightColumnX,
      yPos + 70,
      `Standards: ${this.createStars(countryModel.standards)}`,
      {
        fontSize: '20px',
        fontFamily: 'Courier',
        color: '#ffffff',
      },
    )
    this.infoTexts.push(standardsText)

    // War status with bigger font
    if (warSystem && warSystem.isAtWar(country)) {
      const wars = warSystem.getWarsForCountry(country)
      if (wars.length > 0) {
        const war = wars[0]
        const isAggressor = war.aggressor === country
        const opponent = isAggressor ? war.defender : war.aggressor
        const opponentName = CountryNames[opponent] || opponent
        const warStatus = isAggressor
          ? `🔥 At war: Attacking ${opponentName}`
          : `🛡️ At war: Defending against ${opponentName}`

        const warText = scene.add.text(rightColumnX, yPos + 105, warStatus, {
          fontSize: '20px',
          fontFamily: 'Courier',
          color: '#ff4444',
        })
        this.infoTexts.push(warText)
      }
    }

    // Military capabilities with bigger font and stars
    const armyProdStars = this.createStars(countryModel.industrialProduction.army)
    const navyProdStars = this.createStars(countryModel.industrialProduction.navy)
    const airProdStars = this.createStars(countryModel.industrialProduction.airforce)
    const milText = scene.add.text(
      leftColumnX,
      yPos + 140,
      `Production: Army ${armyProdStars} Navy ${navyProdStars} Air ${airProdStars}`,
      {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: '#aaaaaa',
      },
    )
    this.infoTexts.push(milText)

    // Tech capabilities with stars
    const armyTechStars = this.createStars(countryModel.industrialTech.army)
    const navyTechStars = this.createStars(countryModel.industrialTech.navy)
    const airTechStars = this.createStars(countryModel.industrialTech.airforce)
    const techText = scene.add.text(
      leftColumnX,
      yPos + 165,
      `Technology: Army ${armyTechStars} Navy ${navyTechStars} Air ${airTechStars}`,
      {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: '#aaaaaa',
      },
    )
    this.infoTexts.push(techText)

    // Remove instruction text since overlay auto-hides on hover out
    this.instructionText = scene.add.text(0, 195, '', {
      fontSize: '14px',
      fontFamily: 'Courier',
      color: '#888888',
      fontStyle: 'italic',
    })
    this.instructionText.setOrigin(0.5)

    // Add all elements
    this.add([this.background, this.titleText, ...this.infoTexts, this.instructionText])
    scene.add.existing(this)
    this.setDepth(4000)
    this.setAlpha(0)

    // Fade in
    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    })

    // No interaction needed since overlay is controlled by hover
  }

  private fadeOut() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        super.destroy()
      },
    })
  }

  destroy() {
    // Kill any running tweens
    this.scene.tweens.killTweensOf(this)
    super.destroy()
  }

  private createStars(value: number, inverse: boolean = false): string {
    const actualValue = inverse ? 5 - value : value
    return '★'.repeat(actualValue) + '☆'.repeat(5 - actualValue)
  }

  private getRegimeName(regime: RegimeType): string {
    const names = {
      [RegimeType.DEMOCRACY]: 'Democracy',
      [RegimeType.TOTALITARIAN]: 'Totalitarian',
      [RegimeType.AUTHORITARIAN]: 'Authoritarian',
      [RegimeType.MONARCHY]: 'Monarchy',
      [RegimeType.THEOCRACY]: 'Theocracy',
      [RegimeType.MILITARY_JUNTA]: 'Military Junta',
      [RegimeType.OLIGARCHY]: 'Oligarchy',
    }
    return names[regime] || regime
  }

  private getStanceName(stance: PoliticalStance): string {
    const names = {
      [PoliticalStance.ISOLATIONIST]: 'Isolationist',
      [PoliticalStance.INTERVENTIONIST]: 'Interventionist',
      [PoliticalStance.EXPANSIONIST]: 'Expansionist',
      [PoliticalStance.NEUTRAL]: 'Neutral',
      [PoliticalStance.DEFENSIVE]: 'Defensive',
      [PoliticalStance.COOPERATIVE]: 'Cooperative',
    }
    return names[stance] || stance
  }

  private getStanceColor(stance: PoliticalStance): string {
    const colors = {
      [PoliticalStance.ISOLATIONIST]: '#888888',
      [PoliticalStance.INTERVENTIONIST]: '#ffaa00',
      [PoliticalStance.EXPANSIONIST]: '#ff4444',
      [PoliticalStance.NEUTRAL]: '#aaaaaa',
      [PoliticalStance.DEFENSIVE]: '#4488ff',
      [PoliticalStance.COOPERATIVE]: '#44ff88',
    }
    return colors[stance] || '#ffffff'
  }
}
