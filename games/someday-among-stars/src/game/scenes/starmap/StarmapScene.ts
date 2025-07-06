import { PotatoScene } from "@potato-golem/ui";
import type { Dependencies } from "../../model/diConfig.ts";
import { sceneRegistry } from "../../registries/sceneRegistry.ts";

// Star data interface
interface Star {
    x: number;
    y: number;
    color: number;
    name: string;
    distance: number;
    display: Phaser.GameObjects.Arc;
}

export class StarmapScene extends PotatoScene {
    private stars: Star[] = [];
    private starGroup!: Phaser.GameObjects.Group;

    private isDragging = false;
    private dragStart = { x: 0, y: 0 };
    private cameraStart = { x: 0, y: 0 };

    // Player position (fixed for now)
    private readonly playerX: number = 0;
    private readonly playerY: number = 0;

    constructor(dependencies: Dependencies) {
        super(dependencies.globalSceneEventEmitter, { key: sceneRegistry.STARMAP_SCENE });
    }

    preload() {}

    create() {
        if (!this.scene.isActive(sceneRegistry.STARMAP_UI_SCENE)) {
            this.scene.launch(sceneRegistry.STARMAP_UI_SCENE);
        }

        this.cameras.main.setZoom(1);
        this.starGroup = this.add.group();

        // --- Mouse drag for panning ---
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) return;
            this.isDragging = true;
            this.dragStart.x = pointer.x;
            this.dragStart.y = pointer.y;
            this.cameraStart.x = this.cameras.main.scrollX;
            this.cameraStart.y = this.cameras.main.scrollY;
            this.input.setDefaultCursor('grabbing');
            // Hide overlay on drag
            this.hideOverlay();
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!this.isDragging) {
                this.handleStarHover(pointer);
            } else {
                const cam = this.cameras.main;
                cam.scrollX = this.cameraStart.x - (pointer.x - this.dragStart.x) / cam.zoom;
                cam.scrollY = this.cameraStart.y - (pointer.y - this.dragStart.y) / cam.zoom;
                this.hideOverlay(); // hide overlay while dragging
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
            this.input.setDefaultCursor('default');
        });

        // --- Mouse wheel for zooming ---
        this.input.on(
            'wheel',
            (
                pointer: Phaser.Input.Pointer,
                gameObjects: any,
                deltaX: number,
                deltaY: number,
                deltaZ: number
            ) => {
                const cam = this.cameras.main;
                let newZoom = Phaser.Math.Clamp(cam.zoom - deltaY * 0.001, 0.2, 5);
                cam.setZoom(newZoom);
            }
        );

        // --- Initial random stars ---
        for (let i = 0; i < 100; i++) {
            this.addStar(
                Phaser.Math.Between(-1000, 1000),
                Phaser.Math.Between(-1000, 1000)
            );
        }

        // --- Click to add a star ---
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) return; // skip right-click
            if (this.isDragging) return; // skip if dragging
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.addStar(worldPoint.x, worldPoint.y);
        });
    }

    /**
     * Add a new star at (x, y) with name, color, and distance from player
     */
    addStar(x: number, y: number) {
        const color = this.getRandomStarColor();
        const name = this.getStarName();
        const distance = this.calcDistanceToPlayer(x, y);

        const star = this.add
            .circle(x, y, Phaser.Math.Between(1, 3), color)
            .setAlpha(Phaser.Math.FloatBetween(0.5, 1))
            .setInteractive({ cursor: 'pointer' });

        this.starGroup.add(star);

        this.stars.push({ x, y, color, name, distance, display: star });
    }

    /**
     * On pointer move, check if hovering a star. If so, show overlay in UI Scene.
     */
    handleStarHover(pointer: Phaser.Input.Pointer) {
        // Use Phaser's input hit test to find stars under pointer
        const starsUnderPointer = this.input.hitTestPointer(pointer, this.starGroup.getChildren()) as Phaser.GameObjects.Arc[];

        // If any star is hit, show overlay for the topmost (first) one
        if (starsUnderPointer.length > 0) {
            const arc = starsUnderPointer[0];
            // Find the star data matching this display object
            const star = this.stars.find(s => s.display === arc);
            if (star) {
                const distance = this.calcDistanceToPlayer(star.x, star.y);
                const text =
                    `Name: ${star.name}\n` +
                    `Distance: ${distance.toFixed(1)} ly`;
                const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any;
                if (uiScene?.showOverlay) {
                    uiScene.showOverlay(pointer.x, pointer.y, text);
                }
                return; // Overlay handled
            }
        }

        // If no star under pointer, hide overlay
        const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any;
        if (uiScene?.hideOverlay) uiScene.hideOverlay();
    }

    hideOverlay() {
        const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any;
        if (uiScene?.hideOverlay) uiScene.hideOverlay();
    }

    getRandomStarColor(): number {
        type StarColorType = { rgb: [number, number, number]; weight: number };
        const starColors: StarColorType[] = [
            { rgb: [180, 220, 255], weight: 1 }, // Blue (O/B)
            { rgb: [240, 240, 255], weight: 2 }, // White (A/F)
            { rgb: [255, 255, 220], weight: 3 }, // Yellow (G)
            { rgb: [255, 200, 150], weight: 4 }, // Orange (K)
            { rgb: [255, 160, 120], weight: 7 }, // Red (M)
        ];

        const weighted: [number, number, number][] = [];
        for (const entry of starColors) {
            for (let i = 0; i < entry.weight; i++) weighted.push(entry.rgb);
        }
        const baseRgb = Phaser.Utils.Array.GetRandom(weighted);

        const jitter = (v: number) => Phaser.Math.Clamp(v + Phaser.Math.Between(-10, 10), 0, 255);
        const [r, g, b] = baseRgb.map(jitter);

        return Phaser.Display.Color.GetColor(r, g, b);
    }

    getStarName(): string {
        const greek = [
            'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
            'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho',
            'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'
        ];
        const latin = [
            'Centauri', 'Leonis', 'Cygni', 'Andromedae', 'Cassiopeiae', 'Pegasi',
            'Draconis', 'Ursae', 'Majoris', 'Minoris', 'Aquilae', 'Aurigae',
            'Canis', 'Lyrae', 'Orionis', 'Piscium', 'Sagittarii', 'Scorpii'
        ];

        if (Math.random() < 0.4) {
            const g = Phaser.Utils.Array.GetRandom(greek);
            const l = Phaser.Utils.Array.GetRandom(latin);
            return `${g} ${l}`;
        } else {
            return `HD ${Phaser.Math.Between(10000, 999999)}`;
        }
    }

    calcDistanceToPlayer(x: number, y: number): number {
        return Phaser.Math.Distance.Between(this.playerX, this.playerY, x, y) / 10;
    }

    update() {
        // Twinkle or animations could go here!
    }
}
