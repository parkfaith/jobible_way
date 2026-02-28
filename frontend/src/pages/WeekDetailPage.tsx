import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'

interface CurriculumItem {
  weekNumber: number
  volume: number
  lessonNumber: number
  title: string
  theme: string | null
  scripture: string
  youtubeVideoId: string | null
  requiredBook: string | null
}

interface WeeklyData {
  verseMemorized: number
  bookReportDone: number
  previewDone: number
}

export default function WeekDetailPage() {
  const { weekId } = useParams()
  const navigate = useNavigate()
  const weekNumber = parseInt(weekId ?? '1')
  const [curr, setCurr] = useState<CurriculumItem | null>(null)
  const [weekly, setWeekly] = useState<WeeklyData>({ verseMemorized: 0, bookReportDone: 0, previewDone: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/api/curriculum/${weekNumber}`),
      api.get(`/api/weekly/${weekNumber}`),
    ])
      .then(([c, w]) => { setCurr(c); setWeekly(w) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [weekNumber])

  async function toggleWeekly(field: keyof WeeklyData) {
    const previous = weekly
    const newVal = weekly[field] ? 0 : 1
    const updated = { ...weekly, [field]: newVal }
    setWeekly(updated)
    try {
      await api.put(`/api/weekly/${weekNumber}`, updated)
    } catch {
      setWeekly(previous)
    }
  }

  if (loading) {
    return (
      <AppShell title={`${weekNumber}주차`} showBack>
        <div className="p-4 text-center text-sm text-[var(--color-text-secondary)] pt-20">로딩 중...</div>
      </AppShell>
    )
  }

  const noteMenus = [
    { label: '설교 노트', desc: '주일/금요 설교 기록', path: `/weeks/${weekNumber}/sermon` },
    { label: 'OIA 묵상', desc: '관찰·해석·적용 노트', path: `/weeks/${weekNumber}/oia` },
    { label: '신앙 일기', desc: '이번 주 신앙 성찰', path: `/weeks/${weekNumber}/diary` },
    { label: '성구 암송', desc: '암송 구절 연습', path: `/weeks/${weekNumber}/verse` },
  ]

  const checkItems = [
    { key: 'verseMemorized' as const, label: '성구 암송 완료', done: !!weekly.verseMemorized },
    { key: 'previewDone' as const, label: '예습 완료', done: !!weekly.previewDone },
    ...(curr?.requiredBook ? [{ key: 'bookReportDone' as const, label: '독서보고서 완료', done: !!weekly.bookReportDone }] : []),
  ]

  return (
    <AppShell title={`${weekNumber}주차`} showBack>
      <div className="p-4 space-y-4">
        {/* 주차 정보 카드 */}
        {curr && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
            <span className="text-xs text-[var(--color-secondary)] font-[var(--font-ui)]">
              제{curr.volume}권 · {curr.lessonNumber}과
            </span>
            <h2 className="text-xl font-semibold text-[var(--color-primary)] font-[var(--font-heading)] mt-1">
              {curr.title}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2">{curr.scripture}</p>
            {curr.theme && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">주제: {curr.theme}</p>
            )}
          </div>
        )}

        {/* 노트 메뉴 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-[var(--color-primary)] font-[var(--font-ui)]">기록</h3>
          {noteMenus.map((menu) => (
            <button
              key={menu.path}
              onClick={() => navigate(menu.path)}
              className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl cursor-pointer transition-shadow hover:shadow-md"
            >
              <div className="text-left">
                <p className="text-sm font-medium text-[var(--color-text-primary)] font-[var(--font-ui)]">{menu.label}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{menu.desc}</p>
              </div>
              <svg className="w-4 h-4 text-[var(--color-text-secondary)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>

        {/* 주간 체크 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-[var(--color-primary)] font-[var(--font-ui)]">주간 체크</h3>
          {checkItems.map((item) => (
            <button
              key={item.key}
              onClick={() => toggleWeekly(item.key)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                item.done
                  ? 'bg-[var(--color-success)]/5 border-[var(--color-success)]/30'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)]'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                item.done
                  ? 'bg-[var(--color-success)] text-white'
                  : 'border-2 border-[var(--color-border)]'
              }`}>
                {item.done && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-[var(--font-ui)] ${
                item.done ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
