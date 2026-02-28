import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import { router } from './router'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
