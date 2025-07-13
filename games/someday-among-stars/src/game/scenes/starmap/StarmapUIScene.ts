import { sceneRegistry } from "../../registries/sceneRegistry.ts";
import Phaser from "phaser";

/**
 * This is an overlay on top of map, which needs to be separated into its own scene to avoid being affected by camera zoom of the map itself
 */
export class StarmapUIScene extends Phaser.Scene {
    private overlayBg!: Phaser.GameObjects.Rectangle;
    private overlayText!: Phaser.GameObjects.Text;
    private overlayBox!: Phaser.GameObjects.Container;
    private travelButton!: Phaser.GameObjects.Text;
    private buttonText: string = "Travel to destination";

    constructor() {
        super(sceneRegistry.STARMAP_UI_SCENE);
    }

    create() {
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

        this.travelButton = this.add.text(24, 24, this.buttonText, {
            fontSize: '18px',
            color: '#ffff66',
            backgroundColor: '#222233',
            fontFamily: 'monospace',
            padding: { x: 14, y: 10 }
        })
            .setDepth(1000)
            .setInteractive({ cursor: 'pointer' })
            .setVisible(false);

        // Always emit event to main scene, never use closure
        this.travelButton.on('pointerdown', () => {
            // Defensive: check if parent scene exists
            const main = this.scene.get(sceneRegistry.STARMAP_SCENE);
            if (main) main.events.emit("travelButtonClicked");
        });
    }

    showTravelButton(show: boolean, text?: string) {
        if (text) this.buttonText = text;
        this.travelButton.setText(this.buttonText);
        this.travelButton.setInteractive({ cursor: 'pointer' }); // update after text change!
        this.travelButton.setVisible(show);
    }

    showOverlay(x: number, y: number, text: string) {
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
        if (this.overlayBox) {
            this.overlayBox.setVisible(false);
        }
    }
}
