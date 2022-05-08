import { plainToInstance } from 'class-transformer'
import * as zod from 'zod'

import { BadRequestException } from '@nestjs/common'
import { BaseTypeOptions, ReturnTypeFunc } from '@nestjs/graphql'

import { IModelFromZodOptionsWithMapper, modelFromZod } from '../model-from-zod'

export interface BaseOptions<T extends object> extends BaseTypeOptions {
  /**
   * Options for model creation from `zod`.
   *
   * @type {IModelFromZodOptionsWithMapper<T>}
   * @memberof QueryOptions
   */
  zod?: IModelFromZodOptionsWithMapper<T>
}

type NoInputHandler = (() => MethodDecorator)
type NameInputHandler = ((name: string) => MethodDecorator)
type OptionInputHandler<O extends BaseTypeOptions> = (typeFunc: ReturnTypeFunc, options?: O) => MethodDecorator

type Handler<O extends BaseTypeOptions>
  =
  | NoInputHandler
  | NameInputHandler
  | OptionInputHandler<O>

export function MethodWithZod<T extends zod.AnyZodObject, O extends BaseTypeOptions>(input: T, nameOrOptions: string | BaseOptions<zod.infer<T>>, actualHandler: Handler<O>) {
  let zodOptions: IModelFromZodOptionsWithMapper<T> | undefined

  if (typeof nameOrOptions === 'object') {
    zodOptions = nameOrOptions.zod
  }

  const model = modelFromZod(input, zodOptions)

  return function _QueryWithZod(target: any, methodName: string, descriptor: PropertyDescriptor) {
    let newDescriptor = descriptor || {}

    const originalFunction = descriptor?.value ?? target[ methodName ]

    newDescriptor.value = function _queryWithZod(...args: any[]) {
      const result = originalFunction.apply(this, args)
      if (result instanceof Promise) {
        return result
          .then(output => input.parseAsync(output))
          .then((output) => plainToInstance(model, output))
          .catch((error: zod.ZodError) => new BadRequestException(error.issues))
      }
      else {
        const parseResult = input.safeParse(result)
        if (parseResult.success) {
          return plainToInstance(model, parseResult.data)
        }
        else {
          return new BadRequestException(parseResult.error.issues)
        }
      }
    }

    if (!descriptor) {
      Object.defineProperty(target, methodName, newDescriptor)
    }

    if (typeof nameOrOptions === 'string') {
      (actualHandler as NameInputHandler)(nameOrOptions)(target, methodName, newDescriptor)
    }
    else if (typeof nameOrOptions === 'object') {
      const { zod, ...rest } = nameOrOptions;
      (actualHandler as OptionInputHandler<O>)(() => model, rest as O)(target, methodName, newDescriptor)
    }

    (actualHandler as OptionInputHandler<O>)(() => model)(target, methodName, newDescriptor)
  }
}
