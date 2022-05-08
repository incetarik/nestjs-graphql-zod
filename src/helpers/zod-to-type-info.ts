import { IModelFromZodOptions } from 'src/model-from-zod'
import * as zod from 'zod'

import { Float, Int } from '@nestjs/graphql'

import { modelFromZod } from '../model-from-zod'
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

/**
 * Converts a given `zod` object input for a key, into {@link ZodTypeInfo}.
 *
 * @export
 * @template T The type of the `zod` object input.
 * @param {string} key The key of the property of the `zod` object input,
 * that is being converted.
 * 
 * @param {zod.ZodTypeAny} prop The `zod` object property.
 * @param {IModelFromZodOptions<T>} options The options for conversion.
 * @return {ZodTypeInfo} The {@link ZodTypeInfo} of the property.
 */
export function zodToTypeInfo<T extends zod.AnyZodObject>(key: string, prop: zod.ZodTypeAny, options: IModelFromZodOptions<T>): ZodTypeInfo {
  if (prop instanceof zod.ZodArray) {
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
  else if (prop instanceof zod.ZodBoolean) {
    return {
      type: Boolean,
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
    }
  }
  if (prop instanceof zod.ZodString) {
    return {
      type: String,
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
    }
  }
  else if (prop instanceof zod.ZodNumber) {
    return {
      type: prop.isInt ? Int : Float,
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
    }
  }
  else if (prop instanceof zod.ZodOptional) {
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
  else if (prop instanceof zod.ZodObject) {
    const isNullable = prop.isNullable() || prop.isOptional()

    const nestedOptions = {
      ...options,
      description: prop.description,
      name: `${options.name}_${toTitleCase(key)}`,
      isAbstract: isNullable,
    }

    const model = modelFromZod(prop as any, nestedOptions)

    return {
      type: model,
      isType: true,
      isNullable: prop.isNullable(),
      isOptional: prop.isOptional(),
    }
  }
  else if (prop instanceof zod.ZodEnum) {
    return {
      type: prop,
      isNullable: prop.isNullable(),
      isOptional: prop.isOptional(),
      isEnum: true,
    }
  }
  else {
    throw new Error('')
  }
}
