import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-dvh p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-border)] flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-primary)] font-[var(--font-heading)] mb-2">
            문제가 발생했습니다
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            잠시 후 다시 시도해 주세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[var(--color-secondary)] text-[var(--color-bg)] rounded-lg text-sm font-medium font-[var(--font-ui)] cursor-pointer"
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
