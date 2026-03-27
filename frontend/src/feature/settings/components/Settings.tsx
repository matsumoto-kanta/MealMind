'use client'

import { useState } from 'react'
import { SettingsData, ProfileData, PreferenceData } from '@/types/Settings'
import Profile from './item/Profile'
import Goal from './item/Goal'
import Preference from './item/Preference'
import Logout from './item/Logout'
import EditProfileDrawer from './drawer/EditProfileDrawer'
import EditGoalDrawer from './drawer/EditGoalDrawer'
import EditPreferenceDrawer from './drawer/EditPreferenceDrawer'
import { putProfile } from '@/lib/api/settings/putProfile'
import { putGoal } from '@/lib/api/settings/putGoal'
import { putPreference } from '@/lib/api/settings/putPreference'

interface SettingsProps {
  settings: SettingsData
}

export default function Settings({ settings }: SettingsProps) {
  const [data, setData] = useState<SettingsData>(settings)
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)
  const [goalDrawerOpen, setGoalDrawerOpen] = useState(false)
  const [preferenceDrawerOpen, setPreferenceDrawerOpen] = useState(false)

  // プロフィール更新
  const handleSaveProfile = async (profile: ProfileData) => {
    const response = await putProfile(profile)
    if (response) {
      setData(response)
    }
  }

  // 目標更新
  const handleSaveGoal = async (targetWeight: number) => {
    const response = await putGoal({ targetWeight })
    if (response) {
      setData(response)
    }
  }

  // 食の好み・アレルギー更新
  const handleSavePreference = async (preference: PreferenceData) => {
    const response = await putPreference(preference)
    if (response) {
      setData(response)
    }
  }

  return (
    <div className="flex flex-col gap-7 pb-3">
      {/* プロフィール */}
      <Profile
        profile={data.profile}
        onEdit={() => setProfileDrawerOpen(true)}
      />

      {/* 目標 */}
      <Goal
        goal={data.goal}
        currentWeight={data.profile.weight}
        onEdit={() => setGoalDrawerOpen(true)}
      />

      {/* 食の好み・アレルギー */}
      <Preference
        preference={data.preference}
        onEdit={() => setPreferenceDrawerOpen(true)}
      />

      {/* プロフィール設定ドロワー */}
      <EditProfileDrawer
        open={profileDrawerOpen}
        setOpen={setProfileDrawerOpen}
        profile={data.profile}
        onSave={handleSaveProfile}
      />

      {/* 目標設定ドロワー */}
      <EditGoalDrawer
        open={goalDrawerOpen}
        setOpen={setGoalDrawerOpen}
        currentTargetWeight={data.goal.targetWeight}
        onSave={handleSaveGoal}
      />

      {/* 食の好み・アレルギー設定ドロワー */}
      <EditPreferenceDrawer
        open={preferenceDrawerOpen}
        setOpen={setPreferenceDrawerOpen}
        preference={data.preference}
        onSave={handleSavePreference}
      />

      {/* ログアウト */}
      <Logout />
    </div>
  )
}
