declare type UnionToTuple<U> = UnionToTuple_<U> extends infer X ? Cast<X, List> : never

declare type Mapper<X extends object>
  = { [ K in keyof X ]?: readonly string | number | symbol }

declare type MapKeys<T extends object, Map extends { [ K in keyof T ]?: string | number | symbol }>
  = Omit<T, keyof Map> & MapKeyArray<T, Map, UnionToTuple<keyof Map>>

type MapKeyArray<Source extends object, Mapper extends { [ K in keyof Source ]: string }, A extends (keyof Source)[]>
  = A extends [ infer F, ...infer R ]
  ? { [ K in Mapper[ F ] ]: Source[ F ] } & MapKeyArray<Source, Mapper, R> : {}

type List<A = any> = ReadonlyArray<A>

type Cast<A, B> = A extends B ? A : B

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never

type Extends<A, B> = [ A ] extends [ never ] ? 0 : A extends B ? 1 : 0

type Prepend<L extends List, A> = [ A, ...L ]

type Last<U> = UnionToIntersection<U extends unknown ? (x: U) => void : never> extends (x: infer P) => void ? P : never

type UnionToTuple_<U, LN extends List = [], LastU = Last<U>> = Extends<[ U ], [ never ]> extends 0
  ? UnionToTuple_<Exclude<U, LastU>, Prepend<LN, LastU>>
  : LN
