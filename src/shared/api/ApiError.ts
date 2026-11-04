export class ApiError extends Error {
  readonly status: number
  readonly details: unknown
  readonly fieldErrors: Record<string, string[]>
  constructor(
    status: number,
    message: string,
    details?: unknown,
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.fieldErrors = fieldErrors
  }
}
