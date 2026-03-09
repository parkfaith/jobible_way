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

export default function DailyPage() {
  const { showToast } = useToast()
  const [date, setDate] = useState(today())
  const [daily, setDaily] = useState<DailyData>({ prayer30min: 0, qtDone: 0, bibleReading: 0, bibleChapter: null, verseReading: 0 })
  const [loading, setLoading] = useState(true)
  const [weekDates, setWeekDates] = useState<string[]>([])
  const chapterTimer = useRef<ReturnType<typeof setTimeout>>(null)

  // 현재 주차 계산
  const week1 = new Date('2026-02-22T00:00:00+09:00')
  const now = new Date()
  const diff = Math.floor((now.getTime() - week1.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const currentWeek = Math.max(1, Math.min(32, diff + 1))
  const bibleBook = BIBLE_READING[currentWeek] ?? ''

  useEffect(() => {
    const d = new Date(date + 'T00:00:00')
    const day = d.getDay()
    const mon = new Date(d)
    mon.setDate(d.getDate() - ((day + 6) % 7))
    const dates: string[] = []
    for (let i = 0; i < 7; i++) {
      const dd = new Date(mon)
      dd.setDate(mon.getDate() + i)
      dates.push(formatDate(dd))
    }
    setWeekDates(dates)
  }, [date])

  useEffect(() => {
    loadDaily()
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

  const dateObj = new Date(date + 'T00:00:00')
  const displayDate = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 (${WEEKDAYS[dateObj.getDay()]})`
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
        {/* 주간 날짜 선택 */}
        <div className="flex gap-1 justify-between">
          {weekDates.map((d) => {
            const dd = new Date(d + 'T00:00:00')
            const isToday = d === today()
            const isSelected = d === date
            return (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg text-xs font-[var(--font-ui)] cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[var(--color-secondary)] text-[var(--color-bg)]'
                    : isToday
                      ? 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'
                      : 'text-[var(--color-text-secondary)]'
                }`}
              >
                <span className="text-[10px]">{WEEKDAYS[dd.getDay()]}</span>
                <span className="font-medium mt-0.5">{dd.getDate()}</span>
              </button>
            )
          })}
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
