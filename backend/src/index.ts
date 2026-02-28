import { serve } from '@hono/node-server'
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
import { env } from './env'
import './lib/firebase-admin'

const app = new Hono()

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// Middleware
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return 'http://localhost:5173'
    if (env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) return origin
    if (origin === 'https://jobible-way.vercel.app') return origin
    return 'http://localhost:5173'
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
const weeksApi = new Hono()
weeksApi.route('/:weekNumber/sermon', sermonRoute)
weeksApi.route('/:weekNumber/oia', oiaRoute)
weeksApi.route('/:weekNumber/diary', diaryRoute)
app.route('/api/weeks', weeksApi)

// OIA 개별 수정/삭제: /api/oia/:id (별도 라우트 인스턴스)
app.route('/api/oia', oiaItemRoute)

// 진도 현황 API
app.route('/api/progress', progressRoute)

serve({ fetch: app.fetch, port: env.PORT }, () => {
  console.log(`jobible Way API running on http://localhost:${env.PORT}`)
})

export default app
