import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index'
import { curriculum } from '../db/schema'

export const curriculumRoute = new Hono()

// GET /api/curriculum — 전체 32주 목록
curriculumRoute.get('/', async (c) => {
  const rows = await db.select().from(curriculum).orderBy(curriculum.weekNumber)
  return c.json(rows)
})

// GET /api/curriculum/:weekNumber — 특정 주차 상세
curriculumRoute.get('/:weekNumber', async (c) => {
  const week = parseInt(c.req.param('weekNumber'))
  if (isNaN(week) || week < 1 || week > 32) {
    return c.json({ error: 'Invalid week number' }, 400)
  }
  const [row] = await db.select().from(curriculum).where(eq(curriculum.weekNumber, week))
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(row)
})
