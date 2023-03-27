import { InputTypeWithZod } from './input-type-with-zod'

import type { AnyZodObject, infer as Infer } from 'zod'
import type { Type } from '@nestjs/common'

import type { Options } from './options.inteface'

/**
 * Returns a {@link InputTypeWithZod} decorated class from given `zod` input.
 *
 * You can use this returned dynamic class to extend your classes.
 * @export
 * @template T The type of the `zod` object input.
 * @param {T} input The `zod` object input.
 * @return {Type<Infer<T>>} A class that contains the properties from given
 * `zod` input, decorated with {@link InputTypeWithZod}.
 */
export function inputFromZod<T extends AnyZodObject>(input: T): Type<Infer<T>>

/**
 * Returns a {@link InputTypeWithZod} decorated class from given `zod` input.
 *
 * You can use this returned dynamic class to extend your classes.
 * @export
 * @template T The type of the `zod` object input.
 * @param {T} input The `zod` object input.
 * @param {Options<T>} options The options for the decorator.
 * @return {Type<Infer<T>>} A class that contains the properties from given
 * `zod` input, decorated with {@link InputTypeWithZod}.
 */
export function inputFromZod<T extends AnyZodObject>(input: T, options: Options<T>): Type<Infer<T>>

/**
 * Returns a {@link InputTypeWithZod} decorated class from given `zod` input.
 *
 * You can use this returned dynamic class to extend your classes.
 * @export
 * @template T The type of the `zod` object input.
 * @param {T} input The `zod` object input.
 * @param {string} name The name of the {@link InputType}.
 * @param {Options<T>} options The options for the decorator.
 * @return {Type<Infer<T>>} A class that contains the properties from given
 * `zod` input, decorated with {@link InputTypeWithZod}.
 */
export function inputFromZod<T extends AnyZodObject>(input: T, name: string, options?: Options<T>): Type<Infer<T>>

export function inputFromZod<T extends AnyZodObject>(
  input: T,
  nameOrOptions?: string | Options<T>,
  options?: Options<T>
) {
  class DynamicZodModel {}

  InputTypeWithZod(input, nameOrOptions as string, options)(DynamicZodModel)
  return DynamicZodModel as Type<Infer<T>>
}
