import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import TabNav from '../components/ui/TabNav'
import { api } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import { shareOrCopy } from '../lib/share'

interface SermonData {
  date: string
  preacher: string
  scripture: string
  content: string
}

const SERVICES = [
  { label: '주일 예배', value: 'sunday' },
  { label: '금요 예배', value: 'friday' },
]

const EMPTY: SermonData = { date: '', preacher: '', scripture: '', content: '' }

export default function SermonPage() {
  const { weekId } = useParams()
  const { showToast } = useToast()
  const weekNumber = parseInt(weekId ?? '1')
  const [service, setService] = useState('sunday')
  const [data, setData] = useState<SermonData>({ ...EMPTY })
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // 탭 변경 시 대기 중인 저장 타이머 클리어
    if (saveTimer.current) clearTimeout(saveTimer.current)
    loadSermon()
  }, [service, weekNumber])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  async function loadSermon() {
    setLoading(true)
    try {
      const res = await api.get(`/api/weeks/${weekNumber}/sermon/${service}`)
      setData({
        date: res.date ?? '',
        preacher: res.preacher ?? '',
        scripture: res.scripture ?? '',
        content: res.content ?? '',
      })
    } catch {
      setData({ ...EMPTY })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field: keyof SermonData, value: string) {
    const updated = { ...data, [field]: value }
    setData(updated)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    // service와 weekNumber를 클로저가 아닌 현재 값으로 캡처
    const currentService = service
    const currentWeek = weekNumber
    saveTimer.current = setTimeout(async () => {
      if (!updated.date) return
      try {
        await api.put(`/api/weeks/${currentWeek}/sermon/${currentService}`, updated)
      } catch {
        showToast('저장 실패', 'error')
      }
    }, 1500)
  }

  return (
    <AppShell
      title={`${weekNumber}주차 설교 노트`}
      showBack
      rightAction={
        <button
          onClick={() => {
            const lines = [`[설교 노트] ${weekNumber}주차`]
            if (data.date) lines.push(`날짜: ${data.date}`)
            if (data.preacher) lines.push(`설교자: ${data.preacher}`)
            if (data.scripture) lines.push(`본문: ${data.scripture}`)
            if (data.content) lines.push('', data.content)
            shareOrCopy(lines.join('\n'), showToast)
          }}
          className="p-2.5 text-[var(--color-secondary)] cursor-pointer"
        >
          <ShareIcon />
        </button>
      }
    >
      <TabNav tabs={SERVICES} activeTab={service} onChange={setService} />
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center text-sm text-[var(--color-text-secondary)] py-8">로딩 중...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="날짜" value={data.date} onChange={(v) => handleChange('date', v)} placeholder="2026-03-01" />
              <InputField label="설교자" value={data.preacher} onChange={(v) => handleChange('preacher', v)} placeholder="목사님 성함" />
            </div>
            <InputField label="본문" value={data.scripture} onChange={(v) => handleChange('scripture', v)} placeholder="요한복음 3:16" />
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] font-[var(--font-ui)] mb-1 block">설교 내용</label>
              <textarea
                value={data.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="설교 내용을 기록하세요..."
                rows={12}
                className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 resize-none focus:outline-none focus:border-[var(--color-secondary)] transition-colors"
              />
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}

function ShareIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

function InputField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[var(--color-text-secondary)] font-[var(--font-ui)] mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-secondary)] transition-colors"
      />
    </div>
  )
}
