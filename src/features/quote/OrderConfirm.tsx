import { CheckCircle2, ShoppingCart, Truck, Send, Bookmark, ArrowLeft, RotateCcw } from 'lucide-react'
import { useStore, selectSubtotal } from '@/lib/store'
import { money } from '@/lib/format'
import { Button } from '@/components/ui/primitives'

// Order created from the quote — placeholder next actions only (SPEC §6.5, §14).
const ACTIONS = [
  { icon: ShoppingCart, label: 'Buy now / pay' },
  { icon: Truck, label: 'Schedule delivery' },
  { icon: Send, label: 'Send for approval' },
  { icon: Bookmark, label: 'Save for later' },
]

export function OrderConfirm() {
  const quote = useStore((s) => s.quote)
  const setView = useStore((s) => s.setView)
  const resetDraft = useStore((s) => s.resetDraft)
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="max-w-[520px] mx-auto bg-surface border border-line rounded-md shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 h-12 border-b border-line no-print">
          <button onClick={() => setView('catalog')} className="inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-ink">
            <ArrowLeft size={14} /> Quote Draft
          </button>
          <Button onClick={resetDraft}><RotateCcw size={13} /> New quote</Button>
        </div>
        <div className="p-6 text-center">
          <CheckCircle2 size={40} className="text-[var(--c-success)] mx-auto mb-3" />
          <div className="text-[18px] font-semibold">Order created from quote {quote.number}</div>
          <div className="text-[12px] text-ink-muted mt-1">
            {quote.lines.length} lines · {money(selectSubtotal(quote.lines))}. Placeholder — no real payment or fulfilment (SPEC §14).
          </div>
          <div className="grid grid-cols-2 gap-2 mt-5 text-left">
            {ACTIONS.map((a) => {
              const Icon = a.icon
              return (
                <div key={a.label} className="flex items-center gap-2 border border-line rounded-sm px-3 py-2 text-[13px] text-ink-secondary">
                  <Icon size={16} /> <span>{a.label}</span>
                  <span className="ml-auto text-[10px] text-ink-muted">placeholder</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
