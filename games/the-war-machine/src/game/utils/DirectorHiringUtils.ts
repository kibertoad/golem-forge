import type { PotatoScene } from '@potato-golem/ui'
import type { WorldModel } from '../model/entities/WorldModel.ts'
import { DirectorHiringDialog } from '../scenes/personnel/DirectorHiringDialog.ts'

export class DirectorHiringUtils {
  /**
   * Shows the fee selection dialog for hiring a new director
   */
  static showFeeSelectionDialog(
    scene: PotatoScene,
    worldModel: WorldModel,
    onHireComplete?: (directorName: string | null) => void,
  ) {
    const standardFee = 50000
    const premiumFee = 150000

    // Create fee selection overlay
    const overlay = scene.add.rectangle(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2,
      2560,
      1440,
      0x000000,
      0.8,
    )
    overlay.setInteractive() // Block clicks
    overlay.setDepth(2500)

    const dialog = scene.add.container(scene.cameras.main.width / 2, scene.cameras.main.height / 2)
    dialog.setDepth(2501)

    const bg = scene.add.rectangle(0, 0, 800, 400, 0x1a1a1a, 0.98)
    bg.setStrokeStyle(3, 0x4a4a4a)
    dialog.add(bg)

    const title = scene.add.text(0, -150, 'SELECT AGENCY SERVICE', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    title.setOrigin(0.5)
    dialog.add(title)

    // Standard option
    const standardContainer = scene.add.container(-200, 0)
    const standardBg = scene.add.rectangle(0, 0, 350, 200, 0x2a2a3a, 0.95)
    standardBg.setStrokeStyle(2, 0x3a3a5a)
    standardBg.setInteractive()
    standardContainer.add(standardBg)

    const standardTitle = scene.add.text(0, -70, 'STANDARD', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    standardTitle.setOrigin(0.5)
    standardContainer.add(standardTitle)

    const standardFeeText = scene.add.text(0, -40, `$${standardFee.toLocaleString()}`, {
      fontSize: '20px',
      color: '#ffaa00',
    })
    standardFeeText.setOrigin(0.5)
    standardContainer.add(standardFeeText)

    const standardDesc = scene.add.text(
      0,
      0,
      'Stats visible\nTraits hidden for 3 months\n3 candidates',
      {
        fontSize: '14px',
        color: '#aaaaaa',
        align: 'center',
      },
    )
    standardDesc.setOrigin(0.5)
    standardContainer.add(standardDesc)

    dialog.add(standardContainer)

    // Premium option
    const premiumContainer = scene.add.container(200, 0)
    const premiumBg = scene.add.rectangle(0, 0, 350, 200, 0x2a3a2a, 0.95)
    premiumBg.setStrokeStyle(2, 0x5a5a3a)
    premiumBg.setInteractive()
    premiumContainer.add(premiumBg)

    const premiumTitle = scene.add.text(0, -70, 'PREMIUM', {
      fontSize: '24px',
      color: '#88ff88',
      fontStyle: 'bold',
    })
    premiumTitle.setOrigin(0.5)
    premiumContainer.add(premiumTitle)

    const premiumFeeText = scene.add.text(0, -40, `$${premiumFee.toLocaleString()}`, {
      fontSize: '20px',
      color: '#ffaa00',
    })
    premiumFeeText.setOrigin(0.5)
    premiumContainer.add(premiumFeeText)

    const premiumDesc = scene.add.text(
      0,
      0,
      'All stats visible\nAll traits visible\n3 candidates',
      {
        fontSize: '14px',
        color: '#aaaaaa',
        align: 'center',
      },
    )
    premiumDesc.setOrigin(0.5)
    premiumContainer.add(premiumDesc)

    dialog.add(premiumContainer)

    // Cancel button
    const cancelButton = scene.add.container(0, 150)
    const cancelBg = scene.add.rectangle(0, 0, 150, 40, 0x5a3a3a, 0.9)
    cancelBg.setStrokeStyle(2, 0x7a5a5a)
    cancelBg.setInteractive()
    cancelButton.add(cancelBg)

    const cancelText = scene.add.text(0, 0, 'Cancel', {
      fontSize: '16px',
      color: '#ffffff',
    })
    cancelText.setOrigin(0.5)
    cancelButton.add(cancelText)
    dialog.add(cancelButton)

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

    // Interactions
    standardBg.on('pointerover', () => {
      standardBg.setFillStyle(0x3a3a4a, 1)
    })

    standardBg.on('pointerout', () => {
      standardBg.setFillStyle(0x2a2a3a, 0.95)
    })

    standardBg.on('pointerdown', () => {
      if (worldModel.gameStatus.money >= standardFee) {
        worldModel.deductMoney(standardFee)
        overlay.destroy()
        dialog.destroy()
        openHiringDialog(false)
      } else {
        showError(`Cannot afford $${standardFee.toLocaleString()} fee`)
        overlay.destroy()
        dialog.destroy()
      }
    })

    premiumBg.on('pointerover', () => {
      premiumBg.setFillStyle(0x3a4a3a, 1)
    })

    premiumBg.on('pointerout', () => {
      premiumBg.setFillStyle(0x2a3a2a, 0.95)
    })

    premiumBg.on('pointerdown', () => {
      if (worldModel.gameStatus.money >= premiumFee) {
        worldModel.deductMoney(premiumFee)
        overlay.destroy()
        dialog.destroy()
        openHiringDialog(true)
      } else {
        showError(`Cannot afford $${premiumFee.toLocaleString()} fee`)
        overlay.destroy()
        dialog.destroy()
      }
    })

    cancelBg.on('pointerdown', () => {
      overlay.destroy()
      dialog.destroy()
    })
  }
}
