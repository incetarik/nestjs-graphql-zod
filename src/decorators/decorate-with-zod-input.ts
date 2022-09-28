import { plainToInstance } from 'class-transformer'
import { AnyZodObject, ZodError } from 'zod'

import { BadRequestException } from '@nestjs/common'

import { DynamicZodModelClass } from './types'

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
  model: DynamicZodModelClass<T>
) {
  return function _modelWithZod(this: any, ...args: Parameters<F>) {
    const result = originalFunction.apply(this, args)
    if (result instanceof Promise) {
      return result
        .then(output => input.parseAsync(output))
        .then((output) => plainToInstance(model, output))
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
        return plainToInstance(model, parseResult.data)
      }
      else {
        throw new BadRequestException(parseResult.error.issues)
      }
    }
  }
}
