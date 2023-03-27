import type { IModelFromZodOptions } from '../model-from-zod'
import type {
  ArgsOptions,
  BaseTypeOptions,
  InputTypeOptions,
} from '@nestjs/graphql'
import type { ZodType } from 'zod'

/**
 * Defines the supported option types by the library.
 */
export type SupportedOptionTypes
  = BaseTypeOptions
  | InputTypeOptions
  | ArgsOptions

/**
 * Wraps given type with given zod options.
 *
 * This type extends the option types for NestJS and adds common properties
 * which will be used by this library.
 */
export type WrapWithZodOptions<O extends SupportedOptionTypes, T extends ZodType = ZodType> = O & BaseOptions<T>

/**
 * The base options for providing `zod` property containing options.
 */
export interface BaseOptions<T extends ZodType> {
  /**
   * Options for model creation from `zod`.
   *
   * @type {IModelFromZodOptions<T>}
   * @memberof QueryOptions
   */
  zod?: IModelFromZodOptions<T>
}
