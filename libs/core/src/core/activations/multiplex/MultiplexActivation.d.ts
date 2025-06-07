import type { Activation, ActivationCallback } from '../common/Activation.ts'
/**
 * Activation which invokes other activations in bulk
 */
export declare class MultiplexActivation implements Activation {
  private readonly activations
  constructor(activations: Activation[])
  activate(): void
  static buildCallback(activations: ActivationCallback[]): ActivationCallback
}
//# sourceMappingURL=MultiplexActivation.d.ts.map
