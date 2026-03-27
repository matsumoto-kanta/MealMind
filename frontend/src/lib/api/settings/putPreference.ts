import { fetchData } from '../FetchData'
import { SettingsData, PreferenceData } from '@/types/Settings'
import { getDefaultStore } from 'jotai'
import {
  showToastAtom,
  toastMessageAtom,
  toastErrorMessageAtom,
} from '@/stores/ToastStore'
import { getErrorMessageByStatus } from '@/utils/getErrorMessageByStatus'
import { messages } from '@/constants/messages'

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
