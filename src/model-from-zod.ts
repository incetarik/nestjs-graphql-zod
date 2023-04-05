import type { Type } from '@nestjs/common'
import type { EnumProvider } from './types/enum-provider'
import type { TypeProvider } from './types/type-provider'

import { AnyZodObject, ParseParams, TypeOf, ZodError, ZodTypeAny } from 'zod'

import { ObjectType, ObjectTypeOptions } from '@nestjs/graphql'

import { extractNameAndDescription, parseShape } from './helpers'
import { ZodObjectKey } from './helpers/constants'

export interface IModelFromZodOptions<T extends ZodTypeAny>
  extends ObjectTypeOptions {
  /**
   * The name of the model class in GraphQL schema.
   *
   * @type {string}
   * @memberof IModelFromZodOptions
   */
  name?: string

  /**
   * Indicates whether or not the property should be parsed safely.
   *
   * If this property is set to `true`, then `safeParse` will be used and
   * if parsing is failed, the {@link onParseError} function will be called
   * to provide a replace value.
   *
   * @type {boolean}
   * @memberof IModelFromZodOptions
   * @see {@link doNotThrow}
   */
  safe?: boolean

  /**
   * Indicates if the parsing should throw when no value could be set
   * when there was an error during parsing.
   *
   * If this property is set to `true`, then the value will be `undefined`
   * if data could not be parsed successfully.
   *
   * @type {boolean}
   * @memberof IModelFromZodOptions
   */
  doNotThrow?: boolean

  /**
   * Indicates whether or not the zod object should be kept inside the
   * dynamically generated class.
   *
   * If this property is set to `true`, use {@link getZodObject} function
   * to get the source object from a target.
   *
   * @type {boolean}
   * @memberof IModelFromZodOptions
   */
  keepZodObject?: boolean

  /**
   * A function that can be used for providing a default value for a property
   * that had an error during parsing.
   *
   * @template K The type of the key.
   * @param {K} key The key that could not be parsed.
   * @param {T[ K ]} newValue The new value that is tried to be parsed.
   * @param {(T[ K ] | undefined)} oldValue The previous value of the property.
   * @param {ZodError<T[ K ]>} error The error thrown during parsing.
   * @return {*}  {(T[ keyof T ] | void)} An alternative fallback value to
   * replace and dismiss the error, or nothing.
   *
   * @memberof IModelFromZodOptions
   */
  onParseError?<K extends keyof TypeOf<T>>(
    key: K,
    newValue: TypeOf<T>[ K ],
    oldValue: TypeOf<T>[ K ] | undefined,
    error: ZodError<TypeOf<T>[ K ]>
  ): TypeOf<T>[ keyof TypeOf<T> ] | void

  /**
   * A function that can be used for providing {@link zod.ParseParams} for
   * a key during the parsing process (on set).
   *
   * @template K The type of the key.
   * @param {K} key The key that is being parsed.
   * @param {(T[ K ] | undefined)} previousValue The previously set value.
   * @return {Partial<zod.ParseParams>} The {@link zod.ParseParams} for the
   * current parsing stage.
   *
   * @memberof IModelFromZodOptions
   */
  onParsing?<K extends keyof TypeOf<T>>(
    key: K,
    previousValue: TypeOf<T>[ K ] | undefined
  ): Partial<ParseParams>

  /**
   * Gets the scalar type for given type name.
   *
   * @param {string} typeName The type name corresponding to the zod object.
   * @return {GraphQLScalarType} The scalar type for the zod object.
   */
  getScalarTypeFor?: TypeProvider

  /**
   * Provides a name for nested classes when they are created dynamically from
   * object properties of zod types.
   *
   * @param {string} parentName The parent class name.
   * @param {string} propertyKey The property key/name.
   * @return {(string | undefined)} The name to set for the class. If
   * any value returned other than a `string`, the class name will be generated
   * automatically.
   *
   * @memberof IModelFromZodOptions
  */
  provideNameForNestedClass?(parentName: string, propertyKey: string): string | undefined

  /**
   * Gets an enum type for given information.
   *
   * Use this function to prevent creating different enums in GraphQL schema
   * if you are going to use same values in different places.
   *
   * @param {string | undefined} name The parent name that contains the enum
   * type.
   * @param {string} key The property name of the enum.
   * @param {(Record<string, string | number>)} enumObject The enum object
   * that is extracted from the zod.
   * @return {(Record<string, string | number> | undefined)} The enum
   * that will be used instead of creating a new one. If `undefined` is
   * returned, then a new enum will be created.
   *
   * @memberof IModelFromZodOptions
   */
  getEnumType?: EnumProvider
}

type Options<T extends ZodTypeAny>
  = IModelFromZodOptions<T>
  & {
    /**
     * Provides the decorator to decorate the dynamically generated class.
     *
     * @param {T} zodInput The zod input.
     * @param {string} key The name of the currently processsed property.
     * @return {ClassDecorator} The class decorator to decorate the class.
     * @memberof IOptions
     */
    getDecorator?(zodInput: T, key: string): ClassDecorator
  }

let _generatedClasses: WeakMap<ZodTypeAny, Type> | undefined

/**
 * Creates a dynamic class which will be compatible with GraphQL, from a
 * `zod` model.
 *
 * @export
 * @template T The type of the zod input.
 * @param {T} zodInput The zod object input.
 * @param {IModelFromZodOptions<T>} [options={}] The options for model creation.
 * @return {Type} A class that represents the `zod` object and also
 * compatible with `GraphQL`.
 */
export function modelFromZodBase<
  T extends AnyZodObject,
  O extends Options<T>
>(
  zodInput: T,
  options: O = {} as O,
  decorator: ClassDecorator
): Type<TypeOf<T>> {
  const previousRecord
    = (_generatedClasses ??= new WeakMap<ZodTypeAny, Type>())
      .get(zodInput)

  if (previousRecord) return previousRecord

  const { name, description } = extractNameAndDescription(zodInput, options)
  let { keepZodObject = false } = options

  class DynamicZodModel {}
  const prototype = DynamicZodModel.prototype

  decorator(DynamicZodModel)

  if (keepZodObject) {
    Object.defineProperty(prototype, ZodObjectKey, {
      value: { ...zodInput },
      configurable: false,
      writable: false,
    })
  }

  const parsed = parseShape(zodInput, {
    ...options,
    name,
    description,
    getDecorator: options.getDecorator as any,
  })

  for (const { descriptor, key, decorateFieldProperty } of parsed) {
    Object.defineProperty(prototype, key as string, descriptor)
    decorateFieldProperty(prototype, key as string)
  }

  _generatedClasses.set(zodInput, DynamicZodModel)
  return DynamicZodModel as Type<TypeOf<T>>
}

/**
 * Creates a dynamic class which will be compatible with GraphQL, from a
 * `zod` model.
 *
 * @export
 * @template T The type of the zod input.
 * @param {T} zodInput The zod object input.
 * @param {IModelFromZodOptions<T>} [options={}] The options for model creation.
 * @return {Type} A class that represents the `zod` object and also
 * compatible with `GraphQL`.
 */
export function modelFromZod<
  T extends AnyZodObject,
  O extends IModelFromZodOptions<T>
  >(zodInput: T, options: O = {} as O): Type<TypeOf<T>> {
  const { name, description } = extractNameAndDescription(zodInput, options)

  const decorator = ObjectType(name, {
    description,
    isAbstract: zodInput.isNullable() || zodInput.isOptional(),
    ...options
  })

  return modelFromZodBase(zodInput, options, decorator)
}
