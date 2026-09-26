export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    currentPage: number
    totalPages: number
    totalCount: number
    perPage: number
  }
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

/**
 * Error que rechaza el cliente HTTP. Conserva el status para que cada feature
 * pueda distinguir un 401 de un 500 y elegir su propio mensaje, en vez de
 * mostrarle al usuario el texto crudo que devolvió la API.
 */
export interface ApiRequestError extends Error {
  status?: number
}
