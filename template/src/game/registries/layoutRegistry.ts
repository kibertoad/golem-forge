import type { Scene } from 'phaser'

/**
 * Layout Registry - Centralized layout constants for consistent UI positioning
 */

/**
 * Helper to get actual screen center based on camera dimensions
 * This handles different viewport sizes correctly
 */
export function getScreenCenter(scene: Scene) {
  const camera = scene.cameras.main
  return {
    x: camera.width / 2,
    y: camera.height / 2,
    width: camera.width,
    height: camera.height,
  }
}

/**
 * Helper to create a centered container for selection dialogs
 * @param scene The Phaser scene
 * @param depth The depth/z-index for the container
 * @returns A container positioned at screen center
 */
export function createCenteredContainer(scene: Scene, depth: number) {
  const center = getScreenCenter(scene)
  const container = scene.add.container(center.x, center.y)
  container.setDepth(depth)
  return container
}

/**
 * Helper to create a full-screen overlay
 * @param scene The Phaser scene
 * @param alpha The transparency (0-1)
 * @param depth The depth/z-index
 */
export function createFullScreenOverlay(scene: Scene, alpha = 0.7, depth = 0) {
  const center = getScreenCenter(scene)
  const overlay = scene.add.rectangle(
    center.x,
    center.y,
    center.width,
    center.height,
    0x000000,
    alpha,
  )
  overlay.setInteractive() // Block clicks
  overlay.setDepth(depth)
  return overlay
}

export const LayoutRegistry = {
  // Scene dimensions
  scene: {
    width: 1480,
    height: 800,
    centerX: 740,
    centerY: 400,
  },

  // Selection overlays (tier selection, vendor selection, etc.)
  selection: {
    // Title positioning
    title: {
      y: -250, // From center
      fontSize: 'h2', // Typography reference
    },

    // Option cards (for selection from multiple options)
    optionCards: {
      width: 500,
      height: 180,
      columns: 2,
      rowSpacing: 200,
      columnSpacing: 550,
      startY: -150, // From center
      getPosition: (index: number) => {
        const col = index % 2
        const row = Math.floor(index / 2)
        return {
          x: col === 0 ? -275 : 275, // -550/2 and +550/2
          y: -150 + row * 200,
        }
      },
    },

    // Navigation buttons
    buttons: {
      back: {
        x: 0, // Centered
        y: 250, // Below content
        width: 150,
        height: 50,
      },
      confirm: {
        x: 200,
        y: 320,
        width: 200,
        height: 60,
      },
      cancel: {
        x: -200,
        y: 320,
        width: 150,
        height: 50,
      },
    },

    // Description text areas
    description: {
      y: 50, // Below title/name
      width: 300,
      lineSpacing: 25,
    },

    // Price display
    price: {
      y: 120, // Below description
      fontSize: 'h3',
    },
  },

  // Modal dialogs
  modal: {
    background: {
      width: 1200,
      height: 600,
      borderRadius: 20,
    },
    title: {
      y: -250,
    },
    content: {
      startY: -180,
      padding: 40,
    },
    buttons: {
      y: 250,
      spacing: 200,
    },
  },

  // List views
  list: {
    item: {
      width: 1100,
      height: 70,
      spacing: 5,
    },
    scrollable: {
      visibleItems: 8,
      maxHeight: 600,
    },
  },

  // Tab layouts
  tabs: {
    button: {
      width: 280,
      height: 50,
      spacing: 10,
    },
    container: {
      y: 100, // From top
    },
  },
}
