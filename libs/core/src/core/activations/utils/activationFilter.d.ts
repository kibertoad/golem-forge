import type { Prioritized } from '../common/Activation.ts'
/**
 * Sort possible activations by priority and apply exclusivity filter
 */
export declare function sortAndFilterActivations<T extends Prioritized>(
  activations: readonly T[],
): T[]
//# sourceMappingURL=activationFilter.d.ts.map
