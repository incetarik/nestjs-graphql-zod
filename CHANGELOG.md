# Changelog
This file contains the changes made to the package.

The sections are in descending order of the change date.

## [3.2.0] - 2023-05-16
### Added
- Now `.int()` can be used and it will have `GraphQLInt` type. Previously
it was always `Float` type.

  Thanks [Ugzuzg](https://github.com/Ugzuzg) for [their contribution](https://github.com/incetarik/nestjs-graphql-zod/pull/12).

### Changed
- Dependencies are now moved to `peerDependencies`.

## [3.1.0] - 2023-04-05
### Added
- `setDefaultEnumProvider` function.

  This can be used to provide types for enums parsed from the zod schema. Use this function to return your custom, already registered GraphQL enums instead of dynamic, parsed zod enum. By this way, it would prevent multiple identical enums being generated.

- Added `getDefaultEnumProvider` function.

  This function gets the previously set enum provider function
  through `setDefaultEnumProvider`.

These functions are also added to the options of `@ZodArgs()`.

## [3.0.0] - 2023-03-27
### Added
- `setDefaultTypeProvider` function which can be used to provide custom GraphQL
scalar types for complex types. This function will receive a handler function
which will take the built name representation of the type that is built from
the zod schema and return a `GraphQLScalarType` to represent that custom type.

  The built name for complex types will be similar to TypeScript types, such as:
  `Record<Optional<String>, Array<Number | String>>`. For example, for this type
  it is possible to return a `JSONObject` scalar type to represent this zod type.

  This _Type Provider_ function can be set through this function and also via
  the decorator properties. Hence, it is possible to set different handlers for
  different decorators.

- Support for primitives at `@ZodArgs` decorator

  Now it is possible to pass a primitive value validator or array of it, example:
  ```ts
  @ZodArgs(z.number().gt(10).optional().array()) input: number[]
  ```
  And this decorator will be validating the input passed to the parameter without
  creating a proxy type for it (as it is primitive).

- Added `getZodObjectName` function.

  This function takes any zod type and builds a string representing the zod
  structure like TypeScript types as the example above.

### Changed
- Description parsing is improved. Now the description properties of fields
will still be extracted if they are under different zod effects such as
`Optional` or `Nullable` or `Array` etc.
- Improved error messages during parsing. Now the error messages will provide
a string that represents the schema that caused the error.

### Removed
- `IModelFromZodOptionsWithMapper<T>` interface is removed which means that
`propertyMap` will not be provided any more, there will be no renaming when
a zod is being converted to a class.
- `types.d.ts` file.

## [2.0.3] - 2023-02-07
### Changed
- Provides safe naming mechanism. Now using same name for different or same
schemes will not cause error.
- Now returns the same dynamic class for same zod scheme input for `@ZodArgs()`.

## [2.0.2] - 2022-09-28
### Changed
- The behavior of error handling has been changed. If an error is thrown from
the method body, then the error will not be modified. If a zod validation
error occurs, the zod error will always be placed in a `BadRequestException`.

## [2.0.1] - 2022-09-27
### Fixed
- Nested classes were causing to register the top most class multiple times.

## [2.0.0] - 2022-08-23
### Added
- `.transform` support. Now `zod` objects/properties may have `transform` calls.

### Changed
- Renamed `InputZodType` decorator to `ZodArgs`.
- Renamed `InputTypeFromZod` to `inputFromZod`.
- `README` file.

## [1.0.0] - 2022-08-23
### Added
- New decorators for `InputType` with `zod` validations:
  - `ZodArgs`: Takes a `zod` validation object and can be used in place of
  `Args`. If the validation fails, `BadRequest` exception will be thrown.
  The corresponding `GraphQL` schema objects will be created according to the
  given `zod` input.

  - `InputTypeWithZod`: This is a helper decorator that might be used rarely.
  When applied with a `zod` validation object to a class, the properties found
  in the class will be decorated with `Field` property and the class will be
  decorated with `InputType` decorator.

  - `ZodArgs.Of<T>`: This is a type that will infer the type from a `zod`
  validation object.

### Fixed
- Previosuly default values were being incorrectly set.

## [0.1.5] - 2022-05-08
### Changed
When an error occurs, the `issues` are placed in `BadRequestException` body.

## [0.1.3] - 2022-05-08
### Changed
Type checking strategy is moved to a function file, all type checking will be
done through `isZodInstance` function.

## [0.1.2] - 2022-05-08
### Changed
Type checking strategy is now changed to constructor name comparison.

## [0.1.1] - 2022-05-08
### Added
The initial version of the package.

[Unreleased]: https://github.com/incetarik/nestjs-graphql-zod/compare/3.1.0...HEAD

[3.2.0]: https://github.com/incetarik/nestjs-graphql-zod/compare/3.1.0...3.2.0
[3.1.0]: https://github.com/incetarik/nestjs-graphql-zod/compare/3.0.0...3.1.0
[3.0.0]: https://github.com/incetarik/nestjs-graphql-zod/compare/2.0.3...3.0.0
[2.0.3]: https://github.com/incetarik/nestjs-graphql-zod/compare/2.0.2...2.0.3
[2.0.2]: https://github.com/incetarik/nestjs-graphql-zod/compare/2.0.1...2.0.2
[2.0.1]: https://github.com/incetarik/nestjs-graphql-zod/compare/2.0.0...2.0.1
[2.0.0]: https://github.com/incetarik/nestjs-graphql-zod/compare/1.0.0...2.0.0
[1.0.0]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.5...1.0.0
[0.1.5]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.3...0.1.5
[0.1.3]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.2...0.1.3
[0.1.2]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/incetarik/nestjs-graphql-zod/releases/tag/0.1.1
