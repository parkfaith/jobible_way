import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { usePwaInstall } from '../lib/usePwaInstall'
import { getBibleReading } from '../lib/assignments'

interface CurriculumItem {
  weekNumber: number
  title: string
  volume: number
  scripture: string
  verseText: string | null
  scripture2: string | null
  verseText2: string | null
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showBanner, hasNativePrompt, isIos, install, dismiss } = usePwaInstall()
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([])
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

      const currData = await api.get('/api/curriculum')
      setCurriculum(currData)
    } catch {
      // API 미연결 시 기본값 유지
    } finally {
      setLoading(false)
    }
  }

  const currentCurr = curriculum.find(c => c.weekNumber === currentWeek)
  const progress = Math.round((currentWeek / 32) * 100)

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
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          {/* 주차 네비게이션 헤더 */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[var(--color-border)]/50">
            <button
              onClick={() => setCurrentWeek(w => Math.max(1, w - 1))}
              disabled={currentWeek <= 1}
              className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] disabled:opacity-30 cursor-pointer disabled:cursor-default py-1 px-2 rounded-lg hover:bg-[var(--color-border)]/40 disabled:hover:bg-transparent transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {currentWeek > 1 ? `${currentWeek - 1}주차` : '이전'}
            </button>
            <span className="text-xs text-[var(--color-text-secondary)]">현재 진행</span>
            <button
              onClick={() => setCurrentWeek(w => Math.min(32, w + 1))}
              disabled={currentWeek >= 32}
              className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] disabled:opacity-30 cursor-pointer disabled:cursor-default py-1 px-2 rounded-lg hover:bg-[var(--color-border)]/40 disabled:hover:bg-transparent transition-colors"
            >
              {currentWeek < 32 ? `${currentWeek + 1}주차` : '다음'}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => navigate(`/weeks/${currentWeek}`)}
            className="w-full text-left p-5 cursor-pointer transition-shadow hover:shadow-md"
          >
          <h2 className="text-xl font-semibold text-[var(--color-primary)] font-[var(--font-heading)]">
            {currentWeek}주차 · {currentCurr?.title ?? '제자훈련'}
          </h2>
          {currentCurr && (
            <p className="text-xs text-[var(--color-secondary)] mt-1">{currentCurr.scripture}</p>
          )}
          {getBibleReading(currentWeek) && (
            <div className="flex items-center gap-1.5 mt-2">
              <svg className="w-3.5 h-3.5 text-[var(--color-accent)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
              </svg>
              <span className="text-xs text-[var(--color-accent)] font-[var(--font-ui)]">
                성경통독: {getBibleReading(currentWeek)}
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
        </div>

        {/* 성구 암송 카드 */}
        {currentCurr && (currentCurr.verseText || currentCurr.verseText2) && (
          <button
            onClick={() => navigate(`/weeks/${currentWeek}/verse`)}
            className="w-full text-left bg-[var(--color-surface)] border border-[var(--color-secondary)]/40 rounded-xl p-5 cursor-pointer transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-[var(--color-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
              </svg>
              <h3 className="text-sm font-medium text-[var(--color-primary)]">이번 주 성구 암송</h3>
            </div>
            {currentCurr.verseText && (
              <>
                <p className="text-xs text-[var(--color-secondary)] mb-1">{currentCurr.scripture}</p>
                <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                  {currentCurr.verseText}
                </p>
              </>
            )}
            {currentCurr.scripture2 && currentCurr.verseText2 && (
              <>
                <p className="text-xs text-[var(--color-secondary)] mt-3 mb-1">{currentCurr.scripture2}</p>
                <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                  {currentCurr.verseText2}
                </p>
              </>
            )}
          </button>
        )}

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
            {
              label: '과제물', path: '/assignments',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              ),
            },
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
