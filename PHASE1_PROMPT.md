# PHASE 1 개발 프롬프트 — 기반 구축 (Foundation & Infrastructure)

## 프로젝트 개요

**jobible Way** — 낙원제일교회 제2기 제자훈련(32주) 전용 모바일 웹앱

- **슬로건**: "제자의 길을 걷는 여정"
- **목표 사용자**: 훈련생 20~50명 (성인 전반)
- **주요 환경**: 모바일 브라우저 (375px~768px), PWA 대응 예정

---

## Phase 1 목표

> 앱이 실제로 구동되는 골격을 완성한다.
> 훈련생이 로그인하여 기본 화면을 탐색할 수 있는 상태.

---

## 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| Frontend | React 18 + Vite | SPA |
| Styling | Tailwind CSS v4 | 유틸리티 기반 |
| Routing | React Router v6 | |
| 상태관리 | Zustand | 경량 전역 상태 |
| 인증 | Clerk | 이메일 + Google 로그인, JWT |
| Backend | Node.js + Hono + TypeScript | 경량 API |
| ORM | Drizzle ORM | TypeScript 타입 안전 |
| Database | Turso (LibSQL/SQLite) | 5GB 무료 |
| Frontend 배포 | Vercel | CDN + 자동 배포 |
| Backend 배포 | Render | 750h/월 무료 Web Service |

---

## 폴더 구조 (모노레포)

```
jobible-way/
├── frontend/
│   ├── public/
│   │   └── icons/              # PWA 아이콘 (후 Phase)
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/             # Button, Card, Badge, BottomNav
│   │   │   └── layout/         # AppShell, Header
│   │   ├── pages/
│   │   │   ├── OnboardingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx   # placeholder
│   │   │   ├── WeeksPage.tsx       # placeholder
│   │   │   ├── DailyPage.tsx       # placeholder
│   │   │   ├── ProgressPage.tsx    # placeholder
│   │   │   └── ProfilePage.tsx     # placeholder
│   │   ├── router/
│   │   │   └── index.tsx
│   │   ├── store/
│   │   │   └── useAppStore.ts
│   │   ├── lib/
│   │   │   └── api.ts          # fetch wrapper
│   │   ├── styles/
│   │   │   └── index.css       # Tailwind import + 커스텀 CSS 변수
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts      # Tailwind v4 설정
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts       # Drizzle 스키마
│   │   │   ├── migrate.ts      # 마이그레이션 실행
│   │   │   └── seed.ts         # 커리큘럼 32주 seed
│   │   ├── middleware/
│   │   │   └── auth.ts         # Clerk JWT 검증
│   │   ├── routes/
│   │   │   └── health.ts       # GET /health
│   │   ├── index.ts            # Hono 앱 진입점
│   │   └── env.ts              # 환경변수 검증
│   ├── drizzle/
│   │   └── migrations/         # drizzle-kit 생성 파일
│   ├── drizzle.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 구현 태스크 목록

### 1. 레포지토리 초기 설정

```bash
# 루트
mkdir jobible-way && cd jobible-way
git init

# Frontend
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install

# Backend
mkdir -p backend/src && cd backend
npm init -y
npm install hono @hono/node-server typescript tsx
npm install -D @types/node
```

**`.gitignore` 필수 항목:**
```
node_modules/
.env
.env.local
dist/
.turso/
```

---

### 2. Tailwind CSS v4 설정

```bash
cd frontend
npm install tailwindcss@latest @tailwindcss/vite
```

**`frontend/vite.config.ts`:**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**`frontend/src/styles/index.css`** — CSS 변수 + 디자인 토큰:
```css
@import "tailwindcss";

:root {
  /* Color Palette — jobible Way */
  --color-primary: #1A2E4A;       /* Deep Navy Blue */
  --color-secondary: #C9A84C;     /* Warm Gold */
  --color-bg: #FAF8F5;            /* Cream White */
  --color-surface: #FFFFFF;
  --color-text-primary: #1F1F1F;
  --color-text-secondary: #6B7280;
  --color-success: #4A7C59;       /* Sage Green */
  --color-border: #E5E0D8;

  /* Typography */
  --font-heading: 'Cormorant Garamond', Georgia, serif;
  --font-body-en: 'Crimson Pro', Georgia, serif;
  --font-body-kr: 'Noto Serif KR', serif;
  --font-ui: 'Inter', sans-serif;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-body-kr), var(--font-body-en);
  max-width: 768px;
  margin: 0 auto;
}
```

**Google Fonts 로드 (index.html):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Crimson+Pro:wght@400;600&family=Noto+Serif+KR:wght@400;500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
```

---

### 3. 디자인 시스템 컴포넌트

#### `Button` 컴포넌트 (`frontend/src/components/ui/Button.tsx`)

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}
```

- **primary**: `background: var(--color-secondary)`, 다크 텍스트, 호버 시 골드 다크닝
- **secondary**: `border: 2px solid var(--color-primary)`, 딥 블루 텍스트
- **ghost**: 배경 없음, 텍스트만
- **loading**: 스피너 표시 + 비활성화

#### `Card` 컴포넌트 (`frontend/src/components/ui/Card.tsx`)

```tsx
interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}
```

- `background: var(--color-surface)`
- `border: 1px solid var(--color-border)`
- `border-radius: 12px`
- `box-shadow: 0 1px 3px rgba(0,0,0,0.06)`
- 클릭 가능 시 호버 효과

#### `Badge` 컴포넌트 (`frontend/src/components/ui/Badge.tsx`)

```tsx
type BadgeVariant = 'default' | 'success' | 'gold' | 'outline'
```

- **default**: 크림 배경 + 딥 블루 텍스트
- **success**: 세이지 그린 배경 + 화이트 텍스트
- **gold**: 골드 배경 + 다크 텍스트
- **outline**: 보더만 있는 스타일

#### `BottomNav` 컴포넌트 (`frontend/src/components/ui/BottomNav.tsx`)

```tsx
const NAV_ITEMS = [
  { path: '/home',       icon: HomeIcon,     label: '홈' },
  { path: '/weeks',      icon: BookOpenIcon, label: '주차' },
  { path: '/daily',      icon: CheckIcon,    label: '체크' },
  { path: '/progress',   icon: ChartIcon,    label: '진도' },
  { path: '/profile',    icon: UserIcon,     label: '설정' },
]
```

- **배경**: `var(--color-primary)` (딥 블루)
- **활성 아이콘**: `var(--color-secondary)` (골드)
- **비활성**: 화이트 60% 투명도
- `safe-area-inset-bottom` 패딩 적용 (iOS 홈 인디케이터 대응)
- `position: fixed; bottom: 0;`

---

### 4. 레이아웃 셸 (`AppShell`)

**`frontend/src/components/layout/AppShell.tsx`:**
```tsx
// 역할: 상단 헤더 + 콘텐츠 영역 + 하단 BottomNav 포함 레이아웃 래퍼
// - 헤더: 페이지 타이틀, 선택적 우측 액션 버튼
// - 콘텐츠: pb-20 (BottomNav 높이만큼 padding-bottom)
// - BottomNav는 인증 완료 후에만 표시
```

**레이아웃 구성:**
```
┌────────────────────────────┐ ← max-width: 768px
│  Header (선택적)            │
├────────────────────────────┤
│                            │
│  <Outlet /> (페이지 콘텐츠)  │
│                            │
│  (pb-20 여백)               │
├────────────────────────────┤
│  BottomNav (fixed bottom)  │
└────────────────────────────┘
```

---

### 5. React Router v6 라우팅 설정

**`frontend/src/router/index.tsx`:**

```tsx
import { createBrowserRouter } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

// 라우트 구조
const router = createBrowserRouter([
  {
    path: '/',
    element: <OnboardingPage />,          // 비로그인 랜딩
  },
  {
    path: '/login',
    element: <LoginPage />,               // Clerk 로그인 UI
  },
  {
    path: '/',
    element: <ProtectedLayout />,         // 인증 필요 레이아웃
    children: [
      { path: 'home',     element: <DashboardPage /> },
      { path: 'weeks',    element: <WeeksPage /> },
      { path: 'daily',    element: <DailyPage /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'profile',  element: <ProfilePage /> },
      // Phase 2에서 추가될 중첩 라우트 예약
      // { path: 'weeks/:weekId', element: <WeekDetailPage /> },
    ],
  },
])
```

**`ProtectedLayout`**: `<SignedIn>`이 아니면 `/login`으로 리다이렉트

---

### 6. Clerk 인증 설정

```bash
cd frontend
npm install @clerk/clerk-react
```

**환경변수 (`frontend/.env.local`):**
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
```

**`frontend/src/main.tsx`:**
```tsx
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

root.render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignInUrl="/home" afterSignUpUrl="/home">
    <RouterProvider router={router} />
  </ClerkProvider>
)
```

**`LoginPage.tsx`:**
```tsx
import { SignIn } from '@clerk/clerk-react'

// Clerk 내장 SignIn 컴포넌트 사용
// appearance 커스터마이징: primary color → #C9A84C (골드)
```

**Clerk Dashboard 설정:**
- Enable: Email/Password 로그인
- Enable: Google OAuth
- Redirect URL after sign-in: `/home`
- Branding: 앱 이름, 로고 설정

---

### 7. Hono 백엔드 설정

```bash
cd backend
npm install hono @hono/node-server @clerk/backend
npm install drizzle-orm @libsql/client
npm install -D drizzle-kit tsx typescript @types/node
```

**`backend/src/index.ts`:**
```ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { healthRoute } from './routes/health'

const app = new Hono()

// 미들웨어
app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'https://jobible-way.vercel.app', // 배포 후 실제 URL로 변경
  ],
  credentials: true,
}))
app.use('*', logger())

// 라우트
app.route('/health', healthRoute)
// Phase 2에서 추가: app.route('/api/...', ...)

export default app

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('🚀 jobible Way API running on http://localhost:3000')
})
```

**`backend/src/routes/health.ts`:**
```ts
import { Hono } from 'hono'

export const healthRoute = new Hono()

healthRoute.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'jobible-way-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})
```

**`backend/src/env.ts`** — 환경변수 검증:
```ts
const required = ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'CLERK_SECRET_KEY']
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env: ${key}`)
}

export const env = {
  TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL!,
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN!,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
  PORT: parseInt(process.env.PORT ?? '3000'),
}
```

---

### 8. Clerk JWT 미들웨어 (백엔드)

**`backend/src/middleware/auth.ts`:**
```ts
import { createClerkClient } from '@clerk/backend'
import { env } from '../env'

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })

export const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  try {
    const payload = await clerk.verifyToken(token)
    c.set('userId', payload.sub)   // Clerk userId를 컨텍스트에 저장
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}
```

**사용 예시 (Phase 2 라우트):**
```ts
app.use('/api/*', requireAuth)
```

---

### 9. Drizzle ORM 스키마

**`backend/src/db/schema.ts`:**

```ts
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// 사용자 프로필 (Clerk userId 기반)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),               // Clerk user_id
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  cohort: integer('cohort').default(2),      // 기수
  startDate: text('start_date').notNull(),   // ISO date
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// 커리큘럼 (공통 데이터)
export const curriculum = sqliteTable('curriculum', {
  id: integer('id').primaryKey(),
  weekNumber: integer('week_number').notNull().unique(),  // 1~32
  volume: integer('volume').notNull(),                    // 1, 2, 3
  lessonNumber: integer('lesson_number').notNull(),
  title: text('title').notNull(),
  theme: text('theme'),
  scripture: text('scripture').notNull(),
  youtubeVideoId: text('youtube_video_id'),
  requiredBook: text('required_book'),
})

// 설교 노트
export const sermonNotes = sqliteTable('sermon_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  weekNumber: integer('week_number').notNull(),
  service: text('service').notNull(),  // 'sunday' | 'friday'
  date: text('date').notNull(),
  preacher: text('preacher'),
  scripture: text('scripture'),
  content: text('content'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// OIA 묵상 기록
export const oiaNotes = sqliteTable('oia_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  weekNumber: integer('week_number').notNull(),
  date: text('date').notNull(),
  scripture: text('scripture'),
  observation: text('observation'),
  interpretation: text('interpretation'),
  application: text('application'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// 신앙 일기
export const diaryEntries = sqliteTable('diary_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  weekNumber: integer('week_number').notNull(),
  content: text('content'),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// 주간 과제
export const weeklyTasks = sqliteTable('weekly_tasks', {
  userId: text('user_id').notNull().references(() => users.id),
  weekNumber: integer('week_number').notNull(),
  verseMemorized: integer('verse_memorized').default(0),   // boolean 0/1
  bookReportDone: integer('book_report_done').default(0),
  previewDone: integer('preview_done').default(0),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.weekNumber] }),
}))

// 일일 체크
export const dailyChecks = sqliteTable('daily_checks', {
  userId: text('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),           // YYYY-MM-DD
  prayer30min: integer('prayer_30min').default(0),
  qtDone: integer('qt_done').default(0),
  bibleReading: integer('bible_reading').default(0),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.date] }),
}))
```

---

### 10. 커리큘럼 32주 Seed 데이터

**`backend/src/db/seed.ts`** — 핵심 구조:

```ts
// 1권 터다지기 (1~6주)
// 2권 구원의 진리 (7~20주)
// 3권 작은 예수 (21~32주)

export const CURRICULUM_DATA = [
  // 1권 터다지기
  { weekNumber: 1, volume: 1, lessonNumber: 1, title: '제자훈련이란 무엇인가', scripture: '...', requiredBook: '효과적인 간증' },
  { weekNumber: 2, volume: 1, lessonNumber: 2, title: '...', scripture: '...', requiredBook: '말씀의 손' },
  // ... 3~6주

  // 2권 구원의 진리
  { weekNumber: 7, volume: 2, lessonNumber: 1, title: '성경의 권위', scripture: '딤후 3:16-17', requiredBook: '성경의 권위' },
  // ... 8~20주

  // 3권 작은 예수
  { weekNumber: 21, volume: 3, lessonNumber: 1, title: '...', scripture: '...', requiredBook: '위험한 순종' },
  // ... 22~32주
]

// seed 실행 함수
export async function seed(db: DrizzleDB) {
  // upsert (on conflict do update) 방식으로 idempotent 실행
  for (const row of CURRICULUM_DATA) {
    await db.insert(curriculum).values(row)
      .onConflictDoUpdate({ target: curriculum.weekNumber, set: row })
  }
  console.log('✅ Curriculum seeded (32 weeks)')
}
```

> **주의**: 실제 교재의 주차별 제목, 암송 성구, 필독서 정보는 교역자에게 확인 후 입력

---

### 11. Drizzle 마이그레이션 설정

**`backend/drizzle.config.ts`:**
```ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config
```

**마이그레이션 명령:**
```bash
# 마이그레이션 파일 생성
npx drizzle-kit generate

# Turso에 마이그레이션 적용
npx drizzle-kit migrate

# seed 실행
npx tsx src/db/seed.ts
```

---

### 12. DB 클라이언트 초기화

**`backend/src/db/index.ts`:**
```ts
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
import { env } from '../env'

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
})

export const db = drizzle(client, { schema })
```

---

### 13. Zustand 스토어

**`frontend/src/store/useAppStore.ts`:**
```ts
import { create } from 'zustand'

interface AppState {
  // 현재 사용자의 훈련 주차 (로그인 후 계산)
  currentWeek: number | null
  setCurrentWeek: (week: number) => void

  // 커리큘럼 캐시
  curriculumLoaded: boolean
  setCurriculumLoaded: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentWeek: null,
  setCurrentWeek: (week) => set({ currentWeek: week }),
  curriculumLoaded: false,
  setCurriculumLoaded: (v) => set({ curriculumLoaded: v }),
}))
```

---

### 14. API fetch wrapper

**`frontend/src/lib/api.ts`:**
```ts
import { useAuth } from '@clerk/clerk-react'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// Clerk 토큰을 Authorization 헤더에 자동 첨부
export function useApi() {
  const { getToken } = useAuth()

  const request = async (path: string, options?: RequestInit) => {
    const token = await getToken()
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  return { get: (path: string) => request(path),
           post: (path: string, body: unknown) => request(path, { method: 'POST', body: JSON.stringify(body) }),
           put: (path: string, body: unknown) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
           del: (path: string) => request(path, { method: 'DELETE' }) }
}
```

---

### 15. 페이지 플레이스홀더

Phase 1에서는 각 페이지가 기본 레이아웃과 타이틀만 보여주는 플레이스홀더:

```tsx
// DashboardPage.tsx
export default function DashboardPage() {
  return (
    <AppShell title="대시보드">
      <div className="p-4">
        <p className="text-[var(--color-text-secondary)]">
          Phase 2에서 구현 예정 — 현재 주차, 오늘 체크, 진도 바
        </p>
      </div>
    </AppShell>
  )
}
```

각 페이지 파일: `DashboardPage`, `WeeksPage`, `DailyPage`, `ProgressPage`, `ProfilePage`

---

### 16. 온보딩 / 랜딩 페이지

**`OnboardingPage.tsx`:**
- 로그인 상태면 `/home`으로 즉시 리다이렉트
- 비로그인 상태:
  - 앱 로고 (텍스트 기반)
  - 슬로건: "제자의 길을 걷는 여정"
  - "시작하기" 버튼 → `/login`
  - 간단한 앱 소개 (3줄 이내)

---

### 17. 배포 설정

#### Vercel (Frontend)

1. GitHub 연결 → `frontend/` 폴더를 루트로 설정
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. **환경변수 설정**:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxx
   VITE_API_URL=https://jobible-way-api.onrender.com
   ```

#### Render (Backend)

1. New Web Service → GitHub 연결
2. Root Directory: `backend`
3. Build Command: `npm install && npm run build`
4. Start Command: `node dist/index.js`
5. **환경변수 설정**:
   ```
   TURSO_DATABASE_URL=libsql://xxxx.turso.io
   TURSO_AUTH_TOKEN=xxxx
   CLERK_SECRET_KEY=sk_live_xxxx
   NODE_ENV=production
   PORT=3000
   ```

**`backend/package.json` scripts:**
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "migrate": "drizzle-kit migrate",
    "seed": "tsx src/db/seed.ts"
  }
}
```

---

## Phase 1 완료 기준 체크리스트

- [ ] 모노레포 폴더 구조 생성 완료
- [ ] `npm run dev` (frontend) 포트 5173에서 정상 실행
- [ ] `npm run dev` (backend) 포트 3000에서 정상 실행
- [ ] `GET /health` → `{ status: 'ok' }` 응답 확인
- [ ] Clerk 이메일 로그인 → `/home` 리다이렉트 확인
- [ ] Clerk Google 로그인 → `/home` 리다이렉트 확인
- [ ] 비인증 상태에서 `/home` 접근 시 `/login` 리다이렉트 확인
- [ ] BottomNav 5개 탭 클릭 → 각 페이지 라우팅 확인
- [ ] Tailwind 색상 변수 (딥 블루, 골드) 정상 적용 확인
- [ ] `Button`, `Card`, `Badge` 컴포넌트 스토리북 or 임시 테스트 페이지 확인
- [ ] Drizzle 마이그레이션 Turso 적용 완료
- [ ] 커리큘럼 32주 seed 데이터 삽입 완료
- [ ] Vercel 배포 → HTTPS URL 접근 정상 확인
- [ ] Render 배포 → `/health` 엔드포인트 정상 응답 확인
- [ ] CORS 설정 — Vercel URL에서 Render API 호출 가능 확인

---

## 주요 환경변수 요약

| 위치 | 키 | 설명 |
|------|-----|------|
| frontend `.env.local` | `VITE_CLERK_PUBLISHABLE_KEY` | Clerk 퍼블릭 키 |
| frontend `.env.local` | `VITE_API_URL` | 백엔드 API URL |
| backend `.env` | `TURSO_DATABASE_URL` | Turso DB URL |
| backend `.env` | `TURSO_AUTH_TOKEN` | Turso 인증 토큰 |
| backend `.env` | `CLERK_SECRET_KEY` | Clerk 시크릿 키 |

---

## 다음 단계

Phase 1 완료 후 → **PHASE2_PROMPT.md** 참조

핵심 기능 구현:
- 대시보드 (현재 주차, 프로그레스 바, 오늘 체크 요약)
- 일일 체크 (기도/QT/성경통독 토글)
- 주차 목록 & 상세 (노트 허브)
- OIA 묵상, 설교 노트, 성구 암송
- YouTube IFrame 임베드
