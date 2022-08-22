import { AnyZodObject } from 'zod'

import { InputTypeOptions } from '@nestjs/graphql'

import { extractNameAndDescription, parseShape } from '../../helpers'
import { ZodObjectKey } from '../../helpers/constants'
import { getInputTypeDecorator } from './get-input-type-decorator'
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
export function InputTypeWithZod<T extends AnyZodObject>(
  input: T
): ClassDecorator

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
export function InputTypeWithZod<T extends AnyZodObject>(
  input: T,
  options: Options<T>
): ClassDecorator

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
export function InputTypeWithZod<T extends AnyZodObject>(
  input: T,
  name: string,
  options?: Options<T>
): ClassDecorator

export function InputTypeWithZod<T extends AnyZodObject>(
  input: T,
  nameOrOptions?: string | Options<T>,
  options?: Options<T>
): ClassDecorator {
  if (typeof nameOrOptions === 'object') {
    options = nameOrOptions
    nameOrOptions = undefined
  }

  if (!nameOrOptions) {
    nameOrOptions = options?.name
  }

  const name = nameOrOptions
  let zodOptions = options?.zod

  let inputTypeOptions: InputTypeOptions | undefined
  if (typeof options === 'object') {
    const { name: _, zod: __, ...rest } = options
    inputTypeOptions = rest
  }

  const decorate = getInputTypeDecorator(name, inputTypeOptions)

  return function ZodClassDecoratorBase(target: Function) {
    zodOptions ??= {}

    const { prototype } = target
    const { description, name = target.name } = extractNameAndDescription(input, zodOptions)
    const { keepZodObject = false, propertyMap } = zodOptions

    const returnValue = decorate(target)

    if (keepZodObject) {
      Object.defineProperty(prototype, ZodObjectKey, {
        value: { ...input },
        configurable: false,
        writable: false
      })
    }

    const parsed = parseShape(input, {
      ...zodOptions,
      name,
      description,
      getDecorator(_, key) {
        return getInputTypeDecorator(key, inputTypeOptions)
      }
    })

    for (const { descriptor, key, decorateFieldProperty } of parsed) {
      const targetKey = propertyMap?.[ key as keyof T ] ?? key as keyof T

      Object.defineProperty(prototype, targetKey, descriptor)
      decorateFieldProperty(prototype, targetKey as string)
    }

    return returnValue as void
  }
}

