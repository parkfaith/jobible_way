# CHANGELOG

모든 주요 변경사항은 이 파일에 기록됩니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따릅니다.

---

## [0.7.2] — 2026-03-01
> 배포 후 캐시 불일치로 인한 화면 에러 방지

### Fixed
- **동적 import 실패 시 자동 새로고침** — 배포 후 이전 JS 파일을 로드하지 못할 때 사용자에게 에러 화면 대신 자동 새로고침으로 해결
- **서비스워커 즉시 활성화** — `skipWaiting` + `clientsClaim` 설정으로 새 배포 시 캐시 즉시 교체

### 수정 파일
- `frontend/src/router/index.tsx` — `lazyWithRetry` 래퍼 추가
- `frontend/vite.config.ts` — workbox `skipWaiting`, `clientsClaim` 설정

---

## [0.7.1] — 2026-03-01
> 온보딩 페이지에 PWA 설치 배너 추가

### Added
- **온보딩 페이지(첫 화면)에 PWA 설치 배너 추가** — 로그인 전에도 홈 화면 추가 안내 표시
  - 대시보드와 동일한 UI/동작 (iOS 안내, Android 설치 버튼, 닫기)

### 수정 파일
- `frontend/src/pages/OnboardingPage.tsx`

---

## [0.7.0] — 2026-03-01
> 백엔드 Render → Cloudflare Workers 마이그레이션

### Changed
- **백엔드 런타임 교체**: Render (Node.js) → Cloudflare Workers (Edge)
  - Cold start 완전 제거 (0ms)
  - 무료 티어에서 무제한 서비스 운영 가능
- **진입점 구조 변경**: `@hono/node-server` `serve()` → Workers `export default app`
- **Firebase 인증 방식 변경**: `firebase-admin` SDK → `jose` 라이브러리 JWT 직접 검증
  - Workers 환경에서 Node.js 전용 SDK 사용 불가로 인한 교체
  - Google 공개 키(JWK) 기반 토큰 검증 + 메모리 캐시
- **환경변수 처리 변경**: `dotenv` + `process.env` → Hono `c.env` Bindings
  - `env.ts`를 타입 정의 전용으로 변경
- **DB 클라이언트 구조 변경**: 전역 싱글톤 → 미들웨어 주입 팩토리 함수
  - `createDb(env)` 팩토리로 변경, `c.get('db')`로 라우트에서 접근
- **Health check**: `process.uptime()` 제거 → `runtime: 'cloudflare-workers'` 표시

### Added
- `backend/wrangler.toml` — Cloudflare Workers 배포 설정

### Removed
- `@hono/node-server`, `firebase-admin`, `dotenv`, `tsup` 의존성 제거
- 기존 Node.js 서버 실행 코드 (`serve()`, `PORT` 등)

### 수정 파일
- `backend/package.json` — 의존성 및 scripts 변경
- `backend/tsconfig.json` — Workers 타입 추가
- `backend/wrangler.toml` (신규)
- `backend/src/index.ts` — Workers export 진입점
- `backend/src/env.ts` — 타입 정의 전용
- `backend/src/types.ts` — Bindings + db 변수 추가
- `backend/src/lib/firebase-admin.ts` — jose JWT 검증
- `backend/src/middleware/auth.ts` — verifyFirebaseToken 연동
- `backend/src/db/index.ts` — createDb 팩토리
- `backend/src/routes/health.ts`
- `backend/src/routes/curriculum.ts`
- `backend/src/routes/daily.ts`
- `backend/src/routes/weekly.ts`
- `backend/src/routes/sermon.ts`
- `backend/src/routes/oia.ts`
- `backend/src/routes/diary.ts`
- `backend/src/routes/users.ts`
- `backend/src/routes/progress.ts`

---

## [0.6.0] — 2026-02-28
> 첫 배포 — Render + Vercel + Turso

### Added
- **배포 인프라 구축**
  - 백엔드: Render (Free) — `https://jobible-way-api.onrender.com`
  - 프론트엔드: Vercel (Hobby) — `https://jobible-way.vercel.app`
  - DB: Turso (Free)

### Changed
- 백엔드 빌드를 `tsc` → `tsup` 번들링으로 변경 (ESM 모듈 resolve 문제 해결)
- `tsup`을 dependencies로 이동 (Render 프로덕션 빌드 호환)

### 수정 파일
- `backend/package.json` — build/start 스크립트 변경, tsup 추가

---

## [0.5.0] — 2026-02-28
> 커리큘럼 데이터 전면 교체 — 실제 옥한흠 제자훈련 교재 기준

### Changed
- **커리큘럼 시드 데이터 전면 교체** — AI 생성 데이터 → 실제 옥한흠 제자훈련 교재 기준
  - 1권: 제자 훈련의 터다지기 (6과)
  - 2권: 아무도 흔들 수 없는 나의 구원 (14과)
  - 3권: 작은 예수가 되라 (12과)
- **과당 암송 구절 2개로 확장** — `scripture2`, `verseText2` 컬럼 추가
- **YouTube 암송 영상 연결** — 낙원제일교회 암송 재생목록 32개 영상 ID 매핑
- **VersePage UI 개편** — 2개 구절 카드 분리 표시 + 복사/공유 기능 개선

### 수정 파일
- `backend/src/db/schema.ts` — scripture2, verseText2 컬럼 추가
- `backend/src/db/seed.ts` — 32주 전면 교체 (실제 교재 기준)
- `backend/drizzle/migrations/0003_yummy_senator_kelly.sql` — 마이그레이션
- `frontend/src/pages/VersePage.tsx` — 2구절 표시 UI

---

## [0.4.1] — 2026-02-28
> 성구 암송 페이지 개선 — 실제 구절 본문 추가

### Added
- `curriculum` 테이블에 `verse_text` 컬럼 추가 — 암송 구절 본문 저장
- 시드 데이터에 32주 전체 암송 성경 구절 본문(개역개정) 추가
- VersePage에 공유/복사 기능 추가 (`shareOrCopy` 연동)

### Changed
- VersePage UI 개선 — 성경 주소(예: 요한일서 5:11-13)와 구절 본문을 분리 표시
- 구절 복사 시 주소 + 본문 함께 복사

### 수정 파일
- `backend/src/db/schema.ts` — curriculum 테이블에 verseText 컬럼
- `backend/src/db/seed.ts` — 32주 verseText 데이터 추가
- `backend/drizzle/migrations/0002_talented_preak.sql` — 마이그레이션
- `frontend/src/pages/VersePage.tsx` — UI 개선 + 공유 기능

---

## [0.4.0] — 2026-02-28
> QA 수정 & 배포 준비

### Fixed
- **백엔드 입력 검증 강화**
  - `curriculum.ts` — weekNumber NaN/범위(1-32) 검증 추가
  - 모든 라우트(sermon, oia, daily, weekly, users) — `c.req.json()` try-catch 추가 (잘못된 JSON → 400)
  - `daily.ts`, `oia.ts` — date 필수값 검증 추가
  - `users.ts` — name, email 필수값 검증 추가
- **백엔드 OIA 라우트 안전성**
  - `oia.ts` PUT/DELETE — `rowsAffected === 0` 시 404 리턴 (소유권 불일치 감지)
- **프론트엔드 API 에러 핸들링 개선**
  - `api.ts` — `res.text()` 실패 시 안전한 폴백 메시지, 빈 응답 body JSON 파싱 에러 방지
- **OIA 자동 저장 경합 방지**
  - `OiaPage.tsx` — `saving` ref로 새 노트 생성 시 중복 POST 방지

### Changed
- **자동 저장 토스트 제거**
  - `SermonPage.tsx`, `DiaryPage.tsx`, `OiaPage.tsx` — 성공 시 '자동 저장됨' 토스트 제거 (실패 시에만 표시)
- **미사용 Zustand 제거**
  - `store/useAppStore.ts` 삭제, `zustand` 의존성 제거
- **CORS 유연화**
  - `index.ts` — `ALLOWED_ORIGINS` 환경 변수로 추가 도메인 허용 가능
- **PWA 캐싱 업데이트**
  - `vite.config.ts` — 미사용 Google Fonts 캐싱 제거, Pretendard CDN 캐싱 추가

### Added
- `CLAUDE.md` — Claude Code 프로젝트 가이드 파일 (한국어)

### 수정 파일
- `backend/src/routes/curriculum.ts`
- `backend/src/routes/sermon.ts`
- `backend/src/routes/oia.ts`
- `backend/src/routes/daily.ts`
- `backend/src/routes/weekly.ts`
- `backend/src/routes/users.ts`
- `backend/src/index.ts`
- `frontend/src/lib/api.ts`
- `frontend/src/pages/SermonPage.tsx`
- `frontend/src/pages/OiaPage.tsx`
- `frontend/src/pages/DiaryPage.tsx`
- `frontend/package.json`
- `frontend/vite.config.ts`
- `CLAUDE.md` (신규)

---

## [0.3.0] — 2026-02-28
> 디자인 테마 변경 & 공유 기능 & PWA

### Added
- **복사/공유 기능**
  - `share.ts` — Web Share API + 클립보드 복사 fallback 유틸
  - `SermonPage.tsx` — 설교 노트 공유 버튼 (rightAction)
  - `OiaPage.tsx` — OIA 묵상 공유 버튼 (편집 모드 헤더)
  - `DiaryPage.tsx` — 신앙 일기 공유 버튼 (rightAction)
- **PWA 지원**
  - `vite-plugin-pwa` — 서비스 워커, 오프라인 지원, 홈화면 추가
  - Workbox 런타임 캐싱 (커리큘럼 API, 폰트)
  - 보안 헤더 (`vercel.json`)
- **진도 시각화** (`/progress`)
  - 일일 체크 히트맵 (GitHub 스타일)
  - 연속 달성일 스트릭 카드
  - 권별 완료율 도넛 차트
- 에러 바운더리, 빈 상태 UI, 로딩 스켈레톤
- 코드 분할 — 페이지별 lazy loading + Suspense

### Changed
- **다크 네이비 테마** — 3차 디자인 변경
  - 배경: #0B1026, 표면: #141B32, 골드: #F5A623, 시안: #4FC3F7
  - 모든 컴포넌트/페이지 CSS 변수 기반으로 통일
- **Pretendard 폰트** — 기존 서체(Cormorant Garamond 등) 전면 교체
- **프로필 페이지** — 개발자명 "Park JunHyoung(Ryan)"
- **인증** — Clerk → Firebase Auth (Google OAuth)로 변경

---

## [0.2.0] — 2026-02-28
> 핵심 기능 (Core Features)

### Added
- **대시보드** (`/home`) — 현재 주차 자동 계산, 진행률 바, 일일/주간 요약 카드
- **일일 체크** (`/daily`) — 기도 30분/QT/성경 통독 토글, 주간 달력 선택, 낙관적 업데이트
- **주차 목록** (`/weeks`) — 32주 타임라인, 권별 섹션, 현재 주차 하이라이트
- **주차 상세** (`/weeks/:weekId`) — 노트 허브 + 주간 체크리스트
- **설교 노트** (`/weeks/:weekId/sermon`) — 주일/금요 탭, 1.5초 디바운스 자동 저장
- **OIA 묵상** (`/weeks/:weekId/oia`) — O/I/A 3개 필드, CRUD, 자동 저장
- **신앙 일기** (`/weeks/:weekId/diary`) — 자유 텍스트, 자동 저장
- **성구 암송** (`/weeks/:weekId/verse`) — 성구 카드, YouTube 임베드, 클립보드 복사
- **커리큘럼 안내** (`/curriculum`) — 32주 전체 목록
- **백엔드 REST API** — curriculum, daily, weekly, sermon, oia, diary, users, progress 전체 엔드포인트

---

## [0.1.0] — 2026-02-28
> 기반 구축 (Foundation & Infrastructure)

### Added
- 모노레포 구조 초기화 (`/frontend`, `/backend`)
- **Frontend**: React 19 + Vite 7 + TypeScript 5.9 + Tailwind CSS 4
- **Backend**: Hono + Drizzle ORM + Turso (LibSQL/SQLite) + Firebase Admin SDK
- **DB 스키마**: users, curriculum, sermon_notes, oia_notes, diary_entries, weekly_tasks, daily_checks
- **DB 마이그레이션**: drizzle-kit 설정 + Turso 적용
- **Seed 데이터**: 커리큘럼 32주 (1권 6주, 2권 14주, 3권 12주)
- **디자인 시스템**: Button, Card, Badge, BottomNav, AppShell, TabNav, Toast
- **라우팅**: React Router v7, 인증 보호 라우트, 공개 라우트
- **API fetch 래퍼**: Firebase ID 토큰 자동 첨부
- **환경변수 검증** (`env.ts`)
- **CORS** 설정, 헬스 체크 엔드포인트

---

## [0.0.1] — 2026-02-28
> 프로젝트 초기화

### Added
- PRD 문서 작성 (`PRD_jobible_Way.md`)
- 개발 프롬프트 작성 (`PHASE1_PROMPT.md`, `PHASE2_PROMPT.md`, `PHASE3_PROMPT.md`)
- `CHANGELOG.md` 초기 작성
