import * as zod from 'zod'

import { Mutation, MutationOptions as MO } from '@nestjs/graphql'

import { IModelFromZodOptionsWithMapper } from '../model-from-zod'
import { MethodWithZod } from './common'

export interface MutationOptions<T extends object> extends MO {
  /**
   * Options for model creation from `zod`.
   *
   * @type {IModelFromZodOptionsWithMapper<T>}
   * @memberof QueryOptions
   */
  zod?: IModelFromZodOptionsWithMapper<T>
}

/**
 * Mutation handler (method) Decorator.
 * Routes specified mutation to this method.
 * 
 * Uses a `zod` object.
 *
 * @export
 * @template T The type of the zod object input.
 * @param {T} input The zod input object.
 * @return {MethodDecorator} A {@link MethodDecorator}.
 */
export function MutationWithZod<T extends zod.AnyZodObject>(input: T): MethodDecorator

/**
 * Mutation handler (method) Decorator.
 * Routes specified mutation to this method.
 * 
 * Uses a `zod` object.
 *
 * @export
 * @template T The type of the zod object input.
 * @param {T} input The zod input object.
 * @param {string} name The name of the method.
 * @return {MethodDecorator} A {@link MethodDecorator}.
 */
export function MutationWithZod<T extends zod.AnyZodObject>(input: T, name: string): MethodDecorator

/**
 * Mutation handler (method) Decorator.
 * Routes specified mutation to this method.
 * 
 * Uses a `zod` object.
 *
 * @export
 * @template T The type of the zod object input.
 * @param {T} input The zod input object.
 * @param {MutationOptions<zod.infer<T>>} options The options for query method.
 * @return {MethodDecorator} A {@link MethodDecorator}.
 */
export function MutationWithZod<T extends zod.AnyZodObject>(input: T, options: MutationOptions<zod.infer<T>>): MethodDecorator
export function MutationWithZod<T extends zod.AnyZodObject>(input: T, nameOrOptions?: string | MutationOptions<zod.infer<T>>) {
  return MethodWithZod(input, nameOrOptions!, Mutation)
}
