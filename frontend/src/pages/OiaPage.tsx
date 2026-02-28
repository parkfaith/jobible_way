import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { api } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import { shareOrCopy } from '../lib/share'
import { today } from '../lib/date'

interface OiaNote {
  id?: number
  date: string
  scripture: string
  observation: string
  interpretation: string
  application: string
}

const EMPTY: OiaNote = { date: '', scripture: '', observation: '', interpretation: '', application: '' }

export default function OiaPage() {
  const { weekId } = useParams()
  const { showToast } = useToast()
  const weekNumber = parseInt(weekId ?? '1')
  const [notes, setNotes] = useState<OiaNote[]>([])
  const [current, setCurrent] = useState<OiaNote>({ ...EMPTY })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saving = useRef(false)

  useEffect(() => {
    loadNotes()
  }, [weekNumber])

  const pendingSave = useRef<OiaNote | null>(null)

  // 컴포넌트 언마운트 시 대기 중인 저장 즉시 실행
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      if (pendingSave.current) autoSave(pendingSave.current)
    }
  }, [])

  async function loadNotes() {
    setLoading(true)
    try {
      const rows = await api.get(`/api/weeks/${weekNumber}/oia`)
      setNotes(rows)
      if (rows.length > 0 && !editing) {
        setCurrent(rows[0])
      }
    } catch {
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  function handleNew() {
    setCurrent({ ...EMPTY, date: today() })
    setEditing(true)
  }

  function handleSelect(note: OiaNote) {
    setCurrent(note)
    setEditing(true)
  }

  function handleChange(field: keyof OiaNote, value: string) {
    const updated = { ...current, [field]: value }
    setCurrent(updated)
    pendingSave.current = updated
    setSaveStatus('idle')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      pendingSave.current = null
      autoSave(updated)
    }, 1500)
  }

  async function autoSave(toSave: OiaNote) {
    if (!toSave.date || saving.current) return
    saving.current = true
    setSaveStatus('saving')
    try {
      if (toSave.id) {
        await api.put(`/api/oia/${toSave.id}`, toSave)
      } else {
        const row = await api.post(`/api/weeks/${weekNumber}/oia`, toSave)
        setCurrent(prev => ({ ...prev, id: row.id }))
        setNotes(prev => [row, ...prev])
      }
      setSaveStatus('saved')
    } catch {
      setSaveStatus('idle')
      showToast('저장 실패', 'error')
    } finally {
      saving.current = false
    }
  }

  async function saveNow() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (pendingSave.current) {
      const note = pendingSave.current
      pendingSave.current = null
      await autoSave(note)
    } else {
      await autoSave(current)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('이 묵상을 삭제하시겠습니까?')) return
    try {
      await api.del(`/api/oia/${id}`)
      setNotes(prev => prev.filter(n => n.id !== id))
      if (current.id === id) {
        setCurrent({ ...EMPTY })
        setEditing(false)
      }
      showToast('삭제됨')
    } catch {
      showToast('삭제 실패', 'error')
    }
  }

  if (loading) {
    return (
      <AppShell title={`${weekNumber}주차 OIA 묵상`} showBack>
        <div className="p-4 text-center text-sm text-[var(--color-text-secondary)] py-8">로딩 중...</div>
      </AppShell>
    )
  }

  if (editing) {
    return (
      <AppShell
        title={current.id ? 'OIA 수정' : '새 OIA 묵상'}
        showBack
        rightAction={
          <div className="flex items-center">
            <button
              onClick={() => {
                const lines = [`[OIA 묵상] ${weekNumber}주차`]
                if (current.date) lines.push(`날짜: ${current.date}`)
                if (current.scripture) lines.push(`본문: ${current.scripture}`)
                if (current.observation) lines.push('', `[O] 관찰\n${current.observation}`)
                if (current.interpretation) lines.push('', `[I] 해석\n${current.interpretation}`)
                if (current.application) lines.push('', `[A] 적용\n${current.application}`)
                shareOrCopy(lines.join('\n'), showToast)
              }}
              className="p-2.5 text-[var(--color-secondary)] cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
            <button
              onClick={() => { setEditing(false); loadNotes() }}
              className="text-sm text-[var(--color-secondary)] font-[var(--font-ui)] cursor-pointer py-2 px-3"
            >
              목록
            </button>
          </div>
        }
      >
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] font-[var(--font-ui)] mb-1 block">날짜</label>
              <input
                type="text"
                value={current.date}
                onChange={(e) => handleChange('date', e.target.value)}
                placeholder="2026-03-01"
                className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-base focus:outline-none focus:border-[var(--color-secondary)]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] font-[var(--font-ui)] mb-1 block">본문</label>
              <input
                type="text"
                value={current.scripture}
                onChange={(e) => handleChange('scripture', e.target.value)}
                placeholder="요한복음 3:16"
                className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-base focus:outline-none focus:border-[var(--color-secondary)]"
              />
            </div>
          </div>

          {(['observation', 'interpretation', 'application'] as const).map((field) => (
            <div key={field}>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] font-[var(--font-ui)] mb-1 block">
                {field === 'observation' ? 'O — 관찰 (Observation)' :
                 field === 'interpretation' ? 'I — 해석 (Interpretation)' :
                 'A — 적용 (Application)'}
              </label>
              <textarea
                value={current[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={
                  field === 'observation' ? '본문에서 무엇을 보았습니까?' :
                  field === 'interpretation' ? '그것이 무엇을 의미합니까?' :
                  '나의 삶에 어떻게 적용할 수 있습니까?'
                }
                rows={4}
                className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-base resize-none focus:outline-none focus:border-[var(--color-secondary)]"
              />
            </div>
          ))}
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--color-text-secondary)] font-[var(--font-ui)]">
              {saveStatus === 'saving' ? '저장 중...' : saveStatus === 'saved' ? '자동 저장됨' : '수정 시 자동 저장'}
            </p>
            <button
              onClick={saveNow}
              className="px-4 py-2 bg-[var(--color-secondary)] text-[var(--color-bg)] rounded-lg text-xs font-[var(--font-ui)] cursor-pointer"
            >
              저장
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      title={`${weekNumber}주차 OIA 묵상`}
      showBack
      rightAction={
        <button onClick={handleNew} className="text-sm text-[var(--color-secondary)] font-[var(--font-ui)] cursor-pointer py-2 px-3">
          + 새 묵상
        </button>
      }
    >
      <div className="p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">아직 기록된 묵상이 없습니다</p>
            <button
              onClick={handleNew}
              className="px-4 py-2 bg-[var(--color-secondary)] text-[var(--color-bg)] rounded-lg text-sm font-[var(--font-ui)] cursor-pointer"
            >
              첫 묵상 시작하기
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4"
            >
              <div className="flex items-start justify-between">
                <button onClick={() => handleSelect(note)} className="flex-1 text-left cursor-pointer">
                  <p className="text-xs text-[var(--color-text-secondary)] font-[var(--font-ui)]">{note.date}</p>
                  <p className="text-sm font-medium text-[var(--color-primary)] mt-1">{note.scripture || '(본문 미입력)'}</p>
                  {note.observation && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-2 line-clamp-2">{note.observation}</p>
                  )}
                </button>
                <button
                  onClick={() => note.id && handleDelete(note.id)}
                  className="text-xs text-[var(--color-error)] cursor-pointer py-2 px-3 -mr-2"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  )
}
