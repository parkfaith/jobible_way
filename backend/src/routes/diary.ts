import { Hono } from 'hono'
import { and, eq, sql } from 'drizzle-orm'
import { diaryEntries } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import type { AppEnv } from '../types'

export const diaryRoute = new Hono<AppEnv>()

// GET /api/weeks/:weekNumber/diary
diaryRoute.get('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 32) {
    return c.json({ error: 'Invalid week number' }, 400)
  }
  const [row] = await db.select().from(diaryEntries)
    .where(and(eq(diaryEntries.userId, userId), eq(diaryEntries.weekNumber, weekNumber)))
  return c.json(row ?? { content: '' })
})

// PUT /api/weeks/:weekNumber/diary — upsert
diaryRoute.put('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 32) {
    return c.json({ error: 'Invalid week number' }, 400)
  }
  let body: { content: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
  const { content } = body

  const [existing] = await db.select().from(diaryEntries)
    .where(and(eq(diaryEntries.userId, userId), eq(diaryEntries.weekNumber, weekNumber)))

  if (existing) {
    await db.update(diaryEntries)
      .set({ content, updatedAt: sql`(datetime('now'))` })
      .where(eq(diaryEntries.id, existing.id))
  } else {
    await db.insert(diaryEntries).values({ userId, weekNumber, content })
  }
  return c.json({ ok: true })
})
