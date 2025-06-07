import type { TargettedActivation, TargettedActivationCallback } from '../common/Activation.ts'
/**
 * Activation with a single target, which invokes other activations in bulk
 */
export declare class TargettedMultiplexActivation<Target> implements TargettedActivation<Target> {
  protected readonly activations: TargettedActivation<Target>[]
  priority: number
  constructor(activations: TargettedActivation<Target>[], priority?: number)
  activateTargetted(target: Target): void
  static build<Target>(
    activations: TargettedActivationCallback<Target>[],
  ): TargettedActivation<Target>
}
//# sourceMappingURL=TargettedMultiplexActivation.d.ts.map
