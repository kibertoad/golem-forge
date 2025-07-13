import { sceneRegistry } from "../../registries/sceneRegistry.ts";
import Phaser from "phaser";
import {imageRegistry} from "../../registries/imageRegistry.ts";

// Type for planet info to show in overlay
export interface PlanetOverlayData {
    name: string;
    colonized: boolean;
    biome: string;
    government?: string;
    onMission?: boolean;
}

// Overlay scene for all starmap UI (star hover, travel btn, planet modal)
export class StarmapUIScene extends Phaser.Scene {
    // --- Star hover overlay ---
    private overlayBg!: Phaser.GameObjects.Rectangle;
    private overlayText!: Phaser.GameObjects.Text;
    private overlayBox!: Phaser.GameObjects.Container;

    // --- Travel/Stop button ---
    private travelButton!: Phaser.GameObjects.Text;
    private travelButtonText: string = "Travel to destination";

    // --- Planet overlay ---
    private planetOverlayBox!: Phaser.GameObjects.Container;
    private planetBg!: Phaser.GameObjects.Rectangle;
    private planetImg!: Phaser.GameObjects.Image;
    private planetTitle!: Phaser.GameObjects.Text;
    private planetInfo!: Phaser.GameObjects.Text;
    private planetButtonGroup!: Phaser.GameObjects.Container;
    private planetButtonObjs: Phaser.GameObjects.Text[] = [];

    constructor() {
        super(sceneRegistry.STARMAP_UI_SCENE);
    }

    create() {
        // --- Star hover overlay ---
        this.overlayBg = this.add.rectangle(0, 0, 160, 50, 0x222233, 0.95)
            .setStrokeStyle(1, 0xffffff)
            .setOrigin(0, 0);
        this.overlayText = this.add.text(0, 0, '', {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'monospace',
            padding: { x: 6, y: 4 }
        });
        this.overlayBox = this.add.container(0, 0, [this.overlayBg, this.overlayText])
            .setDepth(1000)
            .setVisible(false);

        // --- Travel/Stop button ---
        this.travelButton = this.add.text(0, 0, this.travelButtonText, {
            fontSize: '18px',
            color: '#ffff66',
            backgroundColor: '#222233',
            fontFamily: 'monospace',
            padding: { x: 14, y: 10 }
        })
            .setDepth(1000)
            .setInteractive({ cursor: 'pointer' })
            .setVisible(false);

        // Button always at top right
        this.positionTravelButton();
        this.scale.on("resize", () => {
            this.positionTravelButton();
            this.centerPlanetOverlay();
        });

        this.travelButton.on('pointerdown', () => {
            const main = this.scene.get(sceneRegistry.STARMAP_SCENE);
            if (main) main.events.emit("travelButtonClicked");
        });

        // --- Planet overlay modal (hidden by default) ---
        this.planetBg = this.add.rectangle(0, 0, 520, 420, 0x151525, 0.97)
            .setOrigin(0, 0)
            .setDepth(10001);
        this.planetImg = this.add.image(32 + 176, 44 + 128, imageRegistry.ABOVE_PLANET_BACKGROUND)
            .setOrigin(0.5, 0)
            .setDisplaySize(176, 256)
            .setDepth(10002);
        this.planetTitle = this.add.text(240, 44, "", {
            fontSize: "28px",
            color: "#eaeaff",
            fontStyle: "bold",
            fontFamily: "monospace"
        }).setOrigin(0, 0)
            .setDepth(10002);
        this.planetInfo = this.add.text(240, 88, "", {
            fontSize: "18px",
            color: "#d5f4ff",
            fontFamily: "monospace"
        }).setOrigin(0, 0)
            .setDepth(10002);
        this.planetButtonGroup = this.add.container(240, 200)
            .setDepth(10002);

        this.planetOverlayBox = this.add.container(
            this.scale.width/2 - 260,
            this.scale.height/2 - 210,
            [
                this.planetBg,
                this.planetImg,
                this.planetTitle,
                this.planetInfo,
                this.planetButtonGroup
            ]
        ).setDepth(10001).setVisible(false);
    }

    // --- Overlay for star hover ---
    showOverlay(x: number, y: number, text: string) {
        if (this.planetOverlayBox.visible) return; // never show star overlay if modal up!
        this.overlayText.setText(text);
        this.overlayBg.setSize(this.overlayText.width + 12, this.overlayText.height + 8);
        const margin = 4;
        const boxW = this.overlayBg.width;
        const boxH = this.overlayBg.height;
        let overlayX = x + 16;
        let overlayY = y + 8;
        if (overlayX + boxW > this.scale.width - margin) {
            overlayX = this.scale.width - boxW - margin;
        }
        if (overlayY + boxH > this.scale.height - margin) {
            overlayY = this.scale.height - boxH - margin;
        }
        if (overlayX < margin) overlayX = margin;
        if (overlayY < margin) overlayY = margin;
        this.overlayBox.setPosition(overlayX, overlayY);
        this.overlayBox.setVisible(true);
    }
    hideOverlay() {
        this.overlayBox.setVisible(false);
    }

    // --- Travel/Stop button ---
    showTravelButton(show: boolean, text?: string) {
        // Hide if modal is up
        if (this.planetOverlayBox.visible) {
            this.travelButton.setVisible(false);
            return;
        }
        if (text) this.travelButtonText = text;
        this.travelButton.setText(this.travelButtonText);
        this.travelButton.setVisible(show);
        this.positionTravelButton();
    }
    hideTravelButton() {
        this.travelButton.setVisible(false);
    }
    private positionTravelButton() {
        this.travelButton.setPosition(
            this.scale.width - this.travelButton.width - 36,
            24
        );
    }

    // --- Planet arrival overlay ---
    showPlanetOverlay(data: PlanetOverlayData) {
        // Hide all other overlays
        this.hideOverlay();
        this.hideTravelButton();

        // Fill in data
        this.planetTitle.setText(data.name);
        let info = "";
        info += data.colonized ? "[COLONIZED]\n" : "[UNCLAIMED]\n";
        info += `Biome: ${data.biome}\n`;
        if (data.colonized && data.government) {
            info += `Gov: ${data.government}\n`;
        }
        this.planetInfo.setText(info);

        // Remove old buttons
        this.planetButtonGroup.removeAll(true);
        this.planetButtonObjs = [];

        let y = 0;
        const buttonConfigs: { label: string; visible: boolean; cb: () => void }[] = [
            {
                label: "Land to a spaceport",
                visible: data.colonized,
                cb: () => this.events.emit("overlay_land", data),
            },
            {
                label: "Explore",
                visible: !data.colonized,
                cb: () => this.events.emit("overlay_explore", data),
            },
            {
                label: "Mission",
                visible: !!data.onMission,
                cb: () => this.events.emit("overlay_mission", data),
            },
            {
                label: "Leave",
                visible: true,
                cb: () => this.hidePlanetOverlay(),
            },
        ];

        for (const cfg of buttonConfigs) {
            if (!cfg.visible) continue;
            const btn = this.makeButton(cfg.label, y, cfg.cb);
            this.planetButtonGroup.add(btn);
            this.planetButtonObjs.push(btn);
            y += 56;
        }

        this.planetOverlayBox.setVisible(true);
        this.centerPlanetOverlay();
    }

    hidePlanetOverlay() {
        this.planetOverlayBox.setVisible(false);
    }
    private centerPlanetOverlay() {
        this.planetOverlayBox.setPosition(
            this.scale.width/2 - 260,
            this.scale.height/2 - 210
        );
    }

    private makeButton(label: string, y: number, onClick: () => void): Phaser.GameObjects.Text {
        const btn = this.add.text(0, y, label, {
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
                btn.setStyle({ backgroundColor: "#666699", color: "#ffffff" });
            })
            .on("pointerout", () => {
                btn.setStyle({ backgroundColor: "#444444", color: "#fff9c0" });
            })
            .on("pointerdown", onClick);
        return btn;
    }
}
