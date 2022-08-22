import type { IModelFromZodOptionsWithMapper } from '../model-from-zod'
import type {
  ArgsOptions,
  BaseTypeOptions,
  InputTypeOptions,
} from '@nestjs/graphql'

/**
 * Defines the supported option types by the library.
 */
export type SupportedOptionTypes
  = BaseTypeOptions
  | InputTypeOptions
  | ArgsOptions

/**
 * Wraps given type with given zod options.
 */
export type WrapWithZodOptions<
  O extends SupportedOptionTypes,
  T extends object = object
  >
  = O & BaseOptions<T>

/**
 * The base options for providing `zod` property containing options.
 */
export interface BaseOptions<T extends object> {
  /**
   * Options for model creation from `zod`.
   *
   * @type {IModelFromZodOptionsWithMapper<T>}
   * @memberof QueryOptions
   */
  zod?: IModelFromZodOptionsWithMapper<T>
}

