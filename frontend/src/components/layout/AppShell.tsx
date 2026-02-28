import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../ui/BottomNav'

interface AppShellProps {
  title?: string
  showBack?: boolean
  children: ReactNode
  rightAction?: ReactNode
}

export default function AppShell({ title, showBack = false, children, rightAction }: AppShellProps) {
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
            <div className="flex items-center gap-1">
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
              <h1 className="text-lg font-semibold font-[var(--font-heading)] text-[var(--color-primary)]">
                {title}
              </h1>
            </div>
            {rightAction && <div>{rightAction}</div>}
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
