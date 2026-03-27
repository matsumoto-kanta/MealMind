import { atom } from 'jotai'

export const showToastAtom = atom<boolean>(false)
export const toastMessageAtom = atom<string>('')
export const toastErrorMessageAtom = atom<string>('')
