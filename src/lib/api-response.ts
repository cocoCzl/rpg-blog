import config from '../../site.config'
import { t } from './i18n'

export const JSON_HEADER = { 'Content-Type': 'application/json' }

export function jsonError(message: string, status = 400, code?: string) {
  return new Response(JSON.stringify({ error: message, code }), {
    status,
    headers: JSON_HEADER,
  })
}

export function jsonSuccess(data: Record<string, unknown> = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADER,
  })
}

export function apiText(key: string) {
  return t(key, config.locale)
}
