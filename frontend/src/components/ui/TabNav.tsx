import type { ReactNode } from 'react'

interface Tab {
  label: string
  value: string
  icon?: ReactNode
}

interface TabNavProps {
  tabs: Tab[]
  activeTab: string
  onChange: (value: string) => void
}

export default function TabNav({ tabs, activeTab, onChange }: TabNavProps) {
  return (
    <div className="flex border-b border-[var(--color-border)]">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium font-[var(--font-ui)] transition-colors cursor-pointer
            ${activeTab === tab.value
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-secondary)]'
              : 'text-[var(--color-text-secondary)]'
            }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
