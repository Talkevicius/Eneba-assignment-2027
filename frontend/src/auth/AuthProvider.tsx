import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiData, ApiError } from '../api/client'
import type {
  AuthResponse,
  CurrentUserResponse,
  LoginCredentials,
  RegistrationDetails,
  User,
} from '../types/api'

const TOKEN_STORAGE_KEY = 'eneba.auth.token'
const USER_STORAGE_KEY = 'eneba.auth.user'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (details: RegistrationDetails) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser(): User | null {
  if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }

  try {
    const value: unknown = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) ?? 'null')
    if (
      typeof value === 'object' && value !== null &&
      'id' in value && typeof value.id === 'number' &&
      'name' in value && typeof value.name === 'string' &&
      'email' in value && typeof value.email === 'string'
    ) return value as User
  } catch {
    // Ignore malformed cached user data and let the API restore the session.
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser())
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)))

  function saveSession(token: string, nextUser: User) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
  }

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) return

    let active = true
    apiData<CurrentUserResponse>('/user')
      .then(({ user: restoredUser }) => {
        if (!active) return
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(restoredUser))
        setUser(restoredUser)
      })
      .catch((error: unknown) => {
        if (!active) return
        if (error instanceof ApiError && error.status === 401) {
          localStorage.removeItem(TOKEN_STORAGE_KEY)
          localStorage.removeItem(USER_STORAGE_KEY)
          setUser(null)
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [])

  async function login(credentials: LoginCredentials) {
    const result = await apiData<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    saveSession(result.token, result.user)
  }

  async function register(details: RegistrationDetails) {
    const result = await apiData<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(details),
    })
    saveSession(result.token, result.user)
  }

  async function logout() {
    try {
      if (localStorage.getItem(TOKEN_STORAGE_KEY)) {
        await apiData<{ message: string }>('/logout', { method: 'POST' })
      }
    } finally {
      clearSession()
    }
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// The hook shares the provider module so auth state has a single context owner.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within an AuthProvider.')
  return value
}
