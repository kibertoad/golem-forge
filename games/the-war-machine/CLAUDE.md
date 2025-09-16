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
- **`src/game/utils/DirectorHiringUtils.ts`**: Shared hiring logic for both Personnel and Research scenes

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
- Shared hiring logic in `DirectorHiringUtils.ts` prevents code duplication
- Hire button on left, Skip (lose fee) button on right
- No cancel option - player must choose to hire or skip

```typescript
// Shared hiring utility
DirectorHiringUtils.showFeeSelectionDialog(
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

## Common Issues and Fixes

### Duplicate Country Entries
If you encounter "An object literal cannot have multiple properties with the same name" errors:
1. Search for duplicate country entries in the affected file
2. Keep the SECOND occurrence (usually the one that appears later in the file)
3. Remove the FIRST occurrence
4. The tests expect the later definitions, not the earlier ones

### War System State Issues
If war declarations aren't showing in UI:
1. **Check GameInitializer is called** - Must explicitly call `gameInitializer.initializeGame()`
2. Check that WarSystem is registered as singleton in diConfig.ts
3. Verify all components get WarSystem from DI container, not creating new instances
4. Ensure WarDirector's onWarDeclared callback is properly connected
5. Check that WorldModel's country models have their war states updated
6. Ensure war status is set BEFORE spawning units (order matters for targeting)

### Attack Visualization Issues
- Attack visualization only appears when viewing defending countries
- Attacker blocks should appear just outside country grid (800px horizontal, 380px vertical)
- Red lines should connect to actual border city positions using grid coordinates
- Arrow heads should point to each specific targeted city, not float randomly
- Use `getIncomingAttacks()` to only show attacks where country is defender
- City grid is 1480x680 with cities positioned on 10x10 grid (148px x 68px blocks)

### Navigation Issues
- Right-click should consistently work as "back" navigation across all map elements
- Check for `pointer.rightButtonDown()` before processing left-click actions
- Global right-click handler in scenes should handle navigation

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
