import {
  ZodArray,
  ZodCatch,
  ZodDefault,
  ZodEffects,
  ZodLazy,
  ZodNullable,
  ZodOptional,
  ZodPromise,
  ZodSet,
  ZodTransformer,
  ZodType,
} from 'zod'

import { Prev } from '../types/prev'
import { isZodInstance } from './is-zod-instance'

/**
 * Unwraps any given zod type by one level.
 *
 * The supported zod wrappers are:
 * - {@link ZodArray}
 * - {@link ZodCatch}
 * - {@link ZodDefault}
 * - {@link ZodEffects}
 * - {@link ZodLazy}
 * - {@link ZodNullable}
 * - {@link ZodOptional}
 * - {@link ZodPromise}
 * - {@link ZodSet}
 * - {@link ZodTransformer}
 *
 * @template T The zod type.
 */
export type UnwrapNestedZod<T extends ZodType>
  = T extends ZodArray<infer I> ? I : (
    T extends ZodOptional<infer I> ? I : (
      T extends ZodTransformer<infer I> ? I : (
        T extends ZodDefault<infer I> ? I : (
          T extends ZodEffects<infer I> ? I : (
            T extends ZodNullable<infer I> ? I : (
              T extends ZodCatch<infer I> ? I : (
                T extends ZodPromise<infer I> ? I : (
                  T extends ZodSet<infer I> ? I : (
                    T extends ZodLazy<infer I> ? I : T
                  )
                )
              )
            )
          )
        )
      )
    )
  )

/**
 * Unwraps any given zod type recursively.
 *
 * The supported zod wrappers are:
 * - {@link ZodArray}
 * - {@link ZodCatch}
 * - {@link ZodDefault}
 * - {@link ZodEffects}
 * - {@link ZodLazy}
 * - {@link ZodNullable}
 * - {@link ZodOptional}
 * - {@link ZodPromise}
 * - {@link ZodSet}
 * - {@link ZodTransformer}
 *
 * @template T The zod type.
 * @template Depth The maximum depth to unwrap, default `5`.
 */
export type UnwrapNestedZodRecursive<T extends ZodType, Depth extends number = 5>
  = [ Prev[ Depth ] ] extends [ never ] ? never : [ T ] extends [ UnwrapNestedZod<T> ] ? T : (
    UnwrapNestedZodRecursive<UnwrapNestedZod<T>, Prev[ Depth ]>
  )

/**
 * Unwraps the zod object one level.
 *
 * The supported zod wrappers are:
 * - {@link ZodArray}
 * - {@link ZodCatch}
 * - {@link ZodDefault}
 * - {@link ZodEffects}
 * - {@link ZodLazy}
 * - {@link ZodNullable}
 * - {@link ZodOptional}
 * - {@link ZodPromise}
 * - {@link ZodSet}
 * - {@link ZodTransformer}
 *
 * @export
 * @template T The type of the input.
 * @param {T} input The zod input.
 * @return {UnwrapNestedZod<T>} The unwrapped zod instance.
 *
 * @__PURE__
 */
export function unwrapNestedZod<T extends ZodType>(input: T): UnwrapNestedZod<T> {
  if (isZodInstance(ZodArray, input)) return input.element as UnwrapNestedZod<T>
  if (isZodInstance(ZodCatch, input)) return input._def.innerType as UnwrapNestedZod<T>
  if (isZodInstance(ZodDefault, input)) return input._def.innerType as UnwrapNestedZod<T>
  if (isZodInstance(ZodEffects, input)) return input.innerType() as UnwrapNestedZod<T>
  if (isZodInstance(ZodLazy, input)) return input.schema as UnwrapNestedZod<T>
  if (isZodInstance(ZodNullable, input)) return input.unwrap() as UnwrapNestedZod<T>
  if (isZodInstance(ZodOptional, input)) return input.unwrap() as UnwrapNestedZod<T>
  if (isZodInstance(ZodPromise, input)) return input.unwrap() as UnwrapNestedZod<T>
  if (isZodInstance(ZodSet, input)) return input._def.valueType as UnwrapNestedZod<T>
  if (isZodInstance(ZodTransformer, input)) return input.innerType() as UnwrapNestedZod<T>
  return input as UnwrapNestedZod<T>
}

/**
 * Unwraps the zob object recursively.
 *
 * @export
 * @template T The type of the input.
 * @template Depth The maximum depth for the recursion, `5` by default.
 * @param {T} input The zod input.
 * @return {UnwrapNestedZodRecursive<T, Depth>} The unwrapped zod instance.
 *
 * @__PURE__
 */
export function unwrapNestedZodRecursively<
  T extends ZodType,
  Depth extends number = 5
>(input: T): UnwrapNestedZodRecursive<T, Depth> {
  let current = input as ZodType

  for (const layer of iterateZodLayers(input)) {
    current = layer
  }

  return current as UnwrapNestedZodRecursive<T, Depth> & ZodType
}

/**
 * Iterates the zod layers by unwrapping the values of the following types:
 *
 * - {@link ZodArray}
 * - {@link ZodCatch}
 * - {@link ZodDefault}
 * - {@link ZodEffects}
 * - {@link ZodLazy}
 * - {@link ZodNullable}
 * - {@link ZodOptional}
 * - {@link ZodPromise}
 * - {@link ZodSet}
 * - {@link ZodTransformer}
 *
 * @export
 * @template T The input zod type.
 * @param {T} input The zod input.
 */
export function* iterateZodLayers<T extends ZodType>(input: T) {
  let current = input as ZodType
  let unwrapped = unwrapNestedZod(input) as ZodType

  while (unwrapped !== current) {
    yield current
    current = unwrapped
    unwrapped = unwrapNestedZod(current) as ZodType
  }

  yield current
}
