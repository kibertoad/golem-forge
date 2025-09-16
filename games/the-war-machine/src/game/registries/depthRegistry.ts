export const DepthRegistry = {
  // Board and map layers (0-99)
  BOARD_BACKGROUND: 30,
  ZONE_HIGHLIGHT: 40,
  UI_BACKGROUND: 50,
  UI_ELEMENTS: 60,
  UI_TEXT: 70,
  BACKGROUND_ENTITY: 90,

  // Entities and game objects (100-999)
  ENTITY: 100,              // Default entity depth
  ENTITY_MIN: 100,
  ENTITY_MAX: 300,
  CHAT_BUBBLE: 400,
  EXPLOSION: 800,
  NAVIGATION_BAR: 900,      // Navigation bar
  EVENT_LOG: 900,           // Event log
  STATUS_DISPLAY: 950,      // Status display
  NEXT_TURN_BUTTON: 950,    // Next turn button

  // UI overlays and modals (1000-2999)
  EVENT: 1000,
  TOAST_CONTAINER: 1000,    // Toast notifications
  SCHEDULE_BUTTON: 1500,    // Schedule attendance button
  TOAST: 1500,
  CITY_ZOOM_VIEW: 2000,     // City zoom view
  CONTINENTAL_VIEW: 2000,   // Continental zoom view
  PERSON_SELECTOR: 2000,    // Generic person selector
  AGENT_SELECTOR: 2000,     // Business agent selector
  MODAL: 2100,              // General modals

  // Inventory and stock views (3000-3999)
  RESEARCH_DIALOG: 3000,    // Research project dialog
  LAB_UPGRADE_DIALOG: 3000, // Laboratory upgrade dialog
  DIRECTOR_HIRING: 3000,    // Director hiring dialog
  CONTINENTAL_TOOLTIP: 3000,// Tooltip on continental view
  STOCK_INVENTORY: 3000,    // Stock inventory window
  STOCK_OVERLAY: 3100,      // Stock overlay in warehouse/assets
  STOCK_DETAIL: 3500,       // Arms detail view (info popup)

  // Country info overlay (4000-4999)
  COUNTRY_INFO_OVERLAY: 4000, // Country information overlay

  // Critical overlays (9000+)
  INPUT_BLOCK: 9000,
  GAME_OVER: 10000,
}
