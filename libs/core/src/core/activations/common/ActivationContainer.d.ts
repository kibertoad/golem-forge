import type {
  Activation,
  Activations,
  AsyncActivation,
  TargettedActivation,
  TargettedActivations,
  TargettedAsyncActivation,
} from './Activation.ts'
export declare class ActivationContainer<Target> {
  private readonly activations
  private readonly asyncActivations
  private readonly targettedActivations
  private readonly targettedAsyncActivations
  private allActivations
  constructor(activations?: Activations | TargettedActivations<Target>)
  addBulk(
    activations: (
      | Activation
      | AsyncActivation
      | TargettedActivation<Target>
      | TargettedAsyncActivation<Target>
    )[],
  ): void
  add(
    activation:
      | Activation
      | AsyncActivation
      | TargettedActivation<Target>
      | TargettedAsyncActivation<Target>,
  ): this | undefined
  activateOnlySync(): void
  activateOnlySyncWithTarget(target: Target): void
  activateAsync(): Promise<void>
  activateAsyncWithTarget(target: Target): Promise<void>
  static instance(): ActivationContainer<unknown>
  private rebuildAllActivations
  getAllActivations(): (
    | Activation
    | AsyncActivation
    | TargettedActivation<Target>
    | TargettedAsyncActivation<Target>
  )[]
}
//# sourceMappingURL=ActivationContainer.d.ts.map
