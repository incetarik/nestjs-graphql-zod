import { ZodObjectKey } from './constants'

/**
 * Extracts the source zod object that is used for creating passed dynamic
 * model class.
 *
 * @export
 * @template T The type of the model class that is dynamically generated from
 * a zod object.
 * 
 * @param {T} input The model class instance that is dynamically generated
 * from a zod object.
 * 
 * @return {*} The source zod object.
 */
export function getZodObject<T extends Record<string | number | symbol, any>>(
  input: T
) {
  return input[ ZodObjectKey ]
}
