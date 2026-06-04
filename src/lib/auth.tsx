// src/lib/auth.tsx
'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from './api'

interface User { id: string; name: string; email: string; role: string }
interface Tenant { id: string; name: string; slug: string; plan: string; creditsBalance: number }
interface AuthCtx {
  user: User | null
  tenant: Tenant | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const t = localStorage.getItem('dsms_token')
    const u = localStorage.getItem('dsms_user')
    const ten = localStorage.getItem('dsms_tenant')
    if (t && u) {
      setToken(t)
      setUser(JSON.parse(u))
      setTenant(ten ? JSON.parse(ten) : null)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login(email, password)
    localStorage.setItem('dsms_token', data.accessToken)
    localStorage.setItem('dsms_user', JSON.stringify(data.user))
    localStorage.setItem('dsms_tenant', JSON.stringify(data.tenant))
    setToken(data.accessToken)
    setUser(data.user)
    setTenant(data.tenant)
    router.push('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('dsms_token')
    localStorage.removeItem('dsms_user')
    localStorage.removeItem('dsms_tenant')
    setToken(null); setUser(null); setTenant(null)
    router.push('/login')
  }

  const isAdmin = tenant?.slug === 'disparesms-admin'

  return (
    <AuthContext.Provider value={{ user, tenant, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
