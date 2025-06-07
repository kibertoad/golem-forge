export type Precondition = {
  isSatisfied(): boolean
}
export type TargettedPrecondition<T> = {
  isSatisfiedForTarget(target: T): boolean
}
export type TargettedReasonedPrecondition<T> = {
  /**
   *
   * @param target The target to check the precondition against
   *
   * @returns true if the precondition is satisfied, false otherwise.
   * If false, a string should be returned explaining why the precondition is not satisfied.
   */
  isSatisfiedForTarget(target: T): true | string
}
export type ReasonedPrecondition = {
  isSatisfied(): true | string
}
export declare function isPrecondition(entity: unknown): entity is Precondition
export declare function isTargettedPrecondition<T>(
  entity: unknown,
): entity is TargettedPrecondition<T>
//# sourceMappingURL=Precondition.d.ts.map
