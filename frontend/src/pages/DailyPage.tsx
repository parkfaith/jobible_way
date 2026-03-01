import { useState, useEffect } from 'react'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import { today, formatDate } from '../lib/date'

interface DailyData {
  prayer30min: number
  qtDone: number
  bibleReading: number
  verseReading: number
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function DailyPage() {
  const { showToast } = useToast()
  const [date, setDate] = useState(today())
  const [daily, setDaily] = useState<DailyData>({ prayer30min: 0, qtDone: 0, bibleReading: 0, verseReading: 0 })
  const [loading, setLoading] = useState(true)
  const [weekDates, setWeekDates] = useState<string[]>([])

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
      setDaily(data)
    } catch {
      setDaily({ prayer30min: 0, qtDone: 0, bibleReading: 0, verseReading: 0 })
    } finally {
      setLoading(false)
    }
  }

  async function toggle(field: keyof DailyData) {
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

  const dateObj = new Date(date + 'T00:00:00')
  const displayDate = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 (${WEEKDAYS[dateObj.getDay()]})`
  const completedCount = (daily.prayer30min ? 1 : 0) + (daily.qtDone ? 1 : 0) + (daily.bibleReading ? 1 : 0) + (daily.verseReading ? 1 : 0)

  const items = [
    { key: 'prayer30min' as const, label: '기도 30분', desc: '하나님과의 대화 시간', done: !!daily.prayer30min },
    { key: 'qtDone' as const, label: 'QT (경건의 시간)', desc: '말씀을 통한 묵상', done: !!daily.qtDone },
    { key: 'bibleReading' as const, label: '성경 통독', desc: '성경 읽기 진행', done: !!daily.bibleReading },
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
              <button
                key={item.key}
                onClick={() => toggle(item.key)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  item.done
                    ? 'bg-[var(--color-success)]/5 border-[var(--color-success)]/30'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  item.done
                    ? 'bg-[var(--color-success)] text-white'
                    : 'border-2 border-[var(--color-border)] text-[var(--color-text-secondary)]'
                }`}>
                  {item.done ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium font-[var(--font-ui)] ${
                    item.done ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]'
                  }`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
