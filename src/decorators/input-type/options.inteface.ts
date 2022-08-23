import type { InputTypeOptions } from '@nestjs/graphql'
import type { AnyZodObject } from 'zod'

import type { WrapWithZodOptions } from '../zod-options-wrapper.interface'

/**
 * An option type for decorators.
 *
 * @export
 * @interface Options
 * @extends {WrapWithZodOptions<InputTypeOptions, T>}
 * @template T The type of the validation object.
 */
export interface Options<T extends AnyZodObject>
  extends WrapWithZodOptions<InputTypeOptions, T> {
  /**
   * The name of the {@link InputType}.
   *
   * @type {string}
   * @memberof Options
   */
  name?: string
}
