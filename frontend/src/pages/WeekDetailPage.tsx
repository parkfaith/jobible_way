import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'
import { BIBLE_READING } from '../lib/bible-reading'
import { REQUIRED_BOOKS } from '../lib/required-books'

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
  sermonWatched: number
}

export default function WeekDetailPage() {
  const { weekId } = useParams()
  const navigate = useNavigate()
  const weekNumber = parseInt(weekId ?? '1')
  const [curr, setCurr] = useState<CurriculumItem | null>(null)
  const [weekly, setWeekly] = useState<WeeklyData>({ verseMemorized: 0, bookReportDone: 0, previewDone: 0, sermonWatched: 0 })
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
    {
      label: '설교 보기', desc: '주일/금요 설교 영상', path: `/weeks/${weekNumber}/sermon`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
    },
    {
      label: 'OIA 묵상', desc: '관찰·해석·적용 노트', path: `/weeks/${weekNumber}/oia`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      ),
    },
    {
      label: '신앙 일기', desc: '이번 주 신앙 성찰', path: `/weeks/${weekNumber}/diary`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      ),
    },
    {
      label: '성구 암송', desc: '암송 구절 연습', path: `/weeks/${weekNumber}/verse`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
      ),
    },
  ]

  const checkItems = [
    { key: 'sermonWatched' as const, label: '설교 시청 완료', done: !!weekly.sermonWatched },
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
            {(BIBLE_READING[weekNumber] || REQUIRED_BOOKS[weekNumber]) && (
              <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-2">
                {BIBLE_READING[weekNumber] && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                    </svg>
                    <span className="text-xs text-[var(--color-accent)] font-[var(--font-ui)]">
                      성경통독: {BIBLE_READING[weekNumber]}
                    </span>
                  </div>
                )}
                {REQUIRED_BOOKS[weekNumber]?.map((book, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <svg className="w-4 h-4 text-[var(--color-secondary)] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                    </svg>
                    <span className="text-xs text-[var(--color-secondary)] font-[var(--font-ui)]">
                      필독서: {book.title}{book.note ? ` (${book.note})` : ''}{book.author ? ` — ${book.author}` : ''}
                    </span>
                  </div>
                ))}
              </div>
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
              className="w-full flex items-center gap-3 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl cursor-pointer transition-shadow hover:shadow-md"
            >
              <div className="w-9 h-9 rounded-lg bg-[var(--color-secondary)]/15 flex items-center justify-center text-[var(--color-secondary)] flex-shrink-0">
                {menu.icon}
              </div>
              <div className="text-left flex-1">
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
