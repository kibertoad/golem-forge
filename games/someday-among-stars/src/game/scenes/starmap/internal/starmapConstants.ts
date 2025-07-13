export const DEFAULT_ZOOM = 3

export type StarColorType = { rgb: [number, number, number]; weight: number };
export const STAR_COLOURS: StarColorType[] = [
    { rgb: [180, 220, 255], weight: 1 }, // Blue (O/B)
    { rgb: [240, 240, 255], weight: 2 }, // White (A/F)
    { rgb: [255, 255, 220], weight: 3 }, // Yellow (G)
    { rgb: [255, 200, 150], weight: 4 }, // Orange (K)
    { rgb: [255, 160, 120], weight: 7 }, // Red (M)
];

export const STAR_AMOUNT = 100
