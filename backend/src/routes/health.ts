import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import type { AppEnv } from '../types'

export const healthRoute = new Hono<AppEnv>()

healthRoute.get('/', async (c) => {
  const db = c.get('db')
  let dbStatus = 'ok'
  try {
    await db.run(sql`SELECT 1`)
  } catch {
    dbStatus = 'error'
  }

  const status = dbStatus === 'ok' ? 'ok' : 'degraded'

  return c.json({
    status,
    service: 'jobible-way-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    runtime: 'cloudflare-workers',
    db: dbStatus,
  }, status === 'ok' ? 200 : 503)
})
