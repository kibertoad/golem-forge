import type {
  Activation,
  AsyncActivation,
  TargettedActivation,
  TargettedAsyncActivation,
} from './Activation.ts'
export declare function isActivation(entity: unknown): entity is Activation
export declare function isAsyncActivation(entity: unknown): entity is AsyncActivation
export declare function isTargettedActivation<Target>(
  entity: unknown,
): entity is TargettedActivation<Target>
export declare function isTargettedAsyncActivation<Target>(
  entity: unknown,
): entity is TargettedAsyncActivation<Target>
//# sourceMappingURL=AbstractActivation.d.ts.map
