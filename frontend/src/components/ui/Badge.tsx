import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'gold' | 'outline'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-surface-elevated)] text-[var(--color-primary)]',
  success: 'bg-[var(--color-success)] text-white',
  gold: 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]',
  outline: 'border border-[var(--color-border)] text-[var(--color-text-secondary)]',
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-xs font-medium font-[var(--font-ui)]
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
