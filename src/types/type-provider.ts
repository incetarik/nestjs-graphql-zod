import type { GraphQLScalarType } from 'graphql/type/definition'

/**
 * The type provider function.
 *
 * The type name will be calculated and it will be similar to `TypeScript`
 * types such as: `Record<Optional<String>, Array<Number | String>>`.
 *
 * The user will provide custom scalar type to use for that kind of
 * zod validation.
 */
export type TypeProvider = (typeName: string) => GraphQLScalarType | undefined
