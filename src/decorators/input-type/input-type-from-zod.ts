import { AnyZodObject } from 'zod'

import { Type } from '@nestjs/common'

import { InputTypeWithZod } from './input-type-with-zod'
import { Options } from './options.inteface'

/**
 * Decorator that marks a class as a GraphQL input type.
 * 
 * Uses a `zod` object.
 *
 * @export
 * @template T The type of the zod object input.
 * @param {T} input The zod input object.
 * @return {ClassDecorator} A {@link ClassDecorator}.
 */
export function InputTypeFromZod<T extends AnyZodObject>(
  input: T
): Type<T>

/**
 * Decorator that marks a class as a GraphQL input type.
 * 
 * Uses a `zod` object.
 *
 * @export
 * @template T The type of the zod object input.
 * @param {T} input The zod input object.
 * @param {Options<T>} options The options for the decorator.
 * @return {ClassDecorator} A {@link ClassDecorator}.
 */
export function InputTypeFromZod<T extends AnyZodObject>(
  input: T,
  options: Options<T>
): Type<T>

/**
 * Decorator that marks a class as a GraphQL input type.
 * 
 * Uses a `zod` object.
 *
 * @export
 * @template T The type of the zod object input.
 * @param {T} input The zod input object.
 * @param {string} name The name of the {@link InputType}.
 * @param {Options<T>} [options] The options for the decorator.
 * @return {ClassDecorator} A {@link ClassDecorator}.
 */
export function InputTypeFromZod<T extends AnyZodObject>(
  input: T,
  name: string,
  options?: Options<T>
): Type<T>

export function InputTypeFromZod<T extends AnyZodObject>(
  input: T,
  nameOrOptions?: string | Options<T>,
  options?: Options<T>
) {
  class DynamicZodModel {}

  InputTypeWithZod(input, nameOrOptions as string, options)(DynamicZodModel)
  return DynamicZodModel as Type<T>
}
