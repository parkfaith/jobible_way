import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'
import { ASSIGNMENTS } from '../lib/assignments'

interface CurriculumItem {
  weekNumber: number
  title: string
}

export default function AssignmentsPage() {
  const navigate = useNavigate()
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([])
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [loading, setLoading] = useState(true)

  // 현재 주차 자동 계산
  const week1 = new Date('2026-02-22T00:00:00+09:00')
  const now = new Date()
  const diff = Math.floor((now.getTime() - week1.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const currentWeek = Math.max(1, Math.min(32, diff + 1))

  useEffect(() => {
    setSelectedWeek(currentWeek)
    api.get('/api/curriculum')
      .then(setCurriculum)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const assignments = ASSIGNMENTS[selectedWeek]
  const currItem = curriculum.find(c => c.weekNumber === selectedWeek)

  if (loading) {
    return (
      <AppShell title="과제물" showBack>
        <div className="p-4 text-center text-sm text-[var(--color-text-secondary)] pt-20">로딩 중...</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="과제물" showBack>
      <div className="p-4 space-y-4">
        {/* 주차 선택 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedWeek(w => Math.max(1, w - 1))}
            disabled={selectedWeek <= 1}
            className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-[var(--color-surface)]"
          >
            <svg className="w-4 h-4 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-[var(--color-primary)] font-[var(--font-heading)]">
              {selectedWeek}주차
            </h2>
            {currItem && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{currItem.title}</p>
            )}
          </div>
          <button
            onClick={() => setSelectedWeek(w => Math.min(currentWeek, w + 1))}
            disabled={selectedWeek >= currentWeek}
            className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-[var(--color-surface)]"
          >
            <svg className="w-4 h-4 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* 주차 표시 바 */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {Array.from({ length: currentWeek }, (_, i) => i + 1).map(week => (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`flex-shrink-0 w-9 h-9 rounded-lg text-xs font-medium font-[var(--font-ui)] cursor-pointer transition-all ${
                week === selectedWeek
                  ? 'bg-[var(--color-secondary)] text-[var(--color-bg)]'
                  : ASSIGNMENTS[week]
                    ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]/50'
              }`}
            >
              {week}
            </button>
          ))}
        </div>

        {/* 과제물 내용 */}
        {assignments ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
            {assignments.map((item, i) => (
              <div key={i} className={i > 0 ? 'pt-3 border-t border-[var(--color-border)]' : ''}>
                <span className="text-xs font-medium text-[var(--color-secondary)] font-[var(--font-ui)]">
                  {item.category}
                </span>
                <p className="text-sm text-[var(--color-text-primary)] mt-1 whitespace-pre-line">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
            <svg className="w-12 h-12 text-[var(--color-text-secondary)]/30 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <p className="text-sm text-[var(--color-text-secondary)]">
              아직 과제물이 정해지지 않았습니다.
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]/60 mt-1">
              해당 주차가 되면 과제물이 업데이트됩니다.
            </p>
          </div>
        )}

        {/* 해당 주차로 이동 */}
        <button
          onClick={() => navigate(`/weeks/${selectedWeek}`)}
          className="w-full flex items-center justify-center gap-2 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl cursor-pointer transition-shadow hover:shadow-md"
        >
          <span className="text-sm text-[var(--color-accent)] font-[var(--font-ui)]">
            {selectedWeek}주차 상세 보기
          </span>
          <svg className="w-4 h-4 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </AppShell>
  )
}
