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
- `StarmapScene` - Galaxy navigation interface
- `StarmapUIScene` - UI overlay for starmap
- `SpaceCombatScene` - Combat encounters

**Model Layer**:
- `entities/` - Game entity models (ComponentModel, EntityModel, PlanetModel, etc.)
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

All scenes receive dependencies via constructor injection, enabling clean separation of concerns and testable components.
