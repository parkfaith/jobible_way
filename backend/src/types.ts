import type { Hono } from 'hono'

// Hono 컨텍스트에 userId 변수 타입 선언
export type AppEnv = {
  Variables: {
    userId: string
  }
}

export type AppHono = Hono<AppEnv>
