export type Gender = 'male' | 'female' | 'other'
export type ActivityLevel = 'low' | 'medium' | 'high'

export interface ProfileData {
  gender: Gender
  age: number
  height: number
  weight: number
  activityLevel: ActivityLevel
}

export interface GoalData {
  targetWeight: number
}

export interface PreferenceData {
  dislikedFoods: string[]
  allergies: string[]
}

export interface SettingsData {
  profile: ProfileData
  goal: GoalData
  preference: PreferenceData
}
