import { fetchData } from '../FetchData'
import { SettingsData } from '@/types/Settings'

/**
 * 設定取得API
 * @returns 設定データ
 */
export const getSettings = async () => {
  const response: { settings: SettingsData } = await fetchData('/settings')
  return response.settings
}
