import { Hono } from 'hono'
import { and, eq, gte, lte, desc } from 'drizzle-orm'
import { dailyChecks, weeklyTasks, curriculum } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import type { AppEnv } from '../types'

export const progressRoute = new Hono<AppEnv>()

// 로컬 날짜 헬퍼
function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// GET /api/progress/heatmap?from=YYYY-MM-DD&to=YYYY-MM-DD
progressRoute.get('/heatmap', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const from = c.req.query('from') ?? '2026-01-05'
  const to = c.req.query('to') ?? localToday()

  const rows = await db.select().from(dailyChecks)
    .where(
      and(
        eq(dailyChecks.userId, userId),
        gte(dailyChecks.date, from),
        lte(dailyChecks.date, to),
      )
    )

  const heatmap = rows.map(r => ({
    date: r.date,
    count: (r.prayer30min ?? 0) + (r.qtDone ?? 0) + (r.bibleReading ?? 0) + (r.verseReading ?? 0),
  }))

  return c.json(heatmap)
})

// GET /api/progress/streak
progressRoute.get('/streak', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')

  const rows = await db.select().from(dailyChecks)
    .where(eq(dailyChecks.userId, userId))
    .orderBy(desc(dailyChecks.date))

  const fullyDoneDates = new Set(
    rows
      .filter(r => r.prayer30min && r.qtDone && r.bibleReading && r.verseReading)
      .map(r => r.date)
  )

  // 현재 스트릭
  let currentStreak = 0
  const todayStr = localToday()
  const date = new Date(`${todayStr}T00:00:00`)
  // 오늘 완료 안 했으면 어제부터 카운트
  if (!fullyDoneDates.has(todayStr)) {
    date.setDate(date.getDate() - 1)
  }

  function dateToStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  while (fullyDoneDates.has(dateToStr(date))) {
    currentStreak++
    date.setDate(date.getDate() - 1)
  }

  // 최장 스트릭
  const sortedDates = [...fullyDoneDates].sort()
  let maxStreak = 0
  let tempStreak = 0
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prev = new Date(sortedDates[i - 1] + 'T00:00:00')
      const curr = new Date(sortedDates[i] + 'T00:00:00')
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      tempStreak = diff === 1 ? tempStreak + 1 : 1
    }
    maxStreak = Math.max(maxStreak, tempStreak)
  }

  return c.json({
    currentStreak,
    maxStreak,
    totalDone: fullyDoneDates.size,
  })
})

// GET /api/progress/volumes
progressRoute.get('/volumes', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')

  const tasks = await db.select().from(weeklyTasks)
    .where(eq(weeklyTasks.userId, userId))

  const currRows = await db.select().from(curriculum)

  const volumes = [1, 2, 3].map(vol => {
    const volWeeks = currRows.filter(cr => cr.volume === vol)
    const doneWeeks = volWeeks.filter(w =>
      tasks.find(t => t.weekNumber === w.weekNumber && t.verseMemorized && t.previewDone)
    )
    return {
      volume: vol,
      total: volWeeks.length,
      done: doneWeeks.length,
      percentage: volWeeks.length ? Math.round((doneWeeks.length / volWeeks.length) * 100) : 0,
    }
  })

  return c.json(volumes)
})
