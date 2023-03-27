import {
  ZodAny,
  ZodArray,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodEffects,
  ZodEnum,
  ZodLiteral,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodRecord,
  ZodString,
  ZodTransformer,
  ZodTypeAny,
  ZodUnion,
} from 'zod'

import { isZodInstance } from './is-zod-instance'
import { toTitleCase } from './to-title-case'

/**
 * Builds the corresponding zod type name.
 *
 * @export
 * @param {ZodTypeAny} instance The zod type instance.
 * @return {string} A built type name for the input.
 *
 * @__PURE__
 */
export function getZodObjectName(instance: ZodTypeAny): string {
  if (isZodInstance(ZodArray, instance)) {
    const innerName = getZodObjectName(instance.element)
    return `Array<${innerName}>`
  }

  if (isZodInstance(ZodOptional, instance)) {
    const innerName = getZodObjectName(instance.unwrap())
    return `Optional<${innerName}>`
  }

  if (isZodInstance(ZodTransformer, instance)) {
    return getZodObjectName(instance.innerType())
  }

  if (isZodInstance(ZodDefault, instance)) {
    return getZodObjectName(instance._def.innerType)
  }

  if (isZodInstance(ZodEnum, instance)) {
    const { description = '', Enum } = instance
    const nameSeparatorIndex = description.indexOf(':')

    if (nameSeparatorIndex > 0) {
      const name = description.slice(0, nameSeparatorIndex)
      return `Enum<${name}>`
    }
    else {
      const values = Object.values(Enum)
      const name = values.join(',')
      return `Enum<${name}>`
    }
  }

  if (isZodInstance(ZodObject, instance)) {
    const { description = '' } = instance
    const nameSeparatorIndex = description.indexOf(':')

    if (nameSeparatorIndex > 0) {
      const name = description.slice(0, nameSeparatorIndex)
      return name
    }
    else {
      return `Object`
    }
  }

  if (isZodInstance(ZodRecord, instance)) {
    const { keySchema, valueSchema } = instance
    const keyName = getZodObjectName(keySchema)
    const valueName = getZodObjectName(valueSchema)
    return `Record<${keyName}, ${valueName}>`
  }

  if (isZodInstance(ZodEffects, instance)) {
    return getZodObjectName(instance.innerType())
  }

  if (isZodInstance(ZodLiteral, instance)) {
    const { value } = instance
    if (typeof value === 'object') {
      if (value === null) return `Literal<Null>`
      let constructor: any
      if ('prototype' in value) {
        const prototype = value[ 'prototype' ]
        if (typeof prototype === 'object' && prototype && ('constructor' in prototype)) {
          constructor = prototype[ 'constructor' ]
        }
      }
      else if ('constructor' in value) {
        constructor = value[ 'constructor' ]
      }

      if (typeof constructor === 'function') {
        return `Literal<${constructor.name}>`
      }
    }

    return `Literal<${toTitleCase(typeof instance.value)}>`
  }

  if (isZodInstance(ZodUnion, instance)) {
    return instance.options.map(getZodObjectName).join(' | ')
  }

  if (isZodInstance(ZodNullable, instance)) {
    const innerName = getZodObjectName(instance._def.innerType)
    return `Nullable<${innerName}>`
  }

  if (isZodInstance(ZodBoolean, instance)) return 'Boolean'
  if (isZodInstance(ZodString, instance)) return 'String'
  if (isZodInstance(ZodNumber, instance)) return 'Number'
  if (isZodInstance(ZodBigInt, instance)) return 'BigInt'
  if (isZodInstance(ZodDate, instance)) return 'Date'
  if (isZodInstance(ZodAny, instance)) return 'Any'
  if (isZodInstance(ZodNull, instance)) return 'Null'
  return 'Unknown'
}
