import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'
import { ASSIGNMENTS, getBibleReading, getBookTitle } from '../lib/assignments'

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
  assignmentMemo: string | null
}

export default function WeekDetailPage() {
  const { weekId } = useParams()
  const navigate = useNavigate()
  const weekNumber = parseInt(weekId ?? '1')
  const [curr, setCurr] = useState<CurriculumItem | null>(null)
  const [weekly, setWeekly] = useState<WeeklyData>({ verseMemorized: 0, bookReportDone: 0, previewDone: 0, sermonWatched: 0, assignmentMemo: null })
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(true)
  const memoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingMemo = useRef<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get(`/api/curriculum/${weekNumber}`),
      api.get(`/api/weekly/${weekNumber}`),
    ])
      .then(([c, w]) => { setCurr(c); setWeekly(w); setMemo(w.assignmentMemo ?? '') })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [weekNumber])

  // 메모 언마운트 시 대기 중인 저장 즉시 실행
  useEffect(() => {
    return () => {
      if (memoTimer.current) clearTimeout(memoTimer.current)
      if (pendingMemo.current !== null) saveMemo(pendingMemo.current)
    }
  }, [])

  function handleMemoChange(value: string) {
    setMemo(value)
    pendingMemo.current = value
    if (memoTimer.current) clearTimeout(memoTimer.current)
    memoTimer.current = setTimeout(() => {
      pendingMemo.current = null
      saveMemo(value)
    }, 1500)
  }

  async function saveMemo(value: string) {
    try {
      await api.put(`/api/weekly/${weekNumber}`, { ...weekly, assignmentMemo: value || null })
    } catch { /* 실패 시 무음 */ }
  }

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

  // 설교 시청은 SermonPage에서 주일/금요 각각 체크 (비트마스크)
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
            {(getBibleReading(weekNumber) || getBookTitle(weekNumber)) && (
              <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-2">
                {getBibleReading(weekNumber) && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                    </svg>
                    <span className="text-xs text-[var(--color-accent)] font-[var(--font-ui)]">
                      성경통독: {getBibleReading(weekNumber)}
                    </span>
                  </div>
                )}
                {getBookTitle(weekNumber) && (
                  <div className="flex items-start gap-1.5">
                    <svg className="w-4 h-4 text-[var(--color-secondary)] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                    </svg>
                    <span className="text-xs text-[var(--color-secondary)] font-[var(--font-ui)]">
                      필독서: {getBookTitle(weekNumber)}
                    </span>
                  </div>
                )}
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

        {/* 과제물 */}
        {ASSIGNMENTS[weekNumber] && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--color-primary)] font-[var(--font-ui)]">과제물</h3>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
              {ASSIGNMENTS[weekNumber].map((item, i) => (
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
            {/* 메모 (손글씨 등 추가 기록) */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
              <label className="text-xs font-medium text-[var(--color-text-secondary)] font-[var(--font-ui)]">
                메모 (추가 기록)
              </label>
              <textarea
                value={memo}
                onChange={(e) => handleMemoChange(e.target.value)}
                placeholder="손글씨 내용이나 추가 메모를 입력하세요..."
                rows={3}
                className="w-full mt-2 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-secondary)] resize-none"
              />
            </div>
          </div>
        )}

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
