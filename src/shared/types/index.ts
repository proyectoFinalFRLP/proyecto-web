export type ID = string | number

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export interface Option<T = string> {
  label: string
  value: T
}
