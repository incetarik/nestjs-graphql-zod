import { IModelFromZodOptions } from 'src/model-from-zod'
import * as zod from 'zod'

import { isZodInstance } from './is-zod-instance'

/**
 * Creates a property descriptor that provides `get` and `set` functions
 * that are using `parse` or `safeParse` methods of the `zod` library.
 *
 * @export
 * @template T The type of the target object.
 * @param {keyof T} key The key of the property that is being created.
 * @param {zod.ZodTypeAny} input The zod object input.
 * @param {IModelFromZodOptions<T>} opts The options.
 * @return {PropertyDescriptor} A {@link PropertyDescriptor}.
 */
export function createZodPropertyDescriptor<T extends object>(key: keyof T, input: zod.ZodTypeAny, opts: IModelFromZodOptions<T>): PropertyDescriptor {
  let localVariable: any

  if (isZodInstance(zod.ZodDefault, input)) {
    localVariable = input._def.defaultValue()
  }

  const {
    safe,
    doNotThrow,

    onParsing,
    onParseError,
  } = opts

  let keyProps: Partial<zod.ParseParams> | undefined
  if (typeof onParsing === 'function') {
    keyProps = onParsing(key, localVariable)
  }

  return {
    get() {
      return localVariable
    },
    set(newValue) {
      if (safe) {
        const result = input.safeParse(newValue, keyProps)
        if (result.success) {
          localVariable = result.data
        }
        else {
          let replaceValue: typeof localVariable

          if (typeof onParseError === 'function') {
            replaceValue = onParseError(
              key,
              newValue,
              localVariable,
              result.error
            )
          }

          if (typeof replaceValue !== 'undefined') {
            localVariable = replaceValue
          }
          else if (doNotThrow) {
            localVariable = undefined
          }
          else {
            throw result.error
          }
        }
      }
      else {
        if (doNotThrow) {
          try {
            const result = input.parse(newValue, keyProps)
            localVariable = result
          }
          catch (_) {
            localVariable = undefined
          }
        }
        else {
          const result = input.parse(newValue, keyProps)
          localVariable = result
        }
      }
    }
  }
}
