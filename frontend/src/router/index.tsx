import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, useNavigate, useRouteError } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

// Eager load (entry pages)
import OnboardingPage from '../pages/OnboardingPage'
import LoginPage from '../pages/LoginPage'

// 동적 import 실패 시 자동 새로고침 (배포 후 캐시 불일치 방지)
const RETRY_KEY = 'chunk-retry'

function lazyWithRetry(importFn: () => Promise<{ default: React.ComponentType }>) {
  return lazy(() =>
    importFn().catch(() => {
      const lastRetry = sessionStorage.getItem(RETRY_KEY)
      const now = Date.now()
      // 10초 이내 재시도면 무한 루프 방지
      if (lastRetry && now - Number(lastRetry) < 10000) {
        return Promise.reject(new Error('청크 로드 실패'))
      }
      sessionStorage.setItem(RETRY_KEY, String(now))
      window.location.reload()
      return new Promise(() => {})
    })
  )
}

// Lazy load (authenticated pages)
const DashboardPage = lazyWithRetry(() => import('../pages/DashboardPage'))
const WeeksPage = lazyWithRetry(() => import('../pages/WeeksPage'))
const WeekDetailPage = lazyWithRetry(() => import('../pages/WeekDetailPage'))
const DailyPage = lazyWithRetry(() => import('../pages/DailyPage'))
const ProgressPage = lazyWithRetry(() => import('../pages/ProgressPage'))
const ProfilePage = lazyWithRetry(() => import('../pages/ProfilePage'))
const SermonPage = lazyWithRetry(() => import('../pages/SermonPage'))
const OiaPage = lazyWithRetry(() => import('../pages/OiaPage'))
const DiaryPage = lazyWithRetry(() => import('../pages/DiaryPage'))
const VersePage = lazyWithRetry(() => import('../pages/VersePage'))
const CurriculumPage = lazyWithRetry(() => import('../pages/CurriculumPage'))

function PageLoading() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[var(--color-text-secondary)]">잠시만 기다려주세요...</p>
    </div>
  )
}

// React Router 에러 바운더리 — 청크 로드 실패 시 자동 새로고침
function RouteErrorBoundary() {
  const error = useRouteError()
  const isChunkError = error instanceof Error && (
    error.message.includes('dynamically imported module') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('Loading chunk') ||
    error.message.includes('청크 로드 실패')
  )

  if (isChunkError) {
    const lastRetry = sessionStorage.getItem(RETRY_KEY)
    const now = Date.now()
    if (!lastRetry || now - Number(lastRetry) > 10000) {
      sessionStorage.setItem(RETRY_KEY, String(now))
      window.location.reload()
      return null
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-border)] flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-[var(--color-primary)] font-[var(--font-heading)] mb-2">
        업데이트가 필요합니다
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        새 버전이 배포되었습니다. 새로고침 해주세요.
      </p>
      <button
        onClick={() => {
          sessionStorage.removeItem(RETRY_KEY)
          window.location.reload()
        }}
        className="px-6 py-2.5 bg-[var(--color-secondary)] text-[var(--color-bg)] rounded-lg text-sm font-medium font-[var(--font-ui)] cursor-pointer"
      >
        새로고침
      </button>
    </div>
  )
}

function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <Outlet />
    </Suspense>
  )
}

function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-bold text-[var(--color-primary)] font-[var(--font-heading)] mb-4">404</p>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">페이지를 찾을 수 없습니다</p>
      <button
        onClick={() => navigate('/home')}
        className="px-6 py-2.5 bg-[var(--color-secondary)] text-[var(--color-bg)] rounded-lg text-sm font-[var(--font-ui)] cursor-pointer"
      >
        홈으로 돌아가기
      </button>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <OnboardingPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    errorElement: <RouteErrorBoundary />,
    element: <ProtectedLayout />,
    children: [
      { path: '/home', element: <DashboardPage /> },
      { path: '/weeks', element: <WeeksPage /> },
      { path: '/weeks/:weekId', element: <WeekDetailPage /> },
      { path: '/weeks/:weekId/sermon', element: <SermonPage /> },
      { path: '/weeks/:weekId/oia', element: <OiaPage /> },
      { path: '/weeks/:weekId/diary', element: <DiaryPage /> },
      { path: '/weeks/:weekId/verse', element: <VersePage /> },
      { path: '/daily', element: <DailyPage /> },
      { path: '/progress', element: <ProgressPage /> },
      { path: '/curriculum', element: <CurriculumPage /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
