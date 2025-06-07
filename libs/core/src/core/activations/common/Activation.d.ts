export declare const LOW_PRIORITY = 10
export declare const AVERAGE_PRIORITY = 50
export declare const HIGH_PRIORITY = 100
export type Activations = Array<Activation | AsyncActivation>
export type TargettedActivations<T> = Array<TargettedActivation<T> | TargettedAsyncActivation<T>>
export type Prioritized = {
  isExclusive?: boolean
  priority: number
}
export type PrioritizedActivation = Prioritized & Activation
/**
 * Abstraction over any kind of effect/trigger
 */
export type ActivationCallback = () => void
export type AsyncActivationCallback = () => Promise<void>
/**
 * Class wrapper for ActivationCallback
 */
export type Activation = {
  activate: ActivationCallback
}
export type AsyncActivation = {
  activateAsync: AsyncActivationCallback
}
/**
 * Effect that targets one specific entity
 */
export type TargettedActivationCallback<Target> = (target: Target) => void
export type TargettedAsyncActivationCallback<Target> = (target: Target) => Promise<void>
/**
 * Class wrapper for TargettedActivationCallback
 */
export type TargettedActivation<Target> = {
  activateTargetted: TargettedActivationCallback<Target>
}
export type TargettedAsyncActivation<Target> = {
  activateTargettedAsync: TargettedAsyncActivationCallback<Target>
}
export declare function executeTargettedActivation<T>(
  activation: TargettedActivation<T> | TargettedAsyncActivation<T>,
  target: T,
): Promise<void>
//# sourceMappingURL=Activation.d.ts.map
