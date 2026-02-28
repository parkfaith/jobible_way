# PHASE 2 개발 프롬프트 — 핵심 기능 (Core Features)

## 전제 조건

> Phase 1이 완료된 상태에서 시작.
> - 모노레포 구조, Vite + Tailwind v4, Clerk 인증, Hono 백엔드, Turso + Drizzle ORM, 공통 컴포넌트, BottomNav, 기본 라우팅 모두 완성.
> - `GET /health` 엔드포인트 정상 동작.
> - 커리큘럼 32주 seed 데이터 삽입 완료.

---

## Phase 2 목표

> 훈련생이 실제 사용 가능한 모든 핵심 기능을 구현한다.

---

## 구현 기능 목록 (우선순위 순)

1. 대시보드 (홈 화면)
2. 일일 체크 페이지
3. 주차 목록 페이지
4. 주차 상세 — 노트 허브
5. OIA 묵상 기록
6. 설교 노트
7. 성구 암송 + YouTube IFrame 임베드
8. 커리큘럼 안내 페이지
9. 주간 과제 체크
10. 백엔드 API 엔드포인트 전체

---

## 1. 백엔드 API 엔드포인트

모든 `/api/*` 라우트에 `requireAuth` 미들웨어 적용.
모든 쿼리에서 `userId = c.get('userId')` 기반 row-level 필터링 필수.

### 라우트 구조

```
backend/src/routes/
├── curriculum.ts   GET /api/curriculum
│                   GET /api/curriculum/:weekNumber
├── daily.ts        GET /api/daily?date=YYYY-MM-DD
│                   PUT /api/daily
├── weekly.ts       GET /api/weekly/:weekNumber
│                   PUT /api/weekly/:weekNumber
├── sermon.ts       GET /api/weeks/:weekNumber/sermon
│                   PUT /api/weeks/:weekNumber/sermon/:service
├── oia.ts          GET /api/weeks/:weekNumber/oia
│                   POST /api/weeks/:weekNumber/oia
│                   PUT /api/oia/:id
│                   DELETE /api/oia/:id
├── diary.ts        GET /api/weeks/:weekNumber/diary
│                   PUT /api/weeks/:weekNumber/diary
└── users.ts        GET /api/me
                    POST /api/me   (최초 가입 시 프로필 생성)
```

### 커리큘럼 API (`curriculum.ts`)

```ts
// GET /api/curriculum — 전체 32주 목록 (인증 불필요 또는 선택)
curriculumRoute.get('/', async (c) => {
  const rows = await db.select().from(curriculum).orderBy(curriculum.weekNumber)
  return c.json(rows)
})

// GET /api/curriculum/:weekNumber — 특정 주차 상세
curriculumRoute.get('/:weekNumber', async (c) => {
  const week = parseInt(c.req.param('weekNumber'))
  const [row] = await db.select().from(curriculum).where(eq(curriculum.weekNumber, week))
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(row)
})
```

### 일일 체크 API (`daily.ts`)

```ts
// GET /api/daily?date=YYYY-MM-DD
dailyRoute.get('/', requireAuth, async (c) => {
  const userId = c.get('userId')
  const date = c.req.query('date') ?? new Date().toISOString().slice(0, 10)
  const [row] = await db.select().from(dailyChecks)
    .where(and(eq(dailyChecks.userId, userId), eq(dailyChecks.date, date)))
  return c.json(row ?? { userId, date, prayer30min: 0, qtDone: 0, bibleReading: 0 })
})

// PUT /api/daily — upsert (부분 업데이트 지원)
dailyRoute.put('/', requireAuth, async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()   // { date, prayer30min?, qtDone?, bibleReading? }

  await db.insert(dailyChecks).values({ userId, ...body })
    .onConflictDoUpdate({
      target: [dailyChecks.userId, dailyChecks.date],
      set: { ...body, updatedAt: sql`(datetime('now'))` },
    })
  return c.json({ ok: true })
})
```

### 주간 과제 API (`weekly.ts`)

```ts
// GET /api/weekly/:weekNumber
weeklyRoute.get('/:weekNumber', requireAuth, async (c) => {
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  const [row] = await db.select().from(weeklyTasks)
    .where(and(eq(weeklyTasks.userId, userId), eq(weeklyTasks.weekNumber, weekNumber)))
  return c.json(row ?? { userId, weekNumber, verseMemorized: 0, bookReportDone: 0, previewDone: 0 })
})

// PUT /api/weekly/:weekNumber — upsert
weeklyRoute.put('/:weekNumber', requireAuth, async (c) => {
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  const body = await c.req.json()

  await db.insert(weeklyTasks).values({ userId, weekNumber, ...body })
    .onConflictDoUpdate({
      target: [weeklyTasks.userId, weeklyTasks.weekNumber],
      set: { ...body, updatedAt: sql`(datetime('now'))` },
    })
  return c.json({ ok: true })
})
```

### 설교 노트 API (`sermon.ts`)

```ts
// GET /api/weeks/:weekNumber/sermon — 해당 주차 설교 노트 목록
sermonRoute.get('/:weekNumber/sermon', requireAuth, async (c) => {
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  const rows = await db.select().from(sermonNotes)
    .where(and(eq(sermonNotes.userId, userId), eq(sermonNotes.weekNumber, weekNumber)))
    .orderBy(sermonNotes.date)
  return c.json(rows)
})

// PUT /api/weeks/:weekNumber/sermon/:service — upsert (sunday | friday)
sermonRoute.put('/:weekNumber/sermon/:service', requireAuth, async (c) => {
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  const service = c.req.param('service')  // 'sunday' | 'friday'
  const body = await c.req.json()         // { date, preacher, scripture, content }

  await db.insert(sermonNotes).values({ userId, weekNumber, service, ...body })
    .onConflictDoUpdate({
      target: [sermonNotes.userId, sermonNotes.weekNumber, sermonNotes.service],
      set: { ...body, updatedAt: sql`(datetime('now'))` },
    })
  return c.json({ ok: true })
})
```

> **sermonNotes 스키마에 복합 유니크 제약 추가**: `(user_id, week_number, service)`

### OIA 묵상 API (`oia.ts`)

```ts
// GET /api/weeks/:weekNumber/oia — 해당 주차 OIA 목록 (최신 순)
oiaRoute.get('/:weekNumber/oia', requireAuth, async (c) => {
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  const rows = await db.select().from(oiaNotes)
    .where(and(eq(oiaNotes.userId, userId), eq(oiaNotes.weekNumber, weekNumber)))
    .orderBy(desc(oiaNotes.createdAt))
  return c.json(rows)
})

// POST /api/weeks/:weekNumber/oia — 새 OIA 생성
oiaRoute.post('/:weekNumber/oia', requireAuth, async (c) => {
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  const body = await c.req.json()  // { date, scripture, observation, interpretation, application }
  const [row] = await db.insert(oiaNotes).values({ userId, weekNumber, ...body }).returning()
  return c.json(row, 201)
})

// PUT /api/oia/:id — 수정
oiaRoute.put('/:id', requireAuth, async (c) => {
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()
  await db.update(oiaNotes)
    .set({ ...body, updatedAt: sql`(datetime('now'))` })
    .where(and(eq(oiaNotes.id, id), eq(oiaNotes.userId, userId)))
  return c.json({ ok: true })
})

// DELETE /api/oia/:id
oiaRoute.delete('/:id', requireAuth, async (c) => {
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'))
  await db.delete(oiaNotes).where(and(eq(oiaNotes.id, id), eq(oiaNotes.userId, userId)))
  return c.json({ ok: true })
})
```

### 신앙 일기 API (`diary.ts`)

```ts
// GET /api/weeks/:weekNumber/diary
diaryRoute.get('/:weekNumber/diary', requireAuth, async (c) => {
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  const [row] = await db.select().from(diaryEntries)
    .where(and(eq(diaryEntries.userId, userId), eq(diaryEntries.weekNumber, weekNumber)))
  return c.json(row ?? { content: '' })
})

// PUT /api/weeks/:weekNumber/diary — upsert
diaryRoute.put('/:weekNumber/diary', requireAuth, async (c) => {
  const userId = c.get('userId')
  const weekNumber = parseInt(c.req.param('weekNumber'))
  const { content } = await c.req.json()
  await db.insert(diaryEntries).values({ userId, weekNumber, content })
    .onConflictDoUpdate({
      target: [diaryEntries.userId, diaryEntries.weekNumber],
      set: { content, updatedAt: sql`(datetime('now'))` },
    })
  return c.json({ ok: true })
})
```

> **diaryEntries 스키마에 복합 유니크 제약 추가**: `(user_id, week_number)`

### 사용자 API (`users.ts`)

```ts
// GET /api/me — 현재 사용자 프로필 조회
usersRoute.get('/me', requireAuth, async (c) => {
  const userId = c.get('userId')
  const [user] = await db.select().from(users).where(eq(users.id, userId))
  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json(user)
})

// POST /api/me — 최초 로그인 시 프로필 생성 (idempotent)
usersRoute.post('/me', requireAuth, async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()  // { name, email, startDate }
  await db.insert(users).values({ id: userId, ...body })
    .onConflictDoUpdate({ target: users.id, set: { name: body.name } })
  return c.json({ ok: true })
})
```

---

## 2. 대시보드 페이지 (`/home`)

**파일**: `frontend/src/pages/DashboardPage.tsx`

### 레이아웃 구성

```
┌──────────────────────────────┐
│  jobible Way              👤  │  ← 헤더 (로고 + 프로필 아이콘)
├──────────────────────────────┤
│  [현재 주차 카드]             │  ← WeekCard
│  "3주차 · 구원의 확신"         │
│  ████████░░░░░░ 9/32         │  ← 프로그레스 바 (골드)
├──────────────────────────────┤
│  [오늘 일일 체크 카드]         │  ← DailyCheckSummary
│  🙏기도  📖QT  📚통독          │
│  ✅        ✅       ⬜         │
├──────────────────────────────┤
│  [이번 주 과제 카드]           │  ← WeeklyTaskSummary
│  ✅ 암송완료  ⬜ 독후감  ⬜ 예습 │
├──────────────────────────────┤
│  [이번 주 암송 성구 배너]       │  ← VerseBanner (골드 배경)
│  "내가 너와 함께 하리라..."     │
│  여호수아 1:9                  │
│  [영상 보기] 버튼              │
└──────────────────────────────┘
```

### 현재 주차 계산 로직

```ts
// 훈련 시작일로부터 몇 주가 지났는지 계산
function getCurrentWeek(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const week = Math.floor(diffDays / 7) + 1
  return Math.min(Math.max(week, 1), 32)  // 1~32 범위 클램핑
}
```

### 프로그레스 바 컴포넌트 (`ProgressBar`)

```tsx
interface ProgressBarProps {
  current: number   // 현재 주차
  total: number     // 32
}

// 스타일:
// - 배경: var(--color-border) (라이트 그레이)
// - fill: var(--color-secondary) (골드)
// - 높이: 8px, border-radius: 4px
// - 애니메이션: CSS transition width 0.5s ease
// - 텍스트: "{current}/{total}주" (우측 정렬)
```

### 데이터 페칭 패턴

```tsx
// React Query 또는 useEffect + useState 사용
// 대시보드 초기 로딩 시 병렬 fetch:
// 1. GET /api/me → 사용자 시작일 → currentWeek 계산
// 2. GET /api/curriculum/:currentWeek → 현재 주차 정보
// 3. GET /api/daily?date=today → 오늘 체크 현황
// 4. GET /api/weekly/:currentWeek → 주간 과제 현황
```

---

## 3. 일일 체크 페이지 (`/daily`)

**파일**: `frontend/src/pages/DailyPage.tsx`

### 레이아웃 구성

```
┌──────────────────────────────┐
│  ← 일일 체크                  │
│  2026년 02월 28일 토요일       │  ← 오늘 날짜 (자동)
├──────────────────────────────┤
│  [기도 30분 카드]             │
│  🙏 기도 30분                 │
│  매일 30분 이상 기도하기        │
│              [  토글 스위치  ] │
├──────────────────────────────┤
│  [QT 카드]                   │
│  📖 경건의 시간 (QT)           │
│  말씀 묵상과 기도              │
│              [  토글 스위치  ] │
├──────────────────────────────┤
│  [성경 통독 카드]             │
│  📚 성경 통독                 │
│  오늘의 통독 분량 완료          │
│              [  토글 스위치  ] │
├──────────────────────────────┤
│  완료: 2/3  🔥 연속 5일       │  ← 오늘 요약 + 스트릭 (Phase 3)
└──────────────────────────────┘
```

### 토글 컴포넌트 (`DailyCheckToggle`)

```tsx
interface DailyCheckToggleProps {
  label: string
  description: string
  icon: string
  checked: boolean
  onChange: (checked: boolean) => void
  loading?: boolean
}

// 상태:
// - 미완료: 카드 배경 화이트, 토글 회색
// - 완료: 카드 배경 골드 5% tint, 토글 골드, 체크 아이콘 애니메이션
// - 낙관적 업데이트 (UI 즉시 반영 후 API 호출)
```

### API 호출 패턴

```tsx
const handleToggle = async (field: 'prayer30min' | 'qtDone' | 'bibleReading', value: boolean) => {
  // 1. 낙관적 업데이트 (UI 즉시 변경)
  setLocalState(prev => ({ ...prev, [field]: value ? 1 : 0 }))

  // 2. API PUT /api/daily
  await api.put('/api/daily', { date: today, [field]: value ? 1 : 0 })

  // 3. 실패 시 롤백
}
```

---

## 4. 주차 목록 페이지 (`/weeks`)

**파일**: `frontend/src/pages/WeeksPage.tsx`

### 레이아웃 구성

```
┌──────────────────────────────┐
│  32주 여정                    │
├──────────────────────────────┤
│  📘 1권 — 터다지기 (1~6주)    │  ← 권별 섹션 헤더
│  ┌────────────────────────┐  │
│  │ 1주  제자훈련이란?  ✅  │  │  ← WeekListItem
│  │ 2주  말씀의 손      ✅  │  │
│  │ 3주  기도의 능력    📍  │  │  ← 현재 주차 (골드 하이라이트)
│  │ 4주  전도의 삶      ⬜  │  │
│  │ 5주  ...           ⬜  │  │
│  │ 6주  ...           ⬜  │  │
│  └────────────────────────┘  │
│  📗 2권 — 구원의 진리 (7~20주)│
│  ...                         │
│  📕 3권 — 작은 예수 (21~32주) │
│  ...                         │
└──────────────────────────────┘
```

### `WeekListItem` 컴포넌트

```tsx
interface WeekListItemProps {
  weekNumber: number
  title: string
  isCurrent: boolean
  isCompleted: boolean    // 주간 과제 3개 모두 완료 여부
  onClick: () => void
}

// 스타일:
// - 현재 주차: 좌측 골드 보더 4px + 골드 배경 5% tint + 📍 배지
// - 완료: 세이지 그린 체크 아이콘
// - 미래 주차: 텍스트 60% 투명도
// - 우측 화살표 아이콘 (모든 항목)
```

### 라우팅

```tsx
// 주차 항목 클릭 → /weeks/:weekId
navigate(`/weeks/${weekNumber}`)
```

---

## 5. 주차 상세 — 노트 허브 (`/weeks/:weekId`)

**파일**: `frontend/src/pages/WeekDetailPage.tsx`

### 라우터에 추가 (Phase 1에서 예약해 둔 중첩 라우트)

```tsx
{ path: 'weeks/:weekId', element: <WeekDetailPage /> },
{ path: 'weeks/:weekId/oia', element: <OiaPage /> },
{ path: 'weeks/:weekId/sermon', element: <SermonPage /> },
{ path: 'weeks/:weekId/diary', element: <DiaryPage /> },
{ path: 'weeks/:weekId/verse', element: <VersePage /> },
```

### 레이아웃 구성

```
┌──────────────────────────────┐
│  ← 3주차                     │
│  구원의 확신                  │  ← 주차 타이틀
│  "여호수아 1:9"               │  ← 이번 주 암송 성구
├──────────────────────────────┤
│  [탭 네비게이션]               │
│  📝설교  🔍OIA  📓일기  🎵암송  │
├──────────────────────────────┤
│  (선택된 탭 콘텐츠 or 링크 카드)│
│                               │
│  [설교 노트 카드]  →          │
│  주일 / 금요 작성 가능          │
│                               │
│  [OIA 묵상 카드]   →          │
│  이번 주 OIA 2개 작성          │
│                               │
│  [신앙 일기 카드]  →          │
│  이번 주 일기 작성             │
│                               │
│  [성구 암송 카드]  →          │
│  YouTube 영상 보기             │
│                               │
│  ─────────────────────────   │
│  [주간 과제 체크]              │
│  ✅암송완료  ⬜독후감  ⬜예습   │
└──────────────────────────────┘
```

---

## 6. OIA 묵상 페이지 (`/weeks/:weekId/oia`)

**파일**: `frontend/src/pages/OiaPage.tsx`

### 레이아웃 구성

```
┌──────────────────────────────┐
│  ← OIA 묵상            [+새로작성]│
├──────────────────────────────┤
│  날짜: 2026-02-28             │
│  본문: [입력 필드]             │
├──────────────────────────────┤
│  📌 O — 관찰 (Observation)    │
│  "본문에서 무엇을 보았는가?"    │
│  ┌──────────────────────┐    │
│  │ 텍스트 영역 (4줄 이상)  │    │
│  └──────────────────────┘    │
├──────────────────────────────┤
│  💡 I — 해석 (Interpretation) │
│  "이 말씀이 무엇을 의미하는가?" │
│  ┌──────────────────────┐    │
│  │ 텍스트 영역             │    │
│  └──────────────────────┘    │
├──────────────────────────────┤
│  ✅ A — 적용 (Application)    │
│  "나의 삶에 어떻게 적용할까?"  │
│  ┌──────────────────────┐    │
│  │ 텍스트 영역             │    │
│  └──────────────────────┘    │
├──────────────────────────────┤
│     [저장하기] 버튼           │
└──────────────────────────────┘

── 이번 주 OIA 기록 목록 ──────
│  2026-02-28 · 창세기 1:1-10   │ → 수정/삭제
│  2026-02-25 · 시편 23편       │ → 수정/삭제
```

### OIA 컴포넌트 상세

```tsx
interface OiaFormData {
  date: string           // YYYY-MM-DD, 기본값: 오늘
  scripture: string      // 본문 (예: "요한복음 3:16")
  observation: string    // O 필드
  interpretation: string // I 필드
  application: string    // A 필드
}

// 저장 버튼 클릭 시:
// - 신규: POST /api/weeks/:weekNumber/oia
// - 수정: PUT /api/oia/:id
// - 성공 시 목록 갱신
// - textarea: auto-resize (내용에 따라 높이 자동 조절)
```

---

## 7. 설교 노트 페이지 (`/weeks/:weekId/sermon`)

**파일**: `frontend/src/pages/SermonPage.tsx`

### 레이아웃 구성

```
┌──────────────────────────────┐
│  ← 설교 노트                  │
│  [  주일 설교  |  금요 집회  ]  │  ← 탭 전환
├──────────────────────────────┤
│  날짜: [날짜 입력]             │
│  설교자: [입력 필드]           │
│  본문: [입력 필드]             │
├──────────────────────────────┤
│  [텍스트 에디터]               │
│  ┌──────────────────────────┐ │
│  │                          │ │
│  │  자유 서술 영역             │ │
│  │  (마크다운 지원)            │ │
│  │                          │ │
│  └──────────────────────────┘ │
├──────────────────────────────┤
│  [저장하기] 버튼               │
└──────────────────────────────┘
```

### 마크다운 에디터

```bash
npm install @uiw/react-md-editor
# 또는 단순 textarea (Phase 2에서는 textarea로 시작)
```

**Phase 2 기본 구현**: `<textarea>` + 마크다운 렌더링 미리보기 없이 저장
**Phase 3 고도화**: `@uiw/react-md-editor` 또는 `react-simplemde-editor` 적용

### 자동 저장 패턴

```tsx
// 3초 디바운스 자동 저장 (또는 blur 시 저장)
const debouncedSave = useDebouncedCallback(async (data) => {
  await api.put(`/api/weeks/${weekId}/sermon/${activeTab}`, data)
  setSaveStatus('saved')  // "저장됨" 표시
}, 3000)
```

---

## 8. 성구 암송 페이지 (`/weeks/:weekId/verse`)

**파일**: `frontend/src/pages/VersePage.tsx`

### 레이아웃 구성

```
┌──────────────────────────────┐
│  ← 성구 암송                  │
│  3주차 · 구원의 확신           │
├──────────────────────────────┤
│  📖 이번 주 암송 성구          │
│  ┌──────────────────────────┐ │
│  │  "내가 네게 명령한 것이    │ │  ← 골드 배경 카드
│  │   아니냐 강하고 담대하라   │ │
│  │   두려워하지 말며 놀라지   │ │
│  │   말라 네 하나님 여호와가  │ │
│  │   너와 함께 하느니라"      │ │
│  │                          │ │
│  │   여호수아 1:9            │ │  ← 참조 구절
│  └──────────────────────────┘ │
│  [📋 복사하기] 버튼           │
├──────────────────────────────┤
│  🎬 암송 영상                 │
│  ┌──────────────────────────┐ │
│  │                          │ │
│  │   YouTube IFrame Player  │ │  ← 16:9 비율 유지
│  │                          │ │
│  └──────────────────────────┘ │
├──────────────────────────────┤
│  [✅ 암송 완료 체크] 버튼      │  ← weeklyTasks.verseMemorized 업데이트
└──────────────────────────────┘
```

### YouTube IFrame 임베드

```tsx
// YouTube IFrame API 사용
const YOUTUBE_EMBED_URL = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`

// 16:9 비율 유지 (padding-top: 56.25%)
function YouTubePlayer({ videoId }: { videoId: string }) {
  return (
    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
      <iframe
        src={YOUTUBE_EMBED_URL}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        frameBorder="0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title="성구 암송 영상"
      />
    </div>
  )
}
```

> **보안**: `youtube-nocookie.com` 사용으로 쿠키 최소화

### 성구 텍스트 복사

```tsx
const handleCopy = async () => {
  await navigator.clipboard.writeText(`"${verse.text}" - ${verse.reference}`)
  showToast('성구가 복사되었습니다')
}
```

---

## 9. 신앙 일기 페이지 (`/weeks/:weekId/diary`)

**파일**: `frontend/src/pages/DiaryPage.tsx`

### 레이아웃 구성

```
┌──────────────────────────────┐
│  ← 신앙 일기 & 생활 숙제       │
├──────────────────────────────┤
│  📓 이번 주 신앙 일기          │
│  ┌──────────────────────────┐ │
│  │                          │ │
│  │  훈련 중 깨달은 점,        │ │
│  │  변화된 삶의 모습 기록      │ │
│  │                          │ │
│  └──────────────────────────┘ │
│  [자동저장됨 ✓]               │
└──────────────────────────────┘
```

### 자동 저장

```tsx
// textarea 변경 2초 후 자동 PUT /api/weeks/:weekId/diary
// 저장 상태 표시: "저장 중..." → "저장됨 ✓"
```

---

## 10. 커리큘럼 안내 페이지 (`/curriculum`)

**파일**: `frontend/src/pages/CurriculumPage.tsx`

### 레이아웃 구성

```
┌──────────────────────────────┐
│  32주 커리큘럼                │
├──────────────────────────────┤
│  📘 1권 — 터다지기            │
│  총 6주 · 1~6과               │
│  ┌────────────────────────┐  │
│  │ 1주 │ 제자훈련이란?     │  │
│  │     │ 암송: 마 28:19    │  │
│  │     │ 필독: 효과적인 간증 │  │
│  │     │          [기록하기]→│  │  ← 클릭 시 /weeks/1로 이동
│  └────────────────────────┘  │
│  ...                         │
│  📗 2권 — 구원의 진리 (7~20주)│
│  📕 3권 — 작은 예수 (21~32주) │
└──────────────────────────────┘
```

### 데이터 로딩

```tsx
// GET /api/curriculum → 32주 전체 목록
// 권별로 그룹화: volume 1, 2, 3
const grouped = rows.reduce((acc, row) => {
  if (!acc[row.volume]) acc[row.volume] = []
  acc[row.volume].push(row)
  return acc
}, {} as Record<number, CurriculumRow[]>)
```

---

## 11. 주간 과제 체크 컴포넌트

`WeekDetailPage` 및 `DashboardPage`에서 공유하는 컴포넌트.

**`frontend/src/components/WeeklyTaskCheck.tsx`:**

```tsx
interface WeeklyTaskCheckProps {
  weekNumber: number
}

// 3개 항목 토글:
// - 암송 완료 (verseMemorized)
// - 독후감 제출 (bookReportDone)
// - 예습 완료 (previewDone)

// 각 항목 클릭 시 PUT /api/weekly/:weekNumber 호출
// 낙관적 업데이트 패턴 적용
```

---

## 12. 공통 UI 컴포넌트 추가

Phase 2에서 필요한 추가 컴포넌트:

### `Toast` 알림 (`frontend/src/components/ui/Toast.tsx`)

```tsx
// 간단한 토스트 알림
// 위치: 화면 하단 BottomNav 위
// 자동 3초 후 사라짐
// 타입: 'success' | 'error' | 'info'
```

### `Skeleton` 로딩 (`frontend/src/components/ui/Skeleton.tsx`)

```tsx
// 데이터 로딩 중 플레이스홀더
// CSS animation: shimmer (좌→우 그라데이션)
// 크기: className으로 제어 (h-4, h-6, w-full 등)
```

### `TabNav` 탭 네비게이션 (`frontend/src/components/ui/TabNav.tsx`)

```tsx
interface TabNavProps {
  tabs: { label: string; value: string; icon?: ReactNode }[]
  activeTab: string
  onChange: (value: string) => void
}

// 스타일: 언더라인 스타일 탭
// 활성: 딥 블루 텍스트 + 골드 하단 보더 2px
// 비활성: 회색 텍스트
```

---

## 13. 상태관리 확장 (Zustand)

```ts
// useAppStore에 추가
interface AppState {
  // Phase 2 추가
  todayChecks: {
    prayer30min: boolean
    qtDone: boolean
    bibleReading: boolean
  }
  setTodayChecks: (checks: Partial<AppState['todayChecks']>) => void
}
```

---

## 14. 라우터 업데이트

Phase 1에서 예약된 중첩 라우트 활성화:

```tsx
{
  path: 'weeks/:weekId',
  element: <WeekDetailPage />,
},
{
  path: 'weeks/:weekId/oia',
  element: <OiaPage />,
},
{
  path: 'weeks/:weekId/sermon',
  element: <SermonPage />,
},
{
  path: 'weeks/:weekId/diary',
  element: <DiaryPage />,
},
{
  path: 'weeks/:weekId/verse',
  element: <VersePage />,
},
{
  path: 'curriculum',
  element: <CurriculumPage />,
},
```

---

## Phase 2 완료 기준 체크리스트

### 대시보드
- [ ] 현재 주차 자동 계산 표시 (시작일 기반)
- [ ] 32주 프로그레스 바 정확히 표시
- [ ] 오늘 일일 체크 요약 카드 표시
- [ ] 이번 주 과제 요약 카드 표시
- [ ] 이번 주 암송 성구 배너 표시

### 일일 체크
- [ ] 기도/QT/통독 토글 정상 동작
- [ ] 낙관적 업데이트 (즉각 UI 반응)
- [ ] API PUT /api/daily 정상 저장
- [ ] 오늘 날짜 기준 데이터 로딩

### 주차 목록
- [ ] 32주 전체 목록 표시 (권별 섹션)
- [ ] 현재 주차 골드 하이라이트
- [ ] 완료/미완료 상태 표시
- [ ] 클릭 시 주차 상세로 이동

### 주차 상세 (노트 허브)
- [ ] 주차 정보 표시 (제목, 암송 성구)
- [ ] 4개 탭 링크 카드 표시 (설교/OIA/일기/암송)
- [ ] 주간 과제 체크 3개 토글 동작

### OIA 묵상
- [ ] O/I/A 3개 필드 입력 가능
- [ ] 날짜 + 본문 필드 입력
- [ ] POST (신규) / PUT (수정) 정상 저장
- [ ] 이번 주 OIA 목록 표시
- [ ] 삭제 기능 동작

### 설교 노트
- [ ] 주일 / 금요 탭 전환
- [ ] 날짜, 설교자, 본문 필드 입력
- [ ] 본문 텍스트 에디터 저장
- [ ] 자동 저장 (디바운스) 동작

### 성구 암송
- [ ] 이번 주 암송 성구 텍스트 표시
- [ ] YouTube IFrame 영상 임베드 재생
- [ ] 성구 복사 버튼 동작
- [ ] 암송 완료 체크 저장

### 신앙 일기
- [ ] 텍스트 입력 + 자동 저장 동작

### 커리큘럼
- [ ] 32주 전체 목록 권별 표시
- [ ] 각 주차 상세 정보 표시 (제목, 성구, 필독서)
- [ ] "기록하기" 클릭 → 주차 상세 이동

---

## 다음 단계

Phase 2 완료 후 → **PHASE3_PROMPT.md** 참조

UX 고도화, 진도 시각화, PWA, 운영 안정화.
