# PRD: jobible Way
## 제품 요구사항 문서 (Product Requirements Document)

**문서 버전**: v1.1
**작성일**: 2026-02-28
**최종 수정**: 2026-02-28 (기술 스택 → Vercel + Render + Turso로 확정)
**프로젝트명**: jobible Way
**슬로건**: "제자의 길을 걷는 여정"

---

## 1. 제품 개요 (Product Overview)

**jobible Way**는 낙원제일교회 제2기 제자훈련 과정(32주)에 참여하는 훈련생들이 자신의 영적 성장 여정을 기록하고, 커리큘럼을 체계적으로 이수할 수 있도록 지원하는 전용 모바일 웹앱입니다.

### 핵심 가치
- **기록**: 설교 요약, 신앙 일기, OIA 묵상을 한 곳에 통합
- **암송**: 주차별 성구 암송 영상(YouTube)과 즉시 연동
- **관리**: 32주 전체 여정의 진도를 시각적으로 추적
- **개인화**: 개인 데이터 격리로 나만의 영적 포트폴리오 구성

---

## 2. 배경 및 문제 정의 (Background & Problem Statement)

### 배경
낙원제일교회 제2기 제자훈련은 32주에 걸쳐 3권의 교재(총 32개 과)를 이수하는 집중 훈련 프로그램입니다. 각 주마다 설교 청취, 성구 암송, OIA 묵상, 필독서 독후감, 일일 기도/QT/성경통독 등 다층적인 과제가 주어집니다.

### 문제점
| 문제 | 현재 방식의 한계 |
|------|-----------------|
| 과제 분산 | 종이 노트, 카카오톡, 개인 메모장에 분산 관리 |
| 진도 파악 어려움 | 32주 전체 진도를 한눈에 파악할 수 없음 |
| 암송 자료 접근 | YouTube 링크 찾기가 번거롭고 맥락이 끊김 |
| 기록 분실 위험 | 물리적 노트 분실 시 복구 불가 |
| 연속성 부족 | 이전 기록을 돌아보며 성장을 확인하기 어려움 |

---

## 3. 목표 및 성공 지표 (Goals & Success Metrics)

### 목표
1. 훈련생 전원이 32주 과정을 디지털로 기록·관리할 수 있는 환경 제공
2. 주차별 성구 암송 영상 접근 시간 단축 (현재 대비 80% 감소)
3. 일일/주간 과제 완료율 향상

### 성공 지표 (KPI)
| 지표 | 목표값 |
|------|-------|
| 훈련생 앱 가입율 | 100% (전체 훈련생) |
| 주간 활성 사용자 | 전체 훈련생의 80% 이상 |
| 일일 체크 완료율 | 70% 이상 |
| OIA/설교노트 기록률 | 주차별 60% 이상 |
| 32주 과정 완주율 | 90% 이상 |

---

## 4. 사용자 (Users)

### 주요 사용자
**낙원제일교회 제2기 제자훈련생**
- 연령대: 성인 전반 (20대~60대)
- 디지털 친숙도: 중간 수준 (스마트폰 기본 앱 사용 가능)
- 사용 환경: 주로 모바일 (Android/iOS 브라우저), 일부 PC
- 사용 시간: 주로 주일 예배 후, 평일 QT 시간

### 보조 사용자
**훈련 담당 교역자/리더**
- 훈련생 전체 진도 모니터링 (향후 Phase 2 기능)
- 과제 제출 확인

---

## 5. 핵심 기능 요구사항 (Core Feature Requirements)

### 5-A. 사용자 인증 및 보안 (Authentication)

**요구사항**
- Firebase Authentication 기반 소셜/이메일 로그인
- 로그인 후 해당 사용자의 데이터만 접근 가능 (데이터 격리)
- 자동 로그인 유지 (토큰 기반 세션 관리)

**세부 기능**
- [ ] 이메일 + 비밀번호 로그인
- [ ] Google 소셜 로그인
- [ ] 카카오 소셜 로그인 (한국 사용자 편의)
- [ ] 비밀번호 재설정
- [ ] 로그아웃

**유저 스토리**
> "나는 훈련생으로서, 나의 기록이 다른 사람에게 보이지 않도록 개인 계정으로 로그인하고 싶다."

---

### 5-B. 대시보드 / 홈 화면 (Dashboard)

**요구사항**
- 현재 진행 중인 주차를 중심으로 한 종합 현황 표시
- 오늘의 체크리스트 빠른 접근
- 32주 전체 여정 프로그레스 바 표시

**세부 기능**
- [ ] 현재 주차 표시 (예: "3주차 - 구원의 확신")
- [ ] 32주 프로그레스 바 (전체 대비 현재 위치)
- [ ] 오늘의 일일 체크 요약 (기도/QT/성경통독 완료 여부)
- [ ] 이번 주 과제 완료 현황 요약 카드
- [ ] 최근 작성한 OIA 노트 미리보기
- [ ] 이번 주 암송 성구 배너

**유저 스토리**
> "나는 앱을 열었을 때, 지금 내가 어디 있는지, 오늘 무엇을 해야 하는지 한눈에 파악하고 싶다."

---

### 5-C. 성구 암송 & YouTube 연동 (Memory Verse)

**요구사항**
- 32주차 각각에 성구 암송 YouTube 영상 1:1 매핑
- 앱 내에서 YouTube 영상 임베드 재생
- 해당 주차 암송 성구 텍스트 표시

**세부 기능**
- [ ] 주차별 성구 목록 (1~32주 전체)
- [ ] YouTube 영상 인앱 임베드 플레이어
- [ ] 현재 주차 자동 하이라이트
- [ ] 암송 완료 체크 (자기 확인)
- [ ] 이전 주차 성구 복습 기능
- [ ] 성구 텍스트 복사/공유

**유저 스토리**
> "나는 암송 성구 영상을 앱 안에서 바로 볼 수 있어서, 별도로 YouTube를 찾을 필요 없이 바로 연습하고 싶다."

---

### 5-D. 주차별 노트 허브 (Weekly Note Hub)

**요구사항**
- 각 주차마다 3가지 기록 유형을 통합 관리
- 모든 기록은 해당 주차에 귀속

**기록 유형 1: 설교 노트 (Sermon Notes)**
- [ ] 주일 설교 / 금요 집회 메시지 기록
- [ ] 날짜, 설교자, 본문 말씀 입력
- [ ] 자유 서술 텍스트 에디터 (기본 마크다운 지원)
- [ ] 주일 / 금요 탭 구분

**기록 유형 2: OIA 묵상 가이드**
- [ ] **O (Observation, 관찰)**: "본문에서 무엇을 보았는가?" 입력 필드
- [ ] **I (Interpretation, 해석)**: "이 말씀이 무엇을 의미하는가?" 입력 필드
- [ ] **A (Application, 적용)**: "나의 삶에 어떻게 적용할 것인가?" 입력 필드
- [ ] 오늘 묵상 날짜 / 본문 말씀 기록
- [ ] 이전 OIA 기록 목록 조회 (이번 주차 내)

**기록 유형 3: 신앙 일기 & 생활 숙제**
- [ ] 훈련 중 깨달은 점 자유 기술
- [ ] 생활 숙제 항목 체크리스트 (주차별 숙제 내용 사전 입력)
- [ ] 변화된 삶의 모습 기록

**유저 스토리**
> "나는 OIA 묵상을 할 때, 관찰/해석/적용 프레임에 맞는 칸이 준비되어 있어 자연스럽게 깊이 있는 묵상을 하고 싶다."

---

### 5-E. 통합 진도 관리 (Progress Tracking)

**요구사항**
- 일일 영적 훈련 체크 기능
- 주간 과제 관리 기능
- 전체 진도 시각화

**일일 체크 (Daily Disciplines)**
- [ ] 기도 30분 완료 체크 (오늘 날짜 기준)
- [ ] QT(경건의 시간) 완료 체크
- [ ] 성경 통독 완료 체크
- [ ] 체크 시각 자동 기록
- [ ] 연속 달성일(스트릭) 표시

**주간 과제 (Weekly Tasks)**
- [ ] 이번 주 필독서 독후감 제출 상태 체크
- [ ] 다음 주 예습 체크
- [ ] 주차별 필독서 정보 자동 표시 (커리큘럼 데이터 연동)

**진도 시각화 (Progress Visualization)**
- [ ] 32주 전체 타임라인 뷰 (완료/진행중/미완료 구분)
- [ ] 일일 체크 달력 히트맵 (GitHub 스타일)
- [ ] 권별 완료율 도넛 차트 (1권/2권/3권)
- [ ] 주간 완료율 막대 그래프

**유저 스토리**
> "나는 매일 기도, QT, 성경통독을 마치면 체크하고, 내가 얼마나 꾸준히 해왔는지 시각적으로 확인하고 싶다."

---

### 5-F. 커리큘럼 안내 (Curriculum Reference)

**요구사항**
- 32주 전체 커리큘럼 정보를 내장 데이터로 제공
- 각 주차별 상세 정보 확인 가능

**커리큘럼 데이터 구조**

| 권 | 과 범위 | 주차 범위 | 제목 | 필독서 |
|----|---------|----------|------|-------|
| 1권 | 1~6과 | 1~6주 | 터다지기 | 효과적인 간증, 말씀의 손 등 |
| 2권 | 1~14과 | 7~20주 | 구원의 진리 | 성경의 권위, 기독교의 기본진리 등 |
| 3권 | 1~12과 | 21~32주 | 작은 예수 | 위험한 순종, 섬김의 혁명 등 |

**세부 기능**
- [ ] 권별 / 주차별 과 목록 조회
- [ ] 주차별 제목, 핵심 주제, 암송 성구 표시
- [ ] 주차별 필독서 정보 표시
- [ ] 해당 주차 기록 화면으로 바로 이동

---

## 6. 화면 목록 (Screen List)

| 화면 | 경로 | 설명 |
|------|------|------|
| 온보딩/스플래시 | `/` | 앱 소개 및 로그인 유도 |
| 로그인 | `/login` | Clerk 인증 |
| 대시보드 (홈) | `/home` | 현재 주차 중심 종합 현황 |
| 주차 목록 | `/weeks` | 32주 전체 타임라인 |
| 주차 상세 | `/weeks/:weekId` | 해당 주차 노트 허브 |
| 설교 노트 | `/weeks/:weekId/sermon` | 설교 기록 |
| OIA 묵상 | `/weeks/:weekId/oia` | OIA 프레임 묵상 |
| 신앙 일기 | `/weeks/:weekId/diary` | 신앙 일기 & 생활 숙제 |
| 성구 암송 | `/weeks/:weekId/verse` | YouTube 임베드 + 성구 |
| 일일 체크 | `/daily` | 기도/QT/성경통독 체크 |
| 진도 현황 | `/progress` | 시각화 대시보드 |
| 커리큘럼 | `/curriculum` | 32주 커리큘럼 안내 |
| 프로필/설정 | `/profile` | 사용자 정보 및 설정 |

---

## 7. UX/UI 디자인 방향 (Design Direction)

### 디자인 철학
SoulScribe (jobible.net)의 사색적이고 문학적인 감성을 기반으로, 영적 여정의 깊이와 신뢰감을 시각적으로 표현합니다. 화려함보다는 고요하고 집중된 경험을 추구합니다.

### 색상 팔레트 (Color Palette)
| 용도 | 색상 | HEX |
|------|------|-----|
| Primary (Deep Blue) | 딥 네이비 블루 | `#1A2E4A` |
| Secondary (Gold Accent) | 따뜻한 골드 | `#C9A84C` |
| Background | 크림 화이트 | `#FAF8F5` |
| Surface | 화이트 | `#FFFFFF` |
| Text Primary | 다크 차콜 | `#1F1F1F` |
| Text Secondary | 미디엄 그레이 | `#6B7280` |
| Success | 세이지 그린 | `#4A7C59` |
| Border | 라이트 그레이 | `#E5E0D8` |

### 타이포그래피 (Typography)
| 용도 | 폰트 | 특징 |
|------|------|------|
| 헤딩 (영문) | Cormorant Garamond | 클래식 세리프, 영적 깊이감 |
| 본문 (영문) | Crimson Pro | 읽기 쉬운 세리프 |
| 한글 전체 | Noto Serif KR | 세리프 계열 한글 폰트 |
| 숫자/UI | Inter | 클린한 산세리프 |

### 디자인 원칙
1. **여백의 미**: 콘텐츠 간 충분한 여백으로 집중감 확보
2. **골드 포인트**: 주요 액션, 완료 상태에 골드 액센트 사용
3. **카드 레이아웃**: 각 기록 단위를 카드 형태로 정리
4. **모바일 퍼스트**: 375px 기준 설계, 최대 768px까지 최적화
5. **미니멀 아이콘**: 단순하고 의미 명확한 라인 아이콘 사용

### 주요 컴포넌트 스타일
- **버튼**: 골드 배경 + 다크 텍스트 (Primary), 딥 블루 아웃라인 (Secondary)
- **카드**: 화이트 배경, 미세 그림자, 1px 라이트 보더
- **프로그레스 바**: 골드 fill, 크림 배경
- **체크박스**: 골드 체크마크, 딥 블루 완료 상태
- **네비게이션**: 하단 탭바 (5개 메인 항목), 딥 블루 배경

---

## 8. 기술 스택 (Technical Stack)

### 8-0. 스택 선정 배경 및 비교

기존 프로젝트에서 검증된 **Vercel + Render + Turso** 조합을 채택합니다.
초기 안으로 검토했던 Firebase 올인원 방식과의 비교는 아래와 같습니다.

| 항목 | Firebase (초안) | **Vercel + Render + Turso (채택)** |
|------|----------------|-----------------------------------|
| DB 모델 | NoSQL (Firestore) | **SQL (SQLite/LibSQL)** — 관계형 데이터에 더 적합 |
| 쿼리 유연성 | 제한적 (복합 인덱스 필요) | **자유로운 SQL 조인/집계** |
| 가격 예측성 | Firestore는 읽기 건수 과금, 예측 어려움 | **예측 가능한 무료 티어** |
| 벤더 종속 | Google 생태계 Lock-in | **오픈 스탠다드, 이식성 우수** |
| 친숙도 | 새로 학습 필요 | **이전 프로젝트 경험 재사용** |
| 실시간 동기화 | 기본 제공 | 필요 시 Polling 또는 SSE로 구현 가능 |

> **결론**: jobible Way는 실시간 동기화가 필수적이지 않고, 커리큘럼·주차·기록의 관계형 구조가 SQL에 훨씬 자연스럽습니다.

---

### 8-1. 무료 티어 현황 (Free Tier Audit)

#### Vercel (Hobby Plan)
| 항목 | 무료 한도 | jobible Way 예상 사용량 |
|------|----------|----------------------|
| Serverless Functions 호출 | 1M회/월 | ~수천 회/월 ✅ |
| 대역폭 | 100GB/월 | ~수백 MB/월 ✅ |
| 빌드 시간 | 6,000분/월 | ~수십 분/월 ✅ |
| 커스텀 도메인 | 무제한 | ✅ |

#### Render (Free Web Service)
| 항목 | 무료 한도 | 비고 |
|------|----------|------|
| 인스턴스 시간 | **750시간/월** | 31일 × 24h = 744h → 1개 서비스 24/7 가능 ✅ |
| RAM | 512MB | 백엔드 API 운영 충분 ✅ |
| CPU | 0.1 vCPU | 소규모 트래픽 충분 ✅ |
| **⚠️ 스핀다운** | **15분 무활동 시 종료** | **→ 아래 대응책 참고** |
| **⚠️ 콜드 스타트** | **약 1분 소요** | **→ 아래 대응책 참고** |
| Render PostgreSQL | 30일 무료 후 만료 | **사용 안 함 (Turso로 대체)** ✅ |

> **⚠️ Render 콜드 스타트 대응책**
> UptimeRobot (무료, 5분 간격 헬스체크 핑)을 사용해 서비스를 항상 깨운 상태로 유지합니다.
> 750h 한도 내에서 24/7 운영 가능하며, `/health` 엔드포인트를 별도로 구성합니다.

#### Turso (Free / Starter Plan)
| 항목 | 무료 한도 | jobible Way 예상 사용량 |
|------|----------|----------------------|
| 데이터베이스 수 | 100개 | 1개 ✅ |
| 저장 용량 | 5GB | ~수십 MB (텍스트 기록) ✅ |
| 월간 Row 읽기 | 5억 회 | ~수만 회/월 ✅ |
| 월간 Row 쓰기 | 1,000만 회 | ~수백~수천 회/월 ✅ |
| 백업 보존 | 1일 | Phase 1 수용 가능 |

#### Clerk (Auth / Hobby Plan)
| 항목 | 무료 한도 | jobible Way 예상 사용량 |
|------|----------|----------------------|
| 월간 활성 사용자 | **50,000명** | ~20~50명 ✅ |
| 소셜 로그인 | Google, Kakao 등 | ✅ |
| 대시보드 시트 | 3석 | ✅ |
| 커스텀 도메인 | 지원 | ✅ |

---

### 8-2. 확정 기술 스택

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (Browser)                  │
│         React (Vite) + Tailwind CSS + Clerk SDK     │
│              배포: Vercel (Static CDN)               │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS REST API
┌────────────────────▼────────────────────────────────┐
│              BACKEND (Render Web Service)            │
│         Node.js + Hono + Drizzle ORM                │
│         JWT 검증 (Clerk 발급 토큰)                   │
└────────────────────┬────────────────────────────────┘
                     │ LibSQL Protocol
┌────────────────────▼────────────────────────────────┐
│               DATABASE (Turso)                      │
│         LibSQL (SQLite 호환) — 5GB 무료              │
└─────────────────────────────────────────────────────┘
```

| 영역 | 기술 | 버전/비고 |
|------|------|----------|
| **Frontend** | React (Vite) | SPA, 컴포넌트 재사용 |
| **Styling** | Tailwind CSS v4 | 유틸리티 기반 |
| **Routing** | React Router v6 | SPA 라우팅 |
| **상태관리** | Zustand | 경량 전역 상태 |
| **인증** | **Clerk** | 소셜 로그인, JWT 발급, 50K MAU 무료 |
| **Backend** | **Node.js + Hono** | 경량 API 프레임워크, TypeScript |
| **ORM** | **Drizzle ORM** | LibSQL/Turso 공식 지원, 타입 안전 |
| **Database** | **Turso (LibSQL/SQLite)** | SQL, 5GB 무료 |
| **Frontend 배포** | **Vercel** | CDN, 자동 배포 |
| **Backend 배포** | **Render** | 750h/월 무료 Web Service |
| **상시 유지** | UptimeRobot | 무료, Render 스핀다운 방지 |
| **YouTube** | YouTube IFrame API | 인앱 영상 임베드 |
| **PWA** | Vite PWA Plugin | 오프라인 지원, 홈화면 추가 |

---

### 8-3. SQL 데이터 모델 (Drizzle ORM Schema)

```sql
-- 사용자 프로필 (Clerk userId 기반)
CREATE TABLE users (
  id          TEXT PRIMARY KEY,          -- Clerk user_id
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  cohort      INTEGER DEFAULT 2,         -- 기수 (2기, 3기...)
  start_date  TEXT NOT NULL,             -- 훈련 시작일 (ISO date)
  created_at  TEXT DEFAULT (datetime('now'))
);

-- 커리큘럼 (공통 데이터, 빌드 타임 seed)
CREATE TABLE curriculum (
  id              INTEGER PRIMARY KEY,
  week_number     INTEGER NOT NULL UNIQUE,  -- 1~32
  volume          INTEGER NOT NULL,         -- 1, 2, 3
  lesson_number   INTEGER NOT NULL,
  title           TEXT NOT NULL,
  theme           TEXT,
  scripture       TEXT NOT NULL,
  youtube_video_id TEXT,
  required_book   TEXT
);

-- 설교 노트
CREATE TABLE sermon_notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL REFERENCES users(id),
  week_number INTEGER NOT NULL,
  service     TEXT NOT NULL CHECK(service IN ('sunday', 'friday')),
  date        TEXT NOT NULL,
  preacher    TEXT,
  scripture   TEXT,
  content     TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- OIA 묵상 기록
CREATE TABLE oia_notes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         TEXT NOT NULL REFERENCES users(id),
  week_number     INTEGER NOT NULL,
  date            TEXT NOT NULL,
  scripture       TEXT,
  observation     TEXT,
  interpretation  TEXT,
  application     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

-- 신앙 일기
CREATE TABLE diary_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL REFERENCES users(id),
  week_number INTEGER NOT NULL,
  content     TEXT,
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- 주간 과제
CREATE TABLE weekly_tasks (
  user_id           TEXT NOT NULL REFERENCES users(id),
  week_number       INTEGER NOT NULL,
  verse_memorized   INTEGER DEFAULT 0,  -- boolean (0/1)
  book_report_done  INTEGER DEFAULT 0,
  preview_done      INTEGER DEFAULT 0,
  updated_at        TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, week_number)
);

-- 일일 체크 (기도/QT/성경통독)
CREATE TABLE daily_checks (
  user_id       TEXT NOT NULL REFERENCES users(id),
  date          TEXT NOT NULL,           -- YYYY-MM-DD
  prayer_30min  INTEGER DEFAULT 0,
  qt_done       INTEGER DEFAULT 0,
  bible_reading INTEGER DEFAULT 0,
  updated_at    TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, date)
);
```

---

## 9. 비기능 요구사항 (Non-Functional Requirements)

| 항목 | 요구사항 | 비고 |
|------|---------|------|
| 성능 | 첫 로딩 3초 이내 (4G 기준) | Vercel CDN + Vite 번들 최적화 |
| API 응답 | 정상 상태 500ms 이내 | Render 웜업 상태 기준 |
| 가용성 | UptimeRobot 모니터링으로 콜드 스타트 방지 | 5분 간격 헬스핑 |
| 반응형 | 320px ~ 768px 완전 지원 | 모바일 퍼스트 |
| PWA | 홈화면 추가, 오프라인 기본 기능 지원 | Vite PWA Plugin |
| 보안 | Clerk JWT 검증 + Drizzle 파라미터 바인딩 | SQL Injection 방지 |
| 데이터 격리 | 모든 API에서 user_id 기반 row-level 필터링 | Render 백엔드 미들웨어 |
| 접근성 | WCAG 2.1 AA 수준 | 충분한 색상 대비, 스크린리더 기본 지원 |
| 브라우저 | Chrome, Safari (iOS/Android) 최신 2버전 | |

---

## 10. 개발 단계 (Phased Rollout)

### Phase 1 (MVP) — 핵심 기능
**목표**: 훈련생들이 실제 사용할 수 있는 최소 기능 제공

- [ ] **인프라 셋업**: Vercel(React) + Render(Hono API) + Turso(LibSQL) 연결
- [ ] **UptimeRobot 설정**: Render 콜드 스타트 방지 헬스핑
- [ ] **Clerk 인증**: 이메일 + Google 소셜 로그인
- [ ] **DB 스키마 마이그레이션**: Drizzle ORM + Turso seed 데이터(커리큘럼 32주)
- [ ] 대시보드 (현재 주차, 일일 체크 요약)
- [ ] 일일 체크 (기도/QT/성경통독)
- [ ] 주차별 OIA 묵상 기록
- [ ] 주차별 설교 노트
- [ ] 성구 암송 + YouTube 임베드
- [ ] 32주 진도 프로그레스 바
- [ ] 기본 디자인 시스템 적용 (Deep Blue + Gold)

### Phase 2 — 경험 강화
- [ ] 카카오 소셜 로그인
- [ ] 신앙 일기 & 생활 숙제 체크리스트
- [ ] 일일 체크 달력 히트맵
- [ ] 권별 완료율 차트
- [ ] PWA (홈화면 추가, 오프라인 지원)
- [ ] 푸시 알림 (기도/QT 리마인더)

### Phase 3 — 커뮤니티 & 관리
- [ ] 필독서 독후감 제출 (텍스트 + 이미지)
- [ ] 교역자/리더용 전체 진도 모니터링
- [ ] 기수별 데이터 분리 (3기, 4기 확장 대비)
- [ ] 기록 PDF 내보내기 (32주 완주 후 영적 포트폴리오)
- [ ] 공개 묵상 공유 (선택적)

---

## 11. 열린 이슈 및 의사결정 필요 항목

| # | 항목 | 옵션 | 상태 |
|---|------|------|------|
| 1 | YouTube 영상 ID 관리 방식 | 관리자 입력 vs 하드코딩 | 미결 |
| 2 | 훈련 시작일 기준 주차 자동 계산 | 시스템 자동 vs 사용자 수동 선택 | 미결 |
| 3 | 카카오 로그인 지원 여부 | Phase 1 포함 vs Phase 2 | 미결 |
| 4 | 필독서 완독 인증 방식 | 자기 체크 vs 독후감 제출 | 미결 |
| 5 | 다국어 지원 | 한국어만 vs 영어 병기 | 미결 |
| 6 | 관리자 기능 범위 | 별도 앱 vs 동일 앱 내 권한 분리 | 미결 |

---

## 12. 용어 정의 (Glossary)

| 용어 | 정의 |
|------|------|
| 제자훈련 | 교회에서 진행하는 성경 기반 제자도 양육 프로그램 |
| OIA | Observation(관찰), Interpretation(해석), Application(적용) — 성경 묵상 방법론 |
| QT | Quiet Time — 개인 경건의 시간 (기도 + 말씀 묵상) |
| 성구 암송 | 성경 구절을 외우는 훈련 |
| 통독 | 성경을 처음부터 끝까지 읽는 것 |
| 주차 | 1~32주로 구성된 훈련 회차 단위 |
| 권 | 교재 묶음 단위 (1권: 터다지기, 2권: 구원의 진리, 3권: 작은 예수) |

---

*본 PRD는 개발 진행에 따라 지속적으로 업데이트됩니다.*
*문의: jobible Way 프로젝트 담당자*
