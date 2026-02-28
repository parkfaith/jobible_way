import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'
import { ListSkeleton } from '../components/ui/Skeleton'
import { today, formatDate } from '../lib/date'

interface HeatmapEntry { date: string; count: number }
interface StreakData { currentStreak: number; maxStreak: number; totalDone: number }
interface VolumeData { volume: number; total: number; done: number; percentage: number }

const HEATMAP_COLORS = ['#1C2541', '#F5A62340', '#F5A62380', '#F5A623']
const VOLUME_LABELS = ['제1권', '제2권', '제3권']

export default function ProgressPage() {
  const navigate = useNavigate()
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([])
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, maxStreak: 0, totalDone: 0 })
  const [volumes, setVolumes] = useState<VolumeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [])

  async function loadProgress() {
    try {
      const startDate = '2026-01-05'
      const todayStr = today()
      const [h, s, v] = await Promise.all([
        api.get(`/api/progress/heatmap?from=${startDate}&to=${todayStr}`),
        api.get('/api/progress/streak'),
        api.get('/api/progress/volumes'),
      ])
      setHeatmap(h)
      setStreak(s)
      setVolumes(v)
    } catch {
      // 기본값 유지
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppShell title="진도 현황">
        <ListSkeleton />
      </AppShell>
    )
  }

  return (
    <AppShell title="진도 현황">
      <div className="p-4 space-y-4">
        {/* 스트릭 카드 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--color-primary)] font-[var(--font-ui)]">연속 달성</h3>
            {streak.currentStreak >= 7 && (
              <span className="text-xs font-bold text-[var(--color-secondary)] font-[var(--font-ui)]">
                Great!
              </span>
            )}
          </div>
          <div className="flex items-center gap-6 justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-primary)] font-[var(--font-heading)]">
                {streak.currentStreak}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">현재 스트릭</p>
            </div>
            <div className="w-px h-10 bg-[var(--color-border)]" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-secondary)] font-[var(--font-heading)]">
                {streak.maxStreak}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">최장 스트릭</p>
            </div>
            <div className="w-px h-10 bg-[var(--color-border)]" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-success)] font-[var(--font-heading)]">
                {streak.totalDone}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">전체 완료일</p>
            </div>
          </div>
          {streak.currentStreak === 0 && (
            <p className="text-xs text-[var(--color-text-secondary)] text-center mt-3">
              오늘부터 기도, QT, 성경통독 모두 완료하면 스트릭이 시작됩니다!
            </p>
          )}
        </div>

        {/* 히트맵 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <h3 className="text-sm font-medium text-[var(--color-primary)] font-[var(--font-ui)] mb-3">일일 체크 히트맵</h3>
          <HeatmapCalendar data={heatmap} />
          <div className="flex items-center gap-1 mt-3 justify-end">
            <span className="text-[10px] text-[var(--color-text-secondary)]">적음</span>
            {HEATMAP_COLORS.map((color, i) => (
              <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            ))}
            <span className="text-[10px] text-[var(--color-text-secondary)]">많음</span>
          </div>
        </div>

        {/* 권별 도넛 차트 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <h3 className="text-sm font-medium text-[var(--color-primary)] font-[var(--font-ui)] mb-4">권별 완료율</h3>
          <div className="flex justify-around">
            {volumes.map((v, i) => (
              <DonutChart key={v.volume} percentage={v.percentage} label={VOLUME_LABELS[i]} />
            ))}
          </div>
        </div>

        {/* 빠른 접근 */}
        <button
          onClick={() => navigate('/curriculum')}
          className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl cursor-pointer transition-shadow hover:shadow-md"
        >
          <span className="text-sm text-[var(--color-text-primary)] font-[var(--font-ui)]">전체 커리큘럼 보기</span>
          <svg className="w-4 h-4 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </AppShell>
  )
}

/* ─── Heatmap Calendar (GitHub style, SVG) ─── */

function HeatmapCalendar({ data }: { data: HeatmapEntry[] }) {
  const dataMap = new Map(data.map(d => [d.date, d.count]))
  const startDate = new Date('2026-01-05T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const dates: string[] = []
  const d = new Date(startDate)
  while (d <= now) {
    dates.push(formatDate(d))
    d.setDate(d.getDate() + 1)
  }

  const firstDay = startDate.getDay()
  const cells: { date: string; x: number; y: number; count: number }[] = []

  dates.forEach((date, i) => {
    const dayIndex = i + firstDay
    const week = Math.floor(dayIndex / 7)
    const dayOfWeek = dayIndex % 7
    cells.push({ date, x: week, y: dayOfWeek, count: dataMap.get(date) ?? 0 })
  })

  const totalWeeks = cells.length > 0 ? cells[cells.length - 1].x + 1 : 1
  const cellSize = 12
  const gap = 2
  const svgWidth = totalWeeks * (cellSize + gap)
  const svgHeight = 7 * (cellSize + gap)

  const todayStr = today()

  return (
    <div className="overflow-x-auto">
      <svg width={svgWidth} height={svgHeight}>
        {cells.map((cell) => (
          <rect
            key={cell.date}
            x={cell.x * (cellSize + gap)}
            y={cell.y * (cellSize + gap)}
            width={cellSize}
            height={cellSize}
            rx={2}
            fill={HEATMAP_COLORS[Math.min(cell.count, 3)]}
            stroke={cell.date === todayStr ? 'var(--color-primary)' : 'none'}
            strokeWidth={cell.date === todayStr ? 1.5 : 0}
          />
        ))}
      </svg>
    </div>
  )
}

/* ─── Donut Chart (SVG) ─── */

function DonutChart({ percentage, label }: { percentage: number; label: string }) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="6" />
          <circle
            cx="40" cy="40" r={radius} fill="none"
            stroke="var(--color-secondary)" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-[var(--color-primary)] font-[var(--font-heading)]">
            {percentage}%
          </span>
        </div>
      </div>
      <p className="text-xs text-[var(--color-text-secondary)] mt-2 font-[var(--font-ui)]">{label}</p>
    </div>
  )
}
