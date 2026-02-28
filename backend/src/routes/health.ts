import { Hono } from 'hono'
import { db } from '../db/index'
import { sql } from 'drizzle-orm'

export const healthRoute = new Hono()

healthRoute.get('/', async (c) => {
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
    uptime: Math.floor(process.uptime()),
    db: dbStatus,
  }, status === 'ok' ? 200 : 503)
})
