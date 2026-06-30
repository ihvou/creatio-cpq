import { useStore, selectSubtotal } from '@/lib/store'
import { money } from '@/lib/format'
import { Button } from '@/components/ui/primitives'

// Placeholder for the foundation-owner Phase-1 slice: full quote view with
// share (QR/link/email), print, and order-readiness flags (SPEC §7).
export function QuoteViewStub() {
  const quote = useStore((s) => s.quote)
  const buyer = useStore((s) => s.buyer)
  const createOrder = useStore((s) => s.createOrder)
  const setView = useStore((s) => s.setView)
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="max-w-[760px] mx-auto bg-surface border border-line rounded-md p-6 shadow-card">
        <div className="flex items-center justify-between border-b border-line pb-3 mb-3">
          <div>
            <div className="text-[18px] font-semibold">Quote {quote.number}</div>
            <div className="text-[12px] text-ink-muted">{buyer?.name ?? 'No buyer'} · valid until {quote.validUntil}</div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setView('catalog')}>Back to catalogue</Button>
            <Button variant="primary" onClick={createOrder}>Create order</Button>
          </div>
        </div>
        {quote.lines.map((l) => (
          <div key={l.id} className="flex justify-between text-[13px] py-1 border-b border-line">
            <span>{l.qty}× {l.name}</span>
            <span className="font-medium">{money(l.extPrice)}</span>
          </div>
        ))}
        <div className="flex justify-between mt-3 text-[15px] font-semibold">
          <span>Subtotal</span>
          <span>{money(selectSubtotal(quote.lines))}</span>
        </div>
        <p className="text-[12px] text-ink-muted mt-4">
          Quote view / share / print + order-readiness flags are the foundation-owner Phase-1 slice (features/quote). Placeholder.
        </p>
      </div>
    </div>
  )
}
