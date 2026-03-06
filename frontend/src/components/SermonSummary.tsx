import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'
import { useToast } from './ui/Toast'

interface Props {
  videoId: string
}

interface SummaryData {
  videoId: string
  summary: string
  model: string
  createdAt: string
}

export default function SermonSummary({ videoId }: Props) {
  const { showToast } = useToast()
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [checked, setChecked] = useState(false)
  const [hasCaptions, setHasCaptions] = useState(true)
  const generating = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function checkAndGenerate() {
      try {
        const data = await api.get(`/api/summaries/${videoId}`)
        if (cancelled) return

        if (data.summary) {
          setSummary(data)
          setChecked(true)
          return
        }

        if (data.hasCaptions === false) {
          setHasCaptions(false)
          setChecked(true)
          return
        }

        // 요약이 없고 자막이 있으면 자동으로 요약 생성
        if (!generating.current) {
          generating.current = true
          setChecked(true)
          setLoading(true)
          try {
            const result = await api.post(`/api/summaries/${videoId}`, {})
            if (!cancelled) {
              setSummary(result)
              setExpanded(true)
            }
          } catch {
            if (!cancelled) {
              showToast('AI 요약 생성에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error')
            }
          } finally {
            if (!cancelled) setLoading(false)
            generating.current = false
          }
        }
      } catch {
        // 조회 실패 시 무시
      }
      if (!cancelled) setChecked(true)
    }

    checkAndGenerate()
    return () => { cancelled = true }
  }, [videoId, showToast])

  if (!checked) return null
  // 자막이 없고 요약도 없으면 컴포넌트 숨김
  if (!summary && !hasCaptions) return null

  return (
    <div className="border-t border-[var(--color-border)]">
      {summary ? (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-4 cursor-pointer"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] font-[var(--font-ui)]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              AI 요약
            </span>
            <svg
              className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform ${expanded ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {expanded && (
            <div className="px-4 pb-4">
              <div className="bg-[var(--color-bg)] rounded-lg p-4 text-sm text-[var(--color-text-primary)] leading-relaxed font-[var(--font-body-kr)]">
                {renderMarkdown(summary.summary)}
              </div>
            </div>
          )}
        </>
      ) : loading ? (
        <div className="w-full flex items-center justify-center gap-2 p-4 text-sm text-[var(--color-accent)] font-[var(--font-ui)] opacity-50">
          <div className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          AI 요약 생성 중... (최대 2분 소요)
        </div>
      ) : null}
    </div>
  )
}

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) {
      return (
        <h3 key={i} className="text-[var(--color-secondary)] font-semibold mt-3 mb-1 first:mt-0">
          {line.replace('## ', '')}
        </h3>
      )
    }
    if (line.startsWith('- ')) {
      return (
        <p key={i} className="pl-3 my-0.5">
          <span className="text-[var(--color-accent)] mr-2">•</span>
          {line.replace('- ', '')}
        </p>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-2" />
    return <p key={i} className="my-0.5">{line}</p>
  })
}
