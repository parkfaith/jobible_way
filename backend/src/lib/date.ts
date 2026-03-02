// Workers 환경(UTC)에서 KST(UTC+9) 기준 날짜/시간 유틸리티

const KST_OFFSET = 9 * 60 * 60 * 1000

/** KST 기준 현재 Date 객체 반환 (UTC 시간에 +9시간 적용) */
function kstNow(): Date {
  return new Date(Date.now() + KST_OFFSET)
}

/** KST 기준 오늘 날짜 (YYYY-MM-DD) */
export function kstToday(): string {
  const d = kstNow()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

/** KST 기준 현재 datetime (YYYY-MM-DD HH:mm:ss) — DB 저장용 */
export function kstDatetime(): string {
  const d = kstNow()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}`
}
