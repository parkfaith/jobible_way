import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth } from './firebase'
import { api } from './api'
import { today } from './date'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        // 유저 레코드 upsert (최초 로그인 시 생성, 이후 이름 업데이트)
        try {
          await api.post('/api/me', {
            name: firebaseUser.displayName ?? '',
            email: firebaseUser.email ?? '',
            startDate: today(),
          })
        } catch {
          // 유저 등록 실패해도 앱은 동작하도록
        }
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signOut = () => firebaseSignOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
