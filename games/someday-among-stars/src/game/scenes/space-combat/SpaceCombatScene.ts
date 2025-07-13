import { PotatoScene } from "@potato-golem/ui";
import { sceneRegistry } from "../../registries/sceneRegistry.ts";
import Phaser from "phaser";

// === DICE SPRITESHEET CONFIG ===
const DICE_SPRITESHEET_KEY = "SCIFI_DICE";
const DICE_FRAME_WIDTH = 16;
const DICE_FRAME_HEIGHT = 16;
const DICE_COLUMNS = 6;
const DICE_ROWS = 15;
const DICE_FINAL_ROWS = 12;

// Example dice data for demo
const examplePlayerSections = [
    {
        label: "Weapons",
        dice: [
            {
                name: "Laser",
                colorIndex: 1,
                faces: [
                    { frame: 1 * 6 + 0, description: "Miss" },
                    { frame: 1 * 6 + 1, description: "Hit" },
                    { frame: 1 * 6 + 2, description: "Overhit" },
                    { frame: 1 * 6 + 3, description: "Jam" },
                    { frame: 1 * 6 + 4, description: "Crit" },
                    { frame: 1 * 6 + 5, description: "Miss" },
                ],
                enabled: true
            },
            {
                name: "Missile",
                colorIndex: 2,
                faces: [
                    { frame: 2 * 6 + 0, description: "Hit" },
                    { frame: 2 * 6 + 1, description: "Miss" },
                    { frame: 2 * 6 + 2, description: "Hit" },
                    { frame: 2 * 6 + 3, description: "Miss" },
                    { frame: 2 * 6 + 4, description: "Hit" },
                    { frame: 2 * 6 + 5, description: "Double Hit" },
                ],
                enabled: true
            },
        ]
    },
    {
        label: "Shields",
        dice: [
            {
                name: "Barrier",
                colorIndex: 3,
                faces: [
                    { frame: 3 * 6 + 0, description: "Block" },
                    { frame: 3 * 6 + 1, description: "Block" },
                    { frame: 3 * 6 + 2, description: "Leak" },
                    { frame: 3 * 6 + 3, description: "Break" },
                    { frame: 3 * 6 + 4, description: "Block" },
                    { frame: 3 * 6 + 5, description: "Crit Block" },
                ],
                enabled: false
            }
        ]
    }
];

const exampleEnemyDice = [
    {
        name: "Enemy Laser",
        colorIndex: 5,
        faces: [
            { frame: 5 * 6 + 0, description: "Miss" },
            { frame: 5 * 6 + 1, description: "Hit" },
            { frame: 5 * 6 + 2, description: "Hit" },
            { frame: 5 * 6 + 3, description: "Crit" },
            { frame: 5 * 6 + 4, description: "Miss" },
            { frame: 5 * 6 + 5, description: "Jam" },
        ]
    },
    {
        name: "Enemy Missile",
        colorIndex: 6,
        faces: [
            { frame: 6 * 6 + 0, description: "Hit" },
            { frame: 6 * 6 + 1, description: "Miss" },
            { frame: 6 * 6 + 2, description: "Double Hit" },
            { frame: 6 * 6 + 3, description: "Hit" },
            { frame: 6 * 6 + 4, description: "Crit" },
            { frame: 6 * 6 + 5, description: "Hit" },
        ]
    }
];

const DICE_ROLL_ROW = 14;

export class SpaceCombatScene extends PotatoScene {
    private playerDiceSprites: Phaser.GameObjects.Sprite[] = [];
    private playerDiceSelected: boolean[] = [];

    private enemyDiceSprites: Phaser.GameObjects.Sprite[] = [];
    private unravelOverlay?: Phaser.GameObjects.Container;
    private unravelTooltip?: Phaser.GameObjects.Text;

    private rollButton!: Phaser.GameObjects.Text;
    private rolling = false;

    private playerHull: number = 72;
    private playerHullMax: number = 100;
    private playerShield: number = 58;
    private playerShieldMax: number = 80;

    private enemyHull: number = 44;
    private enemyHullMax: number = 60;
    private enemyShield: number = 22;
    private enemyShieldMax: number = 60;

    constructor(dependencies: any) {
        super(dependencies.globalSceneEventEmitter, { key: sceneRegistry.SPACE_COMBAT });
    }

    preload() {
        this.load.setPath('assets')
        this.load.spritesheet(DICE_SPRITESHEET_KEY, 'six-sided-die.png', {
            frameWidth: DICE_FRAME_WIDTH,
            frameHeight: DICE_FRAME_HEIGHT
        });
    }

    create() {
        const midX = this.scale.width / 2;
        this.add.rectangle(midX, this.scale.height/2, 2, this.scale.height, 0x2a2a2a, 0.6);

        // --- ENEMY (RIGHT) ---
        const enemyAreaX = midX + 64;
        this.enemyDiceSprites = [];
        for (let i = 0; i < exampleEnemyDice.length; i++) {
            const d = exampleEnemyDice[i];
            const x = enemyAreaX + i * 86;
            const y = 140;
            const sprite = this.add.sprite(x, y, DICE_SPRITESHEET_KEY, d.faces[0].frame)
                .setScale(4)
                .setInteractive({ cursor: 'pointer' })
                .setData("diceIndex", i)
                .setData("isEnemy", true)
                .on('pointerdown', () => this.showUnravel(d, x, y));
            this.enemyDiceSprites.push(sprite);

            this.add.text(x, y + 48, d.name, {
                fontSize: "15px", color: "#eaeaff", fontFamily: "monospace"
            }).setOrigin(0.5, 0);
        }

        // --- PLAYER (LEFT) ---
        let playerDiceY = 124;
        let diceIdx = 0;
        this.playerDiceSprites = [];
        this.playerDiceSelected = [];

        examplePlayerSections.forEach((section, sectionIdx) => {
            this.add.text(40, playerDiceY, section.label, {
                fontSize: "20px", color: "#fff9c0", fontStyle: "bold", fontFamily: "monospace"
            });
            playerDiceY += 26;
            section.dice.forEach((d, i) => {
                const x = 70 + i * 92;
                const y = playerDiceY;
                const sprite = this.add.sprite(x, y, DICE_SPRITESHEET_KEY, d.faces[0].frame)
                    .setScale(4)
                    .setInteractive({ cursor: d.enabled ? 'pointer' : 'not-allowed' })
                    .setData("diceSection", sectionIdx)
                    .setData("diceIndex", i)
                    .setData("enabled", d.enabled)
                    .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                        if (!d.enabled) return;
                        if (pointer.rightButtonDown()) {
                            this.showUnravel(d, x, y);
                        } else {
                            const idx = diceIdx;
                            this.playerDiceSelected[idx] = !this.playerDiceSelected[idx];
                            sprite.setAlpha(this.playerDiceSelected[idx] ? 1.0 : 0.7);
                        }
                    })
                    .on('pointerup', (pointer: Phaser.Input.Pointer) => {
                        if (pointer.rightButtonDown()) pointer.event.preventDefault();
                    });
                this.playerDiceSprites.push(sprite);

                this.add.text(x, y + 48, d.name, {
                    fontSize: "15px", color: d.enabled ? "#baffc0" : "#aaaabb", fontFamily: "monospace"
                }).setOrigin(0.5, 0);

                diceIdx++;
            });
            playerDiceY += 84;
        });

        // --- SHIP INDICATORS (Bottom) ---
        // Player indicator
        this.drawShipIndicator(
            this.scale.width * 0.25, this.scale.height - 68, 36,
            this.playerHull / this.playerHullMax,
            this.playerShield / this.playerShieldMax,
            true
        );
        // Enemy indicator
        this.drawShipIndicator(
            this.scale.width * 0.75, this.scale.height - 68, 36,
            this.enemyHull / this.enemyHullMax,
            this.enemyShield / this.enemyShieldMax,
            false
        );

        // --- ROLL BUTTON ---
        this.rollButton = this.add.text(
            this.scale.width / 2, this.scale.height - 56,
            "Roll dice",
            {
                fontSize: "32px",
                color: "#e0ffbb",
                backgroundColor: "#222",
                fontFamily: "monospace",
                padding: { x: 42, y: 16 }
            }
        )
            .setOrigin(0.5, 0.5)
            .setInteractive({ cursor: "pointer" })
            .on("pointerdown", () => this.startRolling())
            .setDepth(20);

        this.unravelTooltip = this.add.text(0, 0, "", {
            fontSize: "16px", color: "#fff8c0", backgroundColor: "#2a2a50", padding: { x: 8, y: 4 }, wordWrap: { width: 200 }
        }).setDepth(40).setVisible(false);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, currentlyOver: any[]) => {
            if (!currentlyOver.length) {
                this.hideUnravel();
            }
        });

        if (!this.anims.exists("dice-roll")) {
            this.anims.create({
                key: "dice-roll",
                frames: this.anims.generateFrameNumbers(DICE_SPRITESHEET_KEY, {
                    start: DICE_ROLL_ROW * DICE_COLUMNS,
                    end: DICE_ROLL_ROW * DICE_COLUMNS + DICE_COLUMNS - 1
                }),
                frameRate: 18,
                repeat: -1
            });
        }
    }

    private drawShipIndicator(x: number, y: number, r: number, hullRatio: number, shieldRatio: number, isPlayer: boolean) {
        const g = this.add.graphics();
        // Hull circle
        g.lineStyle(10, 0x444466, 1);
        g.strokeCircle(x, y, r);
        // Hull arc (red)
        g.lineStyle(10, 0xcc3333, 1);
        g.beginPath();
        g.arc(x, y, r, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + 360 * hullRatio), false);
        g.strokePath();
        // Shield arc (blue)
        g.lineStyle(5, 0x6ad5ff, 1);
        g.beginPath();
        g.arc(x, y, r + 7, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + 360 * shieldRatio), false);
        g.strokePath();
        // Ship rectangle in center
        g.fillStyle(isPlayer ? 0x2aabff : 0xcc3333, 1);
        g.fillRect(x - 14, y - 20, 28, 40);
        // Hull cracks
        if (hullRatio < 0.8) {
            g.lineStyle(2, 0x555555, 1);
            g.beginPath();
            g.moveTo(x - 8, y - 18); g.lineTo(x + 6, y + 18); g.strokePath();
        }
        if (hullRatio < 0.5) {
            g.lineStyle(2, 0x333333, 1);
            g.beginPath();
            g.moveTo(x + 10, y - 12); g.lineTo(x - 10, y + 12); g.strokePath();
        }
        // Add hull and shield text
        this.add.text(x, y + r + 20,
            `Hull: ${Math.round(hullRatio * 100)}%   Shield: ${Math.round(shieldRatio * 100)}%`,
            {
                fontSize: "14px",
                color: "#aaaaff",
                fontFamily: "monospace"
            }
        ).setOrigin(0.5, 0);
    }

    // --- UNRAVEL OVERLAY ---
    showUnravel(dice: any, baseX: number, baseY: number) {
        this.hideUnravel();
        const rows = 3, cols = 2, cell = 48, padding = 18;
        const overlayX = Math.min(baseX, this.scale.width - (cols * cell + padding * 2));
        const overlayY = Math.max(24, baseY - 40);

        this.unravelOverlay = this.add.container(overlayX, overlayY).setDepth(30);
        const bg = this.add.rectangle(0, 0, cols * cell + padding * 2, rows * cell + padding * 2, 0x222244, 0.98)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xffffff, 0.8);
        this.unravelOverlay.add(bg);

        for (let f = 0; f < 6; f++) {
            const fx = padding + (f % cols) * cell;
            const fy = padding + Math.floor(f / cols) * cell;
            const face = this.add.sprite(fx + cell / 2, fy + cell / 2, DICE_SPRITESHEET_KEY, dice.faces[f].frame).setScale(2.2);

            face.setInteractive({ cursor: 'pointer' })
                .on("pointerover", () => {
                    this.unravelTooltip!.setText(dice.faces[f].description);
                    this.unravelTooltip!.setPosition(overlayX + cols * cell + 26, overlayY + fy);
                    this.unravelTooltip!.setVisible(true);
                })
                .on("pointerout", () => {
                    this.unravelTooltip!.setVisible(false);
                });

            this.unravelOverlay.add(face);
        }
        this.children.bringToTop(this.unravelOverlay);
    }
    hideUnravel() {
        if (this.unravelOverlay) {
            this.unravelOverlay.destroy();
            this.unravelOverlay = undefined;
            if (this.unravelTooltip) this.unravelTooltip.setVisible(false);
        }
    }

    startRolling() {
        if (this.rolling) return;
        this.rolling = true;
        const selectedSprites: Phaser.GameObjects.Sprite[] = [];
        let idx = 0;
        for (let section of examplePlayerSections) {
            for (let d of section.dice) {
                if (this.playerDiceSelected[idx]) {
                    selectedSprites.push(this.playerDiceSprites[idx]);
                }
                idx++;
            }
        }
        if (!selectedSprites.length) {
            this.rolling = false;
            return;
        }
        let diceRollsDone = 0;
        selectedSprites.forEach((sprite, i) => {
            sprite.play("dice-roll");
            const startX = sprite.x;
            const startY = sprite.y;
            const offsetX = Phaser.Math.Between(-18, 18);
            const offsetY = Phaser.Math.Between(-8, 8);

            this.tweens.add({
                targets: sprite,
                x: startX + offsetX,
                y: startY + offsetY,
                duration: 260,
                ease: "Sine.InOut"
            });

            this.time.delayedCall(650 + i * 120, () => {
                const dice = examplePlayerSections.flatMap(s => s.dice)[this.playerDiceSprites.indexOf(sprite)];
                const resultFace = Phaser.Math.Between(0, 5);
                sprite.setFrame(dice.faces[resultFace].frame);
                sprite.stop();
                this.tweens.add({
                    targets: sprite,
                    x: startX,
                    y: startY,
                    duration: 180,
                    ease: "Sine.InOut"
                });
                diceRollsDone++;
                if (diceRollsDone === selectedSprites.length) {
                    this.rollEnemyDice();
                }
            });
        });
    }

    rollEnemyDice() {
        let done = 0;
        this.enemyDiceSprites.forEach((sprite, idx) => {
            sprite.play("dice-roll");
            const startX = sprite.x;
            const startY = sprite.y;
            const offsetX = Phaser.Math.Between(-16, 16);
            const offsetY = Phaser.Math.Between(-10, 10);
            this.tweens.add({
                targets: sprite,
                x: startX + offsetX,
                y: startY + offsetY,
                duration: 260,
                ease: "Sine.InOut"
            });
            this.time.delayedCall(800 + idx * 140, () => {
                const dice = exampleEnemyDice[idx];
                const resultFace = Phaser.Math.Between(0, 5);
                sprite.setFrame(dice.faces[resultFace].frame);
                sprite.stop();
                this.tweens.add({
                    targets: sprite,
                    x: startX,
                    y: startY,
                    duration: 180,
                    ease: "Sine.InOut"
                });
                done++;
                if (done === this.enemyDiceSprites.length) {
                    this.rolling = false;
                }
            });
        });
    }
}
