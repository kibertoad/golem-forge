import { PotatoScene } from "@potato-golem/ui";
import type { Dependencies } from "../../model/diConfig.ts";
import { sceneRegistry } from "../../registries/sceneRegistry.ts";
import Phaser from "phaser";

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

    private travelSpeed: number = 40; // units per second (adjust as you wish)

    private playerX: number = 0;
    private playerY: number = 0;

    private selectedStar: Star | null = null;
    private lineGraphics!: Phaser.GameObjects.Graphics;

    private isTraveling: boolean = false;

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

        this.lineGraphics = this.add.graphics().setDepth(1000);

        // Respond to travel/stop button via event (no closure bugs!)
        this.events.on("travelButtonClicked", () => {
            if (this.isTraveling) {
                this.isTraveling = false;
                this.showTravelButtonIfAvailable();
            } else if (this.selectedStar) {
                this.isTraveling = true;
                this.showTravelButtonIfAvailable();
            }
        });

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.middleButtonDown()) {
                this.isDragging = true;
                this.dragStart.x = pointer.x;
                this.dragStart.y = pointer.y;
                this.cameraStart.x = this.cameras.main.scrollX;
                this.cameraStart.y = this.cameras.main.scrollY;
                this.input.setDefaultCursor('grabbing');
                this.hideOverlay();
                return;
            }
            if (pointer.rightButtonDown()) return;

            // Select star on left click
            const objectsUnderPointer = this.input.hitTestPointer(pointer) as Phaser.GameObjects.GameObject[];
            const arc = objectsUnderPointer.find(obj =>
                obj instanceof Phaser.GameObjects.Arc &&
                this.starGroup.contains(obj)
            ) as Phaser.GameObjects.Arc | undefined;

            if (arc) {
                const star = this.stars.find(s => s.display === arc);
                if (star) {
                    this.selectedStar = star;
                    this.showTravelButtonIfAvailable();
                    return;
                }
            }
            this.selectedStar = null;
            this.hideTravelButton();
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                const cam = this.cameras.main;
                cam.scrollX = this.cameraStart.x - (pointer.x - this.dragStart.x) / cam.zoom;
                cam.scrollY = this.cameraStart.y - (pointer.y - this.dragStart.y) / cam.zoom;
                this.hideOverlay();
            } else {
                this.handleStarHover(pointer);
            }
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging && pointer.middleButtonReleased()) {
                this.isDragging = false;
                this.input.setDefaultCursor('default');
            }
        });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            const cam = this.cameras.main;
            let newZoom = Phaser.Math.Clamp(cam.zoom - deltaY * 0.001, 0.2, 5);
            cam.setZoom(newZoom);
        });

        for (let i = 0; i < 100; i++) {
            this.addStar(
                Phaser.Math.Between(-1000, 1000),
                Phaser.Math.Between(-1000, 1000)
            );
        }
    }

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

    handleStarHover(pointer: Phaser.Input.Pointer) {
        const objectsUnderPointer = this.input.hitTestPointer(pointer) as Phaser.GameObjects.GameObject[];
        const arc = objectsUnderPointer.find(obj =>
            obj instanceof Phaser.GameObjects.Arc &&
            this.starGroup.contains(obj)
        ) as Phaser.GameObjects.Arc | undefined;

        if (arc) {
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
                return;
            }
        }
        const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any;
        if (uiScene?.hideOverlay) uiScene.hideOverlay();
    }

    hideOverlay() {
        const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any;
        if (uiScene?.hideOverlay) uiScene.hideOverlay();
    }

    private onShipArrivedAtDestination(): void {
       console.log("Ship arrived at destination!");
    }

    showTravelButtonIfAvailable() {
        const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any;
        if (this.selectedStar && uiScene?.showTravelButton) {
            uiScene.showTravelButton(true, this.isTraveling ? "Stop" : "Travel to destination");
        }
    }

    hideTravelButton() {
        const uiScene = this.scene.get(sceneRegistry.STARMAP_UI_SCENE) as any;
        if (uiScene?.showTravelButton) {
            uiScene.showTravelButton(false);
        }
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

    update(time: number, delta: number) {
        this.lineGraphics.clear();

        // Move the ship if traveling
        if (this.isTraveling && this.selectedStar) {
            const dx = this.selectedStar.x - this.playerX;
            const dy = this.selectedStar.y - this.playerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Arrive if close enough
            if (dist < this.travelSpeed * (delta / 1000)) {
                this.playerX = this.selectedStar.x;
                this.playerY = this.selectedStar.y;
                this.isTraveling = false;
                this.showTravelButtonIfAvailable();
                this.onShipArrivedAtDestination(); // <-- Call the new method
            } else {
                const angle = Math.atan2(dy, dx);
                const step = this.travelSpeed * (delta / 1000);
                this.playerX += Math.cos(angle) * step;
                this.playerY += Math.sin(angle) * step;
            }
        }

        if (this.selectedStar) {
            this.lineGraphics.fillStyle(0xff0000, 1);
            this.lineGraphics.fillCircle(this.playerX, this.playerY, 6);

            this.lineGraphics.fillStyle(0x00ff00, 1);
            this.lineGraphics.fillCircle(this.selectedStar.x, this.selectedStar.y, 6);

            const dashLength = 12;
            const gapLength = 8;
            const dx = this.selectedStar.x - this.playerX;
            const dy = this.selectedStar.y - this.playerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            let drawn = 0;

            this.lineGraphics.lineStyle(2, 0xffffff, 0.85);

            while (drawn < dist - 1) {
                const x1 = this.playerX + Math.cos(angle) * drawn;
                const y1 = this.playerY + Math.sin(angle) * drawn;
                drawn += dashLength;
                if (drawn > dist) drawn = dist;
                const x2 = this.playerX + Math.cos(angle) * drawn;
                const y2 = this.playerY + Math.sin(angle) * drawn;
                this.lineGraphics.moveTo(x1, y1);
                this.lineGraphics.lineTo(x2, y2);
                drawn += gapLength;
            }

            this.lineGraphics.strokePath();
        }

        if (this.isTraveling) {
            this.cameras.main.centerOn(this.playerX, this.playerY);
        }
    }
}
