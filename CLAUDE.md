# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

**jobible Way** — 낙원제일교회 32주 제자훈련 기록 PWA. `backend/`과 `frontend/` 디렉토리로 분리된 모노레포 구조.

## 명령어

### 백엔드 (`cd backend`)
| 명령어 | 설명 |
|--------|------|
| `npm run dev` | tsx watch 개발 서버 시작 (포트 3000) |
| `npm run build` | TypeScript → `dist/` 컴파일 |
| `npm start` | 컴파일된 서버 실행 |
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
# 양쪽 프로젝트 타입 체크 (출력 없이)
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit && npx vite build
```

## 아키텍처

### 기술 스택
- **백엔드**: Hono + Drizzle ORM + Turso (SQLite/LibSQL) + Firebase Admin SDK
- **프론트엔드**: React 19 + Vite 7 + Tailwind CSS 4 + React Router 7 + Firebase Auth + PWA (vite-plugin-pwa)
- **인증(Auth)**: Firebase Google OAuth → `Authorization: Bearer` 헤더에 ID 토큰 → 백엔드에서 Firebase Admin으로 검증
- **폰트**: Pretendard Variable (CDN 동적 서브셋)

### 백엔드 구조
라우트는 `backend/src/routes/`에 모듈별로 분리. 모든 사용자 관련 라우트는 `requireAuth` 미들웨어를 사용하여 Firebase 토큰에서 `userId`를 추출해 Hono 컨텍스트에 저장.

주요 라우트 패턴:
- `/api/weeks/:weekNumber/{sermon|oia|diary}` — 주차별 콘텐츠
- `/api/oia/:id` — OIA 항목 수정/삭제용 별도 라우터 인스턴스 (userId로 소유권 확인)
- `/api/daily`, `/api/weekly/:weekNumber` — `onConflictDoUpdate` 기반 upsert
- `/api/progress/{heatmap|streak|volumes}` — 읽기 전용 집계 쿼리

중첩 라우팅: `backend/src/index.ts`에서 `weeksApi` Hono 인스턴스를 생성하여 `/api/weeks`에 마운트, 하위에 `:weekNumber/sermon`, `:weekNumber/oia`, `:weekNumber/diary`를 서브 라우트로 연결.

### 프론트엔드 구조
- **진입점**: `main.tsx` → ErrorBoundary → AuthProvider → ToastProvider → RouterProvider
- **라우팅**: `router/index.tsx` — 공개 라우트(`/`, `/login`) + `ProtectedLayout`으로 감싼 보호 라우트 (지연 로딩)
- **인증**: `lib/AuthContext.tsx` — Firebase `onAuthStateChanged` 리스너, 로그인 시 백엔드에 사용자 자동 upsert
- **API 클라이언트**: `lib/api.ts` — Firebase ID 토큰을 자동 첨부하는 fetch 래퍼
- **레이아웃**: `AppShell` (고정 헤더 + 콘텐츠 + BottomNav)이 모든 보호 페이지를 감쌈

### 데이터 패턴
- **자동 저장(Auto-save)**: SermonPage, OiaPage, DiaryPage에서 `useRef` 타이머로 1.5초 디바운스 저장. 성공 시 무음, 실패 시에만 토스트 표시.
- **낙관적 업데이트(Optimistic Update)**: DailyPage, WeekDetailPage에서 상태를 즉시 변경 후 API 실패 시 롤백.
- **OIA 경합 방지(Race Condition Guard)**: `saving` ref로 새 노트 생성 시 중복 POST 방지.

### 데이터베이스 스키마 (7 테이블)
- `users` — PK는 Firebase UID (text)
- `curriculum` — 32주 정적 데이터 (시드), weekNumber에 유니크 제약
- `sermonNotes` — (userId, weekNumber, service)에 유니크
- `oiaNotes` — (userId, weekNumber)에 인덱스, 주차당 복수 허용
- `diaryEntries` — (userId, weekNumber)에 유니크
- `weeklyTasks` — 복합 PK (userId, weekNumber)
- `dailyChecks` — 복합 PK (userId, date)

스키마 변경 시: `backend/src/db/schema.ts` 수정 → `npm run generate` → `npm run migrate` 순서로 실행.

## 환경 변수

### 백엔드 (`backend/.env`)
```
TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
PORT (기본값 3000), NODE_ENV
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
- **백엔드**: Render/Railway (Node.js)
- **CORS**: 개발 환경에서 `localhost:*` 허용, 프로덕션에서 `https://jobible-way.vercel.app` 허용

## 작업 규칙

1. **언어**: 모든 응답과 코드 주석은 **한국어**로 작성. 기술 용어는 영어 병기 가능 (예: 변수(Variable))
2. **CHANGELOG.md**: 코드 수정 후 반드시 업데이트 — 날짜, 카테고리, 상세 내용, 수정 파일 목록 포함
3. **코드**: 변수명, 함수명은 영어 사용
4. **개발자**: Park JunHyoung (Ryan)
