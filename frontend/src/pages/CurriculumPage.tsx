import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'

interface CurriculumItem {
  weekNumber: number
  volume: number
  lessonNumber: number
  title: string
  theme: string | null
  scripture: string
  requiredBook: string | null
}

const VOLUME_INFO = [
  { label: '제1권 · 새생명', desc: '구원의 확신과 기초', color: 'var(--color-success)' },
  { label: '제2권 · 성장', desc: '영적 성장과 훈련', color: 'var(--color-secondary)' },
  { label: '제3권 · 재생산', desc: '사역과 제자 재생산', color: 'var(--color-primary)' },
]

export default function CurriculumPage() {
  const navigate = useNavigate()
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([])
  const [expandedVol, setExpandedVol] = useState<number | null>(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/curriculum')
      .then(setCurriculum)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <AppShell title="커리큘럼" showBack>
        <div className="p-4 text-center text-sm text-[var(--color-text-secondary)] pt-20">로딩 중...</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="커리큘럼" showBack>
      <div className="p-4 space-y-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          낙원제일교회 제2기 제자훈련 32주 전체 커리큘럼
        </p>

        {VOLUME_INFO.map((vol, idx) => {
          const volNum = idx + 1
          const items = curriculum.filter(c => c.volume === volNum)
          const isExpanded = expandedVol === volNum

          return (
            <div key={volNum} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedVol(isExpanded ? null : volNum)}
                className="w-full flex items-center justify-between p-4 cursor-pointer"
              >
                <div className="text-left">
                  <h3 className="text-sm font-semibold font-[var(--font-heading)]" style={{ color: vol.color }}>
                    {vol.label}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{vol.desc} · {items.length}주</p>
                </div>
                <svg
                  className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isExpanded && (
                <div className="border-t border-[var(--color-border)]">
                  {items.map((item) => (
                    <button
                      key={item.weekNumber}
                      onClick={() => navigate(`/weeks/${item.weekNumber}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors hover:bg-[var(--color-bg)] border-b border-[var(--color-border)] last:border-b-0"
                    >
                      <span className="text-xs font-bold text-[var(--color-text-secondary)] w-6 text-center font-[var(--font-ui)]">
                        {item.weekNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] font-[var(--font-ui)] truncate">{item.title}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] truncate">{item.scripture}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}
