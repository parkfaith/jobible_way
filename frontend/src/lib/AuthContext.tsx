import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, getRedirectResult, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth } from './firebase'
import { api } from './api'
import { today } from './date'

// 슈퍼관리자 — 모든 권한 보유
const SUPER_ADMIN_EMAIL = 'parkfaith75@gmail.com'

interface AuthContextType {
  user: User | null
  loading: boolean
  canViewFellow: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  canViewFellow: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [canViewFellow, setCanViewFellow] = useState(false)

  useEffect(() => {
    // signInWithRedirect 후 돌아온 경우 결과 처리
    getRedirectResult(auth).catch(() => {})

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
        // 슈퍼관리자는 모든 권한 자동 부여, 일반 사용자는 DB 조회
        if (firebaseUser.email === SUPER_ADMIN_EMAIL) {
          setCanViewFellow(true)
        } else {
          try {
            const me = await api.get('/api/me')
            setCanViewFellow(!!me.canViewFellow)
          } catch {
            // 권한 조회 실패 시 기본값 유지
          }
        }
      } else {
        setCanViewFellow(false)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signOut = () => firebaseSignOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, canViewFellow, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
