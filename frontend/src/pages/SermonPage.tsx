import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import TabNav from '../components/ui/TabNav'
import { api } from '../lib/api'
import { useToast } from '../components/ui/Toast'

interface SermonVideo {
  videoId: string
  title: string
  date: string
  preacher: string
  scripture: string
  service: string
  thumbnail: string
}

interface WeeklyData {
  sermonWatched: number
}

const SERVICES = [
  { label: '주일 예배', value: 'sunday' },
  { label: '금요 예배', value: 'friday' },
]

export default function SermonPage() {
  const { weekId } = useParams()
  const { showToast } = useToast()
  const weekNumber = parseInt(weekId ?? '1')
  const [service, setService] = useState('sunday')
  const [sermons, setSermons] = useState<SermonVideo[]>([])
  const [weekly, setWeekly] = useState<WeeklyData>({ sermonWatched: 0 })
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [service, weekNumber])

  async function loadData() {
    setLoading(true)
    setPlaying(null)
    try {
      const [sermonsData, weeklyData] = await Promise.all([
        api.get(`/api/weeks/${weekNumber}/sermon/${service}`),
        api.get(`/api/weekly/${weekNumber}`),
      ])
      setSermons(sermonsData)
      setWeekly({ sermonWatched: weeklyData.sermonWatched ?? 0 })
    } catch {
      setSermons([])
    } finally {
      setLoading(false)
    }
  }

  async function toggleWatched() {
    const prev = weekly.sermonWatched
    const next = prev ? 0 : 1
    setWeekly({ sermonWatched: next })
    try {
      await api.put(`/api/weekly/${weekNumber}`, { sermonWatched: next })
    } catch {
      setWeekly({ sermonWatched: prev })
      showToast('저장 실패', 'error')
    }
  }

  return (
    <AppShell title={`${weekNumber}주차 설교보기`} showBack>
      <TabNav tabs={SERVICES} activeTab={service} onChange={setService} />
      <div className="p-4 space-y-4">
        {/* 시청 완료 버튼 — 영상이 없으면 비활성화 */}
        {(() => {
          const disabled = loading || sermons.length === 0
          return (
            <button
              onClick={toggleWatched}
              disabled={disabled}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                disabled
                  ? 'opacity-40 cursor-not-allowed bg-[var(--color-surface)] border-[var(--color-border)]'
                  : weekly.sermonWatched
                    ? 'bg-[var(--color-success)]/5 border-[var(--color-success)]/30 cursor-pointer'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] cursor-pointer'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                weekly.sermonWatched && !disabled
                  ? 'bg-[var(--color-success)] text-white'
                  : 'border-2 border-[var(--color-border)]'
              }`}>
                {!!weekly.sermonWatched && !disabled && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-[var(--font-ui)] ${
                disabled
                  ? 'text-[var(--color-text-secondary)]'
                  : weekly.sermonWatched
                    ? 'text-[var(--color-success)]'
                    : 'text-[var(--color-text-primary)]'
              }`}>
                설교 시청 완료
              </span>
            </button>
          )
        })()}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--color-text-secondary)]">설교 영상을 불러오는 중...</p>
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--color-text-secondary)]">해당 주차의 설교 영상을 찾을 수 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sermons.map((sermon) => (
              <div key={sermon.videoId} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                {/* 설교 정보 헤더 */}
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-semibold text-[var(--color-primary)] font-[var(--font-heading)] leading-snug">
                    {sermon.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {sermon.scripture && (
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-secondary)] font-[var(--font-ui)]">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                        </svg>
                        {sermon.scripture}
                      </span>
                    )}
                    {sermon.preacher && (
                      <span className="text-xs text-[var(--color-text-secondary)]">{sermon.preacher}</span>
                    )}
                    <span className="text-xs text-[var(--color-text-secondary)]">{sermon.date}</span>
                  </div>
                </div>

                {/* YouTube 영상 / 썸네일 */}
                {playing === sermon.videoId ? (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${sermon.videoId}?autoplay=1&rel=0`}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setPlaying(sermon.videoId)}
                    className="relative w-full cursor-pointer group"
                  >
                    <img
                      src={sermon.thumbnail}
                      alt={sermon.title}
                      className="w-full aspect-video object-cover"
                    />
                    {/* 재생 버튼 오버레이 */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-[var(--color-secondary)] flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-[var(--color-bg)] ml-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
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
