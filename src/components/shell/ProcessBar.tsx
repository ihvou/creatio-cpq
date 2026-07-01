import { useStore } from '@/lib/store'
import { cn } from '@/lib/util'

const STAGES: { key: 'catalog' | 'quote' | 'order'; label: string }[] = [
  { key: 'catalog', label: 'Quote Draft' },
  { key: 'quote', label: 'Quote' },
  { key: 'order', label: 'Order' },
]

// Display-only Creatio process bar (SPEC §7). Reflects the current phase.
export function ProcessBar() {
  const view = useStore((s) => s.view)
  const idx = STAGES.findIndex((x) => x.key === view)
  return (
    <div className="flex items-center gap-1.5">
      {STAGES.map((st, i) => {
        const state = i < idx ? 'done' : i === idx ? 'current' : 'upcoming'
        return (
          <div key={st.key} className="flex items-center gap-1.5">
            <span
              className={cn(
                'text-[11px] font-medium px-3 py-1 rounded-[var(--c-radius-pill)]',
                state === 'upcoming' ? 'bg-[#E9EAEE] text-ink-muted' : 'text-white',
              )}
              style={state !== 'upcoming' ? { background: state === 'current' ? 'var(--c-success)' : 'var(--c-stage)' } : undefined}
            >
              {st.label}
            </span>
            {i < STAGES.length - 1 && <span className="text-ink-muted">›</span>}
          </div>
        )
      })}
    </div>
  )
}
