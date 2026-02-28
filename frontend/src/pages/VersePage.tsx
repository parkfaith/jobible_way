import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import { shareOrCopy } from '../lib/share'

interface CurriculumItem {
  weekNumber: number
  title: string
  scripture: string
  verseText: string | null
  scripture2: string | null
  verseText2: string | null
  youtubeVideoId: string | null
}

export default function VersePage() {
  const { weekId } = useParams()
  const { showToast } = useToast()
  const weekNumber = parseInt(weekId ?? '1')
  const [curr, setCurr] = useState<CurriculumItem | null>(null)
  const [memorized, setMemorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [weekNumber])

  async function loadData() {
    setLoading(true)
    try {
      const [currData, weeklyData] = await Promise.all([
        api.get(`/api/curriculum/${weekNumber}`),
        api.get(`/api/weekly/${weekNumber}`),
      ])
      setCurr(currData)
      setMemorized(!!weeklyData.verseMemorized)
    } catch {
      // 기본값 유지
    } finally {
      setLoading(false)
    }
  }

  async function toggleMemorized() {
    const newVal = !memorized
    setMemorized(newVal)
    try {
      await api.put(`/api/weekly/${weekNumber}`, { verseMemorized: newVal ? 1 : 0 })
      showToast(newVal ? '암송 완료!' : '암송 취소')
    } catch {
      setMemorized(!newVal)
      showToast('저장 실패', 'error')
    }
  }

  function handleCopyOrShare() {
    if (!curr) return
    const parts: string[] = []
    if (curr.scripture && curr.verseText) {
      parts.push(`📖 ${curr.scripture}`)
      parts.push(curr.verseText)
    }
    if (curr.scripture2 && curr.verseText2) {
      parts.push('')
      parts.push(`📖 ${curr.scripture2}`)
      parts.push(curr.verseText2)
    }
    const text = parts.length > 0 ? parts.join('\n') : curr.scripture
    shareOrCopy(text, showToast)
  }

  if (loading) {
    return (
      <AppShell title={`${weekNumber}주차 성구 암송`} showBack>
        <div className="p-4 text-center text-sm text-[var(--color-text-secondary)] py-8">로딩 중...</div>
      </AppShell>
    )
  }

  return (
    <AppShell title={`${weekNumber}주차 성구 암송`} showBack>
      <div className="p-4 space-y-4">
        {/* 암송 구절 1 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <p className="text-xs text-[var(--color-secondary)] font-[var(--font-ui)] mb-1">암송 구절 1</p>
          <p className="text-sm font-medium text-[var(--color-secondary)] font-[var(--font-ui)]">
            {curr?.scripture ?? '-'}
          </p>
          {curr?.verseText && (
            <p className="text-base text-[var(--color-text-primary)] font-[var(--font-body-kr)] leading-relaxed mt-3">
              {curr.verseText}
            </p>
          )}
        </div>

        {/* 암송 구절 2 */}
        {curr?.scripture2 && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
            <p className="text-xs text-[var(--color-secondary)] font-[var(--font-ui)] mb-1">암송 구절 2</p>
            <p className="text-sm font-medium text-[var(--color-secondary)] font-[var(--font-ui)]">
              {curr.scripture2}
            </p>
            {curr.verseText2 && (
              <p className="text-base text-[var(--color-text-primary)] font-[var(--font-body-kr)] leading-relaxed mt-3">
                {curr.verseText2}
              </p>
            )}
          </div>
        )}

        {/* 구절 복사/공유 버튼 */}
        <button
          onClick={handleCopyOrShare}
          className="w-full flex items-center justify-center gap-2 py-3 text-xs text-[var(--color-secondary)] font-[var(--font-ui)] cursor-pointer bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          구절 복사 / 공유
        </button>

        {/* YouTube 영상 */}
        {curr?.youtubeVideoId && (
          <div className="rounded-xl overflow-hidden">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${curr.youtubeVideoId}`}
                title="성구 암송 영상"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* 암송 완료 체크 */}
        <button
          onClick={toggleMemorized}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
            memorized
              ? 'bg-[var(--color-success)]/5 border-[var(--color-success)]/30'
              : 'bg-[var(--color-surface)] border-[var(--color-border)]'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            memorized
              ? 'bg-[var(--color-success)] text-white'
              : 'border-2 border-[var(--color-border)]'
          }`}>
            {memorized && (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <span className={`text-sm font-medium font-[var(--font-ui)] ${
            memorized ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]'
          }`}>
            {memorized ? '암송 완료!' : '암송 완료 표시하기'}
          </span>
        </button>

        {/* 팁 */}
        <div className="bg-[var(--color-secondary)]/5 border border-[var(--color-secondary)]/20 rounded-xl p-4">
          <p className="text-xs font-medium text-[var(--color-secondary)] font-[var(--font-ui)] mb-2">암송 팁</p>
          <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
            <li>• 하루에 여러 번 반복해서 읽으세요</li>
            <li>• 구절의 의미를 묵상하며 외우세요</li>
            <li>• 주일 소그룹에서 서로 확인하세요</li>
          </ul>
        </div>
      </div>
    </AppShell>
  )
}
