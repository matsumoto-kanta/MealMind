import { fetchData } from '../FetchData'
import { SettingsData, GoalData } from '@/types/Settings'
import { getDefaultStore } from 'jotai'
import {
  showToastAtom,
  toastMessageAtom,
  toastErrorMessageAtom,
} from '@/stores/ToastStore'
import { getErrorMessageByStatus } from '@/utils/getErrorMessageByStatus'
import { messages } from '@/constants/messages'

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

  const store = getDefaultStore()

  if (response.error) {
    store.set(
      toastErrorMessageAtom,
      response?.error?.messages ??
        getErrorMessageByStatus(response?.error?.status)
    )
    store.set(toastMessageAtom, '')
    store.set(showToastAtom, true)
    return null
  }

  store.set(toastMessageAtom, messages.common.toastMessage.successUpdate)
  store.set(toastErrorMessageAtom, '')
  store.set(showToastAtom, true)
  return response.settings
}
