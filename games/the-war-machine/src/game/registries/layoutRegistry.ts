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

    // Service/vendor tier cards
    tierCards: {
      width: 350,
      height: 300,
      spacing: 400, // Horizontal spacing between cards
      y: 0, // Vertically centered
      // For 3 cards: positions are -400, 0, +400 from center
      getXPosition: (index: number, total: number) => {
        const spacing = 400
        const startX = (-(total - 1) * spacing) / 2
        return startX + index * spacing
      },
    },

    // Option cards (warehouse options, etc.)
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

  // Arms show specific
  armsShow: {
    vendorCard: {
      width: 350,
      height: 250,
      spacing: 400,
    },
    scheduleButton: {
      x: 0,
      y: 300,
      width: 200,
      height: 60,
    },
  },

  // Warehouse selection specific
  warehouse: {
    list: {
      y: -250, // From container center
      itemHeight: 120,
      maxVisibleItems: 5, // Optimal for warehouse selection
      maskPadding: 10,
    },
    optionCard: {
      concealmentX: -550,
      concealmentY: -30,
      storageX: -550,
      storageY: 10,
      buyButtonX: 200,
      rentButtonX: 450,
    },
    backButton: {
      x: -500,
      y: 320,
    },
    scrollbar: {
      x: 610,
    },
    // New layout for right-side warehouse selection
    rightSideSelection: {
      containerX: 1100,
      containerY: 400,
      frameWidth: 700,
      frameHeight: 120,
      listY: -200,
      itemWidth: 600,
      itemHeight: 90,
      maxVisibleItems: 5,
      buyButtonX: -120,
      rentButtonX: 120,
    },
  },

  // Assets scene specific
  assetsScene: {
    backButton: {
      x: 1380,
      y: 50,
    },
    warehouseList: {
      titleY: -220,
      startY: -140,
      itemHeight: 140,
      itemWidth: 1300,
      maxVisibleItems: 5,
      scrollbarX: 680,
    },
  },

  // Common reusable patterns
  common: {
    // Add new item button below scrollable lists (warehouses, directors, etc.)
    addNewButton: {
      y: 320, // Position below typical scrollable list
      width: 250,
      height: 50,
    },
    // Back button in upper right corner for scenes
    upperRightBackButton: {
      x: 1380,
      y: 50,
    },
  },

  // Hiring dialog specific
  hiring: {
    dialogWidth: 1400,
    dialogHeight: 900,
    agencyCard: {
      width: 400,
      height: 350,
      spacing: 450,
    },
    candidateCard: {
      width: 400,
      height: 500,
      spacing: 450,
      getXPosition: (index: number) => {
        // 3 cards: positions are -450, 0, +450 from center
        return -450 + index * 450
      },
    },
    buttons: {
      hire: {
        x: -150,
        y: 380,
        width: 200,
        height: 50,
      },
      skip: {
        x: 150,
        y: 380,
        width: 200,
        height: 50,
      },
    },
  },
}

export default LayoutRegistry
