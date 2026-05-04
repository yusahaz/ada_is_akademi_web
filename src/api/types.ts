export type ApiFieldError = {
  field: string | null
  code: string | null
  message: string | null
}

export type ApiEnvelope<TData> = {
  success: boolean
  message: string | null
  code: string | null
  data: TData | null
  fieldErrors: ApiFieldError[] | null
}

export type HttpMethod = 'GET' | 'POST' | 'PUT'

export type RequestOptions<TBody> = {
  method: HttpMethod
  path: string
  body?: TBody
  requiresAuth?: boolean
}
