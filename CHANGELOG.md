# Changelog
This file contains the changes made to the package.

The sections are in descending order of the change date.

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

[0.1.5]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.3...0.1.5
[0.1.3]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.2...0.1.3
[0.1.2]: https://github.com/incetarik/nestjs-graphql-zod/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/incetarik/nestjs-graphql-zod/releases/tag/0.1.1
