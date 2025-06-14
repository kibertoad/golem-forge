import { LimitedNumber } from '../../primitives/LimitedNumber.ts'
import type {
  Activation,
  Activations,
  AsyncActivation,
  TargettedActivation,
  TargettedActivations,
  TargettedAsyncActivation,
} from '../common/Activation.ts'
import { ActivationContainer } from '../common/ActivationContainer.ts'

export type QueuedActivationParams = {
  id: string
  activations: Activations
  activatesIn: number // how many time units before activation is triggered
  unique?: boolean // if true, no more than one can be queued at a time
  description?: string
}

export type QueuedTargettedActivationParams<Target> = Omit<
  QueuedActivationParams,
  'activations'
> & {
  activations: TargettedActivations<Target>
}

export class QueuedActivation<Target = unknown> implements Activation, AsyncActivation {
  private activatesIn: LimitedNumber
  private readonly activations: ActivationContainer<Target>
  public readonly unique: boolean
  public readonly id: string
  public readonly description?: string

  constructor(params: QueuedActivationParams) {
    this.activatesIn = new LimitedNumber(params.activatesIn, params.activatesIn)
    this.activations = new ActivationContainer(params.activations)
    this.unique = params.unique ?? false
    this.id = params.id
    this.description = params.description
  }

  processTime(timeUnits: number): boolean {
    this.activatesIn.decrease(timeUnits)
    return this.activatesIn.value <= 0
  }

  resetTime() {
    this.activatesIn.setToMax()
  }

  /**
   * Activates only sync activations
   */
  activate(): void {
    this.activations.activateOnlySync()
  }

  /**
   * Activates both sync and async activations
   */
  async activateAsync(): Promise<void> {
    await this.activations.activateAsync()
  }
}

export class QueuedTargettedActivation<Target>
  implements TargettedActivation<Target>, TargettedAsyncActivation<Target>
{
  private activatesIn: LimitedNumber
  private readonly activations: ActivationContainer<Target>
  public readonly unique: boolean
  public readonly id: string
  public readonly description?: string

  constructor(params: QueuedTargettedActivationParams<Target>) {
    this.activatesIn = new LimitedNumber(params.activatesIn, params.activatesIn)
    this.activations = new ActivationContainer(params.activations)
    this.unique = params.unique ?? false
    this.id = params.id
    this.description = params.description
  }

  processTime(timeUnits: number): boolean {
    this.activatesIn.decrease(timeUnits)
    return this.activatesIn.value <= 0
  }

  resetTime() {
    this.activatesIn.setToMax()
  }

  /**
   * Activates only sync activations
   */
  activateTargetted(target: Target): void {
    this.activations.activateOnlySyncWithTarget(target)
  }

  /**
   * Activates both sync and async activations
   */
  async activateTargettedAsync(target: Target): Promise<void> {
    await this.activations.activateAsyncWithTarget(target)
  }
}
