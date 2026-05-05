export type ApiFieldError = {
  field: string | null
  code: string | null
  message: string | null
}

export type ApiEnvelope<TData> = {
  success?: boolean
  isSuccess?: boolean
  message: string | null
  code?: string | null
  errorCode?: string | null
  data: TData | null
  fieldErrors?: ApiFieldError[] | null
  errors?: ApiFieldError[] | null
}

export type HttpMethod = 'GET' | 'POST' | 'PUT'

export type RequestOptions<TBody> = {
  method: HttpMethod
  path: string
  body?: TBody
  requiresAuth?: boolean
}
