'use client'

interface FilterButtonProps {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  color?: string
}

export function FilterButton({
  children,
  active,
  onClick,
  color
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        font-mono text-sm transition-all
        ${active
          ? 'bg-[var(--surface-elevated)] text-[var(--text)] border-[var(--border)]'
          : 'bg-transparent text-[var(--text-dim)] border-transparent hover:text-[var(--text-mid)]'
        }
      `}
      style={{
        padding: '8px 14px',
        border: '1px solid',
        borderColor: active ? 'var(--border)' : 'transparent',
        fontSize: '12px',
      }}
    >
      {color && (
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            backgroundColor: color,
            marginRight: '8px',
          }}
        />
      )}
      {children}
    </button>
  )
}
