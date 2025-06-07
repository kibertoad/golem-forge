import type {
  TargettedActivationCallback,
  TargettedActivations,
  TargettedAsyncActivation,
} from '../common/Activation.ts'
import type { ActivationContainer } from '../common/ActivationContainer.ts'
/**
 * Activation with a single target, which invokes other activations in bulk
 */
export declare class TargettedAsyncMultiplexActivation<Target>
  implements TargettedAsyncActivation<Target>
{
  protected readonly activations: ActivationContainer<Target>
  priority: number
  constructor(activations: TargettedActivations<Target>, priority?: number)
  activateTargettedAsync(target: Target): Promise<void>
  static build<Target>(
    activations: TargettedActivationCallback<Target>[],
  ): TargettedAsyncActivation<Target>
}
//# sourceMappingURL=TargettedAsyncMultiplexActivation.d.ts.map
