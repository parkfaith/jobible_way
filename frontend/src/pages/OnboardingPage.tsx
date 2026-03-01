import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { usePwaInstall } from '../lib/usePwaInstall'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { showBanner, hasNativePrompt, isIos, install, dismiss } = usePwaInstall()

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Warm glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[var(--color-secondary)]/8 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-[var(--color-accent)]/5 blur-2xl" />
      </div>

      {/* Logo */}
      <div className="mb-8 relative z-10">
        <h1 className="text-4xl font-bold font-[var(--font-heading)] text-[var(--color-primary)] tracking-tight">
          jobible Way
        </h1>
        <div className="w-12 h-0.5 bg-[var(--color-secondary)] mx-auto mt-3" />
      </div>

      {/* Slogan */}
      <p className="text-xl font-[var(--font-heading)] text-[var(--color-text-secondary)] mb-2 italic relative z-10">
        제자의 길을 걷는 여정
      </p>
      <p className="text-sm text-[var(--color-text-secondary)] mb-12 max-w-xs leading-relaxed relative z-10">
        32주 제자훈련의 모든 기록을 한 곳에.<br />
        설교 노트, OIA 묵상, 성구 암송, 일일 체크까지.
      </p>

      {/* CTA */}
      <Button size="lg" onClick={() => navigate('/login')} className="w-full max-w-xs relative z-10">
        시작하기
      </Button>

      {/* PWA 설치 배너 */}
      {showBanner && (
        <div className="w-full max-w-xs mt-8 bg-[var(--color-surface)] border border-[var(--color-secondary)]/30 rounded-xl p-4 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-secondary)]/15 flex items-center justify-center text-[var(--color-secondary)] shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" /><path d="M5 12h14" />
            </svg>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-[var(--color-primary)]">홈 화면에 추가</p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {isIos
                ? '공유 버튼 → "홈 화면에 추가"를 눌러주세요'
                : '앱처럼 빠르게 접근할 수 있어요'}
            </p>
          </div>
          {hasNativePrompt && (
            <button
              onClick={async () => {
                const accepted = await install()
                if (!accepted) dismiss()
              }}
              className="px-3 py-1.5 bg-[var(--color-secondary)] text-[var(--color-bg)] rounded-lg text-xs font-[var(--font-ui)] cursor-pointer shrink-0"
            >
              설치
            </button>
          )}
          <button
            onClick={dismiss}
            className="text-[var(--color-text-secondary)] cursor-pointer p-1 shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Footer */}
      <p className="mt-8 text-xs text-[var(--color-text-secondary)]/60 relative z-10">
        낙원제일교회 제2기 제자훈련
      </p>
    </div>
  )
}
