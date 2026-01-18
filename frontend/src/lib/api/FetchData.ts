'use server'

import { messages } from '@/constants/messages'
import { ERROR_STATUS, SUCCESS_STATUS } from '@/constants/response'
import { server } from '../mocks/Server'

// MSW初期化
if (process.env.MSW_ENABLED === 'true') {
  server.listen({
    onUnhandledRequest: 'bypass',
  })
}

const API_BASE_URL = process.env.API_BASE_URL

interface QueryParams {
  [key: string]: string | number | boolean | string[] | number[]
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: { version?: number; [key: string]: unknown } | FormData
  headers?: Record<string, string>
}

export async function fetchData(
  path: string,
  params?: QueryParams,
  options?: FetchOptions
) {
  try {
    const url = new URL(`${API_BASE_URL}${path}`)
    // const cookiesStore = cookies();
    // const accessToken = (await cookiesStore).get('accessToken')?.value;
    if (
      params &&
      options?.method !== 'POST' &&
      options?.method !== 'PUT' &&
      options?.method !== 'PATCH' &&
      options?.method !== 'DELETE'
    ) {
      for (const key of Object.keys(params)) {
        if (
          params[key] !== '' &&
          params[key] !== null &&
          params[key] !== undefined
        ) {
          url.searchParams.append(key, String(params[key]))
        }
      }
    }

    const isFormData = options?.body instanceof FormData

    const fetchOptions: RequestInit = {
      method: options?.method || 'GET',
      headers: {
        // FormDataの場合はContent-Typeを設定しない（ブラウザが自動設定）
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        // ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : {})
        ...options?.headers,
      },
    }

    if (
      (options?.method === 'POST' ||
        options?.method === 'PUT' ||
        options?.method === 'PATCH' ||
        options?.method === 'DELETE') &&
      options.body
    ) {
      fetchOptions.body = isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body)
    }

    console.log('fetchData', fetchOptions)
    const response = await fetch(url.toString(), fetchOptions)
    console.log('response', response)

    if (!response.ok) {
      if (response.status === ERROR_STATUS.UNAUTHORIZED) {
        return {
          error: {
            status: response.status,
            messages: messages.common.errorMessage.unauthorized,
            errorText: `Failed to fetch ${API_BASE_URL + path} ${
              response.status
            }`,
          },
        }
      }
      if (response.status === ERROR_STATUS.FORBIDDEN) {
        return {
          error: {
            status: response.status,
            messages: messages.common.errorMessage.forbidden,
            errorText: `Failed to fetch ${API_BASE_URL + path} ${
              response.status
            }`,
          },
        }
      }
      if (response.status === ERROR_STATUS.NOT_FOUND) {
        return {
          error: {
            status: response.status,
            messages: messages.common.errorMessage.notFound,
            errorText: `Failed to fetch ${API_BASE_URL + path} ${
              response.status
            }`,
          },
        }
      }
      if (response.status === ERROR_STATUS.CONFLICT) {
        return {
          error: {
            status: response.status,
            messages: messages.common.errorMessage.conflict,
            errorText: `Failed to fetch ${API_BASE_URL + path} ${
              response.status
            }`,
          },
        }
      }
      if (response.status === ERROR_STATUS.UNPROCESSABLE_ENTITY) {
        return {
          error: {
            status: response.status,
            messages: messages.common.errorMessage.unprocessableEntity,
            errorText: `Failed to fetch ${API_BASE_URL + path} ${
              response.status
            }`,
          },
        }
      }
      if (response.status === ERROR_STATUS.INTERNAL_SERVER_ERROR) {
        return {
          error: {
            status: response.status,
            messages: messages.common.errorMessage.internalServerError,
            errorText: `Failed to fetch ${API_BASE_URL + path} ${
              response.status
            }`,
          },
        }
      }

      return {
        error: {
          status: response.status,
          messages: messages.common.errorMessage.otherError,
          errorText: `Failed to fetch ${API_BASE_URL + path} ${
            response.status
          }`,
        },
      }
    }

    if (response.status === SUCCESS_STATUS.NO_CONTENT) {
      return {}
    }
    const data = [
      '/competitions/entries/template',
      '/competitions/salse/export',
    ].includes(path)
      ? await response.text()
      : await response.json()
    return data
  } catch (error: unknown) {
    console.log('error', error)
    return {
      error: {
        status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
        messages: messages.common.errorMessage.error,
        errorText:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
    }
  }
}
