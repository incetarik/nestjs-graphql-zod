// A global variable tracking the registered classes count.
// This is used for providing unique class names.
let registerCount = 0

/**
 * A {@link Symbol} that is used for keeping the source zod object inside
 * a model class built from that source.
 */
export const ZodObjectKey = Symbol('[[DynamicZodModelSource]]')

/**
 * Gets the total registered class count.
 *
 * @export
 * @return {number} The registered class count.
 */
export function getRegisterCount(): number {
  return registerCount
}

/**
 * Gets the total registered class count after increases the global counter.
 *
 * @export
 * @return {number} The new registered class count.
 */
export function getAndIncreaseRegisterCount(): number {
  return ++registerCount
}
