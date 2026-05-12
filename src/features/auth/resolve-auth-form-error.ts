import type { TFunction } from 'i18next'

import { ApiError } from '../../api/core/client'

/** Backend `LoginSystemUserAuthenticationFailed` */
export const SYSTEM_USER_LOGIN_AUTH_FAILED_CODE = 'AZX_ADA_APP_VAL_925'

const LOGIN_EMAIL_REQUIRED = 'AZX_ADA_APP_VAL_310'
const LOGIN_DEVICE_REQUIRED = 'AZX_ADA_APP_VAL_311'
const LOGIN_PASSWORD_REQUIRED = 'AZX_ADA_APP_VAL_312'
const LOGIN_TYPE_REQUIRED = 'AZX_ADA_APP_VAL_977'

const REQUEST_VALIDATION_FAILED = 'AZX_CORE_021'
const SERVER_INTERNAL = 'AZX_CORE_INTERNAL'

export type ResolveAuthFormErrorOptions = {
  /** Admin login page vs employer/worker modal — copy for `925` differs slightly. */
  loginVariant?: 'admin' | 'portal'
}

/** Client-side checks before calling `SystemUsers/Login`. */
export function validateLoginFields(email: string, password: string, t: TFunction): string | null {
  const trimmed = email.trim()
  if (!trimmed) {
    return t('auth.validation.emailRequired')
  }
  const basicEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!basicEmail.test(trimmed)) {
    return t('auth.validation.emailInvalid')
  }
  if (!password) {
    return t('auth.validation.passwordRequired')
  }
  return null
}

function collectValidationLines(err: ApiError): string[] {
  const raw = err.fieldErrors as unknown
  if (!Array.isArray(raw) || raw.length === 0) {
    return []
  }
  const out: string[] = []
  for (const item of raw as unknown[]) {
    if (typeof item === 'string' && item.trim()) {
      out.push(item.trim())
    } else if (item && typeof item === 'object' && 'message' in item) {
      const m = (item as { message?: string | null }).message
      if (m?.trim()) out.push(m.trim())
    }
    if (out.length >= 4) break
  }
  return out
}

export function resolveAuthFormError(
  error: unknown,
  t: TFunction,
  options?: ResolveAuthFormErrorOptions,
): string {
  const loginVariant = options?.loginVariant ?? 'portal'

  if (error instanceof ApiError) {
    if (error.code === 'AUTH_NOT_CONFIGURED') {
      return t('auth.feedback.authNotConfigured')
    }

    if (error.code === SYSTEM_USER_LOGIN_AUTH_FAILED_CODE) {
      return loginVariant === 'admin'
        ? t('auth.feedback.loginInvalidCredentialsAdmin')
        : t('auth.feedback.loginInvalidCredentials')
    }

    if (error.code === REQUEST_VALIDATION_FAILED) {
      const lines = collectValidationLines(error)
      if (lines.length > 0) {
        return t('auth.feedback.validationRequestFailedDetail', { detail: lines.join(' · ') })
      }
      return t('auth.feedback.validationRequestFailed')
    }

    switch (error.code) {
      case LOGIN_EMAIL_REQUIRED:
        return t('auth.feedback.serverLoginEmailRequired')
      case LOGIN_PASSWORD_REQUIRED:
        return t('auth.feedback.serverLoginPasswordRequired')
      case LOGIN_DEVICE_REQUIRED:
        return t('auth.feedback.serverLoginDeviceRequired')
      case LOGIN_TYPE_REQUIRED:
        return t('auth.feedback.serverLoginTypeRequired')
      case SERVER_INTERNAL:
        return t('auth.feedback.serverInternalError')
      default:
        break
    }

    if (error.message?.trim() && error.message !== 'API request failed.') {
      return t('auth.feedback.serverErrorWithMessage', { message: error.message.trim() })
    }
  }

  if (error instanceof TypeError) {
    return t('auth.feedback.loginNetworkError')
  }

  return t('auth.feedback.genericError')
}
