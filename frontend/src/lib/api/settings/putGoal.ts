import { fetchData } from '../FetchData'
import { SettingsData, GoalData } from '@/types/Settings'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

/**
 * 目標設定更新API
 * @param goal - 更新する目標データ
 * @returns 更新後の設定データ。エラー時はnull
 */
export const putGoal = async (goal: GoalData): Promise<SettingsData | null> => {
  const response = await fetchData('/settings/goal', undefined, {
    method: 'PUT',
    body: { ...goal },
  })

  if (response.error) {
    showErrorToast(response.error)
    return null
  }

  showSuccessToast(messages.common.toastMessage.successUpdate)
  return response.settings
}
