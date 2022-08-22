import * as zod from 'zod'

import { Query, QueryOptions as QO } from '@nestjs/graphql'

import { IModelFromZodOptionsWithMapper } from '../../model-from-zod'
import { MethodWithZod } from '../common'

export interface QueryOptions<T extends object> extends QO {
  /**
   * Options for model creation from `zod`.
   *
   * @type {IModelFromZodOptionsWithMapper<T>}
   * @memberof QueryOptions
   */
  zod?: IModelFromZodOptionsWithMapper<T>
}

/**
 * Query handler (method) Decorator.
 * Routes specified query to this method.
 * 
 * Uses a `zod` object.
 *
 * @export
 * @template T The type of the zod object input.
 * @param {T} input The zod input object.
 * @return {MethodDecorator} A {@link MethodDecorator}.
 */
export function QueryWithZod<T extends zod.AnyZodObject>(input: T): MethodDecorator

/**
 * Query handler (method) Decorator.
 * Routes specified query to this method.
 * 
 * Uses a `zod` object.
 *
 * @export
 * @template T The type of the zod object input.
 * @param {T} input The zod input object.
 * @param {string} name The name of the method.
 * @return {MethodDecorator} A {@link MethodDecorator}.
 */
export function QueryWithZod<T extends zod.AnyZodObject>(input: T, name: string): MethodDecorator

/**
 * Query handler (method) Decorator.
 * Routes specified query to this method.
 * 
 * Uses a `zod` object.
 *
 * @export
 * @template T The type of the zod object input.
 * @param {T} input The zod input object.
 * @param {QueryOptions<T>} options The options for query.
 * @return {MethodDecorator} A {@link MethodDecorator}.
 */
export function QueryWithZod<T extends zod.AnyZodObject>(input: T, options: QueryOptions<T>): MethodDecorator
export function QueryWithZod<T extends zod.AnyZodObject>(input: T, nameOrOptions?: string | QueryOptions<T>) {
  return MethodWithZod(input, nameOrOptions, Query)
}
