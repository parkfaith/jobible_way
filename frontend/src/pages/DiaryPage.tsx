import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import { shareOrCopy } from '../lib/share'

export default function DiaryPage() {
  const { weekId } = useParams()
  const { showToast } = useToast()
  const weekNumber = parseInt(weekId ?? '1')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadDiary()
  }, [weekNumber])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  async function loadDiary() {
    setLoading(true)
    try {
      const data = await api.get(`/api/weeks/${weekNumber}/diary`)
      setContent(data.content ?? '')
    } catch {
      setContent('')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(value: string) {
    setContent(value)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => autoSave(value), 1500)
  }

  async function autoSave(text: string) {
    try {
      await api.put(`/api/weeks/${weekNumber}/diary`, { content: text })
    } catch {
      showToast('저장 실패', 'error')
    }
  }

  return (
    <AppShell
      title={`${weekNumber}주차 신앙 일기`}
      showBack
      rightAction={
        <button
          onClick={() => {
            if (!content) return
            shareOrCopy(`[신앙 일기] ${weekNumber}주차\n\n${content}`, showToast)
          }}
          className="p-2.5 text-[var(--color-secondary)] cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      }
    >
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center text-sm text-[var(--color-text-secondary)] py-8">로딩 중...</div>
        ) : (
          <>
            <p className="text-xs text-[var(--color-text-secondary)] font-[var(--font-ui)]">
              이번 주 신앙 생활을 돌아보며 자유롭게 기록하세요. 1.5초 후 자동 저장됩니다.
            </p>
            <textarea
              value={content}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="이번 주 하나님과의 동행 가운데 느낀 점, 감사한 일, 기도 제목 등을 기록하세요..."
              rows={16}
              className="w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 resize-none focus:outline-none focus:border-[var(--color-secondary)] transition-colors leading-relaxed"
            />
            <p className="text-xs text-[var(--color-text-secondary)] text-right font-[var(--font-ui)]">
              {content.length}자
            </p>
          </>
        )}
      </div>
    </AppShell>
  )
}
