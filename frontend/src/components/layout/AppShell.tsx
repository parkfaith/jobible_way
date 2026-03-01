import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../ui/BottomNav'
import { today } from '../../lib/date'

function formatDateKo(dateStr: string) {
  const [, m, d] = dateStr.split('-')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const dt = new Date(dateStr + 'T00:00:00+09:00')
  return `${parseInt(m)}월 ${parseInt(d)}일 (${days[dt.getDay()]})`
}

interface AppShellProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  children: ReactNode
  rightAction?: ReactNode
}

export default function AppShell({ title, subtitle, showBack = false, children, rightAction }: AppShellProps) {
  const navigate = useNavigate()

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/home')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      {title && (
        <header className="sticky top-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-sm border-b border-[var(--color-border)] pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-1 min-w-0">
              {showBack && (
                <button
                  onClick={handleBack}
                  className="p-2.5 -ml-2.5 text-[var(--color-text-primary)] cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}
              <div className="min-w-0">
                <h1 className="text-lg font-semibold font-[var(--font-heading)] text-[var(--color-primary)] leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-[10px] text-[var(--color-text-secondary)] font-[var(--font-ui)] leading-tight">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {rightAction && <div>{rightAction}</div>}
              <span className="text-[11px] text-[var(--color-text-secondary)] font-[var(--font-ui)]">
                {formatDateKo(today())}
              </span>
            </div>
          </div>
        </header>
      )}

      {/* Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
