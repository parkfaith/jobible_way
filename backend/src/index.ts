import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { healthRoute } from './routes/health'
import { curriculumRoute } from './routes/curriculum'
import { dailyRoute } from './routes/daily'
import { weeklyRoute } from './routes/weekly'
import { sermonRoute } from './routes/sermon'
import { oiaRoute, oiaItemRoute } from './routes/oia'
import { diaryRoute } from './routes/diary'
import { usersRoute } from './routes/users'
import { progressRoute } from './routes/progress'
import { createDb } from './db/index'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// Middleware — DB 인스턴스 주입
app.use('*', async (c, next) => {
  c.set('db', createDb(c.env))
  await next()
})

// CORS
app.use('*', cors({
  origin: (origin, c) => {
    const allowedOrigins = [
      'https://jobible-way.vercel.app',
      ...(c.env.ALLOWED_ORIGINS?.split(',').map((s: string) => s.trim()) ?? []),
    ]
    if (!origin) return allowedOrigins[0] ?? 'http://localhost:5173'
    if (origin.startsWith('http://localhost:')) return origin
    if (allowedOrigins.includes(origin)) return origin
    return allowedOrigins[0] ?? 'http://localhost:5173'
  },
  credentials: true,
}))
app.use('*', logger())

// Routes
app.route('/health', healthRoute)
app.route('/api/curriculum', curriculumRoute)
app.route('/api/daily', dailyRoute)
app.route('/api/weekly', weeklyRoute)
app.route('/api/me', usersRoute)

// 중첩 라우트: /api/weeks/:weekNumber/sermon, /api/weeks/:weekNumber/oia, /api/weeks/:weekNumber/diary
const weeksApi = new Hono<AppEnv>()
weeksApi.route('/:weekNumber/sermon', sermonRoute)
weeksApi.route('/:weekNumber/oia', oiaRoute)
weeksApi.route('/:weekNumber/diary', diaryRoute)
app.route('/api/weeks', weeksApi)

// OIA 개별 수정/삭제: /api/oia/:id (별도 라우트 인스턴스)
app.route('/api/oia', oiaItemRoute)

// 진도 현황 API
app.route('/api/progress', progressRoute)

export default app
