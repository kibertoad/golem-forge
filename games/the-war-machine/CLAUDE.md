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
- Check README or search codebase for test framework
- Run linting before commits: `npm run lint`
- TypeScript checking: `tsc --noEmit`

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