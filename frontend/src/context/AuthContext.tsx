import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

type AuthState = {
  user: null
  isAuthenticated: false
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: false,
  login: () => undefined,
  logout: () => undefined,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: null,
        isAuthenticated: false,
        login: () => undefined,
        logout: () => undefined,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
