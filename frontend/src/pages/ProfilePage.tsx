import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { api } from '../lib/api'
import AppShell from '../components/layout/AppShell'
import Button from '../components/ui/Button'

interface StreakData {
  currentStreak: number
  maxStreak: number
  totalDone: number
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, maxStreak: 0, totalDone: 0 })

  useEffect(() => {
    api.get('/api/progress/streak').then(setStreak).catch(() => {})
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <AppShell title="내 프로필">
      <div className="p-4 space-y-4">
        {/* 프로필 정보 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="프로필"
              className="w-20 h-20 rounded-full mx-auto mb-3"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center text-[var(--color-secondary)] text-2xl font-[var(--font-heading)] mx-auto mb-3">
              {user?.displayName?.[0] ?? '?'}
            </div>
          )}
          <h2 className="text-lg font-semibold text-[var(--color-primary)] font-[var(--font-heading)]">
            {user?.displayName ?? '훈련생'}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {user?.email}
          </p>
        </div>

        {/* 훈련 현황 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[var(--color-primary)] font-[var(--font-ui)] mb-3">훈련 현황</h3>
          <div className="space-y-3">
            <InfoRow label="훈련 과정" value="제2기 제자훈련" />
            <InfoRow label="현재 주차" value="1주차" />
            <InfoRow label="연속 달성" value={`${streak.currentStreak}일`} />
            <InfoRow label="전체 완료일" value={`${streak.totalDone}일`} />
          </div>
        </div>

        {/* 메뉴 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <MenuButton label="전체 커리큘럼" onClick={() => navigate('/curriculum')} />
          <MenuButton label="진도 현황" onClick={() => navigate('/progress')} />
        </div>

        {/* 앱 정보 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[var(--color-primary)] font-[var(--font-ui)] mb-3">앱 정보</h3>
          <div className="space-y-2">
            <InfoRow label="버전" value="1.0.0" />
            <InfoRow label="개발" value="Park JunHyoung(Ryan)" />
          </div>
        </div>

        {/* 로그아웃 */}
        <Button variant="secondary" onClick={handleSignOut} className="w-full">
          로그아웃
        </Button>
      </div>
    </AppShell>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--color-text-secondary)] font-[var(--font-ui)]">{label}</span>
      <span className="text-sm font-medium text-[var(--color-text-primary)] font-[var(--font-ui)]">{value}</span>
    </div>
  )
}

function MenuButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 text-left cursor-pointer transition-colors hover:bg-[var(--color-bg)] border-b border-[var(--color-border)] last:border-b-0"
    >
      <span className="text-sm text-[var(--color-text-primary)] font-[var(--font-ui)]">{label}</span>
      <svg className="w-4 h-4 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}
