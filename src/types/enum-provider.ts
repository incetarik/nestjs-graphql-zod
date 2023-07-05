/**
 * The enum provider data.
 */
export interface EnumProviderData {
  /**
   * The property name of the enum.
   *
   * @type {string}
   * @memberof EnumProviderData
   */
  name: string

  /**
   * The parent name that contains the enum type.
   *
   * @type {string}
   * @memberof EnumProviderData
   */
  parentName?: string

  /**
   * The description of the enum.
   *
   * @type {string}
   * @memberof EnumProviderData
   */
  description?: string

  /**
   * Indicates that if the enum was a native enum.
   *
   * @type {boolean}
   * @memberof EnumProviderData
   */
  isNative?: boolean
}

/**
 * Gets an enum type for given information.
 *
 * Use this function to prevent creating different enums in GraphQL schema
 * if you are going to use same values in different places.
 *
 * @param {(Record<string, string | number>)} enumObject The enum object
 * that is extracted from the zod.
 *
 * @param {EnumProviderData} info The information of the enum property.
 *
 * @return {(Record<string, string | number> | undefined)} The enum
 * that will be used instead of creating a new one. If `undefined` is
 * returned, then a new enum will be created.
 *
 * @memberof IModelFromZodOptions
 */
export type EnumProvider = (
  enumObject: object,
  info: EnumProviderData
) => object | undefined
