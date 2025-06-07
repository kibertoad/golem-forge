import type {
  Activation,
  Activations,
  AsyncActivation,
  TargettedActivation,
  TargettedActivations,
  TargettedAsyncActivation,
} from '../common/Activation.ts'
export type QueuedActivationParams = {
  id: string
  activations: Activations
  activatesIn: number
  unique?: boolean
  description?: string
}
export type QueuedTargettedActivationParams<Target> = Omit<
  QueuedActivationParams,
  'activations'
> & {
  activations: TargettedActivations<Target>
}
export declare class QueuedActivation<_Target = unknown> implements Activation, AsyncActivation {
  private activatesIn
  private readonly activations
  readonly unique: boolean
  readonly id: string
  readonly description?: string
  constructor(params: QueuedActivationParams)
  processTime(timeUnits: number): boolean
  resetTime(): void
  /**
   * Activates only sync activations
   */
  activate(): void
  /**
   * Activates both sync and async activations
   */
  activateAsync(): Promise<void>
}
export declare class QueuedTargettedActivation<Target>
  implements TargettedActivation<Target>, TargettedAsyncActivation<Target>
{
  private activatesIn
  private readonly activations
  readonly unique: boolean
  readonly id: string
  readonly description?: string
  constructor(params: QueuedTargettedActivationParams<Target>)
  processTime(timeUnits: number): boolean
  resetTime(): void
  /**
   * Activates only sync activations
   */
  activateTargetted(target: Target): void
  /**
   * Activates both sync and async activations
   */
  activateTargettedAsync(target: Target): Promise<void>
}
//# sourceMappingURL=QueuedActivation.d.ts.map
