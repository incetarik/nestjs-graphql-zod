type Suffixed<Suffix extends string, S extends string>
  = S extends `${string}${Suffix}` ? S : `${S}${Suffix}`

/**
 * Returns a function which will take a string and return another string
 * with the given suffix, if the suffix was already there then this function
 * will simply return the string value.
 *
 * @export
 * @typedef S The suffix string.
 * @param {S} suffix The suffix string.
 * @return {(input: string) => string} The suffixed string.
 */
export function withSuffix<S extends string>(suffix: S) {
  /**
   * Returns a string with previously entered suffix is applied.
   * @typedef I The input string.
   * @param {I} input The input string.
   * @return {Suffixed<S, I>} The suffixed string.
   */
  return function _withSuffix<I extends string>(input: I): Suffixed<S, I> {
    if (input.endsWith(suffix)) {
      return input as Suffixed<S, I>
    }

    return (input + suffix) as Suffixed<S, I>
  }
}
