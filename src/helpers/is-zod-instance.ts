import type { ZodTypeAny } from 'zod'
import type { Type } from '@nestjs/common'

/**
 * Checks whether the given `input` is instance of given `klass`.
 *
 * @export
 * @template T The type of the input.
 * @param {T} klass The class type.
 * @param {Object} input The object input.
 * @return {input is InstanceType<T>} A boolean value indicating if the
 * input is instance of given class.
 */
export function isZodInstance<T extends Type<ZodTypeAny>>(
  klass: T,
  input: Object
): input is InstanceType<T> {
  return klass.name === input.constructor.name
}
