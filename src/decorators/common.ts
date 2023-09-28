import type { DynamicZodModelClass, GraphQLMDF } from './types'
import type { WrapWithZodOptions } from './zod-options-wrapper.interface'
import type { TypeProvider } from '../types/type-provider'
import type { EnumProvider } from '../types/enum-provider'

import type { AnyZodObject } from 'zod'
import type { BaseTypeOptions } from '@nestjs/graphql'

import { IModelFromZodOptions, modelFromZod } from '../model-from-zod'
import { decorateWithZodInput } from './decorate-with-zod-input'
import { makeDecoratorFromFactory } from './make-decorator-from-factory'

type BaseOptions<T extends AnyZodObject> = WrapWithZodOptions<BaseTypeOptions, T>

let DEFAULT_TYPE_PROVIDER: TypeProvider | undefined
let DEFAULT_ENUM_PROVIDER: EnumProvider | undefined

/**
 * Returns a method decorator that is built with `zod` validation object.
 *
 * @export
 * @template T The type of the `zod` validation object.
 * @param {T} input The `zod` validation object.
 * @param {(string | BaseOptions<T> | undefined)} nameOrOptions The name or
 * the options.
 *
 * @param {GraphQLMDF<BaseTypeOptions>} graphqlDecoratorFactory The actual
 * decorator factory function.
 *
 * @param {DynamicZodModelClass<T>} model The dynamically built model class from
 * `zod` validation object.
 *
 * @return {MethodDecorator} A method decorator.
 */
export function MethodWithZodModel<T extends AnyZodObject>(
  input: T,
  nameOrOptions: string | BaseOptions<T> | undefined,
  graphqlDecoratorFactory: GraphQLMDF<BaseTypeOptions>,
  model: DynamicZodModelClass<T>
): MethodDecorator {
  return function _ModelWithZod(
    target: Record<PropertyKey, any>,
    methodName: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    let newDescriptor = descriptor || {}

    const originalFunction = descriptor?.value ?? target[ methodName ]

    let decorationProps: typeof nameOrOptions
    if (typeof nameOrOptions === 'string') {
      decorationProps = {
        zod: { parseToInstance: true },
      }
    }
    else {
      decorationProps = nameOrOptions
    }

    const decoratedFunction = decorateWithZodInput(originalFunction, input, model, decorationProps)

    newDescriptor.value = decoratedFunction

    if (!descriptor) {
      Object.defineProperty(target, methodName, newDescriptor)
    }

    const methodDecorator = makeDecoratorFromFactory(
      nameOrOptions,
      graphqlDecoratorFactory,
      model
    )

    methodDecorator(target, methodName, newDescriptor)
  }
}

/**
 * Returns a method decorator that is built with `zod` validation object.
 *
 * @export
 * @template T The type of the `zod` validation object.
 * @param {T} input The `zod` validation object.
 * @param {(string | BaseOptions<T> | undefined)} nameOrOptions The name or
 * the options.
 *
 * @param {GraphQLMDF<BaseTypeOptions>} graphqlDecoratorFactory The actual
 * decorator factory function.
 *
 * @return {MethodDecorator} A method decorator.
 */
export function MethodWithZod<T extends AnyZodObject>(
  input: T,
  nameOrOptions: string | BaseOptions<T> | undefined,
  graphqlDecoratorFactory: GraphQLMDF<BaseTypeOptions>
) {
  let zodOptions: IModelFromZodOptions<T> | undefined

  if (typeof nameOrOptions === 'object') {
    zodOptions = nameOrOptions.zod
  }

  return MethodWithZodModel(
    input,
    nameOrOptions,
    graphqlDecoratorFactory,
    modelFromZod(input, zodOptions) as DynamicZodModelClass<T>
  )
}

/**
 * Sets the default type provider for custom GraphQL Scalars.
 *
 * The type name will be calculated and it will be similar to `TypeScript`
 * types such as: `Record<Optional<String>, Array<Number | String>>`.
 *
 * The user will provide custom scalar type to use for that kind of
 * zod validation.
 *
 * @export
 * @param {TypeProvider} fn The type provider.
 */
export function setDefaultTypeProvider(fn: TypeProvider) {
  DEFAULT_TYPE_PROVIDER = fn
}

/**
 * Gets the default type provided set previously
 * via {@link setDefaultTypeProvider}.
 *
 * @export
 * @return {TypeProvider | undefined} The default type provider.
 */
export function getDefaultTypeProvider(): TypeProvider | undefined {
  return DEFAULT_TYPE_PROVIDER
}

/**
 * Sets the default enum provider for custom GraphQL Scalars.
 *
 * @export
 * @param {EnumProvider} fn The enum provider.
 */
export function setDefaultEnumProvider(fn: EnumProvider) {
  DEFAULT_ENUM_PROVIDER = fn
}

/**
 * Gets the default enum provided set previously
 * via {@link setDefaultEnumProvider}.
 *
 * @export
 * @return {EnumProvider | undefined} The default enum provider.
 */
export function getDefaultEnumProvider(): EnumProvider | undefined {
  return DEFAULT_ENUM_PROVIDER
}
