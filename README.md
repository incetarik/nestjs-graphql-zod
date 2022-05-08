# nestjs-graphql-zod

A library providing dynamic `GraphQL` object classes from their `zod` validation
objects.

This library uses a `zod` object and creates `GraphQL` object/class types for
given input and generates corresponding fields/properties automatically.

You can also nest objects (use `zod.object(...)` for a property) as much as
you want, and also use `zod.enum(...)` and you will also have the corresponding
enums generated for your `GraphQL` schema.

**This library will do the returned value validation.**

To create the corresponding `GraphQL` classes only, use `modelFromZod` function.

NOTE: The names for generated `GraphQL` types are created automatically, to
give them names, you can either use `name` property of the options, or simply
follow the format `{ClassName}:{Description}` string to `.describe` your object.
When you do this, the string will be read until `:` and the left hand side
will be the class name which will be generated and the rest will be the
description of the generated `GraphQL` type.

## Setup Example
- Add `nestjs-graphql-zod` to your dependencies in `package.json`.
- Either use:
  - Classes which you can create with `modelFromZod`.
  - Decorators for `GraphQL`, available decorators:
    - `@MutationWithZod`
    - `@QueryWithZod`
    - `@SubscriptionWithZod`

    These are the same with their corresponding `GraphQL` method decorators.
    Yet, they work with `zod` objects.

## Example
### Simple
```ts
import * as zod from 'zod'

const UserZod = zod.object({
  name: zod.string().describe('The name of the user'),
  age: zod.number().int().gt(10).describe('The age of the user.'),
  fields: zod.string().optional().array().optional().describe('The fields of the user'),
  sortBy: zod.enum([ 'asc', 'desc' ]).describe('The sorting parameter of user.')
})

class UserResolver {
  @QueryWithZod(UserZod)
  async getUser() {
    // You can simply return an object to be parsed and if the parsing is
    // successful, then the data will be returned, otherwise an error will
    // be thrown.

    return {
      name: 'User Name',
      age: 15,
      fields: [ 'Field 1', 'Field 2' ],
      sortBy: 'asc'
    }
  }
}
```

With the example above, you will have the following generated `GraphQL` schema
type if you use `code-first` approach:

```gql
""" Represents an example user instance."""
type ExampleUser {
  """The name of the user"""
  name: String!

  """The age of the user."""
  age: Int!

  """The fields of the user"""
  fields: [String]

  """The sorting parameter of user."""
  sortBy: ExampleUser_SortByEnum_0!
}

"""The sorting parameter of user."""
enum ExampleUser_SortByEnum_0 {
  asc
  desc
}
```

### Nested Object
```ts
import * as zod from 'zod'

const UserZod = zod.object({
  name: zod.string().describe('The name of the user'),
  age: zod.number().int().gt(10).describe('The age of the user.'),
  fields: zod.string().optional().array().optional().describe('The fields of the user'),
  sortBy: zod.enum([ 'asc', 'desc' ]).describe('The sorting parameter of user.'),
  settings: zod.object({
    darkTheme: zod.boolean().optional().describe('The dark theme setting'),
    ratio: zod.number().describe('This will be float by default'),
    profile: zod.object({
      showImage: zod.boolean().describe('Indicates whether the user is showing images.'),
    }).describe('UserProfileSetting: Represents user profile settings.'),
  }).describe('ExampleUserSettings: The user settings.'),
}).describe('ExampleUser: Represents an example user instance.')

class UserResolver {
  @QueryWithZod(UserZod)
  async getUser() {
    // You can simply return an object to be parsed and if the parsing is
    // successful, then the data will be returned, otherwise an error will
    // be thrown.

    return {
      name: 'User Name',
      age: 15,
      fields: [ 'Field 1', 'Field 2' ],
      sortBy: 'asc',
      settings: {
        darkTheme: false,
        ratio: 2.5,
        profile: {
          showImage: true
        }
      }
    }
  }
}
```

With the example above, you will have the following generated `GraphQL` schema
type if you use `code-first` approach:

```gql
""" Represents an example user instance."""
type ExampleUser {
  """The name of the user"""
  name: String!

  """The age of the user."""
  age: Int!

  """The fields of the user"""
  fields: [String]

  """The sorting parameter of user."""
  sortBy: ExampleUser_SortByEnum_0!

  """ExampleUserSettings: The user settings."""
  settings: ExampleUser_Settings!
}

"""The sorting parameter of user."""
enum ExampleUser_SortByEnum_0 {
  asc
  desc
}

"""ExampleUserSettings: The user settings."""
type ExampleUser_Settings {
  """The dark theme setting"""
  darkTheme: Boolean

  """This will be float by default"""
  ratio: Float!

  """UserProfileSetting: Represents user profile settings."""
  profile: ExampleUser_Settings_Profile!
}

"""UserProfileSetting: Represents user profile settings."""
type ExampleUser_Settings_Profile {
  """Indicates whether the user is showing images."""
  showImage: Boolean!
}
```

# Support
To support the project, you can send donations to following addresses:

```md
- Bitcoin     : bc1qtut2ss8udkr68p6k6axd0na6nhvngm5dqlyhtn
- Bitcoin Cash: qzmmv43ztae0tfsjx8zf4wwnq3uk6k7zzgcfr9jruk
- Ether       : 0xf542BED91d0218D9c195286e660da2275EF8eC84
```
