import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../lib/AuthContext'

interface Fellow {
  name: string
  phone: string
  prayerTopics: string[]
}

// 제자동역자 명단 (가나다 순)
const FELLOWS: Fellow[] = [
  { name: '노재진', phone: '010-5572-7328', prayerTopics: [] },
  { name: '박은성', phone: '010-4653-6223', prayerTopics: [] },
  { name: '박준형', phone: '010-9744-4750', prayerTopics: [] },
  { name: '안기준', phone: '010-5178-8396', prayerTopics: [] },
  { name: '이경현', phone: '010-3017-4682', prayerTopics: [] },
  { name: '이규용', phone: '010-4736-6827', prayerTopics: [] },
  { name: '이민성', phone: '010-5243-1153', prayerTopics: [] },
  { name: '황영학', phone: '010-7608-4078', prayerTopics: [] },
]

export default function FellowPage() {
  const { canViewFellow } = useAuth()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // 권한 없으면 홈으로 리다이렉트
  if (!canViewFellow) return <Navigate to="/home" replace />

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <AppShell title="제자동역자" showBack>
      <div className="p-4 space-y-2">
        <p className="text-sm text-[var(--color-text-secondary)] mb-3">
          함께 하는 동역자들의 기도제목을 기억하며 기도해주세요.
        </p>

        {FELLOWS.map((fellow, i) => (
          <div
            key={fellow.name}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between p-4 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)]/15 flex items-center justify-center text-[var(--color-secondary)] text-sm font-medium font-[var(--font-ui)]">
                  {fellow.name[0]}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-text-primary)] font-[var(--font-ui)]">
                    {fellow.name}
                  </span>
                  <a
                    href={`tel:${fellow.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-colors"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    <span className="text-[11px] font-[var(--font-ui)]">{fellow.phone}</span>
                  </a>
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform duration-200 ${
                  openIndex === i ? 'rotate-180' : ''
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {openIndex === i && (
              <div className="px-4 pb-4 pt-0">
                <div className="border-t border-[var(--color-border)] pt-3">
                  {fellow.prayerTopics.length > 0 ? (
                    <ol className="space-y-2">
                      {fellow.prayerTopics.map((topic, j) => (
                        <li key={j} className="flex gap-2 text-sm text-[var(--color-text-primary)]">
                          <span className="text-[var(--color-secondary)] font-medium font-[var(--font-ui)] shrink-0">
                            {j + 1}.
                          </span>
                          {topic}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-[var(--color-text-secondary)] italic">
                      아직 기도제목이 없습니다.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 담당교역자 */}
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <h3 className="text-xs font-medium text-[var(--color-text-secondary)] font-[var(--font-ui)] mb-2">담당교역자</h3>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] text-sm font-medium font-[var(--font-ui)]">
                강
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--color-text-primary)] font-[var(--font-ui)]">
                  강요셉 목사
                </span>
                <a
                  href="tel:010-2234-7241"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-colors"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  <span className="text-[11px] font-[var(--font-ui)]">010-2234-7241</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
