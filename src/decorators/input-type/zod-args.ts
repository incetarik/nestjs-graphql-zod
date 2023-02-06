import { PipeTransform, Type } from '@nestjs/common'
import { Args, ArgsOptions } from '@nestjs/graphql'

import { extractNameAndDescription } from '../../helpers'
import { ZodValidatorPipe } from '../../helpers/zod-validator.pipe'
import { inputFromZod } from './input-from-zod'

import type { AnyZodObject, infer as Infer } from 'zod'

type PT<F = any, T = any> = PipeTransform<F, T> | Type<PipeTransform<F, T>>

let GENERATED_TYPES: WeakMap<AnyZodObject, object> | undefined
let USED_NAMES: string[] | undefined

/**
 * Creates a new type from given zod object or returns previously created one.
 *
 * @template T The type of the zod object passed.
 * @param {T} input The zod scheme object.
 * @return {*} The newly or previously created class instance.
 */
function _getOrCreateRegisteredType<T extends AnyZodObject>(input: T) {
  if (!GENERATED_TYPES) { GENERATED_TYPES = new WeakMap() }
  let RegisteredType = GENERATED_TYPES.get(input) as Type<Infer<T>> | undefined
  if (RegisteredType) return RegisteredType

  const { name, description } = extractNameAndDescription(input, {})
  const safeName = _getSafeName(name)
  RegisteredType = inputFromZod(input, { name: safeName, description })
  GENERATED_TYPES.set(input, RegisteredType)
  return RegisteredType
}

/**
 * Checks if the name is used before, in that case, adds a suffix of `_{number}`
 * indicating the number of times the name is used.
 *
 * @param {string} name The name to check.
 * @return {string} The name that is not used in any other types before.
 */
function _getSafeName(name: string): string {
  if (!USED_NAMES) { USED_NAMES = [] }

  let total = 0
  for (let i = 0, limit = USED_NAMES.length; i < limit; ++i) {
    const current = USED_NAMES[ i ]
    if (current.startsWith(name)) { ++total }
  }

  if (total) {
    const newName = `${name}_${total + 1}`
    USED_NAMES.push(newName)
    return newName
  }

  USED_NAMES.push(name)
  return name
}

/**
 * A parameter decorator that takes a `zod` validation input and marks it as
 * GraphQL `Args` with `property` name with given `options` and pipes.
 *
 * @export
 * @template T The type of the `zod` validation input.
 * @param {T} input The `zod` validation schema object.
 * @param {string} property The name of the property for the GraphQL request
 * argument.
 *
 * @param {ArgsOptions} options The options for {@link Args} decorator.
 * @param {...PT[]} pipes The pipes that will be passed to {@link Args}
 * decorator.
 *
 * @return {ParameterDecorator} A {@link ParameterDecorator} for GraphQL
 * argument.
 */
export function ZodArgs<T extends AnyZodObject>(
  input: T,
  property: string,
  options: ArgsOptions,
  ...pipes: PT[]
): ParameterDecorator

/**
 * A parameter decorator that takes a `zod` validation input and marks it as
 * GraphQL `Args` with `property` name with given `options` and pipes.
 *
 * @export
 * @template T The type of the `zod` validation input.
 * @param {T} input The `zod` validation schema object.
 * @param {ArgsOptions} options The options for {@link Args} decorator.
 * @param {...PT[]} pipes The pipes that will be passed to {@link Args}
 * decorator.
 *
 * @return {ParameterDecorator} A {@link ParameterDecorator} for GraphQL
 * argument.
 */
export function ZodArgs<T extends AnyZodObject>(
  input: T,
  options: ArgsOptions,
  ...pipes: PT[]
): ParameterDecorator

/**
 * A parameter decorator that takes a `zod` validation input and marks it as
 * GraphQL `Args` with `property` name with given `options` and pipes.
 *
 * @export
 * @template T The type of the `zod` validation input.
 * @param {T} input The `zod` validation schema object.
 * @param {string} property The name of the property for the GraphQL request
 * argument.
 *
 * @param {...PT[]} pipes The pipes that will be passed to {@link Args}
 * decorator.
 *
 * @return {ParameterDecorator} A {@link ParameterDecorator} for GraphQL
 * argument.
 */
export function ZodArgs<T extends AnyZodObject>(
  input: T,
  property: string,
  ...pipes: PT[]
): ParameterDecorator

/**
 * A parameter decorator that takes a `zod` validation input and marks it as
 * GraphQL `Args` with `property` name with given `options` and pipes.
 *
 * @export
 * @template T The type of the `zod` validation input.
 * @param {T} input The `zod` validation schema object.
 * @param {...PT[]} pipes The pipes that will be passed to {@link Args}
 * decorator.
 *
 * @return {ParameterDecorator} A {@link ParameterDecorator} for GraphQL
 * argument.
 */
export function ZodArgs<T extends AnyZodObject>(
  input: T,
  ...pipes: PT[]
): ParameterDecorator

export function ZodArgs<T extends AnyZodObject>(
  input: T,
  propertyOrOptions?: string | ArgsOptions | PT,
  optionsOrPipe?: ArgsOptions | PT,
  ...pipes: PT[]
): ParameterDecorator {
  let property: string | undefined
  let options: ArgsOptions | undefined

  // Parameter normalization
  if (typeof propertyOrOptions === 'string') {
    property = propertyOrOptions
    if (typeof optionsOrPipe === 'object') {
      if ('transform' in optionsOrPipe) {
        pipes.unshift(optionsOrPipe)
      }
      else {
        options = optionsOrPipe
      }
    }
  }
  else if (typeof propertyOrOptions === 'object') {
    if (typeof optionsOrPipe === 'object') {
      if ('transform' in optionsOrPipe) {
        pipes.unshift(optionsOrPipe)
      }
      else {
        options = optionsOrPipe
      }
    }
    else if ('transform' in propertyOrOptions) {
      pipes.unshift(propertyOrOptions)
    }
    else {
      options = propertyOrOptions
    }
  }

  const RegisteredType = _getOrCreateRegisteredType(input)
  pipes.unshift(new ZodValidatorPipe(input, RegisteredType))

  options ??= {}
  options.type ??= () => RegisteredType
  options.name ??= 'input'

  let args: ParameterDecorator
  if (typeof property === 'string') {
    if (typeof options === 'object') {
      args = Args(property, options, ...pipes)
    }
    else {
      args = Args(property, ...pipes)
    }
  }
  else if (typeof options === 'object') {
    args = Args(options, ...pipes)
  }
  else {
    args = Args(...pipes)
  }

  return args
}

export module ZodArgs {
  /**
   * A type for inferring the type of a given `zod` validation object.
   */
  export type Of<T extends AnyZodObject> = Infer<T>

  /**
   * Frees the used objects during the startup.
   *
   * The {@link ZodArgs} decorator uses helper local variables to keep the
   * naming system working when the same scheme is used multiple times in
   * separate decorators and same name for different schemes.
   *
   * This function should be called after the GraphQL scheme is created.
   *
   * @export
   */
  export function free() {
    USED_NAMES = undefined
    GENERATED_TYPES = undefined
  }
}
