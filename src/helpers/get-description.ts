import * as zod from 'zod'

import { isZodInstance } from './is-zod-instance'

/**
 * Extracts the description from a given type.
 *
 * @template T The type of the zod object.
 * @param {T} [input] The zod object input.
 * @return {(string | undefined)} The description of the input or `undefined.`
 */
export function getDescription<T extends zod.AnyZodObject>(input?: T): string | undefined {
  if (!input) return

  if (input.description) return input.description

  if (isZodInstance(zod.ZodDefault, input)) {
    let innerType = input._def[ 'innerType' ] as T
    if (typeof innerType === 'object') {
      return getDescription(innerType)
    }
    return
  }

  if (isZodInstance(zod.ZodArray, input)) {
    return getDescription(input.element as T)
  }

  if (isZodInstance(zod.ZodNullable, input)) {
    return getDescription(input.unwrap() as T)
  }

  if (isZodInstance(zod.ZodOptional, input)) {
    return getDescription(input.unwrap() as T)
  }
}
