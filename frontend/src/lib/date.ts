/** 로컬 타임존 기준 오늘 날짜 (YYYY-MM-DD) */
export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Date 객체를 YYYY-MM-DD 문자열로 변환 (로컬 기준) */
export function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
