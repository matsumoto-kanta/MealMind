import { http, HttpResponse } from 'msw'

const API_BASE_URL = process.env.API_BASE_URL

export const authHandlers = [
  http.post(`${API_BASE_URL}/logout`, async () => {
    return HttpResponse.json({}, { status: 200 })
  }),
]
