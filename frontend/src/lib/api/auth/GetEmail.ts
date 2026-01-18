import { fetchData } from '../FetchData'

/**
 * メールアドレスを取得する関数
 *
 * @param token - トークン
 * @returns メールアドレス
 */
export const getEmail = async (token: string) => {
  const response: { email: string } = await fetchData('/email', {
    token: token,
  })
  return response
}
