import { atom } from 'jotai'

/**
 * 献立生成中のローディング状態
 */
export const isGeneratingAtom = atom<boolean>(false)

/**
 * 献立再生成中のカードIDを管理
 * nullの場合は再生成していない
 */
export const loadingCardIdAtom = atom<string | null>(null)

/**
 * いずれかのローディング状態がtrueかどうかを判定
 */
export const isAnyLoadingAtom = atom((get) => {
  const isGenerating = get(isGeneratingAtom)
  const loadingCardId = get(loadingCardIdAtom)
  return isGenerating || loadingCardId !== null
})
