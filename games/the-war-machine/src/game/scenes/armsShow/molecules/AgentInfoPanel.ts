import { GameObjects } from 'phaser'
import type { PotatoScene } from '@potato-golem/ui'
import type { BusinessAgentModel } from '../../../model/entities/BusinessAgentModel.ts'

export class AgentInfoPanel extends GameObjects.Container {
  private background: GameObjects.Graphics
  private agent: BusinessAgentModel

  constructor(scene: PotatoScene, x: number, y: number, agent: BusinessAgentModel) {
    super(scene, x, y)
    this.agent = agent

    // Background
    this.background = scene.add.graphics()
    this.background.fillStyle(0x003366, 0.8)
    this.background.fillRoundedRect(0, 0, 350, 150, 5)
    this.background.lineStyle(2, 0x00ffff, 0.8)
    this.background.strokeRoundedRect(0, 0, 350, 150, 5)
    this.add(this.background)

    // Agent name
    const agentName = scene.add.text(175, 20, `Agent: ${agent.name}`, {
      fontSize: '22px',
      fontFamily: 'Courier',
      color: '#ffffff',
    })
    agentName.setOrigin(0.5)
    this.add(agentName)

    // Skills
    const skills = [
      `Negotiation: ${agent.skills.negotiation}/10`,
      `Networking: ${agent.skills.networking}/10`,
      `Languages: ${agent.skills.languages}/10`,
      `Finance: ${agent.skills.finance}/10`,
    ]

    skills.forEach((skill, index) => {
      const skillText = scene.add.text(20, 50 + index * 25, skill, {
        fontSize: '18px',
        fontFamily: 'Courier',
        color: '#00ffff',
      })
      this.add(skillText)
    })

    scene.add.existing(this)
  }

  updateAgent(agent: BusinessAgentModel) {
    this.agent = agent
    // Update displayed info if needed
  }
}