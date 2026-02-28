import { getAuth } from 'firebase-admin/auth'
import type { Context, Next } from 'hono'

export const requireAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  try {
    const decoded = await getAuth().verifyIdToken(token)
    c.set('userId', decoded.uid)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}
