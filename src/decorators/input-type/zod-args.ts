import { AnyZodObject, infer as Infer, ZodObject, ZodTypeAny } from 'zod'

import { PipeTransform, Type } from '@nestjs/common'
import { Args, ArgsOptions } from '@nestjs/graphql'

import { extractNameAndDescription, getNullability } from '../../helpers'
import { getDescription } from '../../helpers/get-description'
import { getFieldInfoFromZod } from '../../helpers/get-field-info-from-zod'
import { isZodInstance } from '../../helpers/is-zod-instance'
import { ZodValidatorPipe } from '../../helpers/zod-validator.pipe'
import { TypeProvider } from '../../types/type-provider'
import { getDefaultTypeProvider } from '../common'
import { inputFromZod } from './input-from-zod'

type PT<F = any, T = any> = PipeTransform<F, T> | Type<PipeTransform<F, T>>

type CustomDecoratorOptions = {
  /**
   * Gets the scalar type for given type name.
   *
   * @param {string} typeName The type name corresponding to the zod object.
   * @return {GraphQLScalarType} The scalar type for the zod object.
   */
  getScalarTypeFor?: TypeProvider
}

type DecoratorOptions = ArgsOptions & CustomDecoratorOptions

let GENERATED_TYPES: WeakMap<ZodTypeAny, object> | undefined
let USED_NAMES: string[] | undefined

/**
 * Creates a new type from given zod object or returns previously created one.
 *
 * @template T The type of the zod object passed.
 * @param {T} input The zod scheme object.
 * @param {CustomDecoratorOptions} options The custom decorator options.
 * @return {*} The newly or previously created class instance.
 */
function _getOrCreateRegisteredType<T extends AnyZodObject>(
  input: T,
  options: CustomDecoratorOptions
) {
  if (!GENERATED_TYPES) { GENERATED_TYPES = new WeakMap() }
  let RegisteredType = GENERATED_TYPES.get(input) as Type<Infer<T>> | undefined
  if (RegisteredType) return RegisteredType

  const { name, description } = extractNameAndDescription(input, {})
  const safeName = _getSafeName(name)
  RegisteredType = inputFromZod(input, {
    name: safeName,
    description,
    zod: {
      name: safeName,
      description,
      getScalarTypeFor: options.getScalarTypeFor,
    }
  })

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
 * @param {DecoratorOptions} options The options for {@link Args} decorator.
 * @param {...PT[]} pipes The pipes that will be passed to {@link Args}
 * decorator.
 *
 * @return {ParameterDecorator} A {@link ParameterDecorator} for GraphQL
 * argument.
 */
export function ZodArgs<T extends ZodTypeAny>(
  input: T,
  property: string,
  options: DecoratorOptions,
  ...pipes: PT[]
): ParameterDecorator

/**
 * A parameter decorator that takes a `zod` validation input and marks it as
 * GraphQL `Args` with `property` name with given `options` and pipes.
 *
 * @export
 * @template T The type of the `zod` validation input.
 * @param {T} input The `zod` validation schema object.
 * @param {DecoratorOptions} options The options for {@link Args} decorator.
 * @param {...PT[]} pipes The pipes that will be passed to {@link Args}
 * decorator.
 *
 * @return {ParameterDecorator} A {@link ParameterDecorator} for GraphQL
 * argument.
 */
export function ZodArgs<T extends ZodTypeAny>(
  input: T,
  options: DecoratorOptions,
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
export function ZodArgs<T extends ZodTypeAny>(
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
export function ZodArgs<T extends ZodTypeAny>(
  input: T,
  ...pipes: PT[]
): ParameterDecorator

export function ZodArgs<T extends ZodTypeAny>(
  input: T,
  propertyOrOptions?: string | DecoratorOptions | PT,
  optionsOrPipe?: DecoratorOptions | PT,
  ...pipes: PT[]
): ParameterDecorator {
  let property: string | undefined
  let options: DecoratorOptions | undefined

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

  options ??= {}
  const { getScalarTypeFor = getDefaultTypeProvider() } = options

  if (!isZodInstance(ZodObject, input)) {
    pipes.unshift(new ZodValidatorPipe(input))
    const typeInfo = getFieldInfoFromZod('', input, options)
    const nullability = getNullability(typeInfo)
    const description = getDescription(input)

    const { type } = typeInfo
    options.type = () => type
    options.nullable = nullability
    options.description ??= description
  }
  else {
    const RegisteredType = _getOrCreateRegisteredType(
      input as AnyZodObject,
      {
        getScalarTypeFor
      }
    )

    pipes.unshift(new ZodValidatorPipe(input, RegisteredType))
    options.type ??= () => RegisteredType
  }

  if (options.name) {
    return prepareDecorator(property, options, ...pipes)
  }
  else {
    return function _anonymousZodArgsWrapper(target, propKey, index) {
      options ??= {}
      options!.name = `arg_${index}`
      const decorator = prepareDecorator(property, options, ...pipes)
      decorator(target, propKey, index)
    }
  }
}

/**
 * Gets a prepared {@link ParameterDecorator} after {@link Args} is called.
 *
 * @param {string} [property] The property string.
 * @param {DecoratorOptions} [options] The decorator options.
 * @param {...PT[]} pipes The pipes to apply.
 * @return {ParameterDecorator} The built parameter decorator.
 */
function prepareDecorator(property?: string, options?: DecoratorOptions, ...pipes: PT[]): ParameterDecorator {
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
  export type Of<T extends ZodTypeAny> = Infer<T>

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
