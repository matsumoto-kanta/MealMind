import { fetchData } from '../FetchData'
import { SettingsData, ProfileData } from '@/types/Settings'
import { getDefaultStore } from 'jotai'
import {
  showToastAtom,
  toastMessageAtom,
  toastErrorMessageAtom,
} from '@/stores/ToastStore'
import { getErrorMessageByStatus } from '@/utils/getErrorMessageByStatus'
import { messages } from '@/constants/messages'

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
