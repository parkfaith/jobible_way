import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index'
import { users } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import type { AppEnv } from '../types'

export const usersRoute = new Hono<AppEnv>()

// GET /api/me — 현재 사용자 프로필 조회
usersRoute.get('/', requireAuth, async (c) => {
  const userId = c.get('userId')
  const [user] = await db.select().from(users).where(eq(users.id, userId))
  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json(user)
})

// POST /api/me — 최초 로그인 시 프로필 생성 (idempotent)
usersRoute.post('/', requireAuth, async (c) => {
  const userId = c.get('userId')
  let body: { name: string; email: string; startDate: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
  const { name, email, startDate } = body
  if (!name || !email) return c.json({ error: 'name and email are required' }, 400)
  await db.insert(users).values({ id: userId, name, email, startDate })
    .onConflictDoUpdate({ target: users.id, set: { name } })
  return c.json({ ok: true })
})
