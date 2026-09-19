import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiRequest } from '../lib/api'
import type { LoginResponse, Role, User } from '../types/api'

interface Session {
  token: string | null
  user: User
  demo: boolean
}

interface AuthContextValue {
  token: string | null
  user: User | null
  isDemo: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  enterDemo: (role: Role) => User
  logout: () => void
}

const STORAGE_KEY = 'agroleak.session.v1'
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredSession(): Session | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (!value) return null
    const parsed = JSON.parse(value) as Session
    if (!parsed.user?.email || !parsed.user?.role) return null
    return parsed
  } catch {
    return null
  }
}

function demoUser(role: Role): User {
  return {
    id: role === 'ADMIN' ? 'demo-admin' : 'demo-producer',
    email: role === 'ADMIN' ? 'admin@agroleak.demo' : 'productor@agroleak.demo',
    fullName: role === 'ADMIN' ? 'AgroLeak Admin' : 'María Torres',
    role,
    active: true,
    createdAt: new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readStoredSession())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const validateSession = async () => {
      if (!session || session.demo || !session.token) {
        setIsLoading(false)
        return
      }
      try {
        const user = await apiRequest<User>('/auth/me', { token: session.token })
        const validated = { ...session, user }
        setSession(validated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validated))
      } catch {
        setSession(null)
        localStorage.removeItem(STORAGE_KEY)
      } finally {
        setIsLoading(false)
      }
    }
    void validateSession()
    // Session validation is intentionally performed only on application start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    const nextSession: Session = {
      token: response.accessToken,
      user: response.user,
      demo: false,
    }
    setSession(nextSession)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
    return response.user
  }

  const enterDemo = (role: Role) => {
    const user = demoUser(role)
    const nextSession: Session = { token: null, user, demo: true }
    setSession(nextSession)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
    return user
  }

  const logout = () => {
    setSession(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      isDemo: session?.demo ?? false,
      isLoading,
      login,
      enterDemo,
      logout,
    }),
    [session, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
