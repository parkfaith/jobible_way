import { Hono } from 'hono'
import { and, eq, sql } from 'drizzle-orm'
import { dailyChecks } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import type { AppEnv } from '../types'

export const dailyRoute = new Hono<AppEnv>()

// 로컬 날짜 헬퍼 (KST)
function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// GET /api/daily?date=YYYY-MM-DD
dailyRoute.get('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const date = c.req.query('date') ?? localToday()
  const [row] = await db.select().from(dailyChecks)
    .where(and(eq(dailyChecks.userId, userId), eq(dailyChecks.date, date)))
  return c.json(row ?? { userId, date, prayer30min: 0, qtDone: 0, bibleReading: 0 })
})

// PUT /api/daily — upsert
dailyRoute.put('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  let body: { date: string; prayer30min?: number; qtDone?: number; bibleReading?: number }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
  const { date, prayer30min, qtDone, bibleReading } = body
  if (!date) return c.json({ error: 'date is required' }, 400)

  await db.insert(dailyChecks).values({ userId, date, prayer30min, qtDone, bibleReading })
    .onConflictDoUpdate({
      target: [dailyChecks.userId, dailyChecks.date],
      set: { prayer30min, qtDone, bibleReading, updatedAt: sql`(datetime('now'))` },
    })
  return c.json({ ok: true })
})
