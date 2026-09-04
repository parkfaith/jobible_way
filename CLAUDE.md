# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

**jobible Way** — 낙원제일교회 32주 제자훈련 기록 PWA. `backend/`과 `frontend/` 디렉토리로 분리된 모노레포 구조.

## 명령어

### 백엔드 (`cd backend`)
| 명령어 | 설명 |
|--------|------|
| `npx wrangler dev` | Cloudflare Workers 로컬 개발 서버 (포트 3000) |
| `npx wrangler deploy` | Cloudflare Workers 프로덕션 배포 |
| `npm run generate` | 스키마 변경 후 Drizzle 마이그레이션 생성 |
| `npm run migrate` | 대기 중인 마이그레이션 Turso DB에 적용 |
| `npm run seed` | 32주 커리큘럼 시드 데이터 삽입 |

### 프론트엔드 (`cd frontend`)
| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Vite 개발 서버 (포트 5173) |
| `npm run build` | `tsc -b && vite build` (타입 체크 + 번들링) |
| `npm run lint` | ESLint 검사 |
| `npm run preview` | 프로덕션 빌드 로컬 미리보기 |

### 빠른 검증
```bash
# 프론트엔드 타입 체크 + 빌드
cd frontend && npx tsc --noEmit && npx vite build
```

## 아키텍처

### 기술 스택
- **백엔드**: Hono + Drizzle ORM + Turso (SQLite/LibSQL) + Cloudflare Workers
- **프론트엔드**: React 19 + Vite 7 + Tailwind CSS 4 + React Router 7 + Firebase Auth + PWA (vite-plugin-pwa)
- **인증(Auth)**: Firebase Google OAuth → `Authorization: Bearer` 헤더에 ID 토큰 → 백엔드에서 jose 라이브러리로 JWT 공개키 검증
- **폰트**: Pretendard Variable (CDN 동적 서브셋)

### 백엔드 구조
라우트는 `backend/src/routes/`에 모듈별로 분리. 모든 사용자 관련 라우트는 `requireAuth` 미들웨어를 사용하여 Firebase 토큰에서 `userId`를 추출해 Hono 컨텍스트에 저장.

주요 라우트 패턴:
- `/api/weeks/:weekNumber/{sermon|diary}` — 주차별 콘텐츠
- `/api/weeks/:weekNumber/sermons` — YouTube 플레이리스트에서 해당 주차 설교 영상 조회
- `/api/daily`, `/api/weekly/:weekNumber` — `onConflictDoUpdate` 기반 upsert
- `/api/progress/{heatmap|streak|volumes}` — 읽기 전용 집계 쿼리
- `/api/summaries/:videoId` — AI 설교 요약 (GET 조회 / POST 생성)
- `/api/admin/users`, `/api/admin/users/:userId/fellow` — 관리자 전용

중첩 라우팅: `backend/src/index.ts`에서 `weeksApi` Hono 인스턴스를 생성하여 `/api/weeks`에 마운트, 하위에 `:weekNumber/sermon`, `:weekNumber/diary`를 서브 라우트로 연결.

### 인증·권한
- `requireAuth` 미들웨어가 Firebase ID 토큰을 검증한 뒤 `userId`와 **`userEmail`을 토큰의 claim에서 직접** 추출해 Hono 컨텍스트에 저장. 클라이언트가 보낸 body의 이메일은 신뢰하지 않음.
- 관리자 판별: `backend/src/routes/admin.ts`의 `ADMIN_EMAIL` 상수(`parkfaith75@gmail.com`)와 검증된 `userEmail`을 비교. 불일치 시 403.
- 일반 사용자 권한: `users.canViewFellow` 필드로 제자동역자(FellowPage) 열람 제어. 관리자가 `/admin`에서 토글.

### AI 설교 요약 (Gemini)
`backend/src/lib/gemini.ts` — Gemini API로 YouTube 설교 영상을 요약. 스트리밍(`streamGenerateContent`) 방식이며 결과는 `sermon_summaries` 테이블에 **videoId 단위로 전 사용자 공유** 저장(중복 생성 방지). 생성 전 자막 존재 여부(`hasYouTubeCaptions`)와 영상 길이(최대 70분)를 확인.

### 주차 계산 (방학 반영)
`frontend/src/lib/date.ts`가 주차 계산의 **단일 출처**. 각 페이지에서 직접 날짜 계산하지 말고 아래 헬퍼를 사용할 것:
- `getCurrentWeek()` — 현재 진행 주차. 1주차 시작 2026-02-22(일), 19주차(~7/4)까지 진행 후 방학, 20주차부터 2026-09-06(일) 재개하여 32주차까지.
- `isVacation()` — 방학(2026-07-05 ~ 09-05) 여부
- `getWeekStartDate(weekNumber)` — 주차 → 시작 일요일
- 설교 영상 주차↔날짜 매핑은 프론트(`SermonPage.tsx`)와 백엔드(`routes/sermon.ts`) **양쪽에** 20주차 이후 +63일 오프셋이 들어가 있음. 한쪽만 고치면 어긋나므로 함께 수정할 것.

### 과제물 데이터
`frontend/src/lib/assignments.ts`의 `ASSIGNMENTS`(주차 → 항목 배열)가 과제물의 단일 출처. **성경통독·필독서도 별도 상수가 아니라 이 데이터에서 추출**(`getBibleReading()`, `getBookTitle()`)하므로, 주차 데이터를 추가하면 대시보드·주차 상세·데일리 화면에 함께 반영됨.

### 프론트엔드 구조
- **진입점**: `main.tsx` → ErrorBoundary → AuthProvider → ToastProvider → RouterProvider
- **라우팅**: `router/index.tsx` — 공개 라우트(`/`, `/login`) + `ProtectedLayout`으로 감싼 보호 라우트 (지연 로딩)
- **인증**: `lib/AuthContext.tsx` — Firebase `onAuthStateChanged` 리스너, 로그인 시 백엔드에 사용자 자동 upsert
- **API 클라이언트**: `lib/api.ts` — Firebase ID 토큰을 자동 첨부하는 fetch 래퍼
- **레이아웃**: `AppShell` (고정 헤더 + 콘텐츠 + BottomNav)이 모든 보호 페이지를 감쌈
- **청크 로드 복구**: `router/index.tsx`의 `lazyWithRetry` + `RouteErrorBoundary` — 배포 후 캐시 불일치로 동적 import가 실패하면 SW 캐시를 비우고 1회 자동 새로고침 (10초 내 재시도는 무한 루프 방지로 차단)

보호 라우트 페이지: `/home`(대시보드), `/weeks`, `/weeks/:weekId`(주차 상세), `/weeks/:weekId/{sermon|diary|verse}`, `/daily`, `/assignments`(과제물), `/progress`, `/curriculum`, `/fellow`(제자동역자), `/profile`, `/admin`(관리자 전용).

### 데이터 패턴
- **자동 저장(Auto-save)**: SermonPage, DiaryPage에서 `useRef` 타이머로 1.5초 디바운스 저장. 성공 시 무음, 실패 시에만 토스트 표시.
- **낙관적 업데이트(Optimistic Update)**: DailyPage, WeekDetailPage에서 상태를 즉시 변경 후 API 실패 시 롤백.

### 데이터베이스 스키마 (7 테이블)
- `users` — PK는 Firebase UID (text). `canViewFellow`로 제자동역자 열람 권한 관리
- `curriculum` — 32주 정적 데이터 (시드), weekNumber에 유니크 제약
- `sermonNotes` — (userId, weekNumber, service)에 유니크
- `diaryEntries` — (userId, weekNumber)에 유니크
- `weeklyTasks` — 복합 PK (userId, weekNumber)
- `sermonSummaries` — AI 설교 요약, videoId에 유니크 (사용자별이 아닌 공유 데이터)
- `dailyChecks` — 복합 PK (userId, date)

스키마 변경 시: `backend/src/db/schema.ts` 수정 → `npm run generate` → `npm run migrate` 순서로 실행.

## 환경 변수

### 백엔드 (Cloudflare Workers — `wrangler secret` 또는 `backend/.dev.vars`)
```
TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
FIREBASE_PROJECT_ID
YOUTUBE_API_KEY
GEMINI_API_KEY (AI 설교 요약)
ALLOWED_ORIGINS (선택), NODE_ENV (선택)
```

### 프론트엔드 (`frontend/.env.local`)
```
VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
VITE_API_URL (기본값 http://localhost:3000)
```

## 스타일 규칙

모든 색상은 `frontend/src/styles/index.css`에 정의된 CSS 커스텀 속성 사용 (다크 네이비 테마). Tailwind 클래스에서 `var(--color-*)`로 참조:
- `bg-[var(--color-surface)]`, `text-[var(--color-text-primary)]`, `border-[var(--color-border)]`
- 주요 액션 색상: `--color-secondary` (골드 #F5A623)
- 보조 색상: `--color-accent` (시안 #4FC3F7)

컴포넌트에서 하드코딩된 색상값 사용 금지 — 항상 CSS 변수를 사용하여 테마 변경 시 전체 반영되도록 할 것.

## 배포

- **프론트엔드**: Vercel (SPA 리라이트: `frontend/vercel.json`, 보안 헤더 설정 포함)
- **백엔드**: Cloudflare Workers (`wrangler deploy`, `backend/wrangler.toml` 설정)
- **CORS**: `localhost:*` 항상 허용, 프로덕션에서 `https://jobible-way.vercel.app` 허용

## 작업 규칙

1. **언어**: 모든 응답과 코드 주석은 **한국어**로 작성. 기술 용어는 영어 병기 가능 (예: 변수(Variable))
2. **CHANGELOG.md**: 코드 수정 후 반드시 업데이트 — 날짜, 카테고리, 상세 내용, 수정 파일 목록 포함
3. **코드**: 변수명, 함수명은 영어 사용
4. **개발자**: Park JunHyoung (Ryan)
