import type { Context, Next } from 'hono'
import type { AppEnv } from '../types'
import { verifyFirebaseToken } from '../lib/firebase-admin'

export const requireAuth = async (c: Context<AppEnv>, next: Next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  try {
    const uid = await verifyFirebaseToken(token, c.env.FIREBASE_PROJECT_ID)
    c.set('userId', uid)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}
