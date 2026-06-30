import { Trash2, Minus, Plus, FileText } from 'lucide-react'
import { useStore, selectSubtotal } from '@/lib/store'
import { money } from '@/lib/format'
import { Button, Chip } from '@/components/ui/primitives'

// Live quote panel (right side of the split-screen). Foundation-owned.
export function QuotePanel() {
  const quote = useStore((s) => s.quote)
  const buyer = useStore((s) => s.buyer)
  const setQty = useStore((s) => s.setQty)
  const removeLine = useStore((s) => s.removeLine)
  const generateQuote = useStore((s) => s.generateQuote)
  const subtotal = selectSubtotal(quote.lines)

  return (
    <div className="h-full flex flex-col bg-surface border border-line rounded-md">
      <div className="p-3 border-b border-line">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold text-ink">Quote {quote.number}</span>
          {buyer?.eligibilityBadge && <Chip tone="green">{buyer.eligibilityBadge}</Chip>}
        </div>
        <div className="text-[12px] text-ink-muted mt-0.5">{buyer ? buyer.name : 'No buyer — standard pricing'}</div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {quote.lines.length === 0 ? (
          <div className="text-[12px] text-ink-muted p-4 text-center">Add items from the catalogue to start the quote.</div>
        ) : (
          quote.lines.map((l) => (
            <div key={l.id} className="px-3 py-2 border-b border-line flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-ink truncate">{l.name}</div>
                <div className="text-[11px] text-ink-muted">
                  {money(l.unitPrice)} · {l.sku}
                  {l.availabilityState === 'unavailable' && <span className="text-[var(--c-danger)]"> · unavailable</span>}
                  {l.availabilityState === 'swapped' && <span className="text-[var(--c-info)]"> · swapped</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setQty(l.id, l.qty - 1)} className="p-1 rounded hover:bg-bg text-ink-muted" aria-label="Decrease"><Minus size={12} /></button>
                <span className="text-[12px] w-6 text-center">{l.qty}</span>
                <button onClick={() => setQty(l.id, l.qty + 1)} className="p-1 rounded hover:bg-bg text-ink-muted" aria-label="Increase"><Plus size={12} /></button>
              </div>
              <div className="text-[12px] font-medium w-16 text-right">{money(l.extPrice)}</div>
              <button onClick={() => removeLine(l.id)} className="p-1 rounded hover:bg-bg text-ink-muted" aria-label="Remove"><Trash2 size={13} /></button>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-line">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-ink-muted">Subtotal</span>
          <span className="text-[18px] font-semibold text-ink">{money(subtotal)}</span>
        </div>
        <Button variant="primary" className="w-full justify-center" onClick={generateQuote} disabled={quote.lines.length === 0}>
          <FileText size={14} /> Generate quote
        </Button>
      </div>
    </div>
  )
}
