import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { today } from '../lib/date'

interface CurriculumItem {
  weekNumber: number
  title: string
  volume: number
  scripture: string
}

interface DailyData {
  prayer30min: number
  qtDone: number
  bibleReading: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([])
  const [daily, setDaily] = useState<DailyData>({ prayer30min: 0, qtDone: 0, bibleReading: 0 })
  const [currentWeek, setCurrentWeek] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [currData, dailyData] = await Promise.all([
        api.get('/api/curriculum'),
        api.get(`/api/daily?date=${today()}`),
      ])
      setCurriculum(currData)
      setDaily(dailyData)
      setCurrentWeek(1)
    } catch {
      // API 미연결 시 기본값 유지
    } finally {
      setLoading(false)
    }
  }

  async function toggleDaily(field: keyof DailyData) {
    const previous = daily
    const newVal = daily[field] ? 0 : 1
    const updated = { ...daily, [field]: newVal }
    setDaily(updated)
    try {
      await api.put('/api/daily', { date: today(), ...updated })
    } catch {
      setDaily(previous)
    }
  }

  const currentCurr = curriculum.find(c => c.weekNumber === currentWeek)
  const progress = Math.round((currentWeek / 32) * 100)

  const dailyItems = [
    { key: 'prayer30min' as const, label: '기도 30분', done: !!daily.prayer30min },
    { key: 'qtDone' as const, label: 'QT', done: !!daily.qtDone },
    { key: 'bibleReading' as const, label: '성경 통독', done: !!daily.bibleReading },
  ]

  if (loading) {
    return (
      <AppShell title="jobible Way">
        <div className="p-4 flex justify-center pt-20">
          <div className="text-[var(--color-text-secondary)]">로딩 중...</div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="jobible Way">
      <div className="p-4 space-y-4">
        {/* 환영 메시지 */}
        <p className="text-sm text-[var(--color-text-secondary)]">
          {user?.displayName ?? '훈련생'}님, 오늘도 은혜 안에서 성장하세요.
        </p>

        {/* 현재 주차 진행 카드 */}
        <button
          onClick={() => navigate(`/weeks/${currentWeek}`)}
          className="w-full text-left bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 cursor-pointer transition-shadow hover:shadow-md"
        >
          <p className="text-xs text-[var(--color-text-secondary)] mb-1">현재 진행</p>
          <h2 className="text-xl font-semibold text-[var(--color-primary)] font-[var(--font-heading)]">
            {currentWeek}주차 · {currentCurr?.title ?? '제자훈련'}
          </h2>
          {currentCurr && (
            <p className="text-xs text-[var(--color-secondary)] mt-1">{currentCurr.scripture}</p>
          )}
          <div className="mt-4 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-secondary)] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2 text-right">
            {currentWeek} / 32주 ({progress}%)
          </p>
        </button>

        {/* 오늘의 일일 체크 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <h3 className="text-sm font-medium text-[var(--color-primary)] mb-4">오늘의 일일 체크</h3>
          <div className="flex gap-4 justify-center">
            {dailyItems.map((item) => (
              <button
                key={item.key}
                onClick={() => toggleDaily(item.key)}
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
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
                <span className="text-[11px] text-[var(--color-text-secondary)] font-[var(--font-ui)]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '설교 노트', path: `/weeks/${currentWeek}/sermon`, icon: 'M' },
            { label: 'OIA 묵상', path: `/weeks/${currentWeek}/oia`, icon: 'O' },
            { label: '신앙 일기', path: `/weeks/${currentWeek}/diary`, icon: 'D' },
            { label: '성구 암송', path: `/weeks/${currentWeek}/verse`, icon: 'V' },
          ].map((menu) => (
            <button
              key={menu.path}
              onClick={() => navigate(menu.path)}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-left cursor-pointer transition-shadow hover:shadow-md"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--color-secondary)]/15 flex items-center justify-center text-sm font-bold text-[var(--color-secondary)] font-[var(--font-heading)]">
                {menu.icon}
              </div>
              <p className="text-sm font-medium text-[var(--color-primary)] mt-2 font-[var(--font-ui)]">{menu.label}</p>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
