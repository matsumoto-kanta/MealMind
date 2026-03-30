import {
  SettingsData,
  ProfileData,
  GoalData,
  PreferenceData,
} from '@/types/Settings'
import { http, HttpResponse } from 'msw'

const API_BASE_URL = process.env.API_BASE_URL

let settings: SettingsData = {
  profile: {
    gender: 'male',
    age: 28,
    height: 172,
    weight: 68,
    activityLevel: 'medium',
  },
  goal: {
    targetWeight: 63,
    targetPeriodMonths: 6,
  },
  preference: {
    dislikedFoods: ['パクチー', 'セロリ', 'パセリ', '牡蠣'],
    allergies: ['えび', 'かに'],
  },
}

export const settingsHandlers = [
  http.get(`${API_BASE_URL}/settings`, async () => {
    return HttpResponse.json({ settings }, { status: 200 })
  }),

  http.put(`${API_BASE_URL}/settings/profile`, async ({ request }) => {
    const body = (await request.json()) as ProfileData
    settings = {
      ...settings,
      profile: body,
    }
    return HttpResponse.json({ settings }, { status: 200 })
  }),

  http.put(`${API_BASE_URL}/settings/goal`, async ({ request }) => {
    const body = (await request.json()) as GoalData
    settings = {
      ...settings,
      goal: body,
    }
    return HttpResponse.json({ settings }, { status: 200 })
  }),

  http.put(`${API_BASE_URL}/settings/preference`, async ({ request }) => {
    const body = (await request.json()) as PreferenceData
    settings = {
      ...settings,
      preference: body,
    }
    return HttpResponse.json({ settings }, { status: 200 })
  }),
]
