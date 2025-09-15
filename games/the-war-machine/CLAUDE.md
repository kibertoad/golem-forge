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
- **CityData.ts**: Contains city positions for all countries on the game board
  - Each country has 10-25 cities with x,y coordinates
  - Cities marked as capitals have `isCapital: true`
  - Grid coordinates range from 0-19 for both x and y

- **CityNeighbors.ts**: Defines connections between cities within each country
  - Each city lists its neighboring cities for movement/connection purposes
  - Connections must be bidirectional (if A connects to B, B must connect to A)
  - Average 2-3 connections per city
  - **Important**: When fixing duplicates, keep the LATER definitions (usually after line 650+)

- **Country.ts**: Enum of all playable countries
- **ContinentData.ts**: Maps countries to continents and defines continent positions

### Game Mechanics

#### War System Architecture

The war system is designed with the following components:

##### Core Components

1. **WarDirector** (`src/game/model/processors/WarDirector.ts`)
   - Implements `TurnProcessor` interface
   - Manages war progression each turn
   - Coordinates war actions for all countries
   - Registered in DI container for centralized management

2. **CountryModel** (`src/game/model/entities/CountryModel.ts`)
   - Runtime representation of country state
   - Tracks dynamic attributes: military budget, corruption, regime, etc.
   - Manages war status and opponents
   - Calculates military power based on budget, production, and tech

3. **WarSystem** (`src/game/model/WarSystem.ts`)
   - Handles war declarations and combat between countries
   - Expansionist countries automatically declare wars
   - Countries can only attack weaker neighbors (lower military budget)
   - Manages active wars and countries at war

4. **WorldModel** (`src/game/model/entities/WorldModel.ts`)
   - Main game state management
   - Maintains runtime country models (initialized from StartingCountryAttributes)
   - Tracks all countries, cities, wars, and game progression
   - Handles turn processing and victory conditions

##### Data Organization

- **StartingCountryAttributes** (`CountryAttributes.ts`): Initial static data for countries
- **CountryModel**: Runtime state that can change during gameplay
- All scenes now use WorldModel's country data instead of static definitions

##### Turn Processing

The turn processing follows this order:
1. `EndTurnProcessor`: Handles research, directors, and facilities
2. `WarDirector`: Processes war-related actions for all countries
3. WorldModel advances turn counters and dates

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

## Common Issues and Fixes

### Duplicate Country Entries
If you encounter "An object literal cannot have multiple properties with the same name" errors:
1. Search for duplicate country entries in the affected file
2. Keep the SECOND occurrence (usually the one that appears later in the file)
3. Remove the FIRST occurrence
4. The tests expect the later definitions, not the earlier ones

### Testing Best Practices
- Always run `npm test` after making changes to game data files
- Check for bidirectional connections in CityNeighbors
- Verify no cities overlap in CityData (same x,y coordinates)
- Ensure each country has exactly one capital city