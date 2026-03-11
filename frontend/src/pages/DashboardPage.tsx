import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { today } from '../lib/date'
import { usePwaInstall } from '../lib/usePwaInstall'
import { BIBLE_READING } from '../lib/bible-reading'

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
  verseReading: number
}

interface WeeklyData {
  sermonWatched: number  // 비트마스크: sunday=1, friday=2, 둘 다=3
  verseMemorized: number
  previewDone: number
  bookReportDone: number
}

export default function DashboardPage() {
  const { user, canViewFellow } = useAuth()
  const navigate = useNavigate()
  const { showBanner, hasNativePrompt, isIos, install, dismiss } = usePwaInstall()
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([])
  const [daily, setDaily] = useState<DailyData>({ prayer30min: 0, qtDone: 0, bibleReading: 0, verseReading: 0 })
  const [weekly, setWeekly] = useState<WeeklyData>({ sermonWatched: 0, verseMemorized: 0, previewDone: 0, bookReportDone: 0 })
  const [currentWeek, setCurrentWeek] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // 1주차 시작일(2026-02-22) 기준 현재 주차 자동 계산
      const week1 = new Date('2026-02-22T00:00:00+09:00')
      const now = new Date()
      const diff = Math.floor((now.getTime() - week1.getTime()) / (7 * 24 * 60 * 60 * 1000))
      const week = Math.max(1, Math.min(32, diff + 1))
      setCurrentWeek(week)

      const [currData, dailyData, weeklyData] = await Promise.all([
        api.get('/api/curriculum'),
        api.get(`/api/daily?date=${today()}`),
        api.get(`/api/weekly/${week}`),
      ])
      setCurriculum(currData)
      setDaily(dailyData)
      setWeekly(weeklyData)
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
    { key: 'verseReading' as const, label: '암송 읽기', done: !!daily.verseReading },
  ]

  if (loading) {
    return (
      <AppShell title="jobible Way" subtitle="낙원제일교회 제자훈련 2기">
        <div className="p-4 flex flex-col items-center pt-20 gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">데이터를 불러오는 중...</p>
          <p className="text-xs text-[var(--color-text-secondary)]/60">첫 접속 시 서버 준비에 시간이 걸릴 수 있어요</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="jobible Way" subtitle="낙원제일교회 제자훈련 2기">
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
          {BIBLE_READING[currentWeek] && (
            <div className="flex items-center gap-1.5 mt-2">
              <svg className="w-3.5 h-3.5 text-[var(--color-accent)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
              </svg>
              <span className="text-xs text-[var(--color-accent)] font-[var(--font-ui)]">
                성경통독: {BIBLE_READING[currentWeek]}
              </span>
            </div>
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
        {(() => {
          const dailyDoneCount = dailyItems.filter(i => i.done).length
          const allDone = dailyDoneCount === dailyItems.length
          return (
            <div className={`bg-[var(--color-surface)] border rounded-xl p-5 ${
              allDone
                ? 'border-[var(--color-success)]/40'
                : 'border-[var(--color-border)]'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--color-primary)]">오늘의 일일 체크</h3>
                <span className={`text-xs font-[var(--font-ui)] ${
                  allDone ? 'text-[var(--color-success)]' : 'text-[var(--color-secondary)]'
                }`}>
                  {allDone ? '오늘 완료!' : `${dailyDoneCount}/${dailyItems.length} 완료`}
                </span>
              </div>
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
                        : 'border-2 border-[var(--color-secondary)]/50 text-[var(--color-secondary)]'
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
                    <span className={`text-[11px] font-[var(--font-ui)] ${
                      item.done ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-secondary)] font-medium'
                    }`}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })()}

        {/* 이번 주 주간 체크 현황 */}
        {(() => {
          // 설교 시청: sermonWatched 비트마스크 — sunday=1, friday=2, 둘 다=3
          const sundayDone = !!(weekly.sermonWatched & 1)
          const fridayDone = !!(weekly.sermonWatched & 2)
          const sermonDoneCount = (sundayDone ? 1 : 0) + (fridayDone ? 1 : 0)
          const sermonStatus = sermonDoneCount === 2 ? 'done' : sermonDoneCount === 1 ? 'partial' : 'none'
          const weeklyItems = [
            { label: '설교 시청', status: sermonStatus, sub: sermonDoneCount === 2 ? undefined : `${sermonDoneCount}/2` },
            { label: '성구 암송', status: weekly.verseMemorized ? 'done' as const : 'none' as const },
            { label: '예습 완료', status: weekly.previewDone ? 'done' as const : 'none' as const },
            { label: '독서보고서', status: weekly.bookReportDone ? 'done' as const : 'none' as const },
          ]
          const doneCount = weeklyItems.filter(i => i.status === 'done').length
          return (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--color-primary)]">{currentWeek}주차 주간 체크</h3>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {doneCount}/{weeklyItems.length} 완료
                </span>
              </div>
              <div className="space-y-2">
                {weeklyItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.status === 'done'
                        ? 'bg-[var(--color-success)] text-white'
                        : item.status === 'partial'
                          ? 'bg-[var(--color-secondary)] text-white'
                          : 'border-2 border-[var(--color-border)]'
                    }`}>
                      {item.status === 'done' && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {item.status === 'partial' && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-[var(--font-ui)] ${
                      item.status === 'done'
                        ? 'text-[var(--color-success)]'
                        : item.status === 'partial'
                          ? 'text-[var(--color-secondary)]'
                          : 'text-[var(--color-text-secondary)]'
                    }`}>
                      {item.label}
                      {item.sub && <span className="text-xs ml-1 opacity-70">({item.sub})</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* 빠른 메뉴 */}
        {(() => {
          const menus = [
            {
              label: '설교보기', path: `/weeks/${currentWeek}/sermon`,
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              ),
            },
            ...(canViewFellow ? [{
              label: '동역자', path: '/fellow',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              ),
            }] : []),
            {
              label: '신앙일기', path: `/weeks/${currentWeek}/diary`,
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              ),
            },
            {
              label: '성구암송', path: `/weeks/${currentWeek}/verse`,
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                </svg>
              ),
            },
          ]
          return (
            <div className="grid grid-cols-4 gap-2 pb-4">
              {menus.map((menu) => (
                <button
                  key={menu.path}
                  onClick={() => navigate(menu.path)}
                  className="flex flex-col items-center justify-center gap-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg py-3 px-2 cursor-pointer transition-shadow hover:shadow-md"
                >
                  <span className="text-[var(--color-secondary)]">{menu.icon}</span>
                  <span className="text-xs font-medium text-[var(--color-primary)] font-[var(--font-ui)]">{menu.label}</span>
                </button>
              ))}
            </div>
          )
        })()}

        {/* 홈 화면에 추가 배너 */}
        {showBanner && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-secondary)]/30 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-secondary)]/15 flex items-center justify-center text-[var(--color-secondary)] shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" /><path d="M5 12h14" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-primary)]">홈 화면에 추가</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {isIos
                  ? '공유 버튼 → "홈 화면에 추가"를 눌러주세요'
                  : '앱처럼 빠르게 접근할 수 있어요'}
              </p>
            </div>
            {hasNativePrompt && (
              <button
                onClick={async () => {
                  const accepted = await install()
                  if (!accepted) dismiss()
                }}
                className="px-3 py-1.5 bg-[var(--color-secondary)] text-[var(--color-bg)] rounded-lg text-xs font-[var(--font-ui)] cursor-pointer shrink-0"
              >
                설치
              </button>
            )}
            <button
              onClick={dismiss}
              className="text-[var(--color-text-secondary)] cursor-pointer p-1 shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
