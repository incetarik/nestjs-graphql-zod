import { AnyZodObject, ZodDefault, ZodObject, ZodTypeAny } from 'zod'

import { isZodInstance } from './is-zod-instance'

/**
 * Generates the default values for given object.
 * 
 * This function is recursive with {@link generateDefaults}.
 *
 * @param {AnyZodObject} input The input.
 * @return {Record<string, ZodTypeAny>} A record of default values.
 */
function generateDefaultsForObject(input: AnyZodObject) {
  return Object.keys(input.shape).reduce((curr, key) => {
    const res = generateDefaults<ZodTypeAny>(input.shape[ key ])
    if (res) {
      curr[ key ] = res
    }

    return curr
  }, {} as Record<string, ZodTypeAny>)
}

/**
 * Genreates the default vales for given input.
 *
 * @export
 * @template T The type of the input.
 * @param {T} input The input.
 * @return {*} A record containing keys and the zod
 * values with defaults.
 */
export function generateDefaults<T extends ZodTypeAny>(input: T) {
  if (isZodInstance(ZodObject, input)) {
    return generateDefaultsForObject(input as AnyZodObject)
  }
  else if (isZodInstance(ZodDefault, input)) {
    return input._def.defaultValue?.()
  }
}
