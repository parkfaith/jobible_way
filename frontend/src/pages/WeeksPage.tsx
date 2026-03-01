import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'

interface CurriculumItem {
  weekNumber: number
  volume: number
  lessonNumber: number
  title: string
  scripture: string
}

interface WeeklyTask {
  weekNumber: number
  sermonWatched: number
  verseMemorized: number
  previewDone: number
  bookReportDone: number
}

const VOLUME_LABELS = ['제1권 · 새생명', '제2권 · 성장', '제3권 · 재생산']
const VOLUME_COLORS = ['var(--color-success)', 'var(--color-secondary)', 'var(--color-primary)']

export default function WeeksPage() {
  const navigate = useNavigate()
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([])
  const [weeklyMap, setWeeklyMap] = useState<Record<number, WeeklyTask>>({})
  const [loading, setLoading] = useState(true)

  // 현재 주차 자동 계산
  const week1 = new Date('2026-03-01T00:00:00+09:00')
  const now = new Date()
  const diff = Math.floor((now.getTime() - week1.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const currentWeek = Math.max(1, Math.min(32, diff + 1))

  useEffect(() => {
    Promise.all([
      api.get('/api/curriculum'),
      api.get('/api/weekly'),
    ])
      .then(([currData, weeklyData]) => {
        setCurriculum(currData)
        const map: Record<number, WeeklyTask> = {}
        for (const w of weeklyData) map[w.weekNumber] = w
        setWeeklyMap(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function getWeeklyDoneCount(weekNumber: number): number {
    const w = weeklyMap[weekNumber]
    if (!w) return 0
    return (w.sermonWatched ? 1 : 0) + (w.verseMemorized ? 1 : 0) + (w.previewDone ? 1 : 0) + (w.bookReportDone ? 1 : 0)
  }

  if (loading) {
    return (
      <AppShell title="32주 여정">
        <div className="p-4 text-center text-sm text-[var(--color-text-secondary)] pt-20">로딩 중...</div>
      </AppShell>
    )
  }

  const grouped = [1, 2, 3].map(vol => ({
    volume: vol,
    label: VOLUME_LABELS[vol - 1],
    color: VOLUME_COLORS[vol - 1],
    items: curriculum.filter(c => c.volume === vol),
  }))

  return (
    <AppShell title="32주 여정">
      <div className="p-4 space-y-6">
        {/* 진행 상황 요약 */}
        <div className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-secondary)] text-[var(--color-bg)] flex items-center justify-center text-lg font-bold font-[var(--font-heading)]">
            {currentWeek}
          </div>
          <div className="flex-1">
            <p className="text-xs text-[var(--color-text-secondary)]">현재 주차</p>
            <div className="mt-1 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-secondary)] rounded-full" style={{ width: `${(currentWeek / 32) * 100}%` }} />
            </div>
          </div>
          <span className="text-xs text-[var(--color-text-secondary)] font-[var(--font-ui)]">{currentWeek}/32</span>
        </div>

        {/* 볼륨별 목록 */}
        {grouped.map(group => (
          <div key={group.volume}>
            <h2 className="text-sm font-semibold font-[var(--font-heading)] mb-3" style={{ color: group.color }}>
              {group.label}
            </h2>
            <div className="space-y-2">
              {group.items.map((item) => {
                const isCurrent = item.weekNumber === currentWeek
                const isPast = item.weekNumber < currentWeek
                const isFuture = item.weekNumber > currentWeek
                const doneCount = getWeeklyDoneCount(item.weekNumber)
                const isAllDone = doneCount === 4

                return (
                  <button
                    key={item.weekNumber}
                    onClick={() => navigate(`/weeks/${item.weekNumber}`)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/30'
                        : isPast
                          ? 'bg-[var(--color-surface)] border-[var(--color-border)]'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] opacity-60'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isAllDone
                        ? 'bg-[var(--color-success)] text-white'
                        : isCurrent
                          ? 'bg-[var(--color-secondary)] text-[var(--color-bg)]'
                          : isPast
                            ? 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                            : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                    }`}>
                      {isAllDone ? (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        item.weekNumber
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium font-[var(--font-ui)] truncate ${
                        isCurrent ? 'text-[var(--color-primary)]' : isFuture ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)]'
                      }`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">{item.scripture}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isFuture && doneCount > 0 && !isAllDone && (
                        <span className="text-[10px] text-[var(--color-text-secondary)] font-[var(--font-ui)]">
                          {doneCount}/4
                        </span>
                      )}
                      {!isFuture && (
                        <svg className="w-4 h-4 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
