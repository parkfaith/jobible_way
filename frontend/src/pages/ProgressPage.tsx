import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'
import { ListSkeleton } from '../components/ui/Skeleton'
import { today, formatDate } from '../lib/date'

interface HeatmapEntry { date: string; count: number; prayer: number; qt: number; bible: number; verse: number }
interface StreakData { currentStreak: number; maxStreak: number; totalDone: number }
interface VolumeData { volume: number; total: number; done: number; percentage: number }

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
      const startDate = '2026-03-01'
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

        {/* 이번 주 항목별 달성률 */}
        <WeeklyRateCard data={heatmap} />

        {/* 32주 항목별 주간 히트맵 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <h3 className="text-sm font-medium text-[var(--color-primary)] font-[var(--font-ui)] mb-1">32주 체크 현황</h3>
          <p className="text-[10px] text-[var(--color-text-secondary)] mb-3">주간 완료율에 따라 색상이 달라집니다</p>
          <WeeklyHeatmap data={heatmap} />
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

/* ─── 공통 항목 설정 ─── */

const COURSE_START = '2026-03-01'

const ITEM_CONFIG = [
  { key: 'prayer' as const, label: '기도', icon: '🙏', color: '#F5A623' },
  { key: 'qt' as const, label: 'QT', icon: '📖', color: '#4FC3F7' },
  { key: 'bible' as const, label: '통독', icon: '📕', color: '#81C784' },
  { key: 'verse' as const, label: '암송', icon: '✍️', color: '#CE93D8' },
]

type ItemKey = typeof ITEM_CONFIG[number]['key']

// 과정 시작일(일요일) 기준으로 현재 주차의 월~일 날짜 범위 계산
function getCurrentWeekRange() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const day = now.getDay() // 0=일 ~ 6=토
  // 월요일 기준 시작 (일요일이면 6일 전, 월요일이면 0일 전)
  const diffToMon = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diffToMon)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { monday, sunday }
}

function formatShortDate(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/* ─── 이번 주 항목별 달성률 카드 ─── */

function WeeklyRateCard({ data }: { data: HeatmapEntry[] }) {
  const { monday, sunday } = getCurrentWeekRange()
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // 이번 주 월~오늘까지의 날짜 목록
  const weekDates: string[] = []
  const d = new Date(monday)
  while (d <= now && d <= sunday) {
    weekDates.push(formatDate(d))
    d.setDate(d.getDate() + 1)
  }

  const dataMap = new Map(data.map(e => [e.date, e]))
  const totalDays = 7 // 항상 7일 기준

  const rates = ITEM_CONFIG.map(item => {
    const done = weekDates.filter(date => {
      const entry = dataMap.get(date)
      return entry ? entry[item.key] === 1 : false
    }).length
    return { ...item, done, rate: Math.round((done / totalDays) * 100) }
  })

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--color-primary)] font-[var(--font-ui)]">이번 주 달성률</h3>
        <span className="text-[11px] text-[var(--color-text-secondary)]">
          {formatShortDate(monday)} ~ {formatShortDate(sunday)}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {rates.map(r => (
          <div key={r.key} className="text-center">
            <p className="text-lg mb-1">{r.icon}</p>
            <p className="text-xl font-bold font-[var(--font-heading)]" style={{ color: r.color }}>
              {r.done}<span className="text-xs font-normal text-[var(--color-text-secondary)]">/7</span>
            </p>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{r.label}</p>
            <div className="mt-1.5 mx-auto w-full h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${r.rate}%`, backgroundColor: r.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── 32주 항목별 주간 히트맵 ─── */

// 주간 완료율에 따른 색상 반환 (보색 대비로 명확히 구분)
// 100% → 골드, 80%+ → 파랑, 50%+ → 주황, 1%+ → 연보라, 0% → 빈 칸
function getWeekColor(rate: number) {
  if (rate >= 100) return '#F5A623'  // 골드 — 완벽
  if (rate >= 80) return '#2196F3'   // 파랑 — 훌륭
  if (rate >= 50) return '#FF7043'   // 주황 — 양호
  return 'transparent'               // 50% 미만 — 테두리만
}

function getWeekNumber(dateStr: string): number {
  const start = new Date(COURSE_START + 'T00:00:00')
  const target = new Date(dateStr + 'T00:00:00')
  const diff = Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.floor(diff / 7) + 1
}

function WeeklyHeatmap({ data }: { data: HeatmapEntry[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // 32주 × 4항목의 주간 완료율 계산
  const weeklyData: Record<number, Record<ItemKey, { done: number; total: number }>> = {}
  for (let w = 1; w <= 32; w++) {
    weeklyData[w] = {
      prayer: { done: 0, total: 7 },
      qt: { done: 0, total: 7 },
      bible: { done: 0, total: 7 },
      verse: { done: 0, total: 7 },
    }
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const currentWeek = getWeekNumber(formatDate(now))

  data.forEach(entry => {
    const week = getWeekNumber(entry.date)
    if (week < 1 || week > 32) return
    ITEM_CONFIG.forEach(item => {
      if (entry[item.key] === 1) {
        weeklyData[week][item.key].done++
      }
    })
  })

  // 셀 크기 고정, 간격을 남은 공간으로 균등 분배하여 좌우 여백 동일하게
  const labelWidth = 32
  const colsPerRow = 8
  const cellSize = 24
  const availableForGaps = containerWidth - labelWidth - cellSize * colsPerRow
  const gap = availableForGaps > 0 ? availableForGaps / (colsPerRow - 1) : 6
  const weekLabelHeight = 16
  const blockRows = Math.ceil(32 / colsPerRow)

  return (
    <div ref={containerRef} className="space-y-4">
      {/* 범례 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#F5A623]" />
          <span className="text-[10px] text-[var(--color-text-secondary)]">100%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#2196F3]" />
          <span className="text-[10px] text-[var(--color-text-secondary)]">80%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#FF7043]" />
          <span className="text-[10px] text-[var(--color-text-secondary)]">50%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm border border-[var(--color-border)]" />
          <span className="text-[10px] text-[var(--color-text-secondary)]">50%↓</span>
        </div>
      </div>

      {/* 32주 그리드 - 8주씩 4줄 */}
      {containerWidth > 0 && Array.from({ length: blockRows }, (_, blockIdx) => {
        const startWeek = blockIdx * colsPerRow + 1
        const endWeek = Math.min(startWeek + colsPerRow - 1, 32)
        const weeks = Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i)
        const svgWidth = containerWidth
        const svgHeight = weekLabelHeight + ITEM_CONFIG.length * (cellSize + gap) - gap

        return (
          <div key={blockIdx}>
            <svg width={svgWidth} height={svgHeight}>
              {/* 주차 번호 헤더 */}
              {weeks.map((w, colIdx) => (
                <text
                  key={`wk-${w}`}
                  x={labelWidth + colIdx * (cellSize + gap) + cellSize / 2}
                  y={11}
                  textAnchor="middle"
                  fill={w === currentWeek ? 'var(--color-secondary)' : 'var(--color-text-secondary)'}
                  fontSize={9}
                  fontWeight={w === currentWeek ? 'bold' : 'normal'}
                >
                  {w}주
                </text>
              ))}
              {/* 항목별 행 */}
              {ITEM_CONFIG.map((item, rowIdx) => {
                const y = weekLabelHeight + rowIdx * (cellSize + gap)
                return (
                  <g key={item.key}>
                    <text
                      x={0}
                      y={y + cellSize / 2 + 3}
                      fill="var(--color-text-secondary)"
                      fontSize={9}
                    >
                      {item.label}
                    </text>
                    {weeks.map((w, colIdx) => {
                      const wd = weeklyData[w][item.key]
                      const rate = Math.round((wd.done / wd.total) * 100)
                      const isFuture = w > currentWeek
                      const color = isFuture ? 'transparent' : getWeekColor(rate)
                      const showBorder = !isFuture && rate < 50

                      return (
                        <rect
                          key={`${item.key}-${w}`}
                          x={labelWidth + colIdx * (cellSize + gap)}
                          y={y}
                          width={cellSize}
                          height={cellSize}
                          rx={3}
                          fill={color}
                          stroke={w === currentWeek ? 'var(--color-secondary)' : showBorder ? '#5A6078' : 'none'}
                          strokeWidth={w === currentWeek ? 1.5 : showBorder ? 1.5 : 0}
                          opacity={isFuture ? 0.15 : 1}
                        />
                      )
                    })}
                  </g>
                )
              })}
            </svg>
          </div>
        )
      })}
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
