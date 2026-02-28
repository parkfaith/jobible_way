export async function shareOrCopy(
  text: string,
  toast: (msg: string, type?: 'success' | 'error') => void,
) {
  if (navigator.share) {
    try {
      await navigator.share({ text })
    } catch (err) {
      // 사용자가 공유 취소한 경우 무시
      if (err instanceof Error && err.name === 'AbortError') return
    }
  } else {
    try {
      await navigator.clipboard.writeText(text)
      toast('클립보드에 복사됨')
    } catch {
      toast('복사 실패', 'error')
    }
  }
}
