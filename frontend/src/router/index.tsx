import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

// Eager load (entry pages)
import OnboardingPage from '../pages/OnboardingPage'
import LoginPage from '../pages/LoginPage'

// 동적 import 실패 시 자동 새로고침 (배포 후 캐시 불일치 방지)
function lazyWithRetry(importFn: () => Promise<{ default: React.ComponentType }>) {
  return lazy(() =>
    importFn().catch(() => {
      window.location.reload()
      return new Promise(() => {}) // 새로고침 동안 대기
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
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
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
