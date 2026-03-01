import { Hono } from 'hono'
import { and, eq, desc, sql } from 'drizzle-orm'
import { oiaNotes } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import type { AppEnv } from '../types'

export const oiaRoute = new Hono<AppEnv>()

// GET /api/weeks/:weekNumber/oia — 해당 주차 OIA 목록
oiaRoute.get('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 32) {
    return c.json({ error: 'Invalid week number' }, 400)
  }
  const rows = await db.select().from(oiaNotes)
    .where(and(eq(oiaNotes.userId, userId), eq(oiaNotes.weekNumber, weekNumber)))
    .orderBy(desc(oiaNotes.createdAt))
  return c.json(rows)
})

// POST /api/weeks/:weekNumber/oia — 새 OIA 생성
oiaRoute.post('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 32) {
    return c.json({ error: 'Invalid week number' }, 400)
  }
  let body: { date: string; scripture?: string; observation?: string; interpretation?: string; application?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
  const { date, scripture, observation, interpretation, application } = body
  if (!date) return c.json({ error: 'date is required' }, 400)
  const [row] = await db.insert(oiaNotes).values({ userId, weekNumber, date, scripture, observation, interpretation, application }).returning()
  return c.json(row, 201)
})

// 별도 라우트 인스턴스: /api/oia/:id (수정/삭제)
export const oiaItemRoute = new Hono<AppEnv>()

// PUT /api/oia/:id — 수정
oiaItemRoute.put('/:id', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid id' }, 400)
  let body: { scripture?: string; observation?: string; interpretation?: string; application?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
  const { scripture, observation, interpretation, application } = body
  const result = await db.update(oiaNotes)
    .set({ scripture, observation, interpretation, application, updatedAt: sql`(datetime('now'))` })
    .where(and(eq(oiaNotes.id, id), eq(oiaNotes.userId, userId)))
  if (result.rowsAffected === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

// DELETE /api/oia/:id
oiaItemRoute.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid id' }, 400)
  const result = await db.delete(oiaNotes).where(and(eq(oiaNotes.id, id), eq(oiaNotes.userId, userId)))
  if (result.rowsAffected === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})
