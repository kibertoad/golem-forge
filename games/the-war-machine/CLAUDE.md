# The War Machine - Project Guide

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
- **Important**: Always use DI for shared services like `WarSystem` to avoid multiple instances
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

### Important: Singleton Services
When using dependency injection, ensure shared services like `WarSystem` are registered as singletons using `SINGLETON_CONFIG`. Multiple instances will cause state synchronization issues (e.g., war declarations not propagating to UI).

## Development Commands
```bash
npm run dev          # Start development server
npm run build:prod   # Production build
npm run lint         # Run Biome checks and TypeScript type checking
npm run lint:fix     # Auto-fix linting issues
```

## Key Conventions

### File Organization
- `/model`: Game logic, entities, processors
- `/scenes`: Phaser scenes and UI components
- `/content`: Game content (choices, events, etc.)
- `/registries`: Centralized constants and registries

### Naming Patterns
- Models: `*Model.ts` (e.g., `EntityModel`, `WorldModel`)
- Views: `*View.ts` (e.g., `EntityView`)
- Scenes: `*Scene.ts` (e.g., `BoardScene`)
- Processors: `*Processor.ts` (e.g., `EndTurnProcessor`)
- Registries: `*Registry.ts` (lowercase instance)

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

### FilterSortManager

A generic, reusable component for managing filters and sorting in UI views.

**Location**: `src/game/components/FilterSortManager.ts`

**Features**:
- Dynamic filter creation for branches, conditions, grades, and custom filters
- Multi-row layout with each filter category on its own labeled row
- Configurable sort options with custom comparison functions
- Unified UI creation with consistent styling from StyleRegistry
- State management for active filters and sort direction
- Callbacks for filter/sort changes
- Type-safe with generics for sort keys
- Enhanced clear button with red styling and hover effects
- Automatic height calculation for proper layout integration

**Layout**:
- Each filter category (Branches, Conditions, Grades, Custom) appears on its own row
- Category labels positioned at x: -650, filter buttons start at x: -450
- Row height: 35px with 5px spacing between rows
- Clear button on its own row with distinctive red styling
- Sort options appear on the last row

**Usage Example**:
```typescript
import { FilterSortManager, type SortConfig } from '../components/FilterSortManager.ts'

// Define sort configurations
const sortConfigs: SortConfig<MySortKey>[] = [
  {
    key: MySortKey.PRICE,
    label: 'Price',
    compareFunction: (a, b) => a.price - b.price
  },
  // ... more sort options
]

// Create the manager
const filterSortManager = new FilterSortManager(
  scene,
  x,
  y,
  {
    branches: [ArmsBranch.MISSILES, ArmsBranch.SMALL_ARMS],
    conditions: [ArmsCondition.GOOD, ArmsCondition.FAIR],
    grades: [ArmsGrade.OBSOLETE, ArmsGrade.LEGACY],
    custom: [{ key: 'special', label: 'Special Items', value: true }],
    showClearButton: true  // Default is true
  },
  sortConfigs,
  {
    onFiltersChanged: () => this.applyFilters(),
    onSortChanged: () => this.applySort(),
  }
)

// Define filter functions for your data
const filterFunctions = new Map([
  ['branch_filter', (item, branch) => item.definition?.branch === branch],
  ['condition_filter', (item, condition) => item.condition === condition],
  ['grade_filter', (item, grade) => item.definition?.grade === grade],
  ['special_filter', (item, value) => item.isSpecial === value]
])

// Apply filters to a collection
const filtered = filterSortManager.applyFilters(items, filterFunctions)

// Apply sorting
const sorted = filterSortManager.applySort(filtered)

// Get current state
const activeFilters = filterSortManager.getActiveFilters() // Map<string, any>
const currentSort = filterSortManager.getCurrentSort() // { key: SortKey, ascending: boolean }
```

**Currently Used By**:
- `BlackMarketView`: Filters and sorts black market offers
- `StockInventoryView`: Filters and sorts arms inventory with dynamic window sizing

**Integration Notes**:
- The component returns its total height for proper container layout
- Buttons are positioned to avoid text overlap (labels at x: -650, buttons at x: -450)
- Each row consumes 40px of vertical space (35px height + 5px spacing)
- Clear button uses red styling with hover effects for better visibility
- Multi-row layout ensures scalability for many filter options

### StatusBar

A fixed-position component that displays the player's money and current game date, automatically updating when values change.

**Location**: `src/game/components/StatusBar.ts`

**Features**:
- Fixed position at top-right of screen (x: width - 160, y: 80)
- Fixed size of 320x80 pixels with rounded border
- Displays money with 💰 icon and automatic formatting (e.g., $1.5M)
- Displays date with 📅 icon showing month, week, and year
- Automatically updates via WorldModel event listeners
- Money changes trigger color flash (green for gains, red for losses) with scale animation
- Clean, consistent appearance across all scenes

**Usage**:
```typescript
import { StatusBar } from '../../components/StatusBar.ts'

// In any scene's create() method
const statusBar = new StatusBar(this, this.worldModel)
statusBar.setDepth(DepthRegistry.UI_TEXT) // Adjust depth as needed
```

**No Configuration Required**:
The StatusBar has a fixed optimal design and doesn't accept any configuration parameters. Simply pass the scene and world model.

**Currently Used In**:
- `BoardScene`: Main game board (depth: 950)
- `AssetsScene`: Asset management screen (depth: UI_TEXT)
- `ContactsScene`: Contacts management screen (depth: UI_TEXT)
- `PersonnelScene`: Personnel management screen (depth: UI_TEXT)
- `ResearchScene`: Research & Development screen (depth: RESEARCH_DIALOG + 100)

**Event Integration**:
The StatusBar automatically listens to WorldModel events:
- `money-changed`: Updates money display with animation
- `date-changed`: Updates date display

**Visual Design**:
- Background: Semi-transparent dark panel (Colors.background.secondary)
- Border: 2px light blue rounded rectangle
- Money text: Large font (h4), golden color with shadow
- Date text: Regular font, secondary color with shadow
- Separator line between money and date for clarity

### StockListDisplay

A reusable component for displaying lists of arms stock items with consistent styling and behavior.

**Location**: `src/game/components/StockListDisplay.ts`

**Base Interface**:
```typescript
interface StockListItem {
  quantity: number
  condition: ArmsCondition
  getName?: () => string
  getDefinition?: () => ArmsDefinition | undefined
  getCurrentMarketValue?: () => number
  getPotentialProfit?: () => number
  [key: string]: any // Allow additional properties
}
```

Any data type that extends `StockListItem` can be displayed by this component.

**Features**:
- Configurable columns (quantity, condition, value, profit/loss)
- Custom action buttons with hover effects
- Built-in scrolling with scrollbar visualization
- Item hover and click callbacks
- Consistent styling from StyleRegistry
- Support for custom columns and data
- Automatic scrollbar management
- Configurable item dimensions and spacing

**Configuration Options**:
```typescript
interface StockListConfig {
  width?: number         // Item width (default: 1140)
  height?: number        // Item height (default: 70)
  spacing?: number       // Space between items (default: 5)
  showQuantity?: boolean // Show quantity column (default: true)
  showCondition?: boolean // Show condition column (default: true)
  showValue?: boolean    // Show value column (default: true)
  showProfit?: boolean   // Show profit/loss column (default: true)
  showActions?: boolean  // Show action buttons (default: true)
  actions?: StockItemAction[] // Custom action buttons
  columns?: ColumnConfig[]    // Additional custom columns
}
```

**Usage Example**:
```typescript
import { StockListDisplay } from '../components/StockListDisplay.ts'

// Create the stock list display
const stockList = new StockListDisplay(
  scene,
  x,
  y,
  {
    width: 1140,
    height: 70,
    showQuantity: true,
    showCondition: true,
    showValue: true,
    showProfit: true,
    actions: [
      {
        label: 'SELL',
        onClick: (item) => this.sellItem(item),
        color: Colors.inventory.sellButton,
        hoverColor: Colors.inventory.sellButtonHover,
      },
      {
        label: 'INFO',
        onClick: (item) => this.showItemDetails(item),
      }
    ],
    // Add custom columns
    columns: [
      {
        key: 'location',
        label: 'Location',
        x: 900,
        getValue: (item) => item.location || 'Unknown',
        getColor: (item) => Colors.text.muted,
      }
    ]
  },
  {
    onItemClick: (item) => console.log('Clicked:', item),
    onItemHover: (item) => console.log('Hovering:', item),
  }
)

// Set items to display
stockList.setItems(items, maxVisibleItems)

// Handle scrolling
scene.input.on('wheel', (pointer, objects, deltaX, deltaY) => {
  stockList.scroll(deltaY > 0 ? 1 : -1)
})

// Listen to events
stockList.on('item-sell', (item) => handleSell(item))
stockList.on('item-info', (item) => showDetails(item))
```

**Currently Used By**:
- `StockInventoryView`: Displays arms inventory with filtering and sorting
- `BlackMarketView`: Shows black market offers with custom columns for location and price

**Benefits**:
- Eliminates duplicate item rendering code
- Consistent appearance across all stock lists
- Easily customizable for different contexts
- Built-in scrolling and event handling
- Reduces code by ~200 lines per implementation

### StockListView & StockOverlay

Legacy components for displaying stock in modal overlays. Located in `src/game/scenes/components/`.

**StockListView**: A simpler list view without filtering/sorting capabilities
- Uses rectangles instead of graphics for backgrounds
- 50px item height with single-line layout
- All text on one line (name, quantity, condition, value)
- Simpler but less flexible than StockListDisplay

**StockOverlay**: Modal wrapper that displays StockListView with overlay background

**Currently Used By**:
- `WarehouseView`: Shows warehouse stock in a modal overlay

**Key Differences from StockListDisplay**:
- **StockListView**: Simple, fixed layout, better for uniform content
- **StockListDisplay**: Complex, flexible, supports variable heights and custom columns

**When to Use Which**:
- Use `StockListView` for simple modal displays with uniform items
- Use `StockListDisplay` for complex lists with filtering, sorting, and custom layouts

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
// ContactsScene example for black market
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
// In BoardScene when showing stock inventory
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

## Utility Functions

### Money Formatting
- **Location**: `src/game/utils/FormatUtils.ts`
- **Functions**:
  - `formatMoney(amount, includeDecimals?)`: Formats currency with $ prefix
  - `formatNumber(num, includeDecimals?)`: Formats numbers without currency
- **Compression**:
  - Numbers < 1,000: Full display (e.g., $750)
  - Thousands: K suffix (e.g., $1.5K for $1,500)
  - Millions: M suffix (e.g., $2.3M for $2,300,000)
  - Billions: B suffix (e.g., $4.7B for $4,700,000,000)
- **Usage**: Always use formatMoney for displaying currency values in UI
- **Examples**:
  ```typescript
  formatMoney(1500)     // "$1.5K"
  formatMoney(1500000)  // "$1.5M"
  formatMoney(1500, false) // "$2K" (no decimals)
  ```

## Contacts System

The Contacts system provides access to various suppliers and connections for acquiring arms.

### ContactsScene
**Location**: `src/game/scenes/contacts/ContactsScene.ts`

A dedicated scene for managing all player contacts, accessible from BoardScene via the Contacts button in the navigation bar.

**Tabs**:
1. **Black Market**: Immediate purchase of lower-grade equipment
2. **Vendors**: Legitimate suppliers unlocked through Arms Shows
3. **Insurgents**: (Coming Soon)
4. **State Actors**: (Coming Soon)
5. **Mercenaries**: (Coming Soon)
6. **Brokers**: (Coming Soon)

### Black Market
**Location**: `src/game/scenes/contacts/tabs/BlackMarketView.ts`

**Features**:
- 10 random offers generated at game start
- Offers refresh monthly
- Equipment limited to Obsolete, Legacy, or Modern grades
- Condition varies by grade:
  - Obsolete: Mostly salvage to fair
  - Legacy: Poor to good
  - Modern: Only fair or below
- Each offer includes: quantity, condition, price, location (country/city)
- Purchase requires selecting a warehouse with sufficient space
- Uses FilterSortManager for filtering and sorting

### Vendor Contacts
**Location**: `src/game/scenes/contacts/tabs/VendorsView.ts`

**Features**:
- Shows vendors unlocked through successful Arms Show attendance
- Vendors categorized by quality tier: Basic, Standard, Premium
- Each vendor specializes in specific equipment types and grade ranges
- Starting vendor contact added randomly for testing
- Future: Direct purchasing from vendor catalogs

### Arms Grade System

**Location**: `src/game/model/enums/ArmsStockEnums.ts`

Equipment is categorized into technology generations:

```typescript
export enum ArmsGrade {
  OBSOLETE = 'obsolete',    // Old, outdated equipment
  LEGACY = 'legacy',        // Previous generation, still functional
  MODERN = 'modern',        // Current standard military equipment
  NEXTGEN = 'nextgen',      // Advanced, cutting-edge technology
  EXPERIMENTAL = 'experimental' // Prototype/experimental systems
}
```

**Grade Distribution**:
- **Obsolete**: Budget manufacturers (Backyard Defense, Budget Ballistics)
- **Legacy**: Regional manufacturers (Desert Forge, Frontier Arms)
- **Modern**: Major defense contractors (IronForge, Precision Arms)
- **Nextgen**: Advanced systems (Autonomous Systems, Maritime Defense)
- **Experimental**: Future research projects

**Impact on Availability**:
- Black Market: Only Obsolete, Legacy, and Modern (poor condition)
- Vendor Contacts: Access based on vendor tier
- Arms Shows: Full range based on manufacturer

## Important Game Data Files

### City and Country Data
- **Cities.ts** (`src/game/model/enums/Cities.ts`): Contains city positions for all countries on the game board
  - Each country has 10-25 cities with x,y coordinates
  - Cities marked as capitals have `isCapital: true`
  - Grid coordinates range from 0-9 for both x and y
  - Used by CityZoomView to calculate actual positions on 1480x680 grid

- **CityNeighbors.ts**: Defines connections between cities within each country
  - Each city lists its neighboring cities for movement/connection purposes
  - Connections must be bidirectional (if A connects to B, B must connect to A)
  - Average 2-3 connections per city
  - **Important**: When fixing duplicates, keep the LATER definitions

- **Country.ts**: Enum of all playable countries
- **ContinentData.ts**: Maps countries to continents and defines continent positions

- **CountryNeighborDirections.ts**: Maps each country's neighbors to cardinal directions
  - Used for attack visualization positioning
  - Determines which side of the country frame to place attacker blocks

- **CountryBorderCities.ts**: Defines which cities are on borders with neighboring countries
  - Each border city includes: cityId, cityName, and direction
  - Used for attack line targeting in visualizations
  - Only border cities should be included, not inland cities like capitals

### Game Mechanics

#### War System Architecture

The war system is designed with the following components:

##### Core Components

1. **GameInitializer** (`src/game/model/GameInitializer.ts`)
   - **Critical for game startup** - must be called explicitly when game begins
   - Centralizes all initialization logic that should run once at game start
   - Call `initializeGame()` method explicitly (not in constructor)
   - Sets up war system, initializes starting wars, prepares AI (future)
   - Prevents duplicate initialization with internal flag
   - **Important**: Without calling GameInitializer, no wars will start

2. **WarDirector** (`src/game/model/processors/WarDirector.ts`)
   - Implements `TurnProcessor` interface
   - Manages war progression each turn
   - Coordinates unit spawning when wars erupt
   - Processes unit turns and combat
   - Registered in DI container for centralized management
   - **setupWarSystem()** must be called by GameInitializer (not in constructor)

3. **CountryModel** (`src/game/model/entities/CountryModel.ts`)
   - Runtime representation of country state
   - Tracks dynamic attributes: military budget, corruption, regime, etc.
   - Manages war status and opponents
   - Maintains lists of Regular and Assault units
   - Calculates military power based on strength, budget, production, and tech

4. **WarSystem** (`src/game/model/WarSystem.ts`)
   - **MUST be registered as singleton in DI container**
   - Handles war declarations between countries
   - Expansionist countries automatically declare wars
   - Countries can only attack weaker neighbors (lower military budget)
   - Manages active wars and countries at war
   - Provides `onWarDeclared` callback for UI notifications
   - Tracks aggressor vs defender in War interface
   - Currently only supports one-way attacks (aggressor → defender)

5. **WorldModel** (`src/game/model/entities/WorldModel.ts`)
   - Main game state management
   - Maintains runtime country models (initialized from StartingCountryAttributes)
   - Tracks all countries, cities, wars, and game progression
   - Handles turn processing and victory conditions

##### Military Units

###### Unit Types

1. **RegularUnit** (`src/game/model/entities/units/RegularUnit.ts`)
   - Garrison units that defend cities
   - Slowly recover strength when not in combat
   - Lower supply consumption (1 per turn)
   - Get significant defense bonuses when defending home cities
   - Improve organization and training over time

2. **AssaultUnit** (`src/game/model/entities/units/AssaultUnit.ts`)
   - Offensive units deployed to war fronts
   - Get the best military equipment available
   - Higher supply consumption (3 per turn)
   - Track morale and momentum for combat effectiveness
   - Get attack bonuses and can build momentum from victories

###### Unit Attributes

All units have three core attributes:
- **Supplies** (0-100): Food, ammo, medicine - affects combat effectiveness
- **Organization** (0-100): Command quality and discipline
- **Training** (0-100): Training level that improves over time

Assault units additionally have:
- **Morale** (0-100): Affects combat performance
- **Momentum** (0-100): Bonus from consecutive victories

###### Unit Spawning

Units are spawned when a country enters war:
- **Spawn Counts**: Based on military strength (2 regular units and 1 assault unit per strength point)
- **Initial Strength**:
  - Regular: 50-100 based on industrial production
  - Assault: 70-100 based on industrial production
- **Equipment Quality**: Based on industrial tech level (assault units get +1 priority)
- **Attribute Adjustments**:
  - Supplies affected by corruption (less corrupt = better supplies)
  - Organization based on standards
  - Training based on military budget
  - Morale (assault only) based on standards
- **Important**: War status must be set BEFORE spawning units to ensure proper targeting
- **Assault Unit Organization**: Uses `Map<Country, AssaultUnit[]>` for robust targeting instead of string IDs

##### Military Branches

Countries now have capabilities across five branches:
- **Army**: Ground forces
- **Navy**: Naval forces
- **Airforce**: Air forces
- **Special Forces**: Elite units
- **Drones**: Unmanned systems

Each branch is rated 1-5 in:
- **Military Strength**: Base military capability
- **Industrial Production**: Ability to produce equipment
- **Industrial Tech**: Technology level of equipment

##### Data Organization

- **StartingCountryAttributes** (`CountryAttributes.ts`): Initial static data for countries including military strength
- **BranchCapabilities**: Ratings for each military branch
- **CountryModel**: Runtime state that can change during gameplay
- All scenes now use WorldModel's country data instead of static definitions

##### Geographic Data

###### Country Neighbor Directions (`CountryNeighborDirections.ts`)
Maps each country's neighbors to cardinal directions (North, South, East, West) for:
- Attack visualization positioning
- Strategic planning
- Border relationships

###### Border Cities (`CountryBorderCities.ts`)
Defines which cities are on borders with neighboring countries:
- Used for attack targeting
- Defense planning
- Visual representation of conflicts

###### Attack Visualization

###### City-Level Attack Visualization
- **AttackVisualization** component displays incoming attacks only when viewing cities
- Shows red attacker blocks positioned just outside country grid borders
- Draws dashed red lines from attacker blocks to specific border cities
- Arrow heads point to each targeted border city
- **Only shows when viewing defending country** - no visualization when viewing attacker
- Uses actual city grid positions for accurate targeting
- Block positioning based on cardinal direction (800px horizontal, 380px vertical offset)

###### Continental War Visualization
- **ContinentWarVisualization** component shows wars at continental scale
- Displays red dashed lines between warring countries within the same continent
- Directional arrows indicate attacker → defender relationships
- Animated crossed swords (⚔️) at midpoint of attack lines
- Only shows attacks where countries are in the same continent
- Integrated into ContinentZoomView for geopolitical overview

###### War State Management
- Countries now track war relationships with Sets instead of arrays:
  - `warsWith`: Set of all countries at war with
  - `isAttacking`: Set of countries being attacked by this country
  - `isDefending`: Set of countries attacking this country
- `declareWarOn(country, asAggressor)` method sets appropriate flags
- Simplified logic for determining when to show attack visualizations
- Attack visualizations only render when `isDefending.size > 0`

##### Game Initialization Flow

**Critical**: The game requires explicit initialization to start wars and set up systems:

1. **On Game Start** (typically in BoardScene or main game scene):
   ```typescript
   // Get GameInitializer from DI container
   const gameInitializer = container.resolve('gameInitializer')
   gameInitializer.initializeGame() // MUST be called explicitly
   ```

2. **What GameInitializer Does**:
   - Calls `warDirector.setupWarSystem()` to register war callbacks
   - Triggers `warSystem.initializeWars()` to start initial conflicts
   - Sets up AI directors (future)
   - Initializes economic conditions (future)
   - Prevents duplicate initialization with internal flag

3. **Without GameInitializer**:
   - No wars will be declared
   - No units will spawn
   - War visualization won't appear
   - Game will run but be in peaceful state

##### Turn Processing

The turn processing follows this order:
1. `EndTurnProcessor`: Handles research, directors, and facilities
2. `WarDirector`:
   - Processes all units' turns (supplies, recovery, training)
   - Handles combat between units (TODO)
   - Processes city sieges (TODO)
   - Checks for war endings (TODO)
3. WorldModel advances turn counters and dates

##### Balance Calculations

**Military Power Formula**:
```
Power = Budget * 2 + AvgStrength * 1.5 + AvgProduction + AvgTech * 0.5
```

**Combat Effectiveness Formula**:
```
Effectiveness = Strength% * 0.3 + Equipment * 0.25 + Supplies% * 0.15 + Organization% * 0.15 + Training% * 0.15
```

**Defense Bonus (Regular Units)**:
```
Bonus = 1.5 * (1 + Training% * 0.3) * (1 + Organization% * 0.2)
```

**Attack Bonus (Assault Units)**:
```
Bonus = 1.3 * (1 + Morale% * 0.4) * (1 + Momentum% * 0.3) * (1 + Training% * 0.2)
```

## Research & Development System

### Overview
The Research & Development system allows players to:
- Build and manage research facilities of different types
- Hire research directors through agencies to manage facilities
- Research projects with complexity and unpredictability ratings
- Progress tracking with estimates instead of exact times
- Upgrade laboratory tech levels to unlock advanced projects
- Choose from 150+ research projects across 8 categories

### Key Files

#### Models
- **`src/game/model/entities/ResearchDirectorModel.ts`**: Director management with stats and traits
- **`src/game/model/entities/ResearchFacilityModel.ts`**: Facility and project management with tech levels
- **`src/game/model/enums/ResearchDirectorEnums.ts`**: Director traits and facility types
- **`src/game/model/enums/ResearchEnums.ts`**: Research fields and project interface
- **`src/game/model/data/ResearchProjects.ts`**: Complete list of 150+ research projects

#### Scenes & UI
- **`src/game/scenes/research/ResearchScene.ts`**: Main research management interface
- **`src/game/scenes/research/ResearchProjectDialog.ts`**: Project selection with tech level filtering
- **`src/game/scenes/personnel/PersonnelScene.ts`**: Director hiring and management
- **`src/game/scenes/personnel/DirectorHiringDialog.ts`**: Agency hiring interface with larger fonts
- **`src/game/scenes/board/molecules/ui/GenericPersonSelector.ts`**: Reusable person selection UI with hiring integration
- **`src/game/utils/DirectorHiringUtils.ts`**: Shared hiring function for both Personnel and Research scenes

#### Processing
- **`src/game/model/processors/EndTurnProcessor.ts`**: Turn-based research progress, trait reveals, and lab upgrades

### Research Directors

#### Director Stats (1-5 Star System)
- **Talent** (★★★★★): Affects research speed (each star above 3 = 20% faster)
- **Morality** (★★★★★): Determines which projects they'll accept (lower = fewer restrictions)
- **Expertise** (★★★★★): Maximum project complexity they can handle effectively (must match or exceed project complexity)
- **Management** (★★★★★): Affects project costs (each star above complexity = 20% cheaper, each below = 30% more expensive)

#### Director Traits
Traits modify research outcomes:
- **Stingy**: 15% longer, 30% cheaper
- **Disciplined**: Reduces unpredictability effects by 50%
- **Strong Planner**: Shows time estimates (min/max months)
- **Innovative**: 20% chance of breakthrough each month (double progress)
- **Methodical**: Very steady progress with low variance
- **Risk Taker**: Can skip prerequisites, but 30% chance of setbacks
- **Perfectionist**: 25% longer but 30% better results
- **Networked**: 15% discount on launch costs
- **Ambitious**: Can manage 2 projects at 70% efficiency each
- **Frugal**: 25% reduction in monthly costs

### Hiring System

#### Two-Tier Agency System
1. **Standard Agency ($50,000)**
   - Director stats visible (5-star ratings)
   - Traits hidden for 3 months (12 turns)
   - 3 candidates to choose from
   - Larger fonts for better readability

2. **Premium Agency ($150,000)**
   - All stats and traits visible immediately
   - 3 candidates to choose from
   - Traits shown with green badges

#### Hiring Process
- Available from Personnel scene via "Hire New Director" button
- Also available in Research scene when assigning directors to facilities
- Shared hiring function `showDirectorHiringDialog` prevents code duplication
- Hire button on left, Skip (lose fee) button on right
- No cancel option - player must choose to hire or skip

```typescript
// Shared hiring function
showDirectorHiringDialog(
  scene,
  worldModel,
  (directorName) => {
    // Callback after hiring or skipping
  }
)

// Directors start with hiredTurn set for trait tracking
director.hiredTurn = this.worldModel.gameStatus.turn
```

### Research Facilities

#### Facility Types
- **Weapons Lab**: Small arms, explosives, ammunition, tanks, artillery
- **Aerospace Center**: Aircraft, missiles, drones, space systems
- **Electronics Lab**: Guidance systems, communications, cyber, AI, quantum computing
- **Naval Yard**: Ships, submarines, naval weapons, carriers
- **Chemical Plant**: Chemical weapons, advanced materials, composites
- **Nuclear Facility**: Nuclear weapons, fusion power, particle physics
- **Biotech Lab**: Biological research, genetic engineering, super soldiers

#### Facility Management
- Each facility requires a director to function
- Facilities can be retooled to different types (6 month process)
- Monthly upkeep costs (default $75,000)
- Initial facility: Random type in Sudan at tech level 1

#### Laboratory Tech Levels (1-10)
- All facilities start at tech level 1
- Higher tech levels unlock more advanced projects
- Upgrades handled through dedicated upgrade dialog (not research projects)
- Non-incremental pricing - cost depends only on target level, not current level
- Upgrade costs and times:
  - Level 2: $200K upfront, 3 months, $20K/month maintenance
  - Level 3: $500K upfront, 4 months, $30K/month maintenance
  - Level 4: $1M upfront, 5 months, $50K/month maintenance
  - Level 5: $2M upfront, 6 months, $75K/month maintenance
  - Level 6: $4M upfront, 7 months, $100K/month maintenance
  - Level 7: $8M upfront, 8 months, $150K/month maintenance
  - Level 8: $15M upfront, 9 months, $200K/month maintenance
  - Level 9: $30M upfront, 10 months, $300K/month maintenance
  - Level 10: $60M upfront, 12 months, $500K/month maintenance
- Laboratory cannot be used while upgrading
- No director required for upgrades
- Access via "Upgrade Laboratory" button in Research scene

### Research Projects

#### Project Properties
- **Tech Level** (1-10): Required laboratory tech level to start project
- **Complexity** (1-5): Determines difficulty and director expertise required
- **Unpredictability** (1-5): Affects progress variance
- **Base Cost**: Launch cost for the project (paid upfront)
- **Monthly Cost**: Ongoing research costs (base cost / 10)
- **Prerequisites**: Some projects require others to be completed first
- **Category**: Strategic purpose of the research

#### Project Categories
- **Applied Innovation**: Practical applications of existing technology to create new weapons/systems
- **Manufacturing Enablement**: Ability to produce equipment domestically (tanks, missiles, etc.)
- **Technological Enablement**: Core technologies that unlock other research paths
- **Strategic Capability**: Game-changing weapons (WMDs, ICBMs, etc.) that alter global balance
- **Force Multiplier**: Technologies that dramatically increase effectiveness of existing forces
- **Fundamental Research**: Basic science that may lead to revolutionary breakthroughs
- **Infrastructure**: Support systems and facilities (comms networks, launch systems, etc.)
- **Defensive Systems**: Technologies focused on protection and countermeasures

#### Project Selection
- 150+ research projects available across all facility types
- Projects filtered by facility type, tech level, and prerequisites
- Both launch cost and monthly cost displayed
- Category and field shown for each project
- Warning indicators for projects too complex or expensive

#### Progress System
```typescript
// Progress calculation in ResearchFacilityModel.ts
const baseProgress = 100 / baseMonths // Base monthly progress
const variance = (Math.random() - 0.5) * unpredictability * 10
const directorSpeed = director.calculateProjectSpeed()
const monthProgress = (baseProgress + variance) * directorSpeed
```

#### Progress Estimates
Instead of exact completion times, players see:
- "Early stages" (0-25%)
- "Making progress" (25-50%)
- "Well underway" (50-75%)
- "Nearly complete" (75-95%)
- "Final stages" (95%+)

Directors with **Strong Planner** trait show time estimates (e.g., "3-5 months")

### Turn Processing

#### Weekly Updates (4 weeks = 1 month)
1. Research facilities advance progress
2. Director traits check for reveal (if hired with Standard fee)
3. Costs are deducted (weekly = monthly / 4)

#### Trait Reveal System
```typescript
// In EndTurnProcessor.ts
if (currentTurn - director.hiredTurn >= 12) {
  director.traitsRevealed = true
}
```

### Cost Calculations

#### Director Impact on Costs
```typescript
// Management skill vs project complexity (5-star scale)
if (management > complexity) {
  // 20% cost reduction per star above complexity
  costModifier = 1 - ((management - complexity) * 0.2)
} else if (management < complexity) {
  // 30% cost increase per star below complexity
  costModifier = 1 + ((complexity - management) * 0.3)
}
```

### Starting State
- **0 Directors**: Players must hire through agencies
- **1 Research Facility**: Random type in Sudan at tech level 1
- **No Active Projects**: Players must assign directors and select projects

### Usage Flow
1. Navigate to **Personnel** to hire directors (or hire from Research scene)
2. Navigate to **Research** to manage facilities
3. Assign directors to facilities (required for research, not for upgrades)
4. Upgrade laboratory tech levels:
   - Click "Upgrade Laboratory" button (no director required)
   - Select target level from upgrade dialog
   - Pay upfront cost immediately
   - Pay monthly maintenance during upgrade period
   - Laboratory unavailable during upgrade
5. Start research projects:
   - Click "Start New Project" (requires director)
   - Select from projects matching facility type and tech level
   - Pay launch cost upfront, monthly costs during research
6. Monitor progress through turn advancement
7. Complete projects unlock new capabilities and prerequisites

### Key Manufacturing Projects (Examples)
- **Small Arms Production** (Tech 1): Enables domestic rifle/pistol manufacturing
- **Drone Assembly** (Tech 2): UAV production capability
- **Tank Production** (Tech 4): Main battle tank manufacturing
- **Fighter Jet Production** (Tech 5): Combat aircraft manufacturing
- **Nuclear Submarine** (Tech 7): Nuclear-powered submarine construction
- **Aircraft Carrier** (Tech 8): Nuclear carrier construction capability

### Advanced Technologies (Examples)
- **Railgun** (Tech 7): Electromagnetic projectile weapons
- **Quantum Computing** (Tech 7): Military quantum processors
- **Fusion Power** (Tech 8): Controlled fusion reactors
- **Plasma Weapons** (Tech 9): High-temperature plasma weapons
- **Anti-Gravity** (Tech 10): Theoretical gravity manipulation
- **Antimatter Weapon** (Tech 10): Ultimate strategic weapon

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

**Special Colors**
- Heat levels: `getHeatColor(heat)` helper function
  - Low (0-3): Green
  - Medium (4-7): Orange
  - High (8-10): Red

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
- Cards: `warehouse` (1300x120), `location` (1300x80), `stock` (1100x50)
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

## Shared Map Components

### Reusable Map Components for Selection

The game's map components (EarthMap, ContinentZoomView, CityZoomView) can be reused for location selection in overlays.

#### Making Map Components Reusable

1. **Optional WarSystem Parameter**
   - Map components accept optional `warSystem` parameter
   - Pass `undefined` when war visualization isn't needed (e.g., warehouse selection)
   - Never create new WarSystem instances - always get from DI container

2. **Selection Mode for ContinentZoomView**
   ```typescript
   // Normal mode - creates its own CityZoomView
   new ContinentZoomView(scene, x, y, continent, worldModel, warSystem)

   // Selection mode - emits 'country-selected' event instead
   new ContinentZoomView(scene, x, y, continent, worldModel, warSystem, true)
   ```

3. **Event-Driven Navigation**
   - EarthMap emits 'region-selected' → show continent
   - ContinentZoomView emits 'country-selected' → show cities
   - CityZoomView emits 'city-selected' → process selection

#### Example: Warehouse Location Selection

```typescript
export class WarehouseSelectionOverlay extends GameObjects.Container {
  private showMapSelection() {
    // Hide overlay background during map navigation
    this.overlay.setVisible(false)

    // Create EarthMap without war features
    this.earthMap = new EarthMap(
      this.scene,
      LayoutRegistry.scene.centerX,
      LayoutRegistry.scene.centerY + 100,
      this.worldModel,
      this.warSystem,  // Pass from DI, don't create new
      undefined,        // No toast container needed
    )

    // Set high depth to appear above other elements
    this.earthMap.setDepth(DepthRegistry.STOCK_INVENTORY + 100)

    // Listen for continent selection
    this.earthMap.on('region-selected', (region) => {
      this.showContinentZoom(region)
    })
  }

  private showContinentZoom(continent: EarthRegion) {
    // Hide previous view
    if (this.earthMap) {
      this.earthMap.setVisible(false)
    }

    // Create continent view in selection mode
    this.continentZoomView = new ContinentZoomView(
      this.scene,
      width / 2,
      height / 2 + 100,
      continent,
      this.worldModel,
      this.warSystem,
      true,  // Selection mode - emits events instead of showing city view
    )

    // Listen for country selection
    this.continentZoomView.on('country-selected', (country) => {
      this.showCityZoom(country)
    })
  }
}
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

### Duplicate Country Entries
If you encounter "An object literal cannot have multiple properties with the same name" errors:
1. Search for duplicate country entries in the affected file
2. Keep the SECOND occurrence (usually the one that appears later in the file)
3. Remove the FIRST occurrence
4. The tests expect the later definitions, not the earlier ones

### Attack Visualization Issues
- Attack visualization only appears when viewing defending countries
- Attacker blocks should appear just outside country grid (800px horizontal, 380px vertical)
- Red lines should connect to actual border city positions using grid coordinates
- Arrow heads should point to each specific targeted city, not float randomly
- Use `getIncomingAttacks()` to only show attacks where country is defender
- City grid is 1480x680 with cities positioned on 10x10 grid (148px x 68px blocks)

### Navigation Issues
- Right-click should consistently work as "back" navigation across all screens
- Check for `pointer.rightButtonDown()` before processing left-click actions
- Global right-click handler in scenes should handle navigation

### Navigation Bar
Located in `src/game/scenes/board/molecules/navigation/NavigationBar.ts`

**Button Order** (top to bottom):
1. Stock 📦
2. Research 🔬
3. Production 🏭
4. Personnel 👥 (moved between Production and Contacts)
5. Contacts 📞
6. Bazaar 🛒
7. Assets 💼

To reorder buttons, modify the `navItems` array in the constructor.

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

### Border Cities Testing
- **Test File**: `src/game/model/enums/CountryBorderCities.test.ts`
- **Constants File**: `src/game/model/constants/MapPositionConstants.ts`
- Tests validate that border cities are correctly positioned:
  - Cities marked as NORTH borders should have low Y values (toward 0)
  - Cities marked as SOUTH borders should have high Y values (toward 9)
  - Cities marked as EAST borders should have high X values (toward 9)
  - Cities marked as WEST borders should have low X values (toward 0)
- Tests check for line-of-sight obstruction:
  - If a city blocks the attack line to a declared border city, it should be the border city instead
  - Uses perpendicular distance calculation with 30px tolerance
- Corner cities can legitimately be border cities for multiple directions
- Capital cities generally shouldn't be border cities unless geographically necessary

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

**Components Using Item-Based Scrolling:**
- `StockListDisplay` - Generic scrollable stock list component
- `WarehouseSelectionOverlay` - Warehouse options (3 visible items)
- `BlackMarketView` - Black market offers
- `StockInventoryView` - Arms inventory display

### Optimal Visible Item Counts
- **Warehouse Selection:** 5 items visible - Balance between overview and scrolling
- **Stock Lists:** 8-10 items visible - Balance information density
- **Filter Lists:** 5-8 items visible - Quick scanning

## Warehouse System

### Service Tier Selection
The warehouse selection process begins with choosing a service tier that determines the number of warehouse options available:

- **Basic Service ($10,000):** 3 warehouse options
- **Advanced Service ($25,000):** 6 warehouse options
- **Premium Service ($50,000):** 10 warehouse options

**Key Features:**
- Service fees are deducted from player funds immediately upon selection
- Tiers are automatically disabled if player has insufficient funds
- Disabled tiers show grayed-out styling with "Insufficient Funds" message
- Player's current funds are displayed at the top of the selection screen

**Implementation Details:**
```typescript
// Check affordability
const canAfford = playerMoney >= tier.cost

// Visual feedback for disabled options
borderColor: canAfford ? tier.color : Colors.military.neutral
backgroundAlpha: canAfford ? 1.0 : 0.5

// Deduct money on selection
if (this.worldModel.deductMoney(tier.cost)) {
  this.selectedServiceTier = tier.type
  this.showWarehouseOptions()
}
```
