import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { users } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import type { AppEnv } from '../types'

// 관리자 이메일 (이 이메일로 로그인한 사용자만 접근 가능)
const ADMIN_EMAIL = 'parkfaith75@gmail.com'

export const adminRoute = new Hono<AppEnv>()

// 관리자 권한 체크 미들웨어
adminRoute.use('*', requireAuth, async (c, next) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const [me] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId))
  if (!me || me.email !== ADMIN_EMAIL) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  await next()
})

// GET /api/admin/users — 전체 회원 목록 + 최종 로그인 시간
adminRoute.get('/users', async (c) => {
  const db = c.get('db')
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    lastLoginAt: users.lastLoginAt,
    createdAt: users.createdAt,
  }).from(users).orderBy(desc(users.lastLoginAt))
  return c.json(allUsers)
})
