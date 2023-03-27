import type { ReturnTypeFunc } from '@nestjs/graphql'
import type { SupportedOptionTypes } from './zod-options-wrapper.interface'
import type { AnyZodObject } from 'zod'
import type { Type } from '@nestjs/common'

/**
 * Describes a dynamically built class out of the given zod validation object.
 */
export type DynamicZodModelClass<T extends AnyZodObject> = Type<T>

type Decorators = MethodDecorator | ClassDecorator | ParameterDecorator

/**
 * Describes a factory with no input.
 */
export type NoInputDecoratorFactory<T extends Decorators> = (() => T)

/**
 * Describes a factory that takes a string input.
 */
export type NameInputDecoratorFactory<T extends Decorators> = ((name: string) => T)

/**
 * Describes a factory that takes an option.
 */
export type OptionInputDecoratorFactory<
  O extends SupportedOptionTypes,
  T extends Decorators
  > = ((options?: O) => T)

/**
 * Describes a factory that takes a type function and an optional option.
 */
export type TypeOptionInputDecoratorFactory<
  O extends SupportedOptionTypes,
  T extends Decorators
  > = ((typeFunc: ReturnTypeFunc, options?: O) => T)

type DefaultDecoratorFactory<
  O extends SupportedOptionTypes,
  T extends Decorators
  > = NoInputDecoratorFactory<T>
  | NameInputDecoratorFactory<T>
  | OptionInputDecoratorFactory<O, T>

/**
 * Describes a factory with no input.
 */
export type NoInputMethodDecoratorFactory
  = NoInputDecoratorFactory<MethodDecorator>

/**
 * Describes a factory that takes a string input.
 */
export type NameInputMethodDecoratorFactory
  = NameInputDecoratorFactory<MethodDecorator>

/**
 * Describes a factory that takes an option.
 */
export type OptionInputMethodDecoratorFactory<O extends SupportedOptionTypes>
  = OptionInputDecoratorFactory<O, MethodDecorator>

/**
 * Describes a factory that takes an option.
 */
export type TypeOptionInputMethodDecoratorFactory<
  O extends SupportedOptionTypes
  > = TypeOptionInputDecoratorFactory<O, MethodDecorator>

/**
 * Describes a method decorator function of GraphQL.
 */
export type GraphQLMDF<O extends SupportedOptionTypes>
  = DefaultDecoratorFactory<O, MethodDecorator>

/**
 * Describes a method decorator with type function support of GraphQL.
 */
export type GraphQLMDFWithType<O extends SupportedOptionTypes>
  = GraphQLMDF<O>
  | TypeOptionInputMethodDecoratorFactory<O>

/**
 * Describes a class decorator function of GraphQL.
 */
export type GraphQLCDF<O extends SupportedOptionTypes>
  = DefaultDecoratorFactory<O, ClassDecorator>
