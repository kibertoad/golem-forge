import type { IdHolder } from '../interfaces/Entities.ts'
/**
 * Split array into smaller arrays that are up to "chunkSize" large
 */
export declare function chunk<T>(array: readonly T[], chunkSize: number): T[][]
/**
 * Modifies an array by removing an entry with a given id. Returns removed entry
 */
export declare function removeFromArrayById<T extends IdHolder>(
  targetArray: T[],
  idToRemove: string,
): T | null
/**
 * Return a copy of the given array without null or undefined values
 */
export declare function removeNullish<const T>(array: readonly (T | null | undefined)[]): T[]
/**
 * Return a copy of the given array without falsy values (eg: false, 0, '', null, undefined)
 */
export declare function removeFalsy<const T>(
  array: readonly (T | null | undefined | 0 | '' | false)[],
): T[]
//# sourceMappingURL=arrayUtils.d.ts.map
