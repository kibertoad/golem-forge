import type { PotatoScene } from '@potato-golem/ui'
import { GameObjects } from 'phaser'
import type { ArmsShowDefinition } from '../../../model/definitions/armsShowsDefinitions.ts'

export class ShowDetailsPanel extends GameObjects.Container {
  private background: GameObjects.Graphics
  private armsShow: ArmsShowDefinition

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    width: number,
    armsShow: ArmsShowDefinition,
  ) {
    super(scene, x, y)
    this.armsShow = armsShow

    // Background
    this.background = scene.add.graphics()
    this.background.fillStyle(0x002244, 0.8)
    this.background.fillRoundedRect(0, 0, width, 150, 5)
    this.background.lineStyle(2, 0x00ffff, 0.5)
    this.background.strokeRoundedRect(0, 0, width, 150, 5)
    this.add(this.background)

    // Show details
    const details = [
      `Location: ${armsShow.country}`,
      `Prestige Level: ${'★'.repeat(armsShow.prestigeLevel)}${'☆'.repeat(5 - armsShow.prestigeLevel)}`,
      `Entry Fee Paid: $${armsShow.entranceFee.toLocaleString()}`,
      `Arms Branches Present: ${armsShow.armsBranches.join(', ')}`,
    ]

    details.forEach((detail, index) => {
      const detailText = scene.add.text(20, 20 + index * 30, detail, {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: '#ffffff',
      })
      this.add(detailText)
    })

    scene.add.existing(this)
  }
}
