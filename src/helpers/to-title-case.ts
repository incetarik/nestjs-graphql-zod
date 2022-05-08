/**
 * Creates another string where the initial letters of the words are
 * capitalized.
 *
 * @export
 * @param {string} value The input string.
 * @return {string} A string which is title-cased.
 */
export function toTitleCase(value: string) {
  return value.replace(/\b(\p{Alpha})(.*?)\b/u, (_string, match, rest) => {
    return match.toUpperCase() + rest
  })
}
