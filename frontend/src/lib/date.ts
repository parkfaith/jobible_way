/** 로컬 타임존 기준 오늘 날짜 (YYYY-MM-DD) */
export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Date 객체를 YYYY-MM-DD 문자열로 변환 (로컬 기준) */
export function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── 제자훈련 주차 계산 (방학 반영) ─────────────────────────────
// 1주차 시작: 2026-02-22(일). 19주차(6/28~7/4)까지 정상 진행 후 방학.
// 방학: 2026-07-05 ~ 2026-09-05. 20주차 재개: 2026-09-06(일)부터 32주차까지 매주 진행.
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000
export const TOTAL_WEEKS = 32
/** 방학 후 재개 주차 */
export const RESUME_WEEK = 20
/** 20주차 재개일 (방학 안내 표기용) */
export const RESUME_DATE = '2026-09-06'

const WEEK1_START_MS = new Date('2026-02-22T00:00:00+09:00').getTime()
const RESUME_START_MS = new Date(`${RESUME_DATE}T00:00:00+09:00`).getTime()
/** 방학 시작 시점 = 원래 20주차 시작일(2026-07-05) */
const VACATION_START_MS = WEEK1_START_MS + (RESUME_WEEK - 1) * MS_PER_WEEK

/** 현재 진행 주차 (방학 반영). 방학 중에는 재개 직전 주차(19)로 고정 */
export function getCurrentWeek(now: Date = new Date()): number {
  const t = now.getTime()
  if (t >= RESUME_START_MS) {
    const diff = Math.floor((t - RESUME_START_MS) / MS_PER_WEEK)
    return Math.min(TOTAL_WEEKS, RESUME_WEEK + diff)
  }
  const diff = Math.floor((t - WEEK1_START_MS) / MS_PER_WEEK)
  return Math.max(1, Math.min(RESUME_WEEK - 1, diff + 1))
}

/** 방학 기간 여부 (19주차 종료 후 ~ 20주차 재개 전) */
export function isVacation(now: Date = new Date()): boolean {
  const t = now.getTime()
  return t >= VACATION_START_MS && t < RESUME_START_MS
}

/** 주차 번호 → 해당 주 시작 일요일 Date (방학 반영) */
export function getWeekStartDate(weekNumber: number): Date {
  if (weekNumber >= RESUME_WEEK) {
    return new Date(RESUME_START_MS + (weekNumber - RESUME_WEEK) * MS_PER_WEEK)
  }
  return new Date(WEEK1_START_MS + (weekNumber - 1) * MS_PER_WEEK)
}
