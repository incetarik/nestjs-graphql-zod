import * as zod from 'zod'

import { Type } from '@nestjs/common'
import { ObjectType, ObjectTypeOptions } from '@nestjs/graphql'

import { extractNameAndDescription, parseShape } from './helpers'
import { ZodObjectKey } from './helpers/constants'

export interface IModelFromZodOptions<T extends object> extends ObjectTypeOptions {
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
   * @param {zod.ZodError<T[ K ]>} error The error thrown during parsing.
   * @return {*}  {(T[ keyof T ] | void)} An alternative fallback value to
   * replace and dismiss the error, or nothing.
   * 
   * @memberof IModelFromZodOptions
   */
  onParseError?<K extends keyof T>(
    key: K,
    newValue: T[ K ],
    oldValue: T[ K ] | undefined,
    error: zod.ZodError<T[ K ]>
  ): T[ keyof T ] | void

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
  onParsing?<K extends keyof T>(
    key: K,
    previousValue: T[ K ] | undefined
  ): Partial<zod.ParseParams>
}

export interface IModelFromZodOptionsWithMapper<T extends object, PM extends Mapper<T> = Mapper<T>> extends IModelFromZodOptions<T> {
  /**
   * A map that will be used for creating the properties on the generated
   * class.
   * 
   * This property can be used to rename the properties from `zod` to `class`.
   *
   * @type {PM}
   * @memberof IModelFromZodOptions
   */
  readonly propertyMap?: Readonly<PM>
}

type Options<T extends object, PM extends Mapper<T> = Mapper<T>>
  = IModelFromZodOptionsWithMapper<T, PM>
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

type ToType<T extends object, O>
  = O extends IModelFromZodOptionsWithMapper<any, infer PMI>
  ? { new(): MapKeys<T, PMI> }
  : never

let _generatedClasses: WeakMap<zod.AnyZodObject, Type> | undefined

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
  T extends zod.AnyZodObject,
  O extends Options<T>
>(
  zodInput: T,
  options: O = {} as O,
  decorator: ClassDecorator
): ToType<T, O> {

  const previousRecord
    = (_generatedClasses ??= new WeakMap<zod.AnyZodObject, Type>())
      .get(zodInput)

  if (previousRecord) return previousRecord as ToType<T, O>

  const { name, description } = extractNameAndDescription(zodInput, options)
  let { keepZodObject = false, propertyMap } = options

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
    getDecorator: options.getDecorator ?? (() => decorator)
  })

  for (const { descriptor, key, decorateFieldProperty } of parsed) {
    const targetKey = propertyMap?.[ key as keyof T ] ?? key as keyof T

    Object.defineProperty(prototype, targetKey, descriptor)
    decorateFieldProperty(prototype, targetKey as string)
  }

  _generatedClasses.set(zodInput, DynamicZodModel)
  return DynamicZodModel as ToType<T, O>
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
  T extends zod.AnyZodObject,
  O extends IModelFromZodOptionsWithMapper<T>
>(zodInput: T, options: O = {} as O): ToType<T, O> {
  const { name, description } = extractNameAndDescription(zodInput, options)

  const decorator = ObjectType(name, {
    description,
    isAbstract: zodInput.isNullable() || zodInput.isOptional(),
    ...options
  })

  return modelFromZodBase(zodInput, options, decorator)
}
