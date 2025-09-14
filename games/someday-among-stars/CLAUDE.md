# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run lint` - Run Biome linter and TypeScript compiler check
- `npm run lint:fix` - Auto-fix linting issues with Biome

## Architecture Overview

This is a Phaser 4-based space adventure game built with TypeScript and Vite. The project uses a dependency injection pattern with Awilix container for managing scene dependencies.

### Core Architecture

- **Entry Point**: `src/main.ts` bootstraps the application, `src/game/gameContainer.ts` configures Phaser
- **DI Container**: `src/game/diConfig.ts` manages all scene and service dependencies using Awilix
- **World State**: `src/game/model/entities/WorldModel.ts` contains global game state including entities, planets, races, and scene event emitter
- **Scene Management**: Phaser scenes are instantiated through DI container and registered in `gameContainer.ts`

### Game Structure

**Scenes** (all managed as singletons via DI):
- `MainMenuScene` - Game entry point
- `SpaceScene` - Space exploration gameplay
- `ChoiceScene` - Player decision points
- `StarmapScene` - Galaxy navigation interface with fog of war
- `StarmapUIScene` - UI overlay for starmap (handles tooltips, overlays)
- `SpaceCombatScene` - Combat encounters
- `SystemVisitScene` - Planet/system interaction menu
- `StarportTradeScene` - Trading interface for buying/selling goods

**Model Layer**:
- `entities/` - Game entity models (ComponentModel, EntityModel, PlanetModel, etc.)
- `entities/WorldModel.ts` - Central game state with player ship, planets, discovered areas
- `entities/ShipModel.ts` - Ship data including cargo, weapons, concealed compartments
- `generators/` - Procedural content generation (PlanetGenerator)
- `processors/` - Game logic processors (TravelTurnProcessor)
- `slot_sides/` - Dice/component slot mechanics

**Content System**:
- `content/choices/` - Decision tree logic and planet/space encounters
- `content/encounters/` - Specific encounter definitions

### Key Dependencies

- **Phaser 4.0.0-rc.4** - Game engine
- **@potato-golem/*** packages - Custom game framework extensions
- **Awilix** - Dependency injection container
- **Emitix** - Event emitter system
- **Biome** - Linting and formatting
- **Vite** - Build tool and development server

### File Organization

- `src/game/registries/` - Centralized registry systems for images, music, entities, etc.
- `public/assets/` - Static assets (images, sprites, audio)
- `docs/` - Game design documentation (concept, factions, narrative blocks)
- `vite/` - Separate dev/prod Vite configurations

### State Management

The game uses a centralized WorldModel that holds:
- Global scene event emitter for cross-scene communication
- Entity collections with add/remove methods
- Game state flags and main state tracking
- Races and planets data
- Player ship with cargo and concealed compartments
- Discovered areas for fog of war system

All scenes receive dependencies via constructor injection, enabling clean separation of concerns and testable components.

## Game Systems

### Trading System
The trading system (`StarportTradeScene`) implements:
- **Cargo Management**: Public and concealed cargo compartments with different scanner resistances
- **Dynamic Economy**: Prices vary by system type (agricultural, industrial, mining, scientific)
- **Profit Tracking**: Items track purchase price to show profit/loss margins
- **Illegal Goods**: Higher profit but risk of confiscation
- **UI Features**:
  - Filter system for goods (all/legal/illegal/specialty/demand)
  - Visual cargo slots with click-to-sell functionality
  - Fixed item detail panel with color-coded profit margins
  - Scanner protection details for concealed compartments

### Starmap Navigation
The starmap (`StarmapScene`) features:
- **Procedural Generation**: 200+ star systems across multiple regions
- **Region Types**: Hub Systems (85% colonized), Frontier (40%), Outer Rim (20%), etc.
- **Fog of War**: Unexplored areas hidden, revealed by scanner range
- **Jump Mechanics**: Limited by jump drive range (150 units base)
- **System Information**: Shows colonization status, economic type, coordinates

### Cargo & Smuggling Mechanics
Ships (`ShipModel`) support:
- **Public Cargo**: Standard cargo hold visible to authorities
- **Concealed Compartments**: Hidden spaces with scanner proofing
- **Scanner Types**: radiation, thermal, magnetic, gravimetric, bioscan, quantum
- **Detection System**: Concealment level + scanner proofing vs scanner strength
- **Space Management**: Each item has size, compartments have limited space

## Common Patterns & Issues

### UI Patterns
- **Container-based Layout**: Use Phaser containers for grouped UI elements
- **Fixed Positioning**: UI panels at consistent screen positions
- **Interactive Elements**: Set `.setInteractive()` on backgrounds for click handling
- **Depth Management**: Use `.setDepth()` for proper layering (1000+ for UI)
- **Font Sizing**: Increased throughout for readability (base 16-18px)

### Scene Transitions
- **Wake/Sleep Pattern**: Use `scene.sleep()` and `scene.wake()` for state preservation
- **Data Passing**: Pass data object as second parameter to `scene.start()`
- **Cleanup**: Remove event listeners and clear containers in scene shutdown

### Common Fixes Applied
1. **Timing Issues**: Add null checks for UI elements that may not be initialized
2. **Click Events**: Use `pointer.event.stopPropagation()` to prevent bubbling
3. **Phaser 4 API**: Use `container.add()` not `.addTo()` (doesn't exist)
4. **Interactive Icons**: Place at world coordinates, not in containers, for proper event handling
5. **Safety Checks**: Always check if UI elements exist before accessing properties

### Economic Model
- **System Types**: Agricultural, Industrial, Mining, Scientific
- **Price Modifiers**:
  - Specialty goods: -30% in producing systems
  - Demand goods: +30% in consuming systems
  - Illegal goods: High base price, high profit margins
- **Trade Strategy**: Buy specialty goods, sell where in demand
- **Sale Price**: Always 80% of current market value

## Testing Considerations
- **Scene State**: Test scene transitions maintain proper state
- **UI Responsiveness**: Verify all interactive elements respond correctly
- **Economic Balance**: Check profit margins make sense for gameplay
- **Scanner Detection**: Test concealment mechanics work as intended
- **Fog of War**: Verify discovery radius updates properly
