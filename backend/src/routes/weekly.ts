import { Hono } from 'hono'
import { and, eq, sql } from 'drizzle-orm'
import { weeklyTasks } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import type { AppEnv } from '../types'

export const weeklyRoute = new Hono<AppEnv>()

// GET /api/weekly — 전체 주차 주간체크 현황
weeklyRoute.get('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const rows = await db.select().from(weeklyTasks)
    .where(eq(weeklyTasks.userId, userId))
  return c.json(rows)
})

// GET /api/weekly/:weekNumber
weeklyRoute.get('/:weekNumber', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 32) {
    return c.json({ error: 'Invalid week number' }, 400)
  }
  const [row] = await db.select().from(weeklyTasks)
    .where(and(eq(weeklyTasks.userId, userId), eq(weeklyTasks.weekNumber, weekNumber)))
  return c.json(row ?? { userId, weekNumber, verseMemorized: 0, bookReportDone: 0, previewDone: 0, sermonWatched: 0 })
})

// PUT /api/weekly/:weekNumber — upsert
weeklyRoute.put('/:weekNumber', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 32) {
    return c.json({ error: 'Invalid week number' }, 400)
  }
  let body: { verseMemorized?: number; bookReportDone?: number; previewDone?: number; sermonWatched?: number }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
  const { verseMemorized, bookReportDone, previewDone, sermonWatched } = body

  await db.insert(weeklyTasks).values({ userId, weekNumber, verseMemorized, bookReportDone, previewDone, sermonWatched })
    .onConflictDoUpdate({
      target: [weeklyTasks.userId, weeklyTasks.weekNumber],
      set: { verseMemorized, bookReportDone, previewDone, sermonWatched, updatedAt: sql`(datetime('now'))` },
    })
  return c.json({ ok: true })
})
