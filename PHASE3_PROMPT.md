# PHASE 3 개발 프롬프트 — 고도화 & 배포 완성 (Polish & Deployment)

## 전제 조건

> Phase 1, 2가 완료된 상태에서 시작.
> - 모든 핵심 기능 (대시보드, 일일 체크, 주차 목록/상세, OIA, 설교 노트, 성구 암송, 커리큘럼) 정상 동작.
> - Vercel (frontend) + Render (backend) 배포 완료.
> - 모든 API 엔드포인트 정상 동작 확인.

---

## Phase 3 목표

> UX를 고도화하고, 진도 시각화를 완성하며, PWA 지원과 운영 안정화를 달성한다.

---

## 구현 기능 목록

1. 진도 시각화 페이지 (달력 히트맵 + 도넛 차트 + 막대 그래프)
2. 연속 달성일 (스트릭) 표시
3. 카카오 소셜 로그인 추가
4. PWA 설정 (오프라인 지원, 홈화면 추가)
5. 로딩 스켈레톤 / 에러 바운더리 / 빈 상태 UI
6. UptimeRobot 설정 + `/health` 최적화
7. 최종 배포 체크리스트
8. 성능 최적화

---

## 1. 진도 시각화 페이지 (`/progress`)

**파일**: `frontend/src/pages/ProgressPage.tsx`

### 레이아웃 구성

```
┌──────────────────────────────┐
│  진도 현황                    │
├──────────────────────────────┤
│  📅 일일 체크 히트맵           │
│  (GitHub style 달력)          │
│  Jan  Feb  Mar  Apr ...       │
│  ░▓▓▓░░▓▓░▓▓▓▓░░░...        │
├──────────────────────────────┤
│  🔥 연속 달성일: 7일           │
│  📊 최장 연속: 14일            │
│  ✅ 전체 달성: 45일 / 180일   │
├──────────────────────────────┤
│  📈 권별 완료율                │
│  [1권 도넛] [2권 도넛] [3권 도넛]│
│   100%        45%       0%   │
├──────────────────────────────┤
│  📊 최근 8주 완료율 막대그래프  │
│  █████ 85%  week -7         │
│  ██░░░ 40%  week -6         │
│  █████ 90%  week -5         │
│  ...                         │
└──────────────────────────────┘
```

---

### 1-A. 달력 히트맵 (GitHub Style)

#### 백엔드 API 추가

**`GET /api/progress/heatmap?from=YYYY-MM-DD&to=YYYY-MM-DD`**

```ts
// backend/src/routes/progress.ts
progressRoute.get('/heatmap', requireAuth, async (c) => {
  const userId = c.get('userId')
  const from = c.req.query('from')  // YYYY-MM-DD
  const to = c.req.query('to')      // YYYY-MM-DD

  const rows = await db.select().from(dailyChecks)
    .where(
      and(
        eq(dailyChecks.userId, userId),
        gte(dailyChecks.date, from!),
        lte(dailyChecks.date, to!)
      )
    )

  // 날짜별 완료 항목 수 (0~3) 반환
  const heatmap = rows.map(r => ({
    date: r.date,
    count: (r.prayer30min ?? 0) + (r.qtDone ?? 0) + (r.bibleReading ?? 0),
  }))

  return c.json(heatmap)
})
```

#### 프론트엔드 히트맵 컴포넌트

```bash
npm install react-calendar-heatmap
# 또는 직접 구현 (SVG)
```

**`HeatmapCalendar` 컴포넌트:**

```tsx
interface HeatmapEntry {
  date: string   // YYYY-MM-DD
  count: number  // 0~3 (0: 없음, 1: 하나, 2: 둘, 3: 모두 완료)
}

// 색상 단계 (count 기반):
// 0: #E5E0D8 (비어있음)
// 1: #C9A84C40 (골드 20%)
// 2: #C9A84C80 (골드 50%)
// 3: #C9A84C   (골드 100%)

// 레이아웃: 주(Week) 단위 컬럼, 요일 행
// 오늘 날짜: 딥 블루 테두리
// 셀 크기: 12x12px, 간격: 2px
// 범례: 0 → 많음 (색상 단계 표시)
```

**구현 방식 (직접 구현 권장):**

```tsx
function HeatmapCalendar({ data, startDate, endDate }: HeatmapCalendarProps) {
  // 날짜 범위 생성 (startDate → endDate, 훈련 기간 기준)
  const dates = generateDateRange(startDate, endDate)

  // 주 단위 그룹화
  const weeks = chunkByWeek(dates)  // 7일씩 분할

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={weeks.length * 14} height={7 * 14}>
        {weeks.map((week, wi) =>
          week.map((date, di) => (
            <rect
              key={date}
              x={wi * 14}
              y={di * 14}
              width={12}
              height={12}
              rx={2}
              fill={getColor(dataMap[date]?.count ?? 0)}
            />
          ))
        )}
      </svg>
    </div>
  )
}
```

---

### 1-B. 연속 달성일 (스트릭) 계산

#### 백엔드 API

**`GET /api/progress/streak`**

```ts
progressRoute.get('/streak', requireAuth, async (c) => {
  const userId = c.get('userId')

  // 최근 180일 데이터 (훈련 32주 = 224일)
  const rows = await db.select().from(dailyChecks)
    .where(eq(dailyChecks.userId, userId))
    .orderBy(desc(dailyChecks.date))

  const fullyDoneDates = rows
    .filter(r => r.prayer30min && r.qtDone && r.bibleReading)
    .map(r => r.date)

  // 현재 스트릭 (오늘부터 역순으로 연속일 계산)
  let currentStreak = 0
  let date = new Date()
  while (fullyDoneDates.includes(date.toISOString().slice(0, 10))) {
    currentStreak++
    date.setDate(date.getDate() - 1)
  }

  // 최장 스트릭 계산
  const maxStreak = calculateMaxStreak(fullyDoneDates)

  // 전체 완료일 수
  const totalDone = fullyDoneDates.length

  return c.json({ currentStreak, maxStreak, totalDone })
})
```

#### 프론트엔드 스트릭 카드

```tsx
// 🔥 7일 연속 달성 (이모지 + 숫자)
// 스트릭 0: "오늘부터 시작해 보세요!" (빈 상태 메시지)
// 스트릭 >= 7: 골드 텍스트 + 🔥 애니메이션
// 스트릭 >= 30: 특별 배지 표시
```

---

### 1-C. 권별 완료율 도넛 차트

#### 백엔드 API

**`GET /api/progress/volumes`**

```ts
progressRoute.get('/volumes', requireAuth, async (c) => {
  const userId = c.get('userId')

  // 주간 과제 완료 현황 (주차별)
  const tasks = await db.select().from(weeklyTasks)
    .where(eq(weeklyTasks.userId, userId))

  // 커리큘럼에서 권별 주차 수 가져오기
  const curriculum = await db.select().from(curriculum)

  // 권별 완료율 계산
  const volumes = [1, 2, 3].map(vol => {
    const volWeeks = curriculum.filter(c => c.volume === vol)
    const doneWeeks = volWeeks.filter(w =>
      tasks.find(t => t.weekNumber === w.weekNumber && t.verseMemorized && t.bookReportDone)
    )
    return {
      volume: vol,
      total: volWeeks.length,
      done: doneWeeks.length,
      percentage: Math.round((doneWeeks.length / volWeeks.length) * 100),
    }
  })

  return c.json(volumes)
})
```

#### 프론트엔드 도넛 차트

```bash
npm install recharts
# 또는 직접 SVG 구현
```

**`DonutChart` 컴포넌트 (Recharts):**

```tsx
import { PieChart, Pie, Cell } from 'recharts'

function DonutChart({ percentage, label }: DonutChartProps) {
  const data = [
    { value: percentage },
    { value: 100 - percentage },
  ]

  return (
    <div style={{ textAlign: 'center' }}>
      <PieChart width={100} height={100}>
        <Pie data={data} innerRadius={30} outerRadius={45} dataKey="value" startAngle={90} endAngle={-270}>
          <Cell fill="#C9A84C" />  {/* 골드 */}
          <Cell fill="#E5E0D8" />  {/* 라이트 그레이 */}
        </Pie>
      </PieChart>
      <p>{percentage}%</p>
      <p>{label}</p>
    </div>
  )
}
```

---

### 1-D. 주간 완료율 막대 그래프

#### 백엔드 API

**`GET /api/progress/weekly-bars?weeks=8`**

```ts
progressRoute.get('/weekly-bars', requireAuth, async (c) => {
  const userId = c.get('userId')
  const weekCount = parseInt(c.req.query('weeks') ?? '8')

  // 최근 N주 데이터
  // 각 주의 일일 체크 완료율 계산
  // 주차 시작일 계산: 사용자 start_date 기반

  return c.json(weeklyBars)  // [{ week: 3, label: '3주차', rate: 85 }, ...]
})
```

**`WeeklyBarChart` 컴포넌트 (Recharts):**

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

// 바 색상: #C9A84C (골드)
// 그리드: #E5E0D8
// Y축: 0~100%
// X축: "3주차", "4주차" ...
```

---

## 2. 카카오 소셜 로그인

### Clerk 설정

1. Clerk Dashboard → Social Connections → Kakao 활성화
2. Kakao Developers에서 앱 생성 → REST API Key, Secret Key 획득
3. Redirect URI: `https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback`

### 프론트엔드 설정

```tsx
// LoginPage.tsx — Clerk SignIn 컴포넌트가 자동으로 Kakao 버튼 표시
// 별도 코드 불필요 (Clerk가 자동 처리)

// 단, appearance 설정에서 Kakao 버튼 스타일 커스터마이징 가능
import { SignIn } from '@clerk/clerk-react'

<SignIn
  appearance={{
    elements: {
      socialButtonsBlockButton: 'rounded-lg',
    },
  }}
/>
```

### Clerk Dashboard 체크리스트
- [ ] Kakao OAuth 앱 생성 완료
- [ ] Client ID, Client Secret 입력
- [ ] Redirect URI 등록 완료
- [ ] Allowed OAuth scopes: `account`, `profile`

---

## 3. PWA 설정

```bash
cd frontend
npm install vite-plugin-pwa
```

### `vite.config.ts` 업데이트

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'jobible Way',
        short_name: 'jobible Way',
        description: '제자의 길을 걷는 여정 — 제자훈련 32주 기록 앱',
        theme_color: '#1A2E4A',
        background_color: '#FAF8F5',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/home',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // 오프라인 캐싱 전략
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // 커리큘럼 API 캐싱 (자주 변하지 않음)
            urlPattern: /\/api\/curriculum/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'curriculum-api',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
})
```

### PWA 아이콘 생성

```bash
# public/icons/ 폴더에 아이콘 파일 배치
# 필요 크기: 192x192, 512x512
# 도구: https://realfavicongenerator.net 또는 직접 제작
```

### 오프라인 지원 범위

- **오프라인에서 동작**: 이미 로딩된 커리큘럼 데이터 보기, 이전에 조회한 OIA/설교 노트 보기
- **온라인 필요**: 새 데이터 저장, 로그인

---

## 4. 로딩 스켈레톤

**`frontend/src/components/ui/Skeleton.tsx`:**

```tsx
// CSS shimmer 애니메이션
const shimmer = `
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
`

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded animate-pulse bg-gradient-to-r from-[#E5E0D8] via-[#F0ECE5] to-[#E5E0D8] bg-[length:200px_100%] ${className}`}
    />
  )
}

// 사용 예시:
function DashboardSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-32 w-full" />   {/* 현재 주차 카드 */}
      <Skeleton className="h-24 w-full" />   {/* 일일 체크 카드 */}
      <Skeleton className="h-24 w-full" />   {/* 주간 과제 카드 */}
      <Skeleton className="h-20 w-full" />   {/* 암송 성구 배너 */}
    </div>
  )
}
```

**적용 패턴:**
```tsx
if (loading) return <DashboardSkeleton />
if (error) return <ErrorState message={error.message} />
if (!data) return <EmptyState message="데이터가 없습니다" />
return <DashboardContent data={data} />
```

---

## 5. 에러 바운더리

**`frontend/src/components/ErrorBoundary.tsx`:**

```tsx
import { Component, ErrorInfo, ReactNode } from 'react'

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
    // Phase 3+: Sentry 등 에러 리포팅 서비스 연동
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-2">
            문제가 발생했습니다
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            잠시 후 다시 시도해 주세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[var(--color-secondary)] text-[var(--color-primary)] rounded-lg font-medium"
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

**`App.tsx`에 적용:**
```tsx
<ErrorBoundary>
  <RouterProvider router={router} />
</ErrorBoundary>
```

---

## 6. 빈 상태 (Empty State) UI

**`frontend/src/components/ui/EmptyState.tsx`:**

```tsx
interface EmptyStateProps {
  icon?: string          // 이모지
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

function EmptyState({ icon = '📝', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{description}</p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
```

**사용 예시:**
```tsx
// OIA 목록이 비어있을 때
<EmptyState
  icon="🔍"
  title="아직 OIA 묵상 기록이 없어요"
  description="말씀을 관찰하고, 해석하고, 적용해 보세요."
  action={{ label: "첫 OIA 작성하기", onClick: () => setShowForm(true) }}
/>
```

---

## 7. `/health` 엔드포인트 최적화

**UptimeRobot 콜드 스타트 방지를 위한 응답 최적화:**

```ts
// backend/src/routes/health.ts
import { db } from '../db'
import { sql } from 'drizzle-orm'

healthRoute.get('/', async (c) => {
  // DB 연결 상태 확인 (빠른 쿼리)
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
    version: process.env.npm_package_version ?? '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    db: dbStatus,
  }, status === 'ok' ? 200 : 503)
})
```

---

## 8. UptimeRobot 설정 가이드

### 설정 방법

1. **계정 생성**: https://uptimerobot.com (무료 플랜)
2. **Add New Monitor** 클릭
3. **설정값**:
   ```
   Monitor Type: HTTP(s)
   Friendly Name: jobible Way API
   URL: https://jobible-way-api.onrender.com/health
   Monitoring Interval: 5 minutes (무료 최소값)
   ```
4. **Alert Contacts**: 이메일 알림 설정 (서비스 다운 시)

### Render 스핀다운 방지 원리

```
UptimeRobot (5분 마다) → GET /health → Render 서비스 응답
                                         ↑
                                   Render가 활성 상태 유지
                                   (15분 무활동 시 스핀다운 방지)
```

### 운영 모니터링 체크리스트

- [ ] UptimeRobot 모니터 설정 완료
- [ ] 이메일 알림 설정 완료
- [ ] `/health` 응답 200 확인
- [ ] Render 로그에서 5분 간격 요청 확인

---

## 9. 성능 최적화

### 코드 분할 (Lazy Loading)

**`frontend/src/router/index.tsx` 업데이트:**

```tsx
import { lazy, Suspense } from 'react'

// 각 페이지를 lazy import로 변경
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const WeeksPage = lazy(() => import('../pages/WeeksPage'))
const WeekDetailPage = lazy(() => import('../pages/WeekDetailPage'))
const ProgressPage = lazy(() => import('../pages/ProgressPage'))
// ...

// 라우트 Suspense 래핑
{
  element: (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <DashboardPage />
    </Suspense>
  )
}
```

### Recharts 번들 크기 최적화

```tsx
// Tree-shaking을 위해 필요한 컴포넌트만 import
import { PieChart, Pie, Cell } from 'recharts'
// ❌ import Recharts from 'recharts' (전체 import 금지)
```

### API 응답 캐싱 (프론트엔드)

```tsx
// 커리큘럼 데이터: sessionStorage 캐싱 (세션 동안 재사용)
const getCurriculum = async () => {
  const cached = sessionStorage.getItem('curriculum')
  if (cached) return JSON.parse(cached)

  const data = await api.get('/api/curriculum')
  sessionStorage.setItem('curriculum', JSON.stringify(data))
  return data
}
```

### 이미지 최적화

```tsx
// 이미지 lazy loading (모든 <img> 태그)
<img src={...} loading="lazy" decoding="async" alt="..." />

// 앱 로고: SVG 사용 (무한 확대, 작은 용량)
```

---

## 10. 최종 배포 체크리스트

### 보안

- [ ] **CORS 설정**: Render 백엔드에 Vercel 프로덕션 URL만 허용
  ```ts
  // 개발: http://localhost:5173
  // 프로덕션: https://jobible-way.vercel.app (실제 URL)
  ```
- [ ] **환경변수**: 모든 시크릿이 `.env`에 있고 Git에 커밋되지 않음 확인
- [ ] **`.gitignore`**: `.env`, `.env.local`, `node_modules/` 포함 확인
- [ ] **보안 헤더** (Vercel `vercel.json`):
  ```json
  {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-XSS-Protection", "value": "1; mode=block" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
        ]
      }
    ]
  }
  ```
- [ ] **Clerk 프로덕션 모드**: pk_live_, sk_live_ 키 사용 확인
- [ ] **Drizzle 파라미터 바인딩**: 모든 쿼리에 사용자 입력이 직접 보간되지 않음 확인

### 환경변수 최종 확인

| 서비스 | 키 | 값 확인 |
|--------|-----|---------|
| Vercel | `VITE_CLERK_PUBLISHABLE_KEY` | pk_live_xxx |
| Vercel | `VITE_API_URL` | Render 프로덕션 URL |
| Render | `TURSO_DATABASE_URL` | libsql://xxx.turso.io |
| Render | `TURSO_AUTH_TOKEN` | 토큰 값 |
| Render | `CLERK_SECRET_KEY` | sk_live_xxx |
| Render | `NODE_ENV` | production |

### 기능 최종 검증

- [ ] 이메일 로그인 프로덕션 환경 테스트
- [ ] Google 로그인 프로덕션 환경 테스트
- [ ] Kakao 로그인 프로덕션 환경 테스트
- [ ] OIA 저장 → 새로고침 후 데이터 유지 확인
- [ ] 설교 노트 저장 → 새로고침 후 데이터 유지 확인
- [ ] YouTube 영상 임베드 모바일 재생 확인 (iOS Safari, Android Chrome)
- [ ] PWA 홈화면 추가 (iOS Safari 테스트, Android Chrome 테스트)
- [ ] 오프라인 상태에서 기본 화면 로딩 확인
- [ ] 달력 히트맵 정상 렌더링 확인
- [ ] 도넛 차트 3개 정상 렌더링 확인
- [ ] 스트릭 계산 정확성 확인

### 성능 검증

- [ ] Lighthouse 점수 확인 (목표: Performance 80+, Accessibility 90+, PWA 90+)
- [ ] 첫 로딩 시간: 4G 환경에서 3초 이내
- [ ] 번들 크기: `npm run build` 후 `dist/assets/` 확인 (JS < 500KB gzip)

### 반응형 검증

- [ ] iPhone SE (375px) 테스트
- [ ] iPhone 14 Pro (393px) 테스트
- [ ] Samsung Galaxy S23 (360px) 테스트
- [ ] iPad (768px) 테스트
- [ ] BottomNav safe-area 패딩 (iPhone X 이상 홈 인디케이터 영역) 확인

---

## 11. 프로필 페이지 완성 (`/profile`)

**Phase 2에서 기본 플레이스홀더로 두었던 프로필 페이지 완성.**

```
┌──────────────────────────────┐
│  내 프로필                    │
├──────────────────────────────┤
│  [아바타 이미지]              │
│  홍길동                       │  ← Clerk 이름
│  hong@example.com            │  ← Clerk 이메일
├──────────────────────────────┤
│  📅 훈련 시작일: 2026.01.05   │
│  📖 현재 주차: 8주차           │
│  🔥 연속 달성: 12일            │
├──────────────────────────────┤
│  [로그아웃] 버튼               │
└──────────────────────────────┘
```

```tsx
import { useUser, useClerk } from '@clerk/clerk-react'

const { user } = useUser()
const { signOut } = useClerk()

// 로그아웃 후 / (온보딩)으로 리다이렉트
const handleSignOut = () => signOut(() => navigate('/'))
```

---

## Phase 3 완료 기준 체크리스트

### 진도 시각화
- [ ] 달력 히트맵 정상 렌더링 (훈련 기간 전체)
- [ ] 스트릭 현재/최장 표시 정확
- [ ] 권별 도넛 차트 3개 렌더링
- [ ] 주간 막대 그래프 최근 8주 렌더링

### 카카오 로그인
- [ ] Clerk Dashboard Kakao OAuth 설정 완료
- [ ] 프로덕션 환경 Kakao 로그인 테스트 통과

### PWA
- [ ] 홈화면 추가 프롬프트 표시 (Android)
- [ ] iOS Safari "홈 화면에 추가" 동작 확인
- [ ] 오프라인 상태에서 앱 아이콘으로 실행 가능
- [ ] Service Worker 등록 확인 (DevTools → Application → Service Workers)

### UX 고도화
- [ ] 모든 페이지에 로딩 스켈레톤 적용
- [ ] ErrorBoundary 최상단 적용
- [ ] 모든 빈 상태에 EmptyState 컴포넌트 적용
- [ ] Toast 알림 (저장 완료, 에러) 정상 동작

### 운영 안정화
- [ ] UptimeRobot 5분 간격 헬스 핑 설정 완료
- [ ] `/health` DB 연결 상태 포함 응답
- [ ] 보안 헤더 적용 확인
- [ ] Lighthouse PWA 점수 90+

### 성능
- [ ] Lazy loading 적용 (페이지별 코드 분할)
- [ ] 커리큘럼 데이터 sessionStorage 캐싱
- [ ] 첫 로딩 3초 이내 확인

---

## 운영 이후 고려사항 (Phase 4+)

> Phase 3 완료 후 훈련 운영 중 필요에 따라 추가 고려:

- **독후감 제출**: 텍스트 + 이미지 업로드 (Cloudflare R2 또는 Turso의 BLOB 지원)
- **교역자/리더 모니터링 화면**: 전체 훈련생 진도 현황 (role-based access)
- **기수 확장**: 3기, 4기를 위한 cohort 구분 처리
- **32주 완주 포트폴리오 PDF**: 전체 기록을 PDF로 내보내기 (react-pdf)
- **푸시 알림**: 매일 QT/기도 리마인더 (Web Push API + Render 크론)
- **공개 묵상 공유**: 선택적으로 OIA 묵상 공유 (익명 또는 실명)
