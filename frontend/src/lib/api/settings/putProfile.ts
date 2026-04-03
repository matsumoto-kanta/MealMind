import { fetchData } from '../FetchData'
import { SettingsData, ProfileData } from '@/types/Settings'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

/**
 * プロフィール更新API
 * @param profile - 更新するプロフィールデータ
 * @returns 更新後の設定データ。エラー時はnull
 */
export const putProfile = async (
  profile: ProfileData
): Promise<SettingsData | null> => {
  const response = await fetchData('/settings/profile', undefined, {
    method: 'PUT',
    body: { ...profile },
  })

  if (response.error) {
    showErrorToast(response.error)
    return null
  }

  showSuccessToast(messages.common.toastMessage.successUpdate)
  return response.settings
}
