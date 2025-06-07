import { AVERAGE_PRIORITY, } from '../common/Activation';
import { ActivationContainer } from '../common/ActivationContainer';
/**
 * Activation with a single target, which invokes other activations in bulk
 */
export class TargettedAsyncMultiplexActivation {
    activations;
    priority;
    constructor(activations, priority) {
        this.activations = new ActivationContainer(activations);
        this.priority = priority ?? AVERAGE_PRIORITY;
    }
    async activateTargettedAsync(target) {
        await this.activations.activateAsyncWithTarget(target);
    }
    static build(activations) {
        const activationObjects = activations.map((activation) => {
            return {
                activateTargetted: (target) => activation(target),
            };
        });
        return new TargettedAsyncMultiplexActivation(activationObjects);
    }
}
//# sourceMappingURL=TargettedAsyncMultiplexActivation.js.map