import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function OnboardingPage() {
  const navigate = useNavigate()

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

      {/* Footer */}
      <p className="mt-16 text-xs text-[var(--color-text-secondary)]/60 relative z-10">
        낙원제일교회 제2기 제자훈련
      </p>
    </div>
  )
}
