# Deadlines in Hell - Project Guide

## Game Overview
A sprint board management game where players manage development teams and move tickets through various stages of development. Features drag-and-drop mechanics for both tickets and team members.

## Tech Stack
- **Phaser 4**: Game engine (RC version)
- **Awilix**: Dependency injection container
- **@potato-golem**: Custom wrapper libraries for Phaser
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Biome**: Linting and formatting

## Project Structure

### Core Patterns

#### 1. Dependency Injection (Awilix)
- All major components are registered in `src/game/model/diConfig.ts`
- Use `asClass` for singleton services, `asValue` for instances, `asFunction` for factories
- Access dependencies via constructor injection:
```typescript
constructor({ worldModel, endTurnProcessor }: Dependencies) {
  // ...
}
```
- **Important**: Always use DI for shared services to avoid multiple instances
- Test configuration available in `testDiConfig.ts` for unit tests without Phaser dependencies

#### 2. Scene Architecture
- Scenes extend `PotatoScene` from `@potato-golem/ui`
- Register scenes in `src/game/registries/sceneRegistry.ts`
- Scenes are singletons managed by DI container
- Communication between scenes via `globalSceneEventEmitter`

#### 3. Entity System
- Models: `EntityModel` contains game logic and state
- Views: `EntityView` extends `GameObjects.Container` for display
- Definitions: Static entity data in `entityDefinitions.ts`
- World model manages all entities

#### 4. Registry Pattern
- Centralized constants in `/registries` folder:
  - `depthRegistry`: Z-ordering layers
  - `imageRegistry`: Asset keys
  - `sceneRegistry`: Scene identifiers
  - `eventEmitterRegistry`: Event channels
  - `entityTypeRegistry`: Entity type constants

## Development Commands
```bash
npm run dev          # Start development server
npm run build:prod   # Production build
npm run lint         # Run Biome checks and TypeScript type checking
npm run lint:fix     # Auto-fix linting issues
```

## Key Conventions

### File Organization
- `/model`: Game logic, entities, processors, business logic
  - `/entities`: Core data models and interfaces (e.g., `TeamMember.ts`, `Ticket.ts`)
  - `/board`: Business logic modules (e.g., `BoardBusinessLogic.ts`)
  - `/processors`: Game state processors
- `/scenes`: Phaser scenes and UI components (presentation layer only)
- `/content`: Game content (choices, events, etc.)
- `/registries`: Centralized constants and registries

### Naming Patterns
- Models: `*Model.ts` (e.g., `EntityModel`, `WorldModel`)
- Views: `*View.ts` (e.g., `EntityView`)
- Scenes: `*Scene.ts` (e.g., `BoardScene`)
- Processors: `*Processor.ts` (e.g., `EndTurnProcessor`)
- Registries: `*Registry.ts` (lowercase instance)
- Business Logic: `*BusinessLogic.ts` (contains pure functions for game rules)

### Scene Creation Pattern
```typescript
export class MyScene extends PotatoScene {
  constructor({ dependency1, dependency2 }: Dependencies) {
    super(globalSceneEventEmitter, sceneRegistry.MY_SCENE)
    // Initialize dependencies
  }

  init() { /* One-time setup */ }
  preload() { /* Load assets */ }
  create() { /* Create game objects */ }
  update() { /* Game loop */ }
}
```

### Entity Pattern
```typescript
// Model (game logic)
class EntityModel {
  constructor({ definition }) {
    // Initialize from definition
  }
}

// View (display)
class EntityView extends GameObjects.Container {
  constructor(scene: PotatoScene, params: ViewParams, dependencies: ViewDependencies) {
    super(scene)
    // Setup display
    scene.add.existing(this)
  }
}
```

### Model Definition Best Practices

#### 1. Separation of Concerns
- **Models** (`/model/entities/`): Pure data structures and interfaces
- **Business Logic** (`/model/board/`, etc.): Game rules as pure functions
- **Scenes** (`/scenes/`): Presentation layer only - no business logic

#### 2. Model Structure
```typescript
// src/game/model/entities/TeamMember.ts
export enum TeamMemberRole {
  DEVELOPER = 'developer',
  ANALYST = 'analyst',
  // ...
}

export interface TeamMember {
  id: string
  name: string
  role: TeamMemberRole
  assignedTo?: string
  displayObject?: GameObjects.Container // Optional UI reference
}

// Helper functions for model-specific logic
export const getRoleColor = (role: TeamMemberRole): number => {
  // Return color based on role
}
```

#### 3. Business Logic as Functions
```typescript
// src/game/model/board/BoardBusinessLogic.ts
// Use plain functions, not static classes (per linting rules)
export function canAssignToTicket(member: TeamMember, ticket: Ticket): boolean {
  // Business rule implementation
}

export function canMoveToColumn(ticket: Ticket, targetColumn: BoardColumn): boolean {
  // Business rule implementation
}
```

#### 4. Import Best Practices
- Always use `.ts` extensions for relative imports
- Import types separately when possible: `import type { TeamMember }`
- Group imports: external packages, then internal modules, then local files

### Adding New Dependencies
1. Add interface to `Dependencies` in `diConfig.ts`
2. Register in `diConfig` object
3. Access via constructor injection

### Event System
- Use `eventEmitterRegistry` for typed events
- Global scene events via `globalSceneEventEmitter`
- Board-specific events via `boardEmitter`

## Item Height Standards

Consistent item heights improve visual cohesion:

### Standard Heights
- **Compact** (40px): Black market, filtered lists with many items
- **Normal** (50px): Stock overlays, simple lists
- **Comfortable** (70px): Inventory views with details
- **Expanded** (100px+): Detailed cards with multiple data points

### Spacing Standards
- **Item gap**: 5px between items in lists
- **Section gap**: 20-30px between major sections
- **Filter gap**: 150px minimum for filter sections

### Calculating List Container Heights
```typescript
const visibleItems = 10  // Max items before scrolling
const itemHeight = 45     // Item + spacing
const listHeight = visibleItems * itemHeight
const containerHeight = headerHeight + filterHeight + listHeight + padding
```

## Testing Approach
- Test framework: **Vitest**
- Run tests: `npm test`
- Run linting before commits: `npm run lint`
- TypeScript checking: `tsc --noEmit` or `npm run build`
- Test files located alongside source files with `.test.ts` extension
- **Test DI Configuration**: Use `testDiConfig.ts` for unit tests without Phaser dependencies
  - Provides mock implementations of scene-dependent services
  - Allows testing game logic in isolation from rendering
- Do not run server via dev command, building and linting is enough.

## Asset Management
- Images go in `/public/assets/`
- Register keys in `imageRegistry.ts`
- Use `SpriteBuilder` from `@potato-golem/ui` for sprites

## Common Tasks

### Add a New Scene
1. Create scene class extending `PotatoScene`
2. Add to `sceneRegistry.ts`
3. Register in `diConfig.ts`
4. Add to Game config scene array

### Add a New Entity Type
1. Define in `entityDefinitions.ts`
2. Add type to `entityTypeRegistry.ts`
3. Create `EntityModel` and `EntityView` classes
4. Register entity creation in appropriate scene

### Handle User Input
- Use Phaser's input system in scenes
- Emit events via event emitters for cross-component communication
- Process game logic in processors

## Code Style
- No unnecessary comments
- Follow existing patterns in codebase
- Use TypeScript strict mode
- Prefer composition over inheritance
- Keep views and models separated

## Reusable UI Components

All reusable UI components are located in `src/game/components/` for better organization and discoverability.

### Component Architecture Principles

1. **Generic Type Parameters**: Components use TypeScript generics to work with different data types while maintaining type safety
2. **Interface-Based Contracts**: Components depend on interfaces (like `StockListItem`) rather than concrete types
3. **Configuration Over Code**: Extensive configuration options to customize behavior without modifying component code
4. **Event-Driven Communication**: Components emit events rather than directly calling parent methods
5. **Style Registry Integration**: All colors, fonts, and dimensions come from centralized style registry

### Column Layout Best Practices

When designing multi-column layouts:

```typescript
// Define clear column positions
const columnPositions = {
  name: 15,
  quantity: 450,
  value: 600,
  custom: 750,
  actions: 1000
}

// Ensure adequate spacing
// Minimum 150px between column starts for readability
// Account for text width when positioning
```

**Responsive Column Positioning**:
- Primary info (name): Far left (x: 15-30)
- Secondary data (qty, condition): Center-left (x: 450)
- Values/prices: Center-right (x: 600-750)
- Actions: Far right (x: 1000+)
- Custom columns: Adjust based on content

## Component Best Practices

### When Creating New Components

1. **Define Clear Interfaces**: Create interfaces for configuration and callbacks
2. **Use Generics**: Make components work with multiple data types
3. **Emit Events**: Use `this.emit()` for parent communication rather than callbacks
4. **Support Scrolling**: Include scrollbar visualization for long lists
5. **Use Style Registry**: Never hardcode colors or dimensions
6. **Make It Configurable**: Provide options to toggle features on/off
7. **Document Usage**: Add examples in CLAUDE.md

### Component vs. Scene Architecture

- **Components** (`src/game/components/`): Reusable UI elements used across multiple scenes
- **Scene Components** (`src/game/scenes/components/`): Scene-specific components, often legacy
- **Molecules/Organisms** (`src/game/scenes/*/molecules/`): Complex scene-specific UI elements

## UI Layout and Positioning

### Dynamic Frame Sizing

When content varies in height (like filtered lists), frames should resize dynamically:

```typescript
if (this.contentBg && this.contentContainer) {
  const frameHeight = 950  // Calculate based on content
  const frameTop = 190     // Below tabs
  const frameCenterY = frameTop + frameHeight / 2

  // Position both frame and container together
  this.contentBg.setSize(1400, frameHeight)
  this.contentBg.y = frameCenterY
  this.contentContainer.y = frameCenterY
}
```

**Key Points**:
- Calculate total height needed for all content elements
- Keep frame top edge consistent (e.g., below tabs)
- Move both background and container together
- Reset to defaults when switching views

### Text Alignment in Variable Height Items

For components that support different item heights (e.g., StockListDisplay):

```typescript
// Calculate positions based on actual item height
const itemCenterY = this.config.height / 2
const hasBranch = itemBranch && this.config.height > 35

// Conditional positioning
const nameY = hasBranch
  ? (this.config.height > 50 ? itemCenterY - 10 : 10)
  : itemCenterY  // Center if single line

// Always use setOrigin for vertical centering
text.setOrigin(0, 0.5)
```

**Height Breakpoints**:
- **< 35px**: Single line only, centered
- **35-50px**: Two lines, tighter spacing
- **> 50px**: Two lines, comfortable spacing

### Centering Elements in Phaser

#### Button Centering
```typescript
// Center button graphics around container position
const buttonHeight = 30
bg.fillRoundedRect(0, -buttonHeight/2, width, buttonHeight, radius)
text.setPosition(width/2, 0)  // Text at center
text.setOrigin(0.5)  // Center origin
```

#### Interactive Area for Centered Elements
```typescript
bg.setInteractive(
  new Phaser.Geom.Rectangle(0, -height/2, width, height),
  Phaser.Geom.Rectangle.Contains
)
```

### Overlay Management

When showing overlays, hide underlying elements to avoid visual clutter:

```typescript
if (this.stockInventoryView) {
  this.earthMap.setVisible(false)  // Hide map
  this.stockInventoryView.show()
}

// Listen for close event to restore visibility
stockInventoryView.on('inventory-closed', () => {
  this.earthMap.setVisible(true)
  this.navigationBar.setActiveButton(NavigationState.DEFAULT)
})
```

### Dynamic Filter Generation

Filters should reflect actual available data, not hardcoded options:

```typescript
// Collect actual values from data
const availableBranches = new Set<ArmsBranch>()
const availableConditions = new Set<ArmsCondition>()

this.offers.forEach(offer => {
  const armsDef = armsRegistry.getDefinition(offer.armsId)
  if (armsDef) {
    availableBranches.add(armsDef.branch)
  }
  availableConditions.add(offer.condition)
})

// Sort in logical order
const conditionOrder = [ArmsCondition.NEW, ArmsCondition.GOOD, ...]
const sorted = Array.from(availableConditions).sort((a, b) =>
  conditionOrder.indexOf(a) - conditionOrder.indexOf(b)
)
```

### Common UI Patterns

#### Scrolling Implementation
```typescript
// Standard mouse wheel scrolling setup
scene.input.on('wheel', (pointer, objects, deltaX, deltaY) => {
  if (this.visible && this.component) {
    this.component.scroll(deltaY > 0 ? 1 : -1)
  }
})
```

#### Right-Click Navigation
```typescript
// Standard right-click to close/go back
scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
  if (pointer.rightButtonDown() && this.visible) {
    this.hide()
    this.emit('closed')
  }
})

// For scenes, implement goBack method
private goBack() {
  this.scene.stop()  // Stop current scene
  this.scene.wake(sceneRegistry.PREVIOUS_SCENE)  // Wake previous
}
```

**Best Practices**:
- Always emit a close event for parent handling
- Reset navigation state when appropriate
- Implement consistent back navigation across all overlays


## Z-Index Layer Management

### Depth Registry (`src/game/registries/depthRegistry.ts`)

The depth registry centralizes all z-index (depth) values for proper layering of UI elements. This ensures overlays, modals, and popups appear in the correct visual order.

#### Layer Ranges

**0-99: Board and Map Layers**
- Background elements, UI chrome, basic interface

**100-999: Entities and Game Objects**
- Game pieces, animations, navigation elements

**1000-2999: UI Overlays and Modals**
- Toast notifications, zoom views, selection dialogs

**3000-3999: Inventory and Stock Views**
- Stock inventory, research dialogs, tooltips
- Stock detail views (info popups) at 3500

**4000-4999: Country Info Overlays**
- High-priority country information displays

**9000+: Critical Overlays**
- Input blockers, game over screens

#### Usage Guidelines

1. **Always use DepthRegistry constants** instead of hardcoded numbers:
```typescript
import { DepthRegistry } from '../../../../registries/depthRegistry.ts'

// Good
this.setDepth(DepthRegistry.STOCK_INVENTORY)

// Bad
this.setDepth(3000)
```

2. **Parent-child depth relationships**: Child overlays should have higher depth than their parents:
- StockInventoryView: 3000 (STOCK_INVENTORY)
- ArmsDetailView (info popup): 3500 (STOCK_DETAIL)

3. **Modal overlays** should block interaction with elements below by using semi-transparent backgrounds

4. **Right-click navigation**: All overlays should support right-click to close:
```typescript
private setupRightClickClose(scene: PotatoScene) {
  scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    if (pointer.rightButtonDown() && this.visible) {
      this.hide()
    }
  })
}
```

## Layout Registry (`src/game/registries/layoutRegistry.ts`)

The layout registry centralizes all positioning and sizing constants for consistent UI layouts across the game.

### When to Use Layout Registry

Use the layout registry when:
- Creating selection overlays (service tiers, vendor selection, hiring)
- Positioning UI elements that appear in multiple places
- Building modal dialogs or card-based layouts
- Ensuring consistent spacing between elements
- Centering content on screen

### Key Layout Constants

#### Scene Dimensions
```typescript
LayoutRegistry.scene.centerX  // 740
LayoutRegistry.scene.centerY  // 400
LayoutRegistry.scene.width    // 1480
LayoutRegistry.scene.height   // 800
```

#### Selection Overlays
For tier/card selection screens (warehouse service, vendor contacts, hiring):

```typescript
// Title positioning
LayoutRegistry.selection.title.y  // -250 from center

// Tier cards (3 cards horizontally)
const x = LayoutRegistry.selection.tierCards.getXPosition(index, total)
const width = LayoutRegistry.selection.tierCards.width   // 350
const height = LayoutRegistry.selection.tierCards.height // 300

// Navigation buttons
LayoutRegistry.selection.buttons.back  // { x: 0, y: 250, width: 150, height: 50 }
LayoutRegistry.selection.buttons.confirm  // { x: 200, y: 320, ... }
```

#### Dynamic Positioning Functions

**Tier Cards** - Horizontally spaced cards:
```typescript
LayoutRegistry.selection.tierCards.getXPosition(index, total)
// Returns x position for card at index
// Centers all cards with 400px spacing
```

**Option Cards** - 2-column grid layout:
```typescript
LayoutRegistry.selection.optionCards.getPosition(index)
// Returns { x, y } for card at index
// Creates 2-column layout with proper spacing
```

### Usage Example

```typescript
import { LayoutRegistry } from '../../../registries/layoutRegistry.ts'
import { Colors, Typography } from '../../../registries/styleRegistry.ts'

// Center a container on screen
const container = scene.add.container(
  LayoutRegistry.scene.centerX,
  LayoutRegistry.scene.centerY
)

// Add title at standard position
const title = scene.add.text(
  0,
  LayoutRegistry.selection.title.y,
  'Select Service Tier',
  { fontSize: Typography.fontSize.h2 }
)

// Position tier cards
tiers.forEach((tier, index) => {
  const x = LayoutRegistry.selection.tierCards.getXPosition(index, tiers.length)
  const card = createCard(x, 0, tier)
})
```

## Visual Style System

### Style Registry (`src/game/registries/styleRegistry.ts`)

The style registry centralizes all visual constants for consistent design across the game. All colors, typography, spacing, and visual properties should be defined here rather than hardcoded in components.

#### Color Palette

**Primary Colors**
- `Colors.primary.main`: 0x3b82f6 - Blue for main interactive elements
- `Colors.primary.light`: 0x60a5fa - Light blue for hover states and highlights
- `Colors.primary.dark`: 0x2563eb - Dark blue for pressed states

**Background Colors**
- `Colors.background.primary`: 0x1a1a2e - Main scene background
- `Colors.background.secondary`: 0x16213e - Secondary panels
- `Colors.background.tertiary`: 0x0f172a - Content areas
- `Colors.background.card`: 0x1e293b - Card/item backgrounds
- `Colors.background.cardHover`: 0x2d3748 - Card hover state

**Text Colors** (string format for Phaser)
- `Colors.text.primary`: '#ffffff' - Main text
- `Colors.text.secondary`: '#e2e8f0' - Secondary text
- `Colors.text.muted`: '#94a3b8' - Muted/subtle text
- `Colors.text.disabled`: '#64748b' - Disabled text

**Status Colors**
- `Colors.status.success`: Green (0x10b981) - Success, positive
- `Colors.status.warning`: Orange (0xf59e0b) - Warning
- `Colors.status.danger`: Red (0xef4444) - Danger, negative
- `Colors.money.positive`: '#4ade80' - Profits
- `Colors.money.negative`: '#ef4444' - Losses
- `Colors.money.neutral`: '#fbbf24' - Costs


#### Typography

**Font Families**
- `Typography.fontFamily.primary`: 'Arial' - Main UI font
- `Typography.fontFamily.monospace`: 'Courier' - Code/data display
- `Typography.fontFamily.display`: 'Arial' - Display text

**Font Sizes**
- Headings: `h1` (36px) through `h6` (18px)
- Body: `large` (20px), `regular` (18px), `small` (16px), `tiny` (14px)
- Special: `title` (36px), `button` (20px), `caption` (14px)

**Font Styles**
- `Typography.fontStyle.bold`, `normal`, `italic`
- Text shadows: `small`, `medium`, `large` presets

#### Borders & Spacing

**Border Widths**
- `Borders.width.thin`: 1px
- `Borders.width.normal`: 2px
- `Borders.width.thick`: 3px
- `Borders.width.heavy`: 4px

**Border Radius**
- `Borders.radius.small`: 5px
- `Borders.radius.medium`: 10px
- `Borders.radius.large`: 20px

**Spacing**
- `Spacing.xs`: 5px through `Spacing.xxl`: 60px
- Component padding presets for buttons, cards, containers
- List item gaps: `compact` (40px), `normal` (60px), `large` (100px)

#### Dimensions

**Common Sizes**
- Scene: 1480x800
- Buttons: `default` (150x50), `small` (100x35), `large` (200x60), `wide` (250x50)
- Modals: `default` (1200x500), `large` (1400x600), `small` (800x400)
- Tabs: 280x50 with 10px gap

#### Animations

**Durations**
- `Animations.duration.fast`: 100ms
- `Animations.duration.normal`: 200ms
- `Animations.duration.slow`: 300ms

**Easing**
- `Animations.easing.easeIn/Out/InOut`: 'Power2'

#### Opacity

**Preset Values**
- `Opacity.selection`: 0.3 - Selected items
- `Opacity.overlay`: 0.8 - Modal overlays
- `Opacity.disabled`: 0.5 - Disabled elements
- `Opacity.hover`: 0.1 - Hover overlays

#### Style Presets

Pre-configured style combinations for common UI elements:

```typescript
// Primary button
StylePresets.primaryButton = {
  background: Colors.primary.main,
  backgroundHover: Colors.primary.light,
  text: Colors.text.primary,
  fontSize: Typography.fontSize.button,
}

// Selected card
StylePresets.cardSelected = {
  background: Colors.primary.main,
  backgroundOpacity: Opacity.selection,
  border: Colors.primary.light,
  borderWidth: Borders.width.thick,
}
```

#### Usage Examples

```typescript
// Import style constants
import { Colors, Typography, Borders, Spacing } from '../../registries/styleRegistry.ts'

// Use in Phaser objects
const button = this.add.rectangle(0, 0,
  Dimensions.button.default.width,
  Dimensions.button.default.height,
  Colors.primary.main
)

const text = this.add.text(0, 0, 'Hello', {
  fontSize: Typography.fontSize.h3,
  fontFamily: Typography.fontFamily.primary,
  color: Colors.text.primary,
  fontStyle: Typography.fontStyle.bold,
})

// Use heat color helper
const heatColor = getHeatColor(warehouse.heat)

// Apply selection highlight
bg.setFillStyle(Colors.primary.main, Opacity.selection)
bg.setStrokeStyle(Borders.width.thick, Colors.primary.light)
```


#### Depth Management for Map Overlays

When using map components in overlays:

1. **Hide Background Elements**
   ```typescript
   // Hide AssetsScene content when showing overlay
   if (this.assetsScene.contentContainer) {
     this.assetsScene.contentContainer.setVisible(false)
   }
   if (this.assetsScene.contentBg) {
     this.assetsScene.contentBg.setVisible(false)
   }
   ```

2. **Set Appropriate Depths**
   ```typescript
   // Map components above scene content
   this.earthMap.setDepth(DepthRegistry.STOCK_INVENTORY + 100)

   // UI elements above map
   this.instructionText.setDepth(DepthRegistry.STOCK_INVENTORY + 150)
   this.closeButton.setDepth(DepthRegistry.STOCK_INVENTORY + 200)
   ```

3. **Overlay Background Control**
   ```typescript
   // Hide overlay during map navigation
   this.overlay.setVisible(false)  // For map views

   // Show overlay for modal selections
   this.overlay.setVisible(true)   // For tier selection, options
   ```

#### Cleanup on Transition

Properly destroy views when transitioning:
```typescript
this.cityZoomView.on('city-selected', (data) => {
  const city = cities?.find(c => c.name === data.city)
  if (city) {
    this.selectedCity = city

    // Clean up all map views before showing next screen
    if (this.cityZoomView) {
      this.cityZoomView.destroy()
      this.cityZoomView = undefined
    }
    if (this.continentZoomView) {
      this.continentZoomView.destroy()
      this.continentZoomView = undefined
    }
    if (this.earthMap) {
      this.earthMap.destroy()
      this.earthMap = undefined
    }

    this.showServiceTierSelection()
  }
})
```

## Common Issues and Fixes

### Navigation Issues
- Right-click should consistently work as "back" navigation across all screens
- Check for `pointer.rightButtonDown()` before processing left-click actions
- Global right-click handler in scenes should handle navigation

### Depth Layering Issues in Overlays
When map components appear behind overlay backgrounds:
1. Set overlay components to high depth (e.g., `DepthRegistry.STOCK_INVENTORY + 100`)
2. Add components directly to scene with `scene.add.existing()` instead of to containers
3. Force child components to same depth: `component.list.forEach(child => child.setDepth(depth))`
4. Position close buttons and text at even higher depths (+150, +200)
5. Store references to scene-level components for proper cleanup

### Viewport-Aware Centering (Critical for Different Screen Sizes)
The game can run at different resolutions (e.g., 1480x800, 2560x1440). Never use hardcoded center values.

**❌ WRONG - Uses hardcoded values that break on different viewports:**
```typescript
const container = scene.add.container(740, 400)  // Hardcoded 1480x800 center
const container = scene.add.container(
  LayoutRegistry.scene.centerX,  // Still hardcoded!
  LayoutRegistry.scene.centerY
)
```

**✅ CORRECT - Uses camera-aware helpers from LayoutRegistry:**
```typescript
import { createCenteredContainer, getScreenCenter, createFullScreenOverlay } from '../registries/layoutRegistry.ts'

// Get actual screen dimensions and center
const center = getScreenCenter(scene)
console.log(center.x, center.y)  // Actual center based on camera

// Create properly centered container
const container = createCenteredContainer(scene, depth)

// Create full-screen overlay
const overlay = createFullScreenOverlay(scene, 0.8, depthValue)
```

**Helper Functions Available:**
- `getScreenCenter(scene)` - Returns `{x, y, width, height}` based on actual camera
- `createCenteredContainer(scene, depth)` - Creates container at actual screen center
- `createFullScreenOverlay(scene, alpha, depth)` - Creates properly sized overlay

**Files Updated to Use Viewport-Aware Centering:**
- `DirectorHiringUtils` - Hiring tier selection
- `WarehouseSelectionOverlay` - Service tier and warehouse options
- `VendorContactSelection` - Arms show vendor selection
- `DirectorHiringDialog` - Personnel hiring dialog

**Important:** When positioning UI elements in selection dialogs:
1. Use `createCenteredContainer()` for the main container
2. Position cards relative to container (e.g., -400, 0, +400 for 3 cards)
3. Use `getScreenCenter()` for any absolute positioning needs

### Testing Best Practices
- Always run `npm test` after making changes to game data files
- Check for bidirectional connections in CityNeighbors
- Verify no cities overlap in CityData (same x,y coordinates)
- Ensure each country has exactly one capital city

## Scrolling Implementation

### Item-Based Scrolling Pattern
The game uses item-based scrolling (not pixel-based) for better performance and smoother UX:

**Key Principles:**
- `scrollIndex` tracks the index of the first visible item (not pixels)
- Only render items in the visible range to improve performance
- Scroll by 1 item at a time for smooth, predictable movement
- Scrollbar position calculated from item index ratio

**Implementation Example (WarehouseSelectionOverlay):**
```typescript
// Setup
let scrollIndex = 0 // Index of first visible item
const maxScrollIndex = Math.max(0, options.length - maxVisibleItems)

// Update display - only render visible items
const startIndex = scrollIndex
const endIndex = Math.min(startIndex + maxVisibleItems, options.length)
for (let i = startIndex; i < endIndex; i++) {
  const displayIndex = i - startIndex // Position relative to visible area
  const yPos = displayIndex * itemHeight
  // ... render item at yPos
}

// Scroll handling
scene.input.on('wheel', (pointer, objects, deltaX, deltaY) => {
  const scrollDirection = deltaY > 0 ? 1 : -1
  scrollIndex = Math.max(0, Math.min(maxScrollIndex, scrollIndex + scrollDirection))
  updateDisplay()
})
```

## Game-Specific Architecture

### Board System (Deadlines in Hell)

#### Core Components
1. **BoardScene** (`/scenes/board/BoardScene.ts`): Main game board presentation
2. **Team Members** (`/model/entities/TeamMember.ts`): Developer, Analyst, Designer, QA roles
3. **Tickets** (`/model/entities/Ticket.ts`): Tasks that move through development stages
4. **Business Logic** (`/model/board/BoardBusinessLogic.ts`): Rules for ticket movement and team assignment

#### Game Mechanics

##### Ticket Types
- **BUGFIX**: Can skip directly to Implementation
- **REFACTORING**: Can skip directly to Implementation
- **FRONTEND**: Must go through Requirements → Design → Implementation
- **BACKEND**: Must go through Requirements → Design → Implementation

##### Board Columns (Stages)
1. **TODO**: Starting point for all tickets
2. **REQUIREMENT_ANALYSIS**: Only Analysts can work here
3. **DESIGN**: Only Designers can work here
4. **IMPLEMENTATION**: Only Developers can work here
5. **CODE_REVIEW**: Only Developers can work here
6. **QA**: Only QA team members can work here
7. **RELEASED**: Final stage

##### Team Assignment Rules
```typescript
// Enforced in BoardBusinessLogic.canAssignToTicket()
- Requirements stage → Analysts only
- Design stage → Designers only
- Implementation/Code Review → Developers only
- QA stage → QA only
```

#### Drag and Drop Implementation
- **Tickets**: Can be dragged between columns based on workflow rules
- **Team Members**: Can be dragged from team pool to tickets based on stage requirements
- Visual feedback: Items become semi-transparent while dragging
- Validation: Invalid drops return items to original position

#### Layout Considerations
- **Game Resolution**: 2560x1440 (defined in `gameContainer.ts`)
- **Board Columns**: 7 columns, each 170px wide
- **Column Heights**: 760px to accommodate ~6 tickets
- **Team Pool**: Located below board at y:860-1260
- **Spacing**: Compact horizontal layout (110-1250 x-coordinates)

#### Color Coding
- **Team Roles**:
  - Developers: Blue (0x3b82f6)
  - Analysts: Red (0xef4444)
  - Designers: Green (0x10b981)
  - QA: Yellow (0xf59e0b)
- **Ticket Types**:
  - Bugfix: Red
  - Refactoring: Green
  - Frontend: Blue
  - Backend: Yellow/Amber

### Important Implementation Notes

1. **Model-View Separation**: Business logic is completely separated from presentation. Scenes should only handle display and user interaction, not game rules.

2. **No Static Classes**: Per Biome linting rules, use plain functions instead of classes with only static members.

3. **Import Extensions**: Always include `.ts` extension for relative imports.

4. **Display Object References**: Models can optionally hold references to their display objects for efficient updates, but this should be treated as a cache, not the source of truth.

5. **Coordinate System**: The game uses absolute positioning. Team member icons and tickets maintain their positions through the `displayObject` reference stored in their model.
