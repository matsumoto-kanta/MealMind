import { messages } from '@/constants/messages'

/**
 * HTTPステータスコードに対応するエラーメッセージを返す
 * @param status - HTTPステータスコード
 * @returns ステータスコードに対応するエラーメッセージ。該当しない場合は汎用エラーメッセージ
 */
export const getErrorMessageByStatus = (status: number): string => {
  const errorMessages = messages.common.errorMessage

  switch (status) {
    case 401:
      return errorMessages.unauthorized
    case 403:
      return errorMessages.forbidden
    case 404:
      return errorMessages.notFound
    case 409:
      return errorMessages.conflict
    case 422:
      return errorMessages.unprocessableEntity
    case 500:
      return errorMessages.internalServerError
    default:
      return errorMessages.otherError
  }
}
