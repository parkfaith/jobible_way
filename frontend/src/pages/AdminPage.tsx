import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import AppShell from '../components/layout/AppShell'

interface UserInfo {
  id: string
  name: string
  email: string
  canViewFellow: number | null
  lastLoginAt: string | null
  createdAt: string | null
}

// KST datetime 문자열 포맷 (DB에 이미 KST로 저장됨)
function formatDatetime(str: string | null): string {
  if (!str) return '-'
  // "2026-03-02 17:30:00" → "2026.03.02 17:30"
  return str.replace(/-/g, '.').slice(0, 16)
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [userList, setUserList] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

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

                  {/* 제자동역자 열람 권한 */}
                  <label
                    className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] text-[var(--color-text-secondary)] leading-tight">동역자</span>
                    <input
                      type="checkbox"
                      checked={!!u.canViewFellow}
                      onChange={async () => {
                        const next = !u.canViewFellow
                        // 낙관적 업데이트
                        setUserList((prev) =>
                          prev.map((item) =>
                            item.id === u.id ? { ...item, canViewFellow: next ? 1 : 0 } : item
                          )
                        )
                        try {
                          await api.patch(`/api/admin/users/${u.id}/fellow`, { canViewFellow: next })
                          setToast(`${u.name || '사용자'}님의 권한이 변경되었습니다. 해당 사용자가 재로그인하면 적용됩니다.`)
                          setTimeout(() => setToast(''), 4000)
                        } catch {
                          // 실패 시 롤백
                          setUserList((prev) =>
                            prev.map((item) =>
                              item.id === u.id ? { ...item, canViewFellow: next ? 0 : 1 } : item
                            )
                          )
                        }
                      }}
                      className="w-4 h-4 accent-[var(--color-secondary)] cursor-pointer"
                    />
                  </label>

                  {/* 최종 로그인 */}
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-[var(--color-text-secondary)] leading-tight">최종 로그인</p>
                    <p className="text-xs text-[var(--color-text-primary)] font-medium">
                      {formatDatetime(u.lastLoginAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 권한 변경 안내 토스트 */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-[90vw]">
          <div className="bg-[var(--color-surface)] border border-[var(--color-secondary)]/30 rounded-xl px-4 py-3 shadow-lg">
            <p className="text-xs text-[var(--color-text-primary)] text-center leading-relaxed">{toast}</p>
          </div>
        </div>
      )}
    </AppShell>
  )
}
