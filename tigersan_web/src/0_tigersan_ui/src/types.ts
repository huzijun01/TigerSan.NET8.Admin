// Action:
export type Action = () => any
export type TAction<T> = () => T
export type NumberAction = () => number
export type StringAction = () => string
export type ObjectAction = () => object
export type BooleanAction = () => boolean
export type ActionAsync = () => Promise<void>
export type TObjectAction<T extends object> = () => T
export type NumberActionAsync = () => Promise<number>
export type ObjectActionAsync = () => Promise<object>
export type StringActionAsync = () => Promise<string>
export type BooleanActionAsync = () => Promise<boolean>

// Func:
export type TFunc<T> = (value: T) => any
export type NumberFunc = (num: number) => any
export type StringFunc = (str: string) => any
export type ObjectFunc = (obj: object) => any
export type BooleanFunc = (bool: boolean) => any
export type UnknownFunc = (value: unknown) => any
export type TFuncAsync<T> = (value: T) => Promise<void>
export type NumberFuncAsync = (num: number) => Promise<void>
export type StringFuncAsync = (str: string) => Promise<void>
export type ObjectFuncAsync = (obj: object) => Promise<void>
export type BooleanFuncAsync = (bool: boolean) => Promise<void>
export type UnknownFuncAsync = (value: unknown) => Promise<void>

// Array Func:
export type TArrayFunc<T> = (arr: T[]) => any
export type NumberArrayFunc = (arr: number[]) => any
export type StringArrayFunc = (arr: string[]) => any
export type ObjectArrayFunc = (arr: object[]) => any
export type BooleanArrayFunc = (arr: boolean[]) => any
export type UnknownArrayFunc = (arr: unknown[]) => any
export type TObjectArrayFunc<T extends object> = (arr: T[]) => any

// string getter:
export type T2String<T> = (value: T) => string
export type Any2String = (value: any) => string
export type Object2String = (obj?: object) => string

// getter\setter:
export type BooleanGetter = (obj: object) => boolean
export type BooleanSetter = (obj: object, bool: boolean) => any
export type StringGetter = (obj: object, propName: string) => string
export type UnknownGetter = (obj: object, propName: string) => unknown
export type UnknownSetter = (obj: object, propName: string, value: unknown) => any
export type TStringGetter<TSource extends object> = (obj: TSource, propName: string) => string
export type TStringGetterAsync<TSource extends object> = (obj: TSource, propName: string) => Promise<string>
export type TGetter<TSource extends object, TTarget> = (obj: TSource, propName: string) => TTarget | undefined
export type TGetterAsync<TSource extends object, TTarget> = (obj: TSource, propName: string) => Promise<TTarget | undefined>
export type TSetter<TSource extends object, TTarget> = (obj: TSource, propName: string, value: TTarget) => any

// change:
export type TChange<T> = (value: T, oldValue?: T) => any
export type UnknownChange = (value: unknown, oldValue?: unknown) => any

// Other:
export const AnyTypes = [String, Number, Boolean, Object, Array, Symbol, Function, Date, null, undefined]