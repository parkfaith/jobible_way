import 'dotenv/config'

const required = [
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
] as const

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`)
  }
}

export const env = {
  TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL!,
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN!,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID!,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL!,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY!,
  PORT: parseInt(process.env.PORT ?? '3000'),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
}
