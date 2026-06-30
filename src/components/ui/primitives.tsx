import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/util'

type Variant = 'primary' | 'secondary' | 'ghost'

export function Button({
  variant = 'secondary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-hover border border-transparent',
    secondary: 'bg-surface text-ink border border-line hover:bg-surface-2',
    ghost: 'bg-transparent text-ink-secondary hover:bg-surface-2 border border-transparent',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        styles[variant],
        className,
      )}
      {...props}
    />
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('bg-surface border border-line rounded-md shadow-card', className)}>{children}</div>
}

type Tone = 'neutral' | 'blue' | 'green' | 'yellow' | 'red'

export function Chip({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const tones: Record<Tone, string> = {
    neutral: 'bg-[var(--c-chip-neutral-bg)] text-[var(--c-chip-neutral-fg)]',
    blue: 'bg-[var(--c-chip-blue-bg)] text-[var(--c-chip-blue-fg)]',
    green: 'bg-[var(--c-chip-green-bg)] text-[var(--c-chip-green-fg)]',
    yellow: 'bg-[var(--c-chip-yellow-bg)] text-[var(--c-chip-yellow-fg)]',
    red: 'bg-[var(--c-chip-red-bg)] text-[var(--c-chip-red-fg)]',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--c-radius-pill)] px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
