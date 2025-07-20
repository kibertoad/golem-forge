export { LimitedNumber } from './src/core/primitives/LimitedNumber.ts'
export { StateTracker, type StateValues } from './src/core/primitives/StateTracker.ts'
export {
  getRandomNumber,
  randomOneOf,
  normalizedRandom,
  generateUuid,
} from './src/core/utils/randomUtils.ts'
export {
  chunk,
  removeFromArrayById,
  removeFalsy,
  removeNullish,
} from './src/core/utils/arrayUtils.ts'
export type {
  Processor,
  TurnProcessor,
  ParameterlessProcessor,
} from './src/core/interfaces/Processor.ts'
export { executeTargettedActivation } from './src/core/activations/common/Activation.ts'
export type {
  EffectHolder,
  EffectsHolder,
  AsyncActivation,
  AsyncActivationCallback,
  Activations,
  Prioritized,
  PrioritizedActivation,
  Activation,
  ActivationCallback,
  TargettedActivationCallback,
  TargettedActivation,
  TargettedAsyncActivation,
  TargettedActivations,
  TargettedAsyncActivationCallback,
} from './src/core/activations/common/Activation.ts'
export type {
  OptionWithPreconditions,
  Precondition,
  ReasonedPrecondition,
  TargettedPrecondition,
  TargettedReasonedPrecondition,
} from './src/core/preconditions/Precondition.ts'
export { isPrecondition, isTargettedPrecondition } from './src/core/preconditions/Precondition.ts'
export {
  HIGH_PRIORITY,
  AVERAGE_PRIORITY,
  LOW_PRIORITY,
} from './src/core/activations/common/Activation.ts'
export { sortAndFilterActivations } from './src/core/activations/utils/activationFilter.ts'
export { ProcessorActivation } from './src/core/activations/prefabs/ProcessorActivation.ts'
export { MultiplexActivation } from './src/core/activations/multiplex/MultiplexActivation.ts'
export { TargettedAsyncMultiplexActivation } from './src/core/activations/multiplex/TargettedAsyncMultiplexActivation.ts'
export { TargettedMultiplexActivation } from './src/core/activations/multiplex/TargettedMultiplexActivation.ts'
export { DescribedTargettedAsyncMultiplexActivation } from './src/core/activations/multiplex/DescribedTargettedAsyncMultiplexActivation.ts'
export { type Coords, type Dimensions, copyCoords } from './src/core/primitives/Coords.ts'
export type { EntityOwner } from './src/core/interfaces/EntityOwner.ts'
export {
  type TypedEventEmitter,
  type EventSink,
  type EventSource,
  type COMMON_EVENT_TYPES,
  type COMMON_EVENTS,
  type GlobalSceneEvents,
  globalEventEmitter,
} from './src/core/messages/EventBus.ts'
export type {
  StaticDescriptionHolder,
  DynamicDescriptionHolder,
  DynamicDescriptionsHolder,
  Destroyable,
  TypeHolder,
  CoordsHolder,
  HPHolder,
  IdHolder,
  EventReceiver,
  CommonView,
  CommonEntity,
} from './src/core/interfaces/Entities.ts'
export { isDynamicDescriptionsHolder } from './src/core/interfaces/Entities.ts'
export {
  QueuedActivation,
  QueuedTargettedActivation,
  type QueuedTargettedActivationParams,
  type QueuedActivationParams,
} from './src/core/activations/prefabs/QueuedActivation.ts'
export { ActivationContainer } from './src/core/activations/common/ActivationContainer.ts'
export {
  isTargettedAsyncActivation,
  isTargettedActivation,
  isAsyncActivation,
  isActivation,
} from './src/core/activations/common/AbstractActivation.ts'
export { TwoDimensionalMap } from './src/core/primitives/TwoDimensionalMap.ts'
export { calculateManhattanDistance } from './src/core/utils/coordsUtils.ts'
export type { State, StateHolder } from './src/core/state/State.ts'
export { ValueSufficientPrecondition } from './src/core/preconditions/ValueSufficientPrecondition.ts'
export { buildValueSufficientPreconditions } from './src/core/preconditions/ValueSufficientPreconditionsBuilder.ts'
export { ValueBelowPrecondition } from './src/core/preconditions/ValueBelowPrecondition.ts'
export {
  PreconditionWithMetadata,
  type CommonPreconditionMetadata,
} from './src/core/preconditions/PreconditionWithMetadata.ts'

export type {
  RegistryEntityId,
  RegistryEntityIdValues,
} from './src/core/registries/registryUtils.ts'
export { allConditionsPass } from './src/core/preconditions/preconditionUtils.ts'

export type {
  ChoiceDefinition,
  MenuItem,
  MenuTextItem,
} from './src/core/activations/prefabs/fallenlikes/ChoiceTypes.js'
export { MainStateActivation } from './src/core/activations/common/StateActivation.ts'

export {Computable, ComputationContext, SingleInputFactor} from './src/core/primitives/Computable.ts'
export type { InputValueExtractor, SingleInputFactorTier, FactorImpactType } from './src/core/primitives/Computable.ts'
export type { ValueHolder } from './src/core/primitives/CommonPrimitives.ts'
