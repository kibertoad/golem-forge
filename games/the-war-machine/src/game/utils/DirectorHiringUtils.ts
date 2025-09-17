import type { PotatoScene } from '@potato-golem/ui'
import { SelectionCard } from '../components/SelectionCard.ts'
import type { WorldModel } from '../model/entities/WorldModel.ts'
import {
  createCenteredContainer,
  createFullScreenOverlay,
  LayoutRegistry,
} from '../registries/layoutRegistry.ts'
import { Borders, Colors, Typography } from '../registries/styleRegistry.ts'
import { DirectorHiringDialog } from '../scenes/personnel/DirectorHiringDialog.ts'

/**
 * Shows the fee selection dialog for hiring a new director
 */
export function showDirectorHiringDialog(
  scene: PotatoScene,
  worldModel: WorldModel,
  onHireComplete?: (directorName: string | null) => void,
) {
  const standardFee = 50000
  const premiumFee = 150000

  // Create full-screen overlay
  const overlay = createFullScreenOverlay(scene, 0.8, 2500)

  // Create main container - centered on screen
  const container = createCenteredContainer(scene, 2501)

  // Main container background
  const bg = scene.add.rectangle(
    0,
    0,
    LayoutRegistry.hiring.dialogWidth,
    500,
    Colors.selection.titleBg,
    0.98,
  )
  bg.setStrokeStyle(Borders.width.thick, Colors.selection.cardBorderHover)
  container.add(bg)

  const title = scene.add.text(0, -200, 'SELECT AGENCY SERVICE', {
    fontSize: Typography.fontSize.h2,
    color: Colors.text.primary,
    fontStyle: Typography.fontStyle.bold,
  })
  title.setOrigin(0.5)
  container.add(title)

  // Service tier options with colored borders
  const tiers = [
    {
      type: 'standard' as const,
      name: 'STANDARD AGENCY',
      color: Colors.status.warning,
      description: 'Stats visible\nTraits hidden for 3 months\n3 candidates',
      price: `$${standardFee.toLocaleString()}`,
      callback: () => {
        const budget = worldModel.gameStatus.money
        if (budget < standardFee) {
          showError(`Insufficient funds (need $${standardFee.toLocaleString()})`)
          return
        }
        worldModel.deductMoney(standardFee)
        overlay.destroy()
        container.destroy()
        openHiringDialog(false)
      },
    },
    {
      type: 'premium' as const,
      name: 'PREMIUM AGENCY',
      color: Colors.status.success,
      description: 'All stats visible\nAll traits visible\n3 candidates',
      price: `$${premiumFee.toLocaleString()}`,
      callback: () => {
        const budget = worldModel.gameStatus.money
        if (budget < premiumFee) {
          showError(`Insufficient funds (need $${premiumFee.toLocaleString()})`)
          return
        }
        worldModel.deductMoney(premiumFee)
        overlay.destroy()
        container.destroy()
        openHiringDialog(true)
      },
    },
  ]

  tiers.forEach((tier, index) => {
    const x = LayoutRegistry.selection.tierCards.getXPosition(index, tiers.length)
    const y = 0

    const card = new SelectionCard(
      scene,
      x,
      y,
      {
        width: LayoutRegistry.selection.tierCards.width,
        height: LayoutRegistry.selection.tierCards.height,
        borderColor: tier.color,
        borderWidth: Borders.width.thick,
        hoverBorderColor: tier.color,
      },
      [
        {
          type: 'title',
          y: -100,
          text: tier.name,
          style: {
            fontSize: Typography.fontSize.h3,
            fontStyle: Typography.fontStyle.bold,
          },
        },
        {
          type: 'text',
          y: -50,
          text: tier.price,
          style: {
            fontSize: Typography.fontSize.h4,
            color: Colors.selection.salaryText,
            fontStyle: Typography.fontStyle.bold,
          },
        },
        {
          type: 'subtitle',
          y: 20,
          text: tier.description,
          style: {
            align: 'center',
          },
        },
      ],
      {
        onClick: tier.callback,
      },
    )

    container.add(card)
  })

  // Cancel button
  const cancelButton = scene.add.container(0, 180)
  const cancelBg = scene.add.rectangle(
    0,
    0,
    LayoutRegistry.selection.buttons.back.width,
    LayoutRegistry.selection.buttons.back.height,
    Colors.selection.skipButton,
    0.9,
  )
  cancelBg.setStrokeStyle(Borders.width.normal, Colors.selection.skipButtonHover)
  cancelBg.setInteractive()
  cancelButton.add(cancelBg)

  const cancelText = scene.add.text(0, 0, 'CANCEL', {
    fontSize: Typography.fontSize.button,
    color: Colors.text.primary,
  })
  cancelText.setOrigin(0.5)
  cancelButton.add(cancelText)
  container.add(cancelButton)

  // Add container to scene
  scene.add.existing(container)

  // Helper function to show error
  const showError = (message: string) => {
    const errorText = scene.add.text(scene.cameras.main.width / 2, 100, message, {
      fontSize: '24px',
      color: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
    })
    errorText.setOrigin(0.5)
    errorText.setDepth(3000)

    scene.tweens.add({
      targets: errorText,
      alpha: 0,
      duration: 2000,
      delay: 1000,
      onComplete: () => errorText.destroy(),
    })
  }

  // Helper function to show success
  const showSuccess = (message: string) => {
    const successText = scene.add.text(scene.cameras.main.width / 2, 100, message, {
      fontSize: '24px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
    })
    successText.setOrigin(0.5)
    successText.setDepth(3000)

    scene.tweens.add({
      targets: successText,
      alpha: 0,
      duration: 2000,
      delay: 1000,
      onComplete: () => successText.destroy(),
    })
  }

  // Helper function to show info
  const showInfo = (message: string) => {
    const infoText = scene.add.text(scene.cameras.main.width / 2, 100, message, {
      fontSize: '24px',
      color: '#ffaa00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
    })
    infoText.setOrigin(0.5)
    infoText.setDepth(3000)

    scene.tweens.add({
      targets: infoText,
      alpha: 0,
      duration: 2000,
      delay: 1000,
      onComplete: () => infoText.destroy(),
    })
  }

  // Open hiring dialog helper
  const openHiringDialog = (isPremium: boolean) => {
    const hiringDialog = new DirectorHiringDialog(
      scene,
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2,
      isPremium,
      (director) => {
        if (director) {
          // Set hire turn for trait reveal tracking
          director.hiredTurn = worldModel.gameStatus.turn
          worldModel.addResearchDirector(director)
          showSuccess(`Hired ${director.name}`)
          onHireComplete?.(director.name)
        } else {
          showInfo('Agency fee lost, no director hired')
          onHireComplete?.(null)
        }
      },
    )
  }

  // Cancel button handler
  cancelBg.on('pointerdown', () => {
    overlay.destroy()
    container.destroy()
  })
}
