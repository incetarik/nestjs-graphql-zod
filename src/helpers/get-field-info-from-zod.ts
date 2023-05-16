import { GraphQLScalarType } from 'graphql/type/definition'
import { Int } from '@nestjs/graphql';
import {
  ZodArray,
  ZodBoolean,
  ZodDefault,
  ZodEnum,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodString,
  ZodTransformer,
  ZodType,
  ZodTypeAny,
} from 'zod'
import type { ZodNumberCheck } from 'zod';

import { getDefaultTypeProvider } from '../decorators/common'
import {
  IModelFromZodOptions,
  modelFromZod,
  modelFromZodBase,
} from '../model-from-zod'
import { getZodObjectName } from './get-zod-object-name'
import { isZodInstance } from './is-zod-instance'
import { toTitleCase } from './to-title-case'

/**
 * Describes the properties of a zod type that can be used to apply to `Field`
 * decorator of NestJS.
 *
 * @export
 * @interface ZodTypeInfo
 */
export interface ZodTypeInfo {
  /**
   * The corresponing type of the `zod` property.
   *
   * This type will be used by the `Field` property of the NestJS decorators.
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
 * The options for {@link getFieldInfoFromZod} function.
 *
 * The options extends {@link IModelFromZodOptions<T>} because it may create
 * instances if the given zod type was an object, therefore a class would
 * be created.
 *
 * @template T The zod type.
 */
type Options<T extends ZodTypeAny> = IModelFromZodOptions<T> & {
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
 * @param {ZodTypeAny} prop The `zod` object property.
 * @param {Options<T>} options The options for conversion.
 * @return {ZodTypeInfo} The {@link ZodTypeInfo} of the property.
 */
export function getFieldInfoFromZod<T extends ZodTypeAny>(
  key: string,
  prop: ZodTypeAny,
  options: Options<T>
): ZodTypeInfo {

  if (isZodInstance(ZodArray, prop)) {
    const data = getFieldInfoFromZod(key, prop.element, options)

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
  else if (isZodInstance(ZodBoolean, prop)) {
    return {
      type: Boolean,
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
    }
  }
  if (isZodInstance(ZodString, prop)) {
    return {
      type: String,
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
    }
  }
  else if (isZodInstance(ZodNumber, prop)) {
    const isInt = Boolean(prop._def.checks.find((check: ZodNumberCheck) => check.kind === 'int'));
    return {
      type: isInt ? Int : Number,
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
    }
  }
  else if (isZodInstance(ZodOptional, prop)) {
    const {
      type,
      isEnum,
      isOfArray,
      isItemNullable,
      isItemOptional,
    } = getFieldInfoFromZod(key, prop.unwrap(), options)

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
  else if (isZodInstance(ZodObject, prop)) {
    const isNullable = prop.isNullable() || prop.isOptional()
    const {
      provideNameForNestedClass = defaultNestedClassNameProvider,
    } = options

    let name = provideNameForNestedClass(options.name || '', key)
    if (typeof name !== 'string') {
      name = defaultNestedClassNameProvider(options.name || '', key)
    }

    name = name.trim()
    if (!name) {
      name = defaultNestedClassNameProvider(options.name || '', key)
    }

    const nestedOptions = {
      ...options,
      name,
      description: prop.description,
      isAbstract: isNullable,
    }

    let model: any
    if (typeof options.getDecorator === 'function') {
      model = modelFromZodBase(
        prop as any,
        nestedOptions,
        options.getDecorator(prop as any as T, nestedOptions.name)
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
  else if (isZodInstance(ZodEnum, prop)) {
    return {
      type: prop,
      isNullable: prop.isNullable(),
      isOptional: prop.isOptional(),
      isEnum: true,
    }
  }
  else if (isZodInstance(ZodDefault, prop)) {
    return getFieldInfoFromZod(key, prop._def.innerType, options)
  }
  else if (isZodInstance(ZodTransformer, prop)) {
    return getFieldInfoFromZod(key, prop.innerType(), options)
  }
  else if (isZodInstance(ZodNullable, prop)) {
    return getFieldInfoFromZod(key, prop._def.innerType, options)
  }
  else {
    const { getScalarTypeFor = getDefaultTypeProvider() } = options
    const typeName = getZodObjectName(prop)

    if (typeof getScalarTypeFor === 'function') {
      const scalarType = getScalarTypeFor(typeName)
      let isScalarType = scalarType instanceof GraphQLScalarType

      if (!isScalarType && scalarType) {
        let constructor: Function = (scalarType as any)[ 'constructor' ]
        if (typeof constructor === 'function' && constructor.name === GraphQLScalarType.name) {
          isScalarType = true
        }
      }

      if (isScalarType) {
        return {
          isType: true,
          type: scalarType,
          isNullable: prop.isNullable(),
          isOptional: prop.isOptional(),
        }
      }
      else {
        throw new Error(`The Scalar(Value="${scalarType}", Type="${typeof scalarType}") as Key("${key}") of Type("${typeName}") was not an instance of GraphQLScalarType.`)
      }
    }

    throw new Error(`Unsupported type info of Key("${key}") of Type("${typeName}")`)
  }
}

export module getFieldInfoFromZod {
  /**
   * The types that are parseable by the {@link getFieldInfoFromZod} function.
   */
  export const PARSED_TYPES = [
    ZodArray,
    ZodBoolean,
    ZodDefault,
    ZodEnum,
    ZodNullable,
    ZodNumber,
    ZodObject,
    ZodOptional,
    ZodString,
    ZodTransformer,
  ] as const

  /**
   * Determines if the given zod type is parseable by the {@link getFieldInfoFromZod}
   * function.
   *
   * @export
   * @param {ZodType} input The zod type input.
   * @return {boolean} `true` if the given input is parseable.
   */
  export function canParse(input: ZodType): boolean {
    return PARSED_TYPES.some(it => isZodInstance(it, input))
  }
}

/**
 * Provides a name for nested classes.
 *
 * @param {string} parentName The parent class name.
 * @param {string} propertyKey The property key.
 * @return {string} A new name for the new class.
 *
 * @__PURE__
 */
function defaultNestedClassNameProvider(parentName: string, propertyKey: string): string {
  return `${parentName}_${toTitleCase(propertyKey)}`
}
