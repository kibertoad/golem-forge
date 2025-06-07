/**
 * Activation which invokes other activations in bulk
 */
export class MultiplexActivation {
    activations;
    constructor(activations) {
        this.activations = activations;
    }
    activate() {
        for (const activation of this.activations) {
            activation.activate();
        }
    }
    static buildCallback(activations) {
        return () => {
            for (const activation of activations) {
                activation();
            }
        };
    }
}
//# sourceMappingURL=MultiplexActivation.js.map