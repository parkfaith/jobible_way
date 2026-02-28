import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

// Eager load (entry pages)
import OnboardingPage from '../pages/OnboardingPage'
import LoginPage from '../pages/LoginPage'

// Lazy load (authenticated pages)
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const WeeksPage = lazy(() => import('../pages/WeeksPage'))
const WeekDetailPage = lazy(() => import('../pages/WeekDetailPage'))
const DailyPage = lazy(() => import('../pages/DailyPage'))
const ProgressPage = lazy(() => import('../pages/ProgressPage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const SermonPage = lazy(() => import('../pages/SermonPage'))
const OiaPage = lazy(() => import('../pages/OiaPage'))
const DiaryPage = lazy(() => import('../pages/DiaryPage'))
const VersePage = lazy(() => import('../pages/VersePage'))
const CurriculumPage = lazy(() => import('../pages/CurriculumPage'))

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
