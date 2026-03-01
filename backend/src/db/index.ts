import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
import type { Env } from '../env'

// Workers 환경: 요청마다 env에서 DB 클라이언트 생성
export function createDb(env: Env) {
  const client = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  })
  return drizzle(client, { schema })
}

export type Database = ReturnType<typeof createDb>
