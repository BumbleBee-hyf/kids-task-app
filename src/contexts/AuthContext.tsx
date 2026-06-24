import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { User } from '../types'
import { userStorage, sessionStorage } from '../services/storageService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    username: string,
    password: string,
    displayName: string,
    role: 'student' | 'parent',
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化：从后端恢复登录状态
  useEffect(() => {
    const restore = async () => {
      const userId = sessionStorage.getCurrentUserId()
      if (userId) {
        const found = await userStorage.getById(userId)
        if (found) setUser(found)
      }
      setIsLoading(false)
    }
    restore()
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const found = await userStorage.getByUsername(username)
    if (!found) {
      return { success: false, error: '用户名不存在' }
    }
    if (found.password !== password) {
      return { success: false, error: '密码错误' }
    }
    setUser(found)
    sessionStorage.setCurrentUser(found.id)
    return { success: true }
  }, [])

  const register = useCallback(
    async (username: string, password: string, displayName: string, role: 'student' | 'parent') => {
      const existing = await userStorage.getByUsername(username)
      if (existing) {
        return { success: false, error: '用户名已存在' }
      }
      if (password.length < 4) {
        return { success: false, error: '密码至少需要 4 位' }
      }
      if (!displayName.trim()) {
        return { success: false, error: '请输入显示昵称' }
      }
      const newUser = await userStorage.create({
        username,
        password,
        displayName: displayName.trim(),
        role,
      })
      setUser(newUser)
      sessionStorage.setCurrentUser(newUser.id)
      return { success: true }
    },
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.clear()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
