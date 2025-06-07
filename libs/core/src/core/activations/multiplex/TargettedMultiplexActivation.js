import { AVERAGE_PRIORITY, } from '../common/Activation';
/**
 * Activation with a single target, which invokes other activations in bulk
 */
export class TargettedMultiplexActivation {
    activations;
    priority;
    constructor(activations, priority) {
        this.activations = activations;
        this.priority = priority ?? AVERAGE_PRIORITY;
    }
    activateTargetted(target) {
        for (const activation of this.activations) {
            // console.log('Activating', activation)
            activation.activateTargetted(target);
            // console.log('Activated', activation)
        }
    }
    static build(activations) {
        const activationObjects = activations.map((activation) => {
            return {
                activateTargetted: (target) => activation(target),
            };
        });
        return new TargettedMultiplexActivation(activationObjects);
    }
}
//# sourceMappingURL=TargettedMultiplexActivation.js.map