import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export interface User {
  id: string
  email: string
  name?: string
  picture?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

/**
 * 認証状態を管理するJotai atom
 * localStorageに永続化されます
 */
export const authAtom = atomWithStorage<AuthState>('auth', {
  user: null,
  isLoading: true,
  isAuthenticated: false,
})
