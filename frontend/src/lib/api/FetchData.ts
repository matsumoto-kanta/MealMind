'use server'

import { cookies } from 'next/headers'
import { messages } from '@/constants/messages'
import { ERROR_STATUS, SUCCESS_STATUS } from '@/constants/response'
import { server } from '../mocks/Server'

// MSW初期化
if (process.env.MSW_ENABLED === 'true') {
  server.listen({
    onUnhandledRequest: 'bypass',
  })
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
    const cookiesStore = await cookies()
    const accessToken = cookiesStore.get('accessToken')?.value

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
      credentials: 'include', // Cookie送信を有効化
      headers: {
        // FormDataの場合はContent-Typeを設定しない（ブラウザが自動設定）
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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

    const response = await fetch(url.toString(), fetchOptions)

    if (!response.ok) {
      // レスポンスボディからdetailメッセージを取得（存在する場合）
      let errorDetail: string | null = null
      try {
        const errorBody = await response.json()
        errorDetail = errorBody?.detail || null
      } catch {
        // JSONパースに失敗した場合は無視
      }

      // ステータスコードとエラーメッセージのマッピング
      const errorMessageMap: Record<number, string> = {
        [ERROR_STATUS.UNAUTHORIZED]: messages.common.errorMessage.unauthorized,
        [ERROR_STATUS.FORBIDDEN]: messages.common.errorMessage.forbidden,
        [ERROR_STATUS.NOT_FOUND]: messages.common.errorMessage.notFound,
        [ERROR_STATUS.CONFLICT]: messages.common.errorMessage.conflict,
        [ERROR_STATUS.UNPROCESSABLE_ENTITY]:
          messages.common.errorMessage.unprocessableEntity,
        [ERROR_STATUS.INTERNAL_SERVER_ERROR]:
          messages.common.errorMessage.internalServerError,
      }

      const defaultMessage =
        errorMessageMap[response.status] ||
        messages.common.errorMessage.otherError

      return {
        error: {
          status: response.status,
          messages: errorDetail || defaultMessage,
          errorText: `Failed to fetch ${API_BASE_URL + path} ${response.status}`,
        },
      }
    }

    if (response.status === SUCCESS_STATUS.NO_CONTENT) {
      return {}
    }

    const data = await response.json()
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
