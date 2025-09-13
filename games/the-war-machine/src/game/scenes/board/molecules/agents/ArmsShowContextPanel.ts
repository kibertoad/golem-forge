import { GameObjects } from 'phaser'
import type { PotatoScene } from '@potato-golem/ui'
import type { ArmsShowDefinition } from '../../../../model/definitions/armsShowsDefinitions.ts'
import type { BusinessAgentModel } from '../../../../model/entities/BusinessAgentModel.ts'

export function createArmsShowContextPanel(
  scene: PotatoScene,
  armsShow: ArmsShowDefinition,
  availableCash: number
): GameObjects.Container {
  const panel = scene.add.container(0, 0)

  // Panel background - adjusted height and width to fit content
  const panelBg = scene.add.graphics()
  panelBg.fillStyle(0x002244, 0.8)
  panelBg.fillRoundedRect(-395, -90, 790, 180, 5)
  panelBg.lineStyle(2, 0x00ffff, 0.5)
  panelBg.strokeRoundedRect(-395, -90, 790, 180, 5)
  panel.add(panelBg)

  // Show name
  const showName = scene.add.text(0, -65, armsShow.name, {
    fontSize: '22px',
    fontFamily: 'Courier',
    color: '#ffff00',
    align: 'center',
    wordWrap: { width: 750 },
  })
  showName.setOrigin(0.5)
  panel.add(showName)

  // Show details - more compact layout with reduced spacing
  const details = [
    `Country: ${armsShow.country}`,
    `Entry Fee: $${armsShow.entranceFee.toLocaleString()}`,
    `Prestige: ${'★'.repeat(armsShow.prestigeLevel)}${'☆'.repeat(5 - armsShow.prestigeLevel)}`,
    `Arms Branches: ${armsShow.armsBranches.join(', ')}`,
  ]

  details.forEach((detail, index) => {
    const detailText = scene.add.text(-365, -30 + index * 25, detail, {
      fontSize: '18px',
      fontFamily: 'Courier',
      color: '#00ffff',
    })
    panel.add(detailText)
  })

  // Available cash - positioned at bottom of panel
  const cashText = scene.add.text(0, 75, `Available Cash: $${availableCash.toLocaleString()}`, {
    fontSize: '20px',
    fontFamily: 'Courier',
    color: availableCash >= armsShow.entranceFee ? '#00ff00' : '#ff0000',
    align: 'center',
  })
  cashText.setOrigin(0.5)
  panel.add(cashText)

  return panel
}

export function createArmsShowCostCalculator(armsShow: ArmsShowDefinition): (agent: BusinessAgentModel) => number {
  return (agent: BusinessAgentModel) => {
    return agent.calculateAttendanceFee(armsShow.entranceFee)
  }
}

export function createArmsShowSelectionValidator(armsShow: ArmsShowDefinition): (agent: BusinessAgentModel, cash: number) => boolean {
  return (agent: BusinessAgentModel, availableCash: number) => {
    const cost = agent.calculateAttendanceFee(armsShow.entranceFee)
    return agent.status === 'available' && availableCash >= cost
  }
}