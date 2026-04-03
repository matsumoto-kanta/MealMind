import { fetchData } from '../FetchData'
import { SettingsData, PreferenceData } from '@/types/Settings'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

/**
 * 食の好み・アレルギー更新API
 * @param preference - 更新する好み・アレルギーデータ
 * @returns 更新後の設定データ。エラー時はnull
 */
export const putPreference = async (
  preference: PreferenceData
): Promise<SettingsData | null> => {
  const response = await fetchData('/settings/preference', undefined, {
    method: 'PUT',
    body: { ...preference },
  })

  if (response.error) {
    showErrorToast(response.error)
    return null
  }

  showSuccessToast(messages.common.toastMessage.successUpdate)
  return response.settings
}
