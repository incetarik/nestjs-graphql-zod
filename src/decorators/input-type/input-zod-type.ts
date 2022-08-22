import { AnyZodObject, infer as Infer } from 'zod'

import { PipeTransform, Type } from '@nestjs/common'
import { Args, ArgsOptions } from '@nestjs/graphql'

import { extractNameAndDescription } from '../../helpers'
import { ZodValidatorPipe } from '../../helpers/zod-validator.pipe'
import { InputTypeFromZod } from './input-type-from-zod'

type PT<F = any, T = any> = PipeTransform<F, T> | Type<PipeTransform<F, T>>

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
export function InputZodType<T extends AnyZodObject>(
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
export function InputZodType<T extends AnyZodObject>(
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
export function InputZodType<T extends AnyZodObject>(
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
export function InputZodType<T extends AnyZodObject>(
  input: T,
  ...pipes: PT[]
): ParameterDecorator

export function InputZodType<T extends AnyZodObject>(
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

  // Operation
  const { name, description } = extractNameAndDescription(input, {})
  const RegisteredType = InputTypeFromZod(input, { name, description })

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

export module InputZodType {
  /**
   * A type for inferring the type of a given `zod` validation object.
   */
  export type Of<T extends AnyZodObject> = Infer<T>
}
