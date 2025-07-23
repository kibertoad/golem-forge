import Phaser from 'phaser'
import { STAR_COLOURS } from './starmapConstants.ts'

export function getRandomStarColor(): number {
  const weighted: [number, number, number][] = []
  for (const entry of STAR_COLOURS) {
    for (let i = 0; i < entry.weight; i++) weighted.push(entry.rgb)
  }
  const baseRgb = Phaser.Utils.Array.GetRandom(weighted)

  const jitter = (v: number) => Phaser.Math.Clamp(v + Phaser.Math.Between(-10, 10), 0, 255)
  const [r, g, b] = baseRgb.map(jitter)

  return Phaser.Display.Color.GetColor(r, g, b)
}

export function getStarName(): string {
  const greek = [
    'Alpha',
    'Beta',
    'Gamma',
    'Delta',
    'Epsilon',
    'Zeta',
    'Eta',
    'Theta',
    'Iota',
    'Kappa',
    'Lambda',
    'Mu',
    'Nu',
    'Xi',
    'Omicron',
    'Pi',
    'Rho',
    'Sigma',
    'Tau',
    'Upsilon',
    'Phi',
    'Chi',
    'Psi',
    'Omega',
  ]
  const latin = [
    'Centauri',
    'Leonis',
    'Cygni',
    'Andromedae',
    'Cassiopeiae',
    'Pegasi',
    'Draconis',
    'Ursae',
    'Majoris',
    'Minoris',
    'Aquilae',
    'Aurigae',
    'Canis',
    'Lyrae',
    'Orionis',
    'Piscium',
    'Sagittarii',
    'Scorpii',
  ]

  if (Math.random() < 0.4) {
    const g = Phaser.Utils.Array.GetRandom(greek)
    const l = Phaser.Utils.Array.GetRandom(latin)
    return `${g} ${l}`
  } else {
    return `HD ${Phaser.Math.Between(10000, 999999)}`
  }
}
