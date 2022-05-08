import * as zod from 'zod'

import { registerEnumType } from '@nestjs/graphql'

import { IModelFromZodOptions } from '../model-from-zod'
import { getRegisterCount } from './constants'
import { toTitleCase } from './to-title-case'
import { withSuffix } from './with-suffix'
import { ZodTypeInfo } from './zod-to-type-info'

/**
 * Builds an enum type for GraphQL schema.
 *
 * @export
 * @template T The type of the zod object.
 * @param {keyof zod.infer<T>} key The key of the zod object.
 * @param {ZodTypeInfo} typeInfo The parsed zod type info.
 * @param {IModelFromZodOptions<zod.infer<T>>} options The options for building
 * enum type.
 * 
 * @return {object} The enum object.
 */
export function buildEnumType<T extends zod.AnyZodObject>(
  key: keyof zod.infer<T>,
  typeInfo: ZodTypeInfo,
  options: IModelFromZodOptions<zod.infer<T>>
): object {

  const { type } = typeInfo
  if (type instanceof zod.ZodEnum) {
    const { Enum } = type

    const incompatibleKey = getFirstIncompatibleEnumKey(Enum)
    if (incompatibleKey) {
      throw new Error(`The value of the Key("${incompatibleKey}") of ${options.name}.${key} Enum was not valid`)
    }

    const parentName = options.name
    const enumName = withSuffix('Enum')(toTitleCase(key as string))
    const registerCount = getRegisterCount()

    registerEnumType(Enum, {
      name: toTitleCase(`${parentName}_${enumName}_${registerCount}`),
      description: type.description ?? `Enum values for ${options.name}.${key}`,
    })

    return typeInfo.type = Enum
  }
  else if (Array.isArray(type)) {
    const dynamicEnumClass = buildEnumType(key, {
      type: type[ 0 ],
      isNullable: !!typeInfo.isItemNullable,
      isOptional: !!typeInfo.isItemOptional,
    }, options)

    return typeInfo.type = [ dynamicEnumClass ]
  }
  else {
    throw new Error(`Unexpected enum type for Key("${key}")`)
  }
}

function getFirstIncompatibleEnumKey(input: Record<string, string>) {
  const digitTest = /^\s*?\d/

  for (const key in input) {
    const value = input[ key ]
    if (typeof value !== 'string') return key
    if (digitTest.test(value)) return key
  }
}
