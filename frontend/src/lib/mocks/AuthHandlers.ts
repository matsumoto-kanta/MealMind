import { http, HttpResponse } from 'msw'

const API_BASE_URL = process.env.API_BASE_URL

export const authHandlers = [
  // ログアウト
  http.post(`${API_BASE_URL}/auth/logout`, async () => {
    return HttpResponse.json({}, { status: 200 })
  }),

  // 現在のユーザー情報取得
  http.get(`${API_BASE_URL}/auth/me`, async () => {
    // ダミーユーザー情報を返却
    return HttpResponse.json(
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        name: 'テストユーザー',
        picture: 'https://via.placeholder.com/150',
      },
      { status: 200 }
    )
  }),
]
