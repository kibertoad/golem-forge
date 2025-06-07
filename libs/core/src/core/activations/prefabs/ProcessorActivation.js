import { validateNotNil } from 'validation-utils';
/**
 * Activation which triggers specified processor
 */
export class ProcessorActivation {
    processor;
    params;
    constructor(processor, ...params) {
        this.processor = processor;
        // @ts-ignore
        this.params = params;
    }
    activate() {
        this.processor.process(this.params);
    }
    static build(processor, params) {
        validateNotNil(processor, 'processor cannot be null');
        // @ts-ignore
        const activation = new ProcessorActivation(processor, params);
        return () => {
            activation.activate();
        };
    }
}
//# sourceMappingURL=ProcessorActivation.js.map