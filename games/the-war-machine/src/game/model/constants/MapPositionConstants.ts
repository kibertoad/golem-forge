/**
 * Constants for map positioning calculations used across the game.
 * These are exported to ensure consistency between game code and tests.
 */

// City grid dimensions for the zoom view
export const CITY_GRID_WIDTH = 1480
export const CITY_GRID_HEIGHT = 680
export const CITY_GRID_COLUMNS = 10
export const CITY_GRID_ROWS = 10
export const CITY_BLOCK_SIZE_X = CITY_GRID_WIDTH / CITY_GRID_COLUMNS // 148
export const CITY_BLOCK_SIZE_Y = CITY_GRID_HEIGHT / CITY_GRID_ROWS // 68
export const CITY_GRID_START_X = -CITY_GRID_WIDTH / 2 // -740
export const CITY_GRID_START_Y = -CITY_GRID_HEIGHT / 2 + 40 // -300 (with title offset)

// Attack visualization offsets
export const ATTACKER_BLOCK_HORIZONTAL_OFFSET = 800 // Distance from center for E/W attackers
export const ATTACKER_BLOCK_VERTICAL_OFFSET = 380 // Distance from center for N/S attackers

/**
 * Calculate the actual screen position of a city based on its grid coordinates.
 * This is used for both rendering and testing.
 */
export function calculateCityPosition(gridX: number, gridY: number): { x: number; y: number } {
  const x = CITY_GRID_START_X + gridX * CITY_BLOCK_SIZE_X + CITY_BLOCK_SIZE_X / 2
  const y = CITY_GRID_START_Y + gridY * CITY_BLOCK_SIZE_Y + CITY_BLOCK_SIZE_Y / 2
  return { x, y }
}

/**
 * Calculate the position of an attacker block based on the direction of attack.
 */
export function calculateAttackerBlockPosition(
  direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST',
  defenderPos: { x: number; y: number } = { x: 0, y: 0 },
): { x: number; y: number } {
  switch (direction) {
    case 'NORTH':
      return { x: defenderPos.x, y: -ATTACKER_BLOCK_VERTICAL_OFFSET }
    case 'SOUTH':
      return { x: defenderPos.x, y: ATTACKER_BLOCK_VERTICAL_OFFSET }
    case 'EAST':
      return { x: ATTACKER_BLOCK_HORIZONTAL_OFFSET, y: defenderPos.y }
    case 'WEST':
      return { x: -ATTACKER_BLOCK_HORIZONTAL_OFFSET, y: defenderPos.y }
  }
}

/**
 * Check if a point is between two other points (used for border city validation).
 * Returns true if point C is approximately on the line between A and B.
 */
export function isPointBetween(
  pointA: { x: number; y: number },
  pointB: { x: number; y: number },
  pointC: { x: number; y: number },
  tolerance: number = 10,
): boolean {
  // Calculate distances
  const distAB = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2))
  const distAC = Math.sqrt(Math.pow(pointC.x - pointA.x, 2) + Math.pow(pointC.y - pointA.y, 2))
  const distCB = Math.sqrt(Math.pow(pointB.x - pointC.x, 2) + Math.pow(pointB.y - pointC.y, 2))

  // Check if C is approximately on the line between A and B
  // If C is on the line, then distance(A,C) + distance(C,B) ≈ distance(A,B)
  return Math.abs(distAC + distCB - distAB) < tolerance
}

/**
 * Check if a line from point A to point B passes close to point C.
 * Uses perpendicular distance from point to line.
 */
export function doesLinePassNearPoint(
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number },
  point: { x: number; y: number },
  maxDistance: number = 20,
): boolean {
  // Vector from lineStart to lineEnd
  const lineVecX = lineEnd.x - lineStart.x
  const lineVecY = lineEnd.y - lineStart.y
  const lineLengthSquared = lineVecX * lineVecX + lineVecY * lineVecY

  if (lineLengthSquared === 0) {
    // Line start and end are the same point
    const dist = Math.sqrt(Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2))
    return dist <= maxDistance
  }

  // Calculate parameter t for the projection of point onto the line
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - lineStart.x) * lineVecX + (point.y - lineStart.y) * lineVecY) / lineLengthSquared,
    ),
  )

  // Find the nearest point on the line segment
  const nearestX = lineStart.x + t * lineVecX
  const nearestY = lineStart.y + t * lineVecY

  // Calculate distance from point to nearest point on line
  const distance = Math.sqrt(Math.pow(point.x - nearestX, 2) + Math.pow(point.y - nearestY, 2))

  return distance <= maxDistance
}
