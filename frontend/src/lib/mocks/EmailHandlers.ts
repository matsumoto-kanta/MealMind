import { http, HttpResponse } from 'msw'

const API_BASE_URL = process.env.API_BASE_URL

export const emailHandlers = [
  http.get(`${API_BASE_URL}/email`, async () => {
    return HttpResponse.json({ email: 'test@test.com' }, { status: 200 })
  }),
]
