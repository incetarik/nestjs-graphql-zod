# Changelog
This file contains the changes made to the package.

The sections are in descending order of the change date.

## [0.1.6] - 2022-08-23
### Added
- New decorators for `InputType` with `zod` validations:
  - `InputZodType`: Takes a `zod` validation object and can be used in place of
  `Args`. If the validation fails, `BadRequest` exception will be thrown.
  The corresponding `GraphQL` schema objects will be created according to the
  given `zod` input.

  - `InputTypeWithZod`: This is a helper decorator that might be used rarely.
  When applied with a `zod` validation object to a class, the properties found
  in the class will be decorated with `Field` property and the class will be
  decorated with `InputType` decorator.

  - `InputTypeFromZod`: This decorator will return a class that is decorated
  with `InputTypeWithZod` decorator and this class will represent the given
  `zod` validation object.

  - `InputZodType.Of<T>`: This is a type that will infer the type from a `zod`
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

[Unreleased]: https://github.com/incetarik/nestjs-graphql-zod/compare/v1.0.0...HEAD

[0.1.6]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.5...0.1.6
[0.1.5]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.3...0.1.5
[0.1.3]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.2...0.1.3
[0.1.2]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/incetarik/nestjs-graphql-zod/releases/tag/0.1.1
