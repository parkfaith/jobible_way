import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--color-surface)] border border-[var(--color-border)]
        rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]
        ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}
