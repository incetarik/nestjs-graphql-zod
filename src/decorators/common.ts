import { AnyZodObject } from 'zod'

import { BaseTypeOptions } from '@nestjs/graphql'

import { IModelFromZodOptionsWithMapper, modelFromZod } from '../model-from-zod'
import { decorateWithZodInput } from './decorate-with-zod-input'
import { makeDecoratorFromFactory } from './make-decorator-from-factory'
import { DynamicZodModelClass, GraphQLMDF } from './types'
import { WrapWithZodOptions } from './zod-options-wrapper.interface'

type BaseOptions<T extends object> = WrapWithZodOptions<BaseTypeOptions, T>

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
) {
  return function _ModelWithZod(
    target: Record<string, any>,
    methodName: string,
    descriptor: PropertyDescriptor
  ) {
    let newDescriptor = descriptor || {}

    const originalFunction = descriptor?.value ?? target[ methodName ]
    const decoratedFunction
      = decorateWithZodInput(originalFunction, input, model)

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
  let zodOptions: IModelFromZodOptionsWithMapper<T> | undefined

  if (typeof nameOrOptions === 'object') {
    zodOptions = nameOrOptions.zod
  }

  return MethodWithZodModel(
    input,
    nameOrOptions,
    graphqlDecoratorFactory,
    modelFromZod(input, zodOptions)
  )
}
