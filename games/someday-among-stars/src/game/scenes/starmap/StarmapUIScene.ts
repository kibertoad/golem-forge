import Phaser from 'phaser'
import type { EncounterModel } from '../../model/entities/EncounterModel.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'

export interface PlanetOverlayData {
  name: string
  colonized: boolean
  biome: string
  government?: string
  onMission?: boolean
  region?: string
  inhabitant?: string
  hasShipyard?: boolean
  hasMercenaryGuild?: boolean
  economicType?: 'industrial' | 'scientific' | 'mining' | 'agricultural' | null
  distance?: number
}

/**
 * Needs to be a separate scene so that UI could be scaled separately from the map.
 */
export class StarmapUIScene extends Phaser.Scene {
  // --- Star hover overlay ---
  private overlayBg!: Phaser.GameObjects.Rectangle
  private overlayText!: Phaser.GameObjects.Text
  private overlayBox!: Phaser.GameObjects.Container

  // --- Travel/Stop button ---
  private travelButton!: Phaser.GameObjects.Text
  private travelButtonText = 'Travel to destination'

  // --- Planet overlay ---
  private planetOverlayBox!: Phaser.GameObjects.Container
  private planetBg!: Phaser.GameObjects.Rectangle
  private planetImg!: Phaser.GameObjects.Image
  private planetTitle!: Phaser.GameObjects.Text
  private planetInfo!: Phaser.GameObjects.Text
  private planetButtonGroup!: Phaser.GameObjects.Container
  private planetButtonObjs: Phaser.GameObjects.Text[] = []

  // --- Encounter overlay ---
  private encounterOverlayBox!: Phaser.GameObjects.Container
  private encounterBg!: Phaser.GameObjects.Rectangle
  private encounterImage!: Phaser.GameObjects.Image
  private encounterTitle!: Phaser.GameObjects.Text
  private encounterButtonGroup!: Phaser.GameObjects.Container
  private encounterButtonObjs: Phaser.GameObjects.Text[] = []
  private encounterTooltipBox!: Phaser.GameObjects.Container
  private encounterTooltipBg!: Phaser.GameObjects.Rectangle
  private encounterTooltipText!: Phaser.GameObjects.Text

  constructor() {
    super(sceneRegistry.STARMAP_UI_SCENE)
  }

  create() {
    // --- Star hover overlay ---
    this.overlayBg = this.add
      .rectangle(0, 0, 280, 180, 0x222233, 0.95)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0, 0)
    this.overlayText = this.add.text(0, 0, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      padding: { x: 10, y: 8 },
      lineSpacing: 4,
    })
    this.overlayBox = this.add
      .container(0, 0, [this.overlayBg, this.overlayText])
      .setDepth(1000)
      .setVisible(false)

    // --- Travel/Stop button ---
    this.travelButton = this.add
      .text(0, 0, this.travelButtonText, {
        fontSize: '18px',
        color: '#ffff66',
        backgroundColor: '#222233',
        fontFamily: 'monospace',
        padding: { x: 14, y: 10 },
      })
      .setDepth(1000)
      .setInteractive({ cursor: 'pointer' })
      .setVisible(false)

    this.positionTravelButton()
    this.scale.on('resize', () => {
      this.positionTravelButton()
      this.centerPlanetOverlay()
      this.centerEncounterOverlay()
    })

    this.travelButton.on('pointerdown', () => {
      const main = this.scene.get(sceneRegistry.STARMAP_SCENE)
      main.events.emit('travelButtonClicked')
    })

    // --- Planet overlay modal (hidden by default) ---
    this.planetBg = this.add
      .rectangle(0, 0, 620, 520, 0x151525, 0.97)
      .setOrigin(0, 0)
      .setDepth(10001)
    this.planetImg = this.add
      .image(32 + 176, 44 + 128, imageRegistry.ABOVE_PLANET_BACKGROUND)
      .setOrigin(0.5, 0)
      .setDisplaySize(176, 256)
      .setDepth(10002)
    this.planetTitle = this.add
      .text(240, 44, '', {
        fontSize: '28px',
        color: '#eaeaff',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      })
      .setOrigin(0, 0)
      .setDepth(10002)
    this.planetInfo = this.add
      .text(240, 88, '', {
        fontSize: '18px',
        color: '#d5f4ff',
        fontFamily: 'monospace',
      })
      .setOrigin(0, 0)
      .setDepth(10002)
    this.planetButtonGroup = this.add.container(240, 200).setDepth(10002)

    this.planetOverlayBox = this.add
      .container(this.scale.width / 2 - 310, this.scale.height / 2 - 260, [
        this.planetBg,
        this.planetImg,
        this.planetTitle,
        this.planetInfo,
        this.planetButtonGroup,
      ])
      .setDepth(10001)
      .setVisible(false)

    // --- Encounter overlay (hidden by default) ---
    this.encounterBg = this.add
      .rectangle(0, 0, 560, 350, 0x1a1a28, 0.98)
      .setOrigin(0, 0)
      .setDepth(11001)
    this.encounterImage = this.add
      .image(40 + 160, 32 + 96, imageRegistry.ENCOUNTER_BACKGROUND)
      .setOrigin(0.5, 0)
      .setDisplaySize(180, 192)
      .setDepth(11002)
    this.encounterTitle = this.add
      .text(260, 42, '', {
        fontSize: '26px',
        color: '#eaeaff',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      })
      .setOrigin(0, 0)
      .setDepth(11002)
    this.encounterButtonGroup = this.add.container(260, 96).setDepth(11002)

    // Tooltip for encounter option
    this.encounterTooltipText = this.add
      .text(0, 0, '', {
        fontSize: '16px',
        color: '#fff0da',
        backgroundColor: '#111130',
        fontFamily: 'monospace',
        padding: { x: 12, y: 10 },
        wordWrap: { width: 300 },
      })
      .setDepth(12000)
      .setVisible(false)
    this.encounterTooltipBg = this.add
      .rectangle(0, 0, 340, 60, 0x1c1649, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xffffff)
      .setDepth(11999)
      .setVisible(false)
    // Tooltip is a child of the overlay, so local position!
    this.encounterTooltipBox = this.add
      .container(0, 0, [this.encounterTooltipBg, this.encounterTooltipText])
      .setDepth(12000)
      .setVisible(false)

    this.encounterOverlayBox = this.add
      .container(this.scale.width / 2 - 280, this.scale.height / 2 - 175, [
        this.encounterBg,
        this.encounterImage,
        this.encounterTitle,
        this.encounterButtonGroup,
        this.encounterTooltipBox,
      ])
      .setDepth(11000)
      .setVisible(false)
  }

  // --- Overlay for star hover ---
  showOverlay(x: number, y: number, text: string) {
    // Check if overlay components exist
    if (!this.overlayBox || !this.overlayText || !this.overlayBg) {
      return
    }
    if (this.planetOverlayBox.visible || this.encounterOverlayBox.visible) return
    this.overlayText.setText(text)
    this.overlayBg.setSize(this.overlayText.width + 20, this.overlayText.height + 16)
    const margin = 4
    const boxW = this.overlayBg.width
    const boxH = this.overlayBg.height
    let overlayX = x + 16
    let overlayY = y + 8
    if (overlayX + boxW > this.scale.width - margin) {
      overlayX = this.scale.width - boxW - margin
    }
    if (overlayY + boxH > this.scale.height - margin) {
      overlayY = this.scale.height - boxH - margin
    }
    if (overlayX < margin) overlayX = margin
    if (overlayY < margin) overlayY = margin
    this.overlayBox.setPosition(overlayX, overlayY)
    this.overlayBox.setVisible(true)
  }
  hideOverlay() {
    if (this.overlayBox) {
      this.overlayBox.setVisible(false)
    }
    this.hideEncounterTooltip()
  }

  // --- Travel/Stop button ---
  showTravelButton(show: boolean, text?: string) {
    if (this.planetOverlayBox.visible || this.encounterOverlayBox.visible) {
      this.travelButton.setVisible(false)
      return
    }
    if (text) this.travelButtonText = text
    this.travelButton.setText(this.travelButtonText)
    this.travelButton.setVisible(show)
    this.positionTravelButton()
  }
  hideTravelButton() {
    this.travelButton.setVisible(false)
  }
  private positionTravelButton() {
    this.travelButton.setPosition(this.scale.width - this.travelButton.width - 36, 24)
  }

  // --- Planet arrival overlay ---
  showPlanetOverlay(data: PlanetOverlayData) {
    this.hideOverlay()
    this.hideTravelButton()
    this.hideEncounterOverlay()

    this.planetTitle.setText(`SYSTEM: ${data.name}`)

    let info = ''
    // Region and distance
    if (data.region) {
      info += `Region: ${data.region}\n`
    }
    if (data.distance !== undefined) {
      info += `Distance: ${data.distance.toFixed(1)} ly\n`
    }
    info += '─────────────────────\n'

    // Colonization status
    if (data.colonized) {
      info += 'Status: COLONIZED\n'
      if (data.inhabitant) {
        info += `Inhabitants: ${data.inhabitant}\n`
      }
      if (data.government) {
        info += `Government: ${data.government}\n`
      }
    } else {
      info += 'Status: UNINHABITED\n'
    }

    // Biome
    info += `Biome: ${data.biome}\n`

    // Economic type
    if (data.economicType) {
      const typeLabel = data.economicType.charAt(0).toUpperCase() + data.economicType.slice(1)
      info += `Economy: ${typeLabel} Hub\n`
    }

    // Facilities
    const facilities: string[] = []
    if (data.hasShipyard) facilities.push('Shipyard')
    if (data.hasMercenaryGuild) facilities.push('Mercenary Guild')

    if (facilities.length > 0) {
      info += `\nFacilities Available:\n`
      facilities.forEach((f) => {
        info += `  • ${f}\n`
      })
    }

    this.planetInfo.setText(info)

    this.planetButtonGroup.removeAll(true)
    this.planetButtonObjs = []

    let y = 0
    const buttonConfigs: { label: string; visible: boolean; cb: () => void }[] = [
      {
        label: 'Land at Spaceport',
        visible: data.colonized,
        cb: () => this.events.emit('overlay_land', data),
      },
      {
        label: 'Visit Shipyard',
        visible: !!data.hasShipyard,
        cb: () => this.events.emit('overlay_shipyard', data),
      },
      {
        label: 'Mercenary Guild',
        visible: !!data.hasMercenaryGuild,
        cb: () => this.events.emit('overlay_mercenary_guild', data),
      },
      {
        label: 'Trade Hub',
        visible: !!data.economicType,
        cb: () => this.events.emit('overlay_trade', data),
      },
      {
        label: 'Explore Planet',
        visible: !data.colonized,
        cb: () => this.events.emit('overlay_explore', data),
      },
      {
        label: 'Mission',
        visible: !!data.onMission,
        cb: () => this.events.emit('overlay_mission', data),
      },
      {
        label: 'Leave System',
        visible: true,
        cb: () => this.hidePlanetOverlay(),
      },
    ]

    for (const cfg of buttonConfigs) {
      if (!cfg.visible) continue
      const btn = this.makeButton(cfg.label, y, cfg.cb)
      this.planetButtonGroup.add(btn)
      this.planetButtonObjs.push(btn)
      y += 56
    }

    this.planetOverlayBox.setVisible(true)
    this.centerPlanetOverlay()
  }

  hidePlanetOverlay() {
    this.planetOverlayBox.setVisible(false)
  }
  private centerPlanetOverlay() {
    this.planetOverlayBox.setPosition(this.scale.width / 2 - 310, this.scale.height / 2 - 260)
  }

  private makeButton(label: string, y: number, onClick: () => void): Phaser.GameObjects.Text {
    const btn = this.add
      .text(0, y, label, {
        fontSize: '22px',
        color: '#fff9c0',
        backgroundColor: '#444444',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        padding: { x: 28, y: 14 },
      })
      .setOrigin(0, 0)
      .setInteractive({ cursor: 'pointer' })
      .on('pointerover', () => {
        btn.setStyle({ backgroundColor: '#666699', color: '#ffffff' })
      })
      .on('pointerout', () => {
        btn.setStyle({ backgroundColor: '#444444', color: '#fff9c0' })
      })
      .on('pointerdown', onClick)
    return btn
  }

  // --- ENCOUNTER OVERLAY ---
  showEncounterOverlay(encounter: EncounterModel) {
    this.hideOverlay()
    this.hidePlanetOverlay()
    this.hideTravelButton()

    this.encounterTitle.setText(encounter.name)

    this.encounterButtonGroup.removeAll(true)
    this.encounterButtonObjs = []

    let y = 0
    for (const choice of encounter.choices) {
      const show =
        !choice.conditionsToShow || choice.conditionsToShow.every((cond) => cond.isSatisfied())
      if (!show) continue

      const enabled =
        !choice.conditionsToEnable || choice.conditionsToEnable.every((cond) => cond.isSatisfied())

      const btn = this.add
        .text(0, y, choice.name, {
          fontSize: '22px',
          color: enabled ? '#fff9c0' : '#aaaabb',
          backgroundColor: enabled ? '#444444' : '#222222',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          padding: { x: 28, y: 14 },
        })
        .setOrigin(0, 0)
        .setInteractive({ cursor: enabled ? 'pointer' : 'not-allowed' })
        .on('pointerover', () => {
          btn.setStyle({ backgroundColor: enabled ? '#666699' : '#222222', color: '#ffffff' })
          if (choice.description) {
            // Tooltip: always at the right of overlay, aligned to hovered button
            this.showEncounterTooltip(choice.description, y)
          }
        })
        .on('pointerout', () => {
          btn.setStyle({
            backgroundColor: enabled ? '#444444' : '#222222',
            color: enabled ? '#fff9c0' : '#aaaabb',
          })
          this.hideEncounterTooltip()
        })
        .on('pointerdown', () => {
          if (enabled) {
            // console.log("encounter choice selected", choice);
            const main = this.scene.get(sceneRegistry.STARMAP_SCENE)
            main.events.emit('encounter_choice_selected', choice)
            this.hideEncounterOverlay()
          }
        })
      this.encounterButtonGroup.add(btn)
      this.encounterButtonObjs.push(btn)
      y += 56
    }
    // Add Leave button at the bottom
    /*
        const leaveBtn = this.add.text(0, y, "Leave", {
            fontSize: "22px",
            color: "#fff9c0",
            backgroundColor: "#444444",
            fontFamily: "monospace",
            fontStyle: "bold",
            padding: { x: 28, y: 14 }
        })
            .setOrigin(0, 0)
            .setInteractive({ cursor: 'pointer' })
            .on("pointerover", () => {
                leaveBtn.setStyle({ backgroundColor: "#666699", color: "#ffffff" });
                this.hideEncounterTooltip();
            })
            .on("pointerout", () => {
                leaveBtn.setStyle({ backgroundColor: "#444444", color: "#fff9c0" });
            })
            .on("pointerdown", () => {
                this.hideEncounterOverlay();
                this.events.emit("encounter_leave");
            });
        this.encounterButtonGroup.add(leaveBtn);
        this.encounterButtonObjs.push(leaveBtn);

         */

    this.encounterOverlayBox.setVisible(true)
    this.centerEncounterOverlay()
  }

  hideEncounterOverlay() {
    this.encounterOverlayBox.setVisible(false)
    this.hideEncounterTooltip()
  }
  private centerEncounterOverlay() {
    this.encounterOverlayBox.setPosition(this.scale.width / 2 - 280, this.scale.height / 2 - 175)
  }

  // --- Tooltip always next to overlay, aligned to hovered button ---
  private showEncounterTooltip(desc: string, btnY: number) {
    this.encounterTooltipText.setText(desc)
    this.encounterTooltipBg.setSize(
      this.encounterTooltipText.width + 16,
      this.encounterTooltipText.height + 10,
    )

    // Tooltip local to overlay, always next to choices, aligned to hovered button
    const offsetX = 260 + 240 // buttons start at 260, tooltip 240px right of that
    const offsetY = 96 + btnY // buttons start at y=96
    this.encounterTooltipBox.setPosition(offsetX, offsetY)

    this.encounterTooltipBox.setVisible(true)
    this.encounterTooltipBg.setVisible(true)
    this.encounterTooltipText.setVisible(true)
  }

  private hideEncounterTooltip() {
    this.encounterTooltipBox.setVisible(false)
  }
}
