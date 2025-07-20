# potato-golem/core

Framework-agnostic reusable functionality

## Catalogue of functionality

* Activation - a triggered effect
* Processor Activation - activation, which triggers a specified processor
* Processor - a class capable of being triggered
* LimitedNumber - a number which has current and maximum value

## `Random`

* normalizedRandom - generate a random number, which is biased towards mid-range values
* randomOneOf - return a random element of a given array

## `Computable`

`Computable` is a utility class for applying tiered, composable computation logic to numeric values using customizable *factors*. It’s useful for complex, rules-based calculations—such as in games, business logic, or simulations—where values may be influenced by multiple dynamic effects.

### Features

- **Composable Factors:** Apply one or more factors, each with their own rules and effects.
- **Tiered Effects:** Each factor can have multiple tiers based on input value ranges.
- **Stacking and Caps:** Supports additive, multiplicative, and capped effects.
- **Type Safety:** Fully generic for any source model structure.

---

### Usage Example

```typescript
import { Computable, SingleInputFactor, FactorImpact } from './Computable'

type User = { name: string; age: number }

const ageFactor = new SingleInputFactor<User>(
  [
    {
      atValueMin: 0,
      atValueMax: 29,
      effects: [{ type: 'raiseValue', value: 10 }]
    },
    {
      atValueMin: 30,
      atValueMax: 100,
      effects: [{ type: 'raiseValue', value: 20 }]
    }
  ],
  (user) => ({ value: user.age }),
  'user'
)

const computable = new Computable<'user', User>([ageFactor])

computable.compute({ user: { name: 'Alice', age: 35 } })

console.log(computable.currentValue) // 20
```

---

### API

#### `constructor(inputFactors: SingleInputFactor<SourceModels>[])`

Creates a new `Computable` with one or more input factors.

#### `compute(sourceModels: Record<SourceModelTypes, SourceModels>): void`

Calculates and applies all factor effects using the provided source models. Result is stored in `.currentValue`.

#### `currentValue: number`

The output value after computation.

---

### Related Types

- **`SingleInputFactor`** – A factor that applies tiered effects based on a single property of the source model.
- **`SingleInputFactorTier`** – Defines a min/max value range and the effects to apply in that range.
- **`FactorImpact`** – An individual effect, such as `'raiseValue'`, `'raiseValueBoost'`, `'capValueMin'`, etc.

---

**Tip:**  
For advanced use, combine multiple factors or create overlapping/stacking effects to model complex systems.
