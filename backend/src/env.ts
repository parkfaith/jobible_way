// Cloudflare Workers 환경변수 타입 정의
// wrangler.toml 또는 Cloudflare 대시보드에서 시크릿으로 설정
export type Env = {
  TURSO_DATABASE_URL: string
  TURSO_AUTH_TOKEN: string
  FIREBASE_PROJECT_ID: string
  ALLOWED_ORIGINS?: string
  NODE_ENV?: string
}
