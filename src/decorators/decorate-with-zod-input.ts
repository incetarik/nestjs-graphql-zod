import type { BaseOptions } from './zod-options-wrapper.interface'
import type { DynamicZodModelClass } from './types'

import { plainToInstance } from 'class-transformer'
import { AnyZodObject, ZodError } from 'zod'

import { BadRequestException } from '@nestjs/common'

type Fn = (...args: any) => any

/**
 * Decorates a method with given zod validation object.
 *
 * @export
 * @template T The type of the zod validation object.
 * @template F The type of the function that will be replaced.
 * @param {Function} originalFunction The original function which will be
 * replaced.
 *
 * @param {T} input The zod validation object.
 * @param {DynamicZodModelClass<T>} model The dynamically built zod class that
 * has the validations installed.
 *
 * @return {F}
 */
export function decorateWithZodInput<
  T extends AnyZodObject,
  F extends Fn = Fn
>(
  originalFunction: F,
  input: T,
  model: DynamicZodModelClass<T>,
  options?: BaseOptions<T>
) {
  return function _modelWithZod(this: any, ...args: Parameters<F>) {
    const result = originalFunction.apply(this, args)
    let parseToInstance = true

    if (typeof options?.zod === 'object') {
      if (typeof options.zod.parseToInstance === 'boolean') {
        parseToInstance = options.zod.parseToInstance
      }
    }

    if (result instanceof Promise) {
      return result
        .then(output => input.parseAsync(output))
        .then(output => parseToInstance ? plainToInstance(model, output) : output)
        .catch((error: Error) => {
          if (error instanceof ZodError) {
            throw new BadRequestException(error.issues)
          }
          else {
            throw error
          }
        })
    }
    else {
      const parseResult = input.safeParse(result)
      if (parseResult.success) {
        return parseToInstance ? plainToInstance(model, parseResult.data) : parseResult.data
      }
      else {
        throw new BadRequestException(parseResult.error.issues)
      }
    }
  }
}
