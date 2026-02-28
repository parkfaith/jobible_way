# CHANGELOG

모든 주요 변경사항은 이 파일에 기록됩니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따릅니다.

---

## [Unreleased]

> 현재 개발 중인 변경사항

---

## [0.3.0] — Phase 3 (예정)
> 고도화 & 배포 완성 (Polish & Deployment)

### Added
- 진도 시각화 페이지 (`/progress`)
  - 일일 체크 달력 히트맵 (GitHub style, 골드 색상 단계)
  - 권별 완료율 도넛 차트 (1권/2권/3권 각각)
  - 최근 8주 완료율 막대 그래프
- 연속 달성일 (스트릭) 표시 — 현재 스트릭 / 최장 스트릭 / 전체 완료일
- 카카오 소셜 로그인 (Clerk OAuth 연동)
- PWA 지원 (`vite-plugin-pwa`)
  - 홈화면 추가 (Android Chrome, iOS Safari)
  - 오프라인 기본 기능 지원 (Service Worker + Workbox)
  - 커리큘럼 API NetworkFirst 캐싱
  - Google Fonts CacheFirst 캐싱
- 로딩 스켈레톤 — 모든 페이지 shimmer 애니메이션
- 에러 바운더리 (`ErrorBoundary`) — 앱 최상단 적용
- 빈 상태 UI (`EmptyState`) — 모든 목록 화면 적용
- UptimeRobot 5분 간격 헬스 핑 설정
- `GET /health` DB 연결 상태 포함 응답 (status: ok | degraded)
- 보안 헤더 (`vercel.json`): X-Frame-Options, X-XSS-Protection 등
- 프로필 페이지 완성 — 훈련 통계, 로그아웃
- 코드 분할 (Lazy Loading) — 페이지별 번들 분리
- 커리큘럼 데이터 `sessionStorage` 캐싱

### Changed
- `/health` 엔드포인트 — DB 상태 포함, 503 응답 분기 추가
- 라우터 — 모든 페이지 `lazy()` + `Suspense` 래핑

### Fixed
- iOS Safari 하단 안전 영역 (safe-area-inset-bottom) 패딩 보정
- YouTube IFrame 모바일 전체화면 권한 속성 추가

---

## [0.2.0] — Phase 2 (예정)
> 핵심 기능 (Core Features)

### Added
- **대시보드** (`/home`)
  - 훈련 시작일 기반 현재 주차 자동 계산
  - 32주 프로그레스 바 (골드 fill)
  - 오늘 일일 체크 요약 카드
  - 이번 주 과제 요약 카드
  - 이번 주 암송 성구 배너 (골드 배경)
- **일일 체크** (`/daily`)
  - 기도 30분 / QT / 성경 통독 토글 스위치
  - 낙관적 업데이트 (즉각 UI 반응)
  - 오늘 날짜 자동 표시
- **주차 목록** (`/weeks`)
  - 32주 전체 타임라인 (권별 섹션 구분)
  - 현재 주차 골드 하이라이트 + 📍 배지
  - 완료/진행중/미완료 상태 시각화
- **주차 상세 — 노트 허브** (`/weeks/:weekId`)
  - 설교 노트 / OIA 묵상 / 신앙 일기 / 성구 암송 링크 카드
  - 주간 과제 체크 (암송완료/독후감/예습)
- **OIA 묵상** (`/weeks/:weekId/oia`)
  - O(관찰) / I(해석) / A(적용) 3개 필드
  - 날짜 + 본문 필드
  - 이번 주 OIA 기록 목록 (수정/삭제)
- **설교 노트** (`/weeks/:weekId/sermon`)
  - 주일 / 금요 탭 전환
  - 날짜, 설교자, 본문, 내용 입력
  - 3초 디바운스 자동 저장
- **성구 암송** (`/weeks/:weekId/verse`)
  - 이번 주 암송 성구 텍스트 (골드 카드)
  - YouTube IFrame 임베드 플레이어 (youtube-nocookie.com)
  - 성구 텍스트 클립보드 복사
  - 암송 완료 체크 (weeklyTasks.verseMemorized)
- **신앙 일기** (`/weeks/:weekId/diary`)
  - 자유 서술 텍스트, 2초 디바운스 자동 저장
- **커리큘럼 안내** (`/curriculum`)
  - 32주 전체 목록 (권별 섹션)
  - 주차별 제목, 암송 성구, 필독서 표시
  - "기록하기" → 주차 상세 이동
- **Toast 알림** — 저장 완료, 에러 메시지
- **TabNav** 컴포넌트 — 언더라인 스타일 탭
- **백엔드 API** 전체
  - `GET /api/curriculum`, `GET /api/curriculum/:weekNumber`
  - `GET/PUT /api/daily`
  - `GET/PUT /api/weekly/:weekNumber`
  - `GET/PUT /api/weeks/:weekNumber/sermon/:service`
  - `GET/POST/PUT/DELETE /api/oia`
  - `GET/PUT /api/weeks/:weekNumber/diary`
  - `GET/POST /api/me`

### Changed
- `WeeksPage`, `DailyPage`, `ProgressPage`, `ProfilePage` — 플레이스홀더에서 실제 기능으로 전환
- 라우터 — 중첩 라우트 활성화 (주차 상세, OIA, 설교 노트, 신앙 일기, 성구 암송)

---

## [0.1.0] — Phase 1 (예정)
> 기반 구축 (Foundation & Infrastructure)

### Added
- 모노레포 구조 초기화 (`/frontend`, `/backend`)
- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS v4 + CSS 변수 디자인 토큰
  - 색상 팔레트: Deep Navy Blue (#1A2E4A), Warm Gold (#C9A84C), Cream White (#FAF8F5)
  - 타이포그래피: Cormorant Garamond, Crimson Pro, Noto Serif KR, Inter (Google Fonts)
- **라우팅**: React Router v6 (SPA, 인증 보호 라우트)
- **상태관리**: Zustand (`useAppStore`)
- **인증**: Clerk (이메일 + Google 소셜 로그인, JWT)
- **Backend**: Node.js + Hono + TypeScript
- **ORM**: Drizzle ORM (TypeScript 타입 안전)
- **Database**: Turso (LibSQL/SQLite) 연결
- **DB 스키마**: users, curriculum, sermon_notes, oia_notes, diary_entries, weekly_tasks, daily_checks
- **DB 마이그레이션**: drizzle-kit 설정 및 Turso 적용
- **Seed 데이터**: 커리큘럼 32주 (1권 터다지기 1~6주, 2권 구원의 진리 7~20주, 3권 작은 예수 21~32주)
- **디자인 시스템 컴포넌트**:
  - `Button` (primary/secondary/ghost, loading 상태)
  - `Card` (클릭 가능/불가 변형)
  - `Badge` (default/success/gold/outline)
  - `BottomNav` (5개 탭: 홈/주차/체크/진도/설정, 딥 블루 배경)
- **레이아웃 셸**: `AppShell` (헤더 + 콘텐츠 + BottomNav)
- **API fetch wrapper**: Clerk JWT 자동 첨부 (`useApi` 훅)
- **페이지 플레이스홀더**: Dashboard, Weeks, Daily, Progress, Profile
- **온보딩 페이지** (`/`): 슬로건, "시작하기" CTA
- **로그인 페이지** (`/login`): Clerk SignIn 컴포넌트
- `GET /health` 엔드포인트 — `{ status, service, timestamp, uptime }`
- Clerk JWT 미들웨어 (`requireAuth`)
- CORS 설정 (localhost:5173 + Vercel URL)
- 환경변수 검증 (`env.ts`)
- **배포 초기 설정**:
  - Vercel (frontend) — GitHub 연결, 환경변수 설정
  - Render (backend) — GitHub 연결, 환경변수 설정

---

## [0.0.1] — 2026-02-28
> 프로젝트 초기화

### Added
- PRD 문서 작성 완료 (`PRD_jobible_Way.md`)
  - 제품 개요, 배경, 목표, 사용자 정의
  - 핵심 기능 요구사항 (인증, 대시보드, 성구 암송, 노트 허브, 진도 관리, 커리큘럼)
  - 화면 목록 및 라우트 설계
  - UX/UI 디자인 방향 (색상 팔레트, 타이포그래피, 컴포넌트 스타일)
  - 기술 스택 확정 (Vercel + Render + Turso + Clerk)
  - SQL 데이터 모델 설계 (7개 테이블)
  - 비기능 요구사항 (성능, 보안, PWA, 접근성)
  - 3단계 개발 로드맵 정의
- 개발 프롬프트 작성 완료
  - `PHASE1_PROMPT.md` — 기반 구축
  - `PHASE2_PROMPT.md` — 핵심 기능
  - `PHASE3_PROMPT.md` — 고도화 & 배포 완성
- `CHANGELOG.md` 초기 작성
