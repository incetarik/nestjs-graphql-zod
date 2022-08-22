import { InputType, InputTypeOptions } from '@nestjs/graphql'

/**
 * Builds an input type decorator for given name and options.
 *
 * @param {string} [name] The name of the property.
 * @param {InputTypeOptions} [opts] The options for the decorator.
 * @return {ClassDecorator} A decorator for the dynamic input type class.
 */
export function getInputTypeDecorator(name?: string, opts?: InputTypeOptions) {
  if (typeof opts === 'object') {
    if (typeof name === 'string') {
      return InputType(name, opts)
    }

    return InputType(opts)
  }

  if (typeof name === 'string') {
    return InputType(name)
  }

  return InputType()
}
