import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import AppShell from '../components/layout/AppShell'

interface UserInfo {
  id: string
  name: string
  email: string
  lastLoginAt: string | null
  createdAt: string | null
}

// UTC datetime 문자열을 KST 표시용으로 변환
function formatKST(utcStr: string | null): string {
  if (!utcStr) return '-'
  const d = new Date(utcStr + 'Z')
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  // KST = UTC + 9
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000)
  return `${kst.getFullYear()}.${String(kst.getMonth() + 1).padStart(2, '0')}.${String(kst.getDate()).padStart(2, '0')} ${String(kst.getHours()).padStart(2, '0')}:${String(kst.getMinutes()).padStart(2, '0')}`
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [userList, setUserList] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/admin/users')
      .then(setUserList)
      .catch((err) => {
        if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
          setError('접근 권한이 없습니다.')
        } else {
          setError('데이터를 불러올 수 없습니다.')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell title="관리자">
      <div className="p-4 space-y-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--color-primary)] font-[var(--font-ui)]">
              회원 목록
            </h3>
            {!loading && !error && (
              <span className="text-xs text-[var(--color-text-secondary)] font-[var(--font-ui)]">
                총 {userList.length}명
              </span>
            )}
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--color-error)]">{error}</p>
              <button
                onClick={() => navigate('/profile')}
                className="mt-3 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] cursor-pointer"
              >
                돌아가기
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-3">
              {userList.map((u, i) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]"
                >
                  {/* 번호 */}
                  <div className="w-7 h-7 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">{i + 1}</span>
                  </div>

                  {/* 사용자 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {u.name || '(이름 없음)'}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      {u.email}
                    </p>
                  </div>

                  {/* 최종 로그인 */}
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-[var(--color-text-secondary)] leading-tight">최종 로그인</p>
                    <p className="text-xs text-[var(--color-text-primary)] font-medium">
                      {formatKST(u.lastLoginAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
