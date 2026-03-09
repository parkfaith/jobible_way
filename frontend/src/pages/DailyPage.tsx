import { useState, useEffect, useRef } from 'react'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import { today, formatDate } from '../lib/date'
import { BIBLE_READING } from '../lib/bible-reading'

interface DailyData {
  prayer30min: number
  qtDone: number
  bibleReading: number
  bibleChapter: string | null
  verseReading: number
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** 해당 월의 캘린더 그리드 생성 (앞뒤 빈칸 포함) */
function buildCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay() // 0=일
  const lastDate = new Date(year, month + 1, 0).getDate()
  const grid: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) grid.push(null)
  for (let d = 1; d <= lastDate; d++) grid.push(d)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

/** 해당 날짜가 속한 주의 월~일 범위 (월요일 시작) */
function getWeekRange(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() - ((day + 6) % 7)) // 월요일
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6) // 일요일
  return { start: formatDate(mon), end: formatDate(sun) }
}

export default function DailyPage() {
  const { showToast } = useToast()
  const [date, setDate] = useState(today())
  const [daily, setDaily] = useState<DailyData>({ prayer30min: 0, qtDone: 0, bibleReading: 0, bibleChapter: null, verseReading: 0 })
  const [loading, setLoading] = useState(true)
  const chapterTimer = useRef<ReturnType<typeof setTimeout>>(null)

  // 캘린더 표시용 년/월 (선택된 날짜 기준)
  const selectedDate = new Date(date + 'T00:00:00')
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth())

  // 현재 주차 계산
  const week1 = new Date('2026-02-22T00:00:00+09:00')
  const now = new Date()
  const diff = Math.floor((now.getTime() - week1.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const currentWeek = Math.max(1, Math.min(32, diff + 1))
  const bibleBook = BIBLE_READING[currentWeek] ?? ''

  // 오늘이 속한 주 범위
  const todayStr = today()
  const thisWeek = getWeekRange(todayStr)

  const calendarGrid = buildCalendarGrid(viewYear, viewMonth)

  useEffect(() => {
    loadDaily()
  }, [date])

  // 날짜 선택 시 뷰 월도 동기화
  useEffect(() => {
    const d = new Date(date + 'T00:00:00')
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }, [date])

  async function loadDaily() {
    setLoading(true)
    try {
      const data = await api.get(`/api/daily?date=${date}`)
      setDaily({ ...data, bibleChapter: data.bibleChapter ?? null })
    } catch {
      setDaily({ prayer30min: 0, qtDone: 0, bibleReading: 0, bibleChapter: null, verseReading: 0 })
    } finally {
      setLoading(false)
    }
  }

  async function toggle(field: keyof DailyData) {
    if (field === 'bibleChapter') return
    const previous = daily
    const newVal = daily[field] ? 0 : 1
    const updated = { ...daily, [field]: newVal }
    setDaily(updated)
    try {
      await api.put('/api/daily', { date, ...updated })
      showToast(newVal ? '완료!' : '취소됨')
    } catch {
      setDaily(previous)
      showToast('저장 실패', 'error')
    }
  }

  function handleChapterChange(value: string) {
    const hasValue = value.trim().length > 0
    const updated = { ...daily, bibleChapter: value || null, bibleReading: hasValue ? 1 : 0 }
    setDaily(updated)

    if (chapterTimer.current) clearTimeout(chapterTimer.current)
    chapterTimer.current = setTimeout(async () => {
      try {
        await api.put('/api/daily', { date, ...updated })
      } catch { /* 무음 실패 */ }
    }, 800)
  }

  function goMonth(delta: number) {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setViewMonth(m)
    setViewYear(y)
  }

  const displayDate = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 (${WEEKDAYS[selectedDate.getDay()]})`
  const completedCount = (daily.prayer30min ? 1 : 0) + (daily.qtDone ? 1 : 0) + (daily.bibleReading ? 1 : 0) + (daily.verseReading ? 1 : 0)

  const items = [
    { key: 'prayer30min' as const, label: '기도 30분', desc: '하나님과의 대화 시간', done: !!daily.prayer30min },
    { key: 'qtDone' as const, label: 'QT (경건의 시간)', desc: '말씀을 통한 묵상', done: !!daily.qtDone },
    { key: 'bibleReading' as const, label: '성경 통독', desc: bibleBook, done: !!daily.bibleReading, isBible: true },
    { key: 'verseReading' as const, label: '성구 암송 읽기', desc: '암송 구절 반복 읽기', done: !!daily.verseReading },
  ]

  return (
    <AppShell title="일일 체크">
      <div className="p-4 space-y-4">
        {/* 월간 캘린더 */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-3">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => goMonth(-1)} className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-sm font-semibold text-[var(--color-text-primary)] font-[var(--font-ui)]">
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button onClick={() => goMonth(1)} className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((w, i) => (
              <div key={w} className={`text-center text-[10px] font-medium py-1 ${
                i === 0 ? 'text-[var(--color-error)]' : 'text-[var(--color-text-secondary)]'
              }`}>{w}</div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7">
            {calendarGrid.map((day, idx) => {
              if (day === null) return <div key={`e${idx}`} />

              const cellDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isToday = cellDate === todayStr
              const isSelected = cellDate === date
              const isThisWeek = cellDate >= thisWeek.start && cellDate <= thisWeek.end
              const isSunday = idx % 7 === 0

              return (
                <button
                  key={cellDate}
                  onClick={() => setDate(cellDate)}
                  className={`relative flex items-center justify-center py-1.5 text-xs font-[var(--font-ui)] cursor-pointer transition-colors rounded-lg ${
                    isSelected
                      ? 'bg-[var(--color-secondary)] text-[var(--color-bg)] font-bold'
                      : isToday
                        ? 'text-[var(--color-secondary)] font-bold'
                        : isThisWeek
                          ? 'bg-[var(--color-secondary)]/8 text-[var(--color-text-primary)]'
                          : isSunday
                            ? 'text-[var(--color-error)]/60'
                            : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  {day}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-secondary)]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 날짜 + 진행률 */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[var(--color-primary)] font-[var(--font-heading)]">
            {displayDate}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {completedCount}/4 완료
          </p>
        </div>

        {/* 체크 항목 */}
        {loading ? (
          <div className="text-center text-sm text-[var(--color-text-secondary)] py-8">로딩 중...</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.key}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                  item.done
                    ? 'bg-[var(--color-success)]/5 border-[var(--color-success)]/30'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                }`}
              >
                <button
                  onClick={() => !('isBible' in item && item.isBible) && toggle(item.key)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    'isBible' in item && item.isBible ? '' : 'cursor-pointer'
                  } ${
                    item.done
                      ? 'bg-[var(--color-success)] text-white'
                      : 'border-2 border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item.done ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                </button>
                {'isBible' in item && item.isBible ? (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium font-[var(--font-ui)] flex-shrink-0 ${
                        item.done ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]'
                      }`}>
                        {item.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-[var(--color-accent)] font-[var(--font-ui)] flex-shrink-0">{bibleBook}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder=""
                        value={daily.bibleChapter ?? ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleChapterChange(e.target.value)}
                        className="w-14 bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-0.5 text-xs text-[var(--color-text-primary)] text-center font-[var(--font-ui)] outline-none focus:border-[var(--color-accent)]/50"
                      />
                      <span className="text-xs text-[var(--color-text-secondary)]">장</span>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => toggle(item.key)} className="text-left flex-1 cursor-pointer">
                    <p className={`text-sm font-medium font-[var(--font-ui)] ${
                      item.done ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]'
                    }`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{item.desc}</p>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
