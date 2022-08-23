import * as zod from 'zod'

import { Field, NullableList } from '@nestjs/graphql'

import { buildEnumType } from './build-enum-type'
import { createZodPropertyDescriptor } from './create-zod-property-descriptor'
import { generateDefaults } from './generate-defaults'
import { getDescription } from './get-description'
import { isZodInstance } from './is-zod-instance'
import { zodToTypeInfo } from './zod-to-type-info'

import type { IModelFromZodOptions } from '../model-from-zod'

/**
 * An interface describing a parsed field.
 */
export interface ParsedField {
  /**
   * The key of the parsed property.
   *
   * @type {string}
   */
  key: string
  /**
   * The type of the field of the parsed property.
   * 
   * Can be used for GraphQL @{@link Field} decorator.
   *
   * @type {*}
   */
  fieldType: any
  /**
   * The {@link PropertyDescriptor} of the parsed property.
   *
   * @type {PropertyDescriptor}
   */
  descriptor: PropertyDescriptor

  /**
   * A {@link PropertyDecorator} for decorating fields.
   *
   * @type {PropertyDecorator}
   */
  decorateFieldProperty: PropertyDecorator
}

const PARSED_TYPES = [
  zod.ZodArray,
  zod.ZodBoolean,
  zod.ZodString,
  zod.ZodNumber,
  zod.ZodEnum,
  zod.ZodOptional,
  zod.ZodObject,
  zod.ZodDefault,
  zod.ZodTransformer,
] as const

type Options<T extends zod.AnyZodObject>
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

/**
 * Parses a zod input object with given options.
 *
 * @export
 * @template T The type of the zod object.
 * @param {T} zodInput The zod object input.
 * @param {Options<T>} [options={}] The options for the parsing.
 * @return {ParsedField[]} An array of {@link ParsedField}.
 */
export function parseShape<T extends zod.AnyZodObject>(
  zodInput: T,
  options: Options<T> = {}
) {
  const parsedShapes: ParsedField[] = []

  for (const _key in zodInput.shape) {
    const key = _key as (keyof T) & string
    const prop = zodInput.shape[ key ]

    let propertyDescriptor: PropertyDescriptor

    // Changed constructor name checking because of the version mismatch, the
    // objects may have different prototypes even if they both are zod objects.
    if (PARSED_TYPES.some(it => isZodInstance(it, prop))) {
      propertyDescriptor = createZodPropertyDescriptor(key, prop, options)
    }
    else {
      throw new Error(`"${key}" cannot be processed`)
    }

    const elementType = zodToTypeInfo(key, prop, options)

    const {
      isNullable,
      isOptional,
      isEnum,
      isOfArray,
      isItemNullable,
      isItemOptional,
    } = elementType

    if (isEnum) {
      buildEnumType(key, elementType, options)
    }

    const { type: fieldType } = elementType

    let defaultValue = elementType.isType ? undefined : generateDefaults(prop)
    let nullable: boolean | NullableList = isNullable || isOptional

    if (isOfArray) {
      if (isItemNullable || isItemOptional) {
        if (nullable) {
          nullable = 'itemsAndList'
        }
        else {
          nullable = 'items'
          defaultValue = undefined
        }
      }
    }

    parsedShapes.push({
      key,
      fieldType,
      descriptor: propertyDescriptor,
      decorateFieldProperty: Field(() => fieldType, {
        name: key,
        nullable,
        defaultValue,
        description: getDescription(prop),
      })
    })
  }

  return parsedShapes
}
