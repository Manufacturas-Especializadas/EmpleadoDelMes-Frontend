/** GUID serializado por ASP.NET; no implica validación en tiempo de ejecución. */
export type Identifier = string
export interface PaginationParams {
  pageNumber: number
  pageSize: number
}
export interface PaginatedResponse<T> extends PaginationParams {
  items: T[]
  total: number
}
