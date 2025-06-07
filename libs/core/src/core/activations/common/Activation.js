import { isTargettedActivation } from './AbstractActivation';
export const LOW_PRIORITY = 10;
export const AVERAGE_PRIORITY = 50;
export const HIGH_PRIORITY = 100;
export function executeTargettedActivation(activation, target) {
    if (isTargettedActivation(activation)) {
        activation.activateTargetted(target);
        return Promise.resolve();
    }
    return activation.activateTargettedAsync(target);
}
//# sourceMappingURL=Activation.js.map