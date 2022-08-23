import type { AnyZodObject } from 'zod'
import type {
  DynamicZodModelClass,
  GraphQLCDF,
  GraphQLMDF,
  NameInputMethodDecoratorFactory,
  TypeOptionInputMethodDecoratorFactory,
} from './types'
import type {
  SupportedOptionTypes,
  WrapWithZodOptions,
} from './zod-options-wrapper.interface'

/**
 * Builds a decorator from a decorator factory function.
 *
 * @export
 * @template T The type of the `zod` validation object.
 * @template O The type of the supported option type.
 * @param {(WrapWithZodOptions<O, T> | string | undefined)} nameOrOptions The
 * name or the options.
 * 
 * @param {(GraphQLMDF<O> | GraphQLCDF<O>)} decoratorFactory The decorator
 * factory.
 * 
 * @param {DynamicZodModelClass<T>} model The class that is dynamically built.
 * 
 * @return {MethodDecorator | ClassDecorator | ParameterDecorator} A decorator. 
 */
export function makeDecoratorFromFactory<
  T extends AnyZodObject,
  O extends SupportedOptionTypes
>(
  nameOrOptions: WrapWithZodOptions<O, T> | string | undefined,
  decoratorFactory: GraphQLMDF<O> | GraphQLCDF<O>,
  model: DynamicZodModelClass<T>,
) {
  let decorator: MethodDecorator | ClassDecorator | ParameterDecorator
  if (typeof nameOrOptions === 'string') {
    const factory = decoratorFactory as NameInputMethodDecoratorFactory
    decorator = factory(nameOrOptions)
  }
  else if (typeof nameOrOptions === 'object') {
    const { zod, ...rest } = nameOrOptions
    const factory = decoratorFactory as TypeOptionInputMethodDecoratorFactory<O>
    decorator = factory(() => model, rest as O)
  }
  else {
    const factory = decoratorFactory as TypeOptionInputMethodDecoratorFactory<O>
    decorator = factory(() => model)
  }

  return decorator
}
