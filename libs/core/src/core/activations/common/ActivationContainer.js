import { isActivation, isAsyncActivation, isTargettedActivation, isTargettedAsyncActivation, } from './AbstractActivation';
export class ActivationContainer {
    activations = [];
    asyncActivations = [];
    targettedActivations = [];
    targettedAsyncActivations = [];
    allActivations = [];
    constructor(activations) {
        if (activations) {
            this.addBulk(activations);
        }
    }
    addBulk(activations) {
        for (const activation of activations) {
            this.add(activation);
        }
    }
    add(activation) {
        this.allActivations.push(activation);
        if (isActivation(activation)) {
            this.activations.push(activation);
            return;
        }
        if (isAsyncActivation(activation)) {
            this.asyncActivations.push(activation);
            return;
        }
        if (isTargettedActivation(activation)) {
            this.targettedActivations.push(activation);
            return;
        }
        if (isTargettedAsyncActivation(activation)) {
            this.targettedAsyncActivations.push(activation);
            return;
        }
        return this;
    }
    activateOnlySync() {
        for (const activation of this.activations) {
            activation.activate();
        }
    }
    activateOnlySyncWithTarget(target) {
        this.activateOnlySync();
        for (const activation of this.targettedActivations) {
            activation.activateTargetted(target);
        }
    }
    async activateAsync() {
        for (const activation of this.activations) {
            activation.activate();
        }
        for (const activation of this.asyncActivations) {
            await activation.activateAsync();
        }
    }
    async activateAsyncWithTarget(target) {
        for (const activation of this.activations) {
            activation.activate();
        }
        for (const activation of this.targettedActivations) {
            activation.activateTargetted(target);
        }
        for (const activation of this.asyncActivations) {
            await activation.activateAsync();
        }
        for (const activation of this.targettedAsyncActivations) {
            await activation.activateTargettedAsync(target);
        }
    }
    static instance() {
        return new ActivationContainer();
    }
    rebuildAllActivations() {
        this.allActivations = [
            ...this.activations,
            ...this.asyncActivations,
            ...this.targettedActivations,
            ...this.targettedAsyncActivations,
        ];
    }
    getAllActivations() {
        return this.allActivations;
    }
}
//# sourceMappingURL=ActivationContainer.js.map