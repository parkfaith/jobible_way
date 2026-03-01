import type { Env } from './env'
import type { Database } from './db/index'

// Hono 컨텍스트에 Workers Bindings + userId/db 변수 타입 선언
export type AppEnv = {
  Bindings: Env
  Variables: {
    userId: string
    db: Database
  }
}
