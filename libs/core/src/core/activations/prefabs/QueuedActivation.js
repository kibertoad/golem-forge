import { LimitedNumber } from '../../primitives/LimitedNumber';
import { ActivationContainer } from '../common/ActivationContainer';
export class QueuedActivation {
    activatesIn;
    activations;
    unique;
    id;
    description;
    constructor(params) {
        this.activatesIn = new LimitedNumber(params.activatesIn, params.activatesIn);
        this.activations = new ActivationContainer(params.activations);
        this.unique = params.unique ?? false;
        this.id = params.id;
        this.description = params.description;
    }
    processTime(timeUnits) {
        this.activatesIn.decrease(timeUnits);
        return this.activatesIn.value <= 0;
    }
    resetTime() {
        this.activatesIn.setToMax();
    }
    /**
     * Activates only sync activations
     */
    activate() {
        this.activations.activateOnlySync();
    }
    /**
     * Activates both sync and async activations
     */
    async activateAsync() {
        await this.activations.activateAsync();
    }
}
export class QueuedTargettedActivation {
    activatesIn;
    activations;
    unique;
    id;
    description;
    constructor(params) {
        this.activatesIn = new LimitedNumber(params.activatesIn, params.activatesIn);
        this.activations = new ActivationContainer(params.activations);
        this.unique = params.unique ?? false;
        this.id = params.id;
        this.description = params.description;
    }
    processTime(timeUnits) {
        this.activatesIn.decrease(timeUnits);
        return this.activatesIn.value <= 0;
    }
    resetTime() {
        this.activatesIn.setToMax();
    }
    /**
     * Activates only sync activations
     */
    activateTargetted(target) {
        this.activations.activateOnlySyncWithTarget(target);
    }
    /**
     * Activates both sync and async activations
     */
    async activateTargettedAsync(target) {
        await this.activations.activateAsyncWithTarget(target);
    }
}
//# sourceMappingURL=QueuedActivation.js.map