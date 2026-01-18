import { atom } from 'jotai'

export const showToastAtom = atom<boolean>(false)
export const toastMessageAtom = atom<string>('')
