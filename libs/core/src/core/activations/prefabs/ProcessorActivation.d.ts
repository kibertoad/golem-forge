import type { Activation, ActivationCallback, Processor } from '../../../../index.ts'
/**
 * Activation which triggers specified processor
 */
export declare class ProcessorActivation<
  ProcessorType extends Processor<InputType>,
  InputType = undefined,
> implements Activation
{
  private readonly processor
  private readonly params
  constructor(processor: ProcessorType, ...params: InputType extends undefined ? [] : [InputType])
  activate(): void
  static build<InputType>(
    processor: Processor<InputType, unknown>,
    params: InputType,
  ): ActivationCallback
}
//# sourceMappingURL=ProcessorActivation.d.ts.map
