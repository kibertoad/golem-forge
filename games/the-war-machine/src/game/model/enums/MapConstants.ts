// Map frame dimensions
export const MAP_FRAME = {
  WIDTH: 1520,
  HEIGHT: 800,
  LEFT: -760,
  TOP: -400,
  RIGHT: 760,
  BOTTOM: 400,
} as const

// Continent zoom view grid settings
export const CONTINENT_GRID = {
  START_X: -685,
  START_Y: -320,
  CELL_WIDTH: 152,
  CELL_HEIGHT: 80,
  MAX_GRID_X: 9,
  MAX_GRID_Y: 9,
} as const

// Block size calculation parameters
export const BLOCK_SIZE = {
  BASE: 100,
  MIN_SCALE: 0.8,
  SCALE_PER_SIZE: 0.3, // Each size level adds 0.3 to scale
  HEIGHT_RATIO: 0.75, // Blocks are 75% as tall as they are wide
} as const

// Calculate actual block dimensions for a given size
export function getBlockDimensions(relativeSize: number): { width: number; height: number } {
  const scale = BLOCK_SIZE.MIN_SCALE + relativeSize * BLOCK_SIZE.SCALE_PER_SIZE
  return {
    width: BLOCK_SIZE.BASE * scale,
    height: BLOCK_SIZE.BASE * scale * BLOCK_SIZE.HEIGHT_RATIO,
  }
}

// Calculate actual position for a country block
export function getBlockPosition(gridX: number, gridY: number): { x: number; y: number } {
  return {
    x: CONTINENT_GRID.START_X + gridX * CONTINENT_GRID.CELL_WIDTH,
    y: CONTINENT_GRID.START_Y + gridY * CONTINENT_GRID.CELL_HEIGHT,
  }
}

// Check if a block fits within the frame
export function blockFitsInFrame(gridX: number, gridY: number, relativeSize: number): boolean {
  const pos = getBlockPosition(gridX, gridY)
  const size = getBlockDimensions(relativeSize)

  const left = pos.x - size.width / 2
  const right = pos.x + size.width / 2
  const top = pos.y - size.height / 2
  const bottom = pos.y + size.height / 2

  return (
    left >= MAP_FRAME.LEFT &&
    right <= MAP_FRAME.RIGHT &&
    top >= MAP_FRAME.TOP &&
    bottom <= MAP_FRAME.BOTTOM
  )
}

// Check if two blocks overlap
export function blocksOverlap(
  gridX1: number,
  gridY1: number,
  size1: number,
  gridX2: number,
  gridY2: number,
  size2: number,
): boolean {
  const pos1 = getBlockPosition(gridX1, gridY1)
  const dim1 = getBlockDimensions(size1)
  const pos2 = getBlockPosition(gridX2, gridY2)
  const dim2 = getBlockDimensions(size2)

  const left1 = pos1.x - dim1.width / 2
  const right1 = pos1.x + dim1.width / 2
  const top1 = pos1.y - dim1.height / 2
  const bottom1 = pos1.y + dim1.height / 2

  const left2 = pos2.x - dim2.width / 2
  const right2 = pos2.x + dim2.width / 2
  const top2 = pos2.y - dim2.height / 2
  const bottom2 = pos2.y + dim2.height / 2

  return !(right1 <= left2 || left1 >= right2 || bottom1 <= top2 || top1 >= bottom2)
}
