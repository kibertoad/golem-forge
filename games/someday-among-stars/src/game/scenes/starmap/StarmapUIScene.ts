import { PotatoScene } from "@potato-golem/ui";
import { sceneRegistry } from "../../registries/sceneRegistry.ts";
import { Scene } from "phaser";
import {Dependencies} from "../../model/diConfig.ts";

// Very basic UI scene. Use the same dependencies if needed.
export class StarmapUIScene extends Scene {
    private overlayBg!: Phaser.GameObjects.Rectangle;
    private overlayText!: Phaser.GameObjects.Text;
    private overlayBox!: Phaser.GameObjects.Container;

    constructor(dependencies: Dependencies) {
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
    }

    showOverlay(x: number, y: number, text: string) {
        if (!this.overlayBox) return

        this.overlayText.setText(text);
        this.overlayBg.setSize(this.overlayText.width + 12, this.overlayText.height + 8);

        // Clamp to window as before
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
