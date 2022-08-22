import { IModelFromZodOptions } from 'src/model-from-zod'
import * as zod from 'zod'

import { modelFromZod, modelFromZodBase } from '../model-from-zod'
import { isZodInstance } from './is-zod-instance'
import { toTitleCase } from './to-title-case'

export interface ZodTypeInfo {
  /**
   * The corresponing type of the `zod` property.
   *
   * @type {*}
   * @memberof ZodTypeInfo
   */
  type: any

  /**
   * Indicates whether or not the prperty is optional.
   *
   * @type {boolean}
   * @memberof ZodTypeInfo
   */
  isOptional: boolean

  /**
   * Indicates whether or not the property is nullable.
   *
   * @type {boolean}
   * @memberof ZodTypeInfo
   */
  isNullable: boolean

  /**
   * Indicates whether or not the property is an enum type.
   *
   * @type {boolean}
   * @memberof ZodTypeInfo
   */
  isEnum?: boolean

  /**
   * Indicates whether or not the property is an object (another type).
   *
   * @type {boolean}
   * @memberof ZodTypeInfo
   */
  isType?: boolean

  /**
   * Indicates whether or not the property is an array.
   *
   * @type {boolean}
   * @memberof ZodTypeInfo
   */
  isOfArray?: boolean

  /**
   * Indicates whether or not the item of the array of the property is
   * optional.
   *
   * @type {boolean}
   * @memberof ZodTypeInfo
   */
  isItemOptional?: boolean

  /**
   * Indicates whether or not the item of the array of the property is
   * nullable.
   *
   * @type {boolean}
   * @memberof ZodTypeInfo
   */
  isItemNullable?: boolean
}

type Options<T extends object> = IModelFromZodOptions<T> & {
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

/**
 * Converts a given `zod` object input for a key, into {@link ZodTypeInfo}.
 *
 * @export
 * @template T The type of the `zod` object input.
 * @param {string} key The key of the property of the `zod` object input,
 * that is being converted.
 * 
 * @param {zod.ZodTypeAny} prop The `zod` object property.
 * @param {Options<T>} options The options for conversion.
 * @return {ZodTypeInfo} The {@link ZodTypeInfo} of the property.
 */
export function zodToTypeInfo<T extends zod.AnyZodObject>(
  key: string,
  prop: zod.ZodTypeAny,
  options: Options<T>
): ZodTypeInfo {

  if (isZodInstance(zod.ZodArray, prop)) {
    const data = zodToTypeInfo(key, prop.element, options)

    const {
      type,
      isEnum,
      isNullable: isItemNullable,
      isOptional: isItemOptional,
    } = data

    return {
      type: [ type ],
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
      isEnum,
      isOfArray: true,
      isItemNullable,
      isItemOptional,
    }
  }
  else if (isZodInstance(zod.ZodBoolean, prop)) {
    return {
      type: Boolean,
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
    }
  }
  if (isZodInstance(zod.ZodString, prop)) {
    return {
      type: String,
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
    }
  }
  else if (isZodInstance(zod.ZodNumber, prop)) {
    return {
      // FIXME: There is a known bug in NestJS that does not support `Int` and
      // `Float` separately therefore we will just be passing `Number` here.
      type: Number,
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
    }
  }
  else if (isZodInstance(zod.ZodOptional, prop)) {
    const {
      type,
      isEnum,
      isOfArray,
      isItemNullable,
      isItemOptional,
    } = zodToTypeInfo(key, prop.unwrap(), options)

    return {
      type,
      isEnum,
      isOfArray,
      isItemNullable,
      isItemOptional,
      isOptional: true,
      isNullable: prop.isNullable(),
    }
  }
  else if (isZodInstance(zod.ZodObject, prop)) {
    const isNullable = prop.isNullable() || prop.isOptional()

    const nestedOptions = {
      ...options,
      description: prop.description,
      name: `${options.name}_${toTitleCase(key)}`,
      isAbstract: isNullable,
    }

    let model: any
    if (typeof options.getDecorator === 'function') {
      model = modelFromZodBase(
        prop as any,
        nestedOptions,
        options.getDecorator(prop as T, nestedOptions.name)
      )
    }
    else {
      model = modelFromZod(prop as any, nestedOptions)
    }

    return {
      type: model,
      isType: true,
      isNullable: prop.isNullable(),
      isOptional: prop.isOptional(),
    }
  }
  else if (isZodInstance(zod.ZodEnum, prop)) {
    return {
      type: prop,
      isNullable: prop.isNullable(),
      isOptional: prop.isOptional(),
      isEnum: true,
    }
  }
  else if (isZodInstance(zod.ZodDefault, prop)) {
    return zodToTypeInfo(key, prop._def.innerType, options)
  }
  else {
    throw new Error(`Unsupported type info of Key("${key}")`)
  }
}
