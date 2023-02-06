# Changelog
This file contains the changes made to the package.

The sections are in descending order of the change date.

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

[Unreleased]: https://github.com/incetarik/nestjs-graphql-zod/compare/2.0.3...HEAD

[2.0.3]: https://github.com/incetarik/nestjs-graphql-zod/compare/2.0.2...2.0.3
[2.0.2]: https://github.com/incetarik/nestjs-graphql-zod/compare/2.0.1...2.0.2
[2.0.1]: https://github.com/incetarik/nestjs-graphql-zod/compare/2.0.0...2.0.1
[2.0.0]: https://github.com/incetarik/nestjs-graphql-zod/compare/1.0.0...2.0.0
[1.0.0]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.5...1.0.0
[0.1.5]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.3...0.1.5
[0.1.3]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.2...0.1.3
[0.1.2]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/incetarik/nestjs-graphql-zod/releases/tag/0.1.1
