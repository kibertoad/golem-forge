/**
 * Centralized style registry for consistent visual design across the game
 * All colors, typography, spacing, and visual constants should be defined here
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const Colors = {
  // Primary Colors
  primary: {
    main: 0x3b82f6, // Blue - main interactive elements
    light: 0x60a5fa, // Light blue - hover states, highlights
    dark: 0x2563eb, // Dark blue - pressed states
    text: '#3b82f6', // Text version of primary
  },

  // Background Colors
  background: {
    primary: 0x1a1a2e, // Main scene background
    secondary: 0x16213e, // Secondary panels
    tertiary: 0x0f172a, // Content areas
    card: 0x1e293b, // Card/item backgrounds
    cardHover: 0x2d3748, // Card hover state
    overlay: 0x000000, // Modal overlay background
  },

  // Text Colors (as strings for Phaser text objects)
  text: {
    primary: '#ffffff', // Main text
    secondary: '#e2e8f0', // Secondary text
    muted: '#94a3b8', // Muted/subtle text
    disabled: '#64748b', // Disabled text
    dark: '#1a1a2e', // Dark text on light backgrounds
  },

  // Status Colors
  status: {
    success: 0x10b981, // Green - success, positive
    successHover: 0x059669,
    successText: '#10b981',
    warning: 0xf59e0b, // Orange - warning
    warningText: '#f59e0b',
    danger: 0xef4444, // Red - danger, negative
    dangerText: '#ef4444',
    info: 0x3b82f6, // Blue - informational
    infoText: '#3b82f6',
  },

  // Money/Currency
  money: {
    positive: '#4ade80', // Green for profits
    negative: '#ef4444', // Red for losses
    neutral: '#fbbf24', // Yellow for costs
  },

  // Stock Inventory specific colors
  inventory: {
    title: '#00ff00', // Bright green for inventory title
    value: '#00ffff', // Cyan for values
    profit: '#00ff00', // Green for profit
    loss: '#ff0000', // Red for loss
    filterActive: 0x00aa00, // Active filter green
    filterBorder: 0x00ff00, // Filter border green
    sortActive: 0x0066aa, // Active sort blue
    sortBorder: 0x00aaff, // Sort border blue
    clearButton: 0x660000, // Dark red for clear button
    clearBorder: 0xaa0000, // Red border for clear
    sellButton: 0x004400, // Dark green for sell button
    sellButtonHover: 0x006600, // Brighter green on hover
    sellBorder: 0x00ff00, // Green border
    scrollTrack: 0x1a1a1a, // Dark track
    scrollThumb: 0x666666, // Grey thumb
    background: 0x1a1a1a, // Inventory background
    backgroundBorder: 0x444444, // Background border
    itemBackground: 0x2a2a2a, // Item row background
    itemBorder: 0x444444, // Item row border
    itemHover: 0x3a3a3a, // Item hover background
    itemHoverBorder: 0x666666, // Item hover border
  },

  // Selection screen colors
  selection: {
    cardBg: 0x2a2a2a,
    cardBgHover: 0x3a3a3a,
    cardBgSelected: 0x2a3a4a,
    cardBorder: 0x3a3a3a,
    cardBorderHover: 0x4a4a4a,
    cardBorderSelected: 0x4a6a8a,
    overlayBg: 0x000000,
    overlayAlpha: 0.8,
    titleBg: 0x1a1a1a,
    salaryText: '#ffaa00',
    starRating: '#ffcc00',
    starEmpty: '#666666',
    traitPositive: '#88ff88',
    traitHidden: '#666666',
    traitBadge: 0x2a4a2a,
    confirmButton: 0x2a5a2a,
    confirmButtonHover: 0x3a6a3a,
    skipButton: 0x3a3a3a,
    skipButtonHover: 0x4a4a4a,
    skipButtonText: '#ffaaaa',
    techLevelFill: 0x00aaff,
    scaleLevelFill: 0x00ff00,
    emptyLevelBox: 0x222222,
    emptyLevelBorder: 0x444444,
    specialtyBadge: 0x004444,
    vendorGlow: 0x00ffff,
  },

  // Heat Levels
  heat: {
    low: '#10b981', // Green (0-3)
    medium: '#f59e0b', // Orange (4-7)
    high: '#ef4444', // Red (8-10)
  },

  // Special UI Elements
  ui: {
    border: 0x3b82f6, // Standard border color
    borderHover: 0x60a5fa, // Hover border color
    selection: 0x3b82f6, // Selection highlight
    focus: 0x60a5fa, // Focus indicator
    divider: 0x2d3748, // Divider lines
    scrollbarBg: 0x333333, // Scrollbar background
    scrollbar: 0x666666, // Scrollbar thumb
    maskFill: 0xffffff, // Mask fill color
  },

  // Military/War Colors
  military: {
    ally: 0x10b981, // Green for allies
    enemy: 0xef4444, // Red for enemies
    neutral: 0x94a3b8, // Gray for neutrals
    capital: 0xffff00, // Yellow for capitals
    attack: 0xff0000, // Red for attack indicators
  },
} as const

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const Typography = {
  // Font Families
  fontFamily: {
    primary: 'Arial',
    monospace: 'Courier',
    display: 'Arial',
  },

  // Font Sizes
  fontSize: {
    // Headings
    h1: '36px',
    h2: '32px',
    h3: '28px',
    h4: '24px',
    h5: '20px',
    h6: '18px',

    // Body text
    large: '20px',
    regular: '18px',
    small: '16px',
    tiny: '14px',

    // Special uses
    title: '36px',
    subtitle: '24px',
    button: '20px',
    buttonSmall: '16px',
    label: '16px',
    caption: '14px',
    tooltip: '14px',
  },

  // Font Styles
  fontStyle: {
    normal: 'normal',
    bold: 'bold',
    italic: 'italic',
  },

  // Text Shadow
  shadow: {
    small: { x: 1, y: 1, color: '#000000', blur: 1, stroke: true, fill: true },
    medium: { x: 2, y: 2, color: '#000000', blur: 2, stroke: true, fill: true },
    large: { x: 3, y: 3, color: '#000000', blur: 3, stroke: true, fill: true },
  },
} as const

// ============================================================================
// BORDERS & STROKES
// ============================================================================

export const Borders = {
  // Border Widths
  width: {
    thin: 1,
    normal: 2,
    thick: 3,
    heavy: 4,
  },

  // Border Radius
  radius: {
    none: 0,
    small: 5,
    medium: 10,
    large: 20,
    full: 9999,
  },
} as const

// ============================================================================
// SPACING & LAYOUT
// ============================================================================

export const Spacing = {
  // Padding/Margin values
  none: 0,
  xs: 5,
  sm: 10,
  md: 20,
  lg: 30,
  xl: 40,
  xxl: 60,

  // Component spacing
  buttonPadding: { x: 20, y: 10 },
  cardPadding: { x: 15, y: 15 },
  containerPadding: { x: 20, y: 20 },

  // List item spacing
  listItemGap: 60,
  listItemGapLarge: 100,
  listItemGapCompact: 40,
} as const

// ============================================================================
// DIMENSIONS
// ============================================================================

export const Dimensions = {
  // Scene dimensions
  scene: {
    width: 1480,
    height: 800,
  },

  // Common component sizes
  button: {
    default: { width: 150, height: 50 },
    small: { width: 100, height: 35 },
    large: { width: 200, height: 60 },
    wide: { width: 250, height: 50 },
  },

  // Card/Panel sizes
  card: {
    warehouse: { width: 1300, height: 120 },
    location: { width: 1300, height: 80 },
    stock: { width: 1100, height: 50 },
  },

  // Warehouse selection specific
  warehouseOption: {
    width: 1200,
    height: 100,
    buyButtonWidth: 200,
    buyButtonHeight: 80,
    rentButtonWidth: 200,
    rentButtonHeight: 80,
  },

  // Scrollbar dimensions
  scrollbar: {
    width: 10,
    thumbAlpha: 0.8,
    bgAlpha: 0.5,
  },

  // Modal/Overlay sizes
  modal: {
    default: { width: 1200, height: 500 },
    large: { width: 1400, height: 600 },
    small: { width: 800, height: 400 },
  },

  // Tab dimensions
  tab: {
    width: 280,
    height: 50,
    gap: 10,
  },

  // Command bar
  commandBar: {
    width: 120,
    buttonHeight: 30,
    buttonGap: 5,
  },
} as const

// ============================================================================
// ANIMATIONS
// ============================================================================

export const Animations = {
  // Duration in milliseconds
  duration: {
    instant: 0,
    fast: 100,
    normal: 200,
    slow: 300,
    verySlow: 500,
  },

  // Easing functions
  easing: {
    linear: 'Linear',
    easeIn: 'Power2',
    easeOut: 'Power2',
    easeInOut: 'Power2',
    bounce: 'Bounce',
  },
} as const

// ============================================================================
// OPACITY
// ============================================================================

export const Opacity = {
  transparent: 0,
  veryLight: 0.1,
  light: 0.3,
  medium: 0.5,
  heavy: 0.7,
  dark: 0.8,
  veryDark: 0.9,
  opaque: 1,

  // Specific uses
  overlay: 0.8,
  disabled: 0.5,
  selection: 0.3,
  hover: 0.1,
} as const

// ============================================================================
// Z-INDEX LAYERS (extends DepthRegistry)
// ============================================================================

export const Layers = {
  background: 0,
  content: 100,
  cards: 200,
  ui: 300,
  popover: 400,
  modal: 500,
  overlay: 1000,
  tooltip: 2000,
  notification: 3000,
} as const

// ============================================================================
// STYLE PRESETS (Common combinations)
// ============================================================================

export const StylePresets = {
  // Primary button style
  primaryButton: {
    background: Colors.primary.main,
    backgroundHover: Colors.primary.light,
    backgroundActive: Colors.primary.dark,
    text: Colors.text.primary,
    fontSize: Typography.fontSize.button,
    padding: Spacing.buttonPadding,
  },

  // Secondary button style
  secondaryButton: {
    background: Colors.background.cardHover,
    backgroundHover: Colors.background.card,
    text: Colors.text.primary,
    fontSize: Typography.fontSize.button,
    padding: Spacing.buttonPadding,
  },

  // Card style
  card: {
    background: Colors.background.card,
    backgroundHover: Colors.background.cardHover,
    border: Colors.ui.border,
    borderWidth: Borders.width.normal,
    padding: Spacing.cardPadding,
  },

  // Selected card style
  cardSelected: {
    background: Colors.primary.main,
    backgroundOpacity: Opacity.selection,
    border: Colors.primary.light,
    borderWidth: Borders.width.thick,
  },

  // Title text
  titleText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.h3,
    fontStyle: Typography.fontStyle.bold,
    fontFamily: Typography.fontFamily.primary,
  },

  // Body text
  bodyText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.regular,
    fontStyle: Typography.fontStyle.normal,
    fontFamily: Typography.fontFamily.primary,
  },

  // Muted text
  mutedText: {
    color: Colors.text.muted,
    fontSize: Typography.fontSize.small,
    fontStyle: Typography.fontStyle.normal,
    fontFamily: Typography.fontFamily.primary,
  },

  // Money display
  moneyText: {
    positive: {
      color: Colors.money.positive,
      fontSize: Typography.fontSize.regular,
    },
    negative: {
      color: Colors.money.negative,
      fontSize: Typography.fontSize.regular,
    },
    neutral: {
      color: Colors.money.neutral,
      fontSize: Typography.fontSize.small,
    },
  },
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert hex color number to string format
 */
export function colorToString(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`
}

/**
 * Get heat color based on heat level
 */
export function getHeatColor(heat: number): string {
  if (heat <= 3) return Colors.heat.low
  if (heat <= 7) return Colors.heat.medium
  return Colors.heat.high
}

/**
 * Get text style configuration for Phaser text objects
 */
export function getTextStyle(
  preset: keyof typeof StylePresets,
): Phaser.Types.GameObjects.Text.TextStyle {
  const style = StylePresets[preset as keyof typeof StylePresets]
  if ('color' in style && 'fontSize' in style) {
    return {
      color: style.color,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily || Typography.fontFamily.primary,
      fontStyle: style.fontStyle || Typography.fontStyle.normal,
    }
  }
  return {}
}
