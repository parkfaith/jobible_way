import { Hono } from 'hono'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '../db/index'
import { sermonNotes } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import type { AppEnv } from '../types'

export const sermonRoute = new Hono<AppEnv>()

// GET /api/weeks/:weekNumber/sermon — 해당 주차 설교 노트 목록
sermonRoute.get('/', requireAuth, async (c) => {
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 32) {
    return c.json({ error: 'Invalid week number' }, 400)
  }
  const rows = await db.select().from(sermonNotes)
    .where(and(eq(sermonNotes.userId, userId), eq(sermonNotes.weekNumber, weekNumber)))
    .orderBy(sermonNotes.date)
  return c.json(rows)
})

// GET /api/weeks/:weekNumber/sermon/:service
sermonRoute.get('/:service', requireAuth, async (c) => {
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 32) {
    return c.json({ error: 'Invalid week number' }, 400)
  }
  const service = c.req.param('service')
  const [row] = await db.select().from(sermonNotes)
    .where(and(
      eq(sermonNotes.userId, userId),
      eq(sermonNotes.weekNumber, weekNumber),
      eq(sermonNotes.service, service),
    ))
  return c.json(row ?? { userId, weekNumber, service, date: '', preacher: '', scripture: '', content: '' })
})

// PUT /api/weeks/:weekNumber/sermon/:service — upsert
sermonRoute.put('/:service', requireAuth, async (c) => {
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 32) {
    return c.json({ error: 'Invalid week number' }, 400)
  }
  const service = c.req.param('service')
  let body: { date: string; preacher?: string; scripture?: string; content?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
  const { date, preacher, scripture, content } = body

  const [existing] = await db.select().from(sermonNotes)
    .where(and(
      eq(sermonNotes.userId, userId),
      eq(sermonNotes.weekNumber, weekNumber),
      eq(sermonNotes.service, service),
    ))

  if (existing) {
    await db.update(sermonNotes)
      .set({ date, preacher, scripture, content, updatedAt: sql`(datetime('now'))` })
      .where(eq(sermonNotes.id, existing.id))
  } else {
    await db.insert(sermonNotes).values({ userId, weekNumber, service, date, preacher, scripture, content })
  }
  return c.json({ ok: true })
})
