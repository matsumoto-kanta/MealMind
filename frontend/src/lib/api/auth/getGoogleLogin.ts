/**
 * Google OAuth認証を開始する
 * バックエンドの /auth/google エンドポイントにリダイレクトします
 */
export const getGoogleLogin = () => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  window.location.href = `${API_BASE_URL}/auth/google`
}
