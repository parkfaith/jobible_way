import { signInWithPopup, signInWithRedirect } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider } from '../lib/firebase'
import Button from '../components/ui/Button'
import { useState, useMemo } from 'react'

// 인앱 브라우저(WebView) 감지 — Google OAuth가 차단됨
function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || ''
  // 카카오톡, 라인, 인스타그램, 페이스북, 네이버 등 인앱 브라우저
  return /KAKAOTALK|Line|Instagram|FBAN|FBAV|NAVER|Whale\/\d/i.test(ua) ||
    // iOS WebView (Safari가 아닌 WKWebView)
    (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua))
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inApp = useMemo(() => isInAppBrowser(), [])

  const handleGoogleLogin = async () => {
    // 인앱 브라우저에서는 외부 브라우저로 열기
    if (inApp) {
      const url = window.location.href
      // Android 인앱 브라우저 — intent 스킴으로 Chrome 열기
      if (/android/i.test(navigator.userAgent)) {
        window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
        return
      }
      // iOS 인앱 브라우저 — Safari로 열기
      window.open(url, '_system')
      return
    }

    setLoading(true)
    setError('')
    try {
      // popup 우선 시도 — 실패 시 redirect 폴백 (모바일 팝업 차단 대비)
      try {
        await signInWithPopup(auth, googleProvider)
        navigate('/home', { replace: true })
      } catch (popupErr: unknown) {
        const code = (popupErr as { code?: string })?.code
        // 팝업 차단/닫힘 시에만 redirect 폴백
        if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(auth, googleProvider)
        } else {
          throw popupErr
        }
      }
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Warm glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[var(--color-secondary)]/8 blur-3xl" />
      </div>

      <h2 className="text-2xl font-bold font-[var(--font-heading)] text-[var(--color-primary)] mb-2 relative z-10">
        jobible Way
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-10 relative z-10">
        Google 계정으로 로그인하세요
      </p>

      {inApp && (
        <div className="w-full max-w-xs mb-6 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] relative z-10">
          <p className="text-sm text-[var(--color-secondary)] font-medium mb-1">외부 브라우저에서 열어주세요</p>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            인앱 브라우저에서는 Google 로그인이 제한됩니다.
            아래 버튼을 누르거나, 우측 상단 메뉴에서 "Safari/Chrome으로 열기"를 선택해주세요.
          </p>
        </div>
      )}

      <Button
        size="lg"
        onClick={handleGoogleLogin}
        loading={loading}
        className="w-full max-w-xs gap-3 relative z-10"
      >
        {inApp ? (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            외부 브라우저로 열기
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google로 로그인
          </>
        )}
      </Button>

      {error && (
        <p className="mt-4 text-sm text-[var(--color-error)] relative z-10">{error}</p>
      )}

      <button
        onClick={() => navigate('/')}
        className="mt-8 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] cursor-pointer relative z-10"
      >
        돌아가기
      </button>
    </div>
  )
}
