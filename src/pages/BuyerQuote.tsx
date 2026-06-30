import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import type { Quote } from '@/lib/types'
import { loadSharedQuote } from '@/features/quote/quoteShare'
import { money } from '@/lib/format'
import { selectSubtotal } from '@/lib/store'
import { Button } from '@/components/ui/primitives'

function Center({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-bg flex items-center justify-center p-4">{children}</div>
}

// Buyer-facing read-only quote + next actions (SPEC Scenario 4 / §6.I).
export function BuyerQuote() {
  const { quoteId = '' } = useParams()
  const [quote, setQuote] = useState<Quote | null | undefined>(undefined)

  useEffect(() => {
    void loadSharedQuote(quoteId).then(setQuote)
  }, [quoteId])

  if (quote === undefined) return <Center><div className="text-[13px] text-ink-muted">Loading…</div></Center>
  if (!quote)
    return (
      <Center>
        <div className="text-[13px] text-ink-muted text-center max-w-[320px]">
          Quote not found. Open it on the device that created it, or configure Supabase for cross-device sharing.
        </div>
      </Center>
    )

  return (
    <Center>
      <div className="w-full max-w-[440px] bg-surface border border-line rounded-md shadow-card p-5">
        <div className="text-[16px] font-semibold">Quote {quote.number}</div>
        <div className="text-[12px] text-ink-muted">Valid until {quote.validUntil}</div>
        <div className="mt-3">
          {quote.lines.map((l) => (
            <div key={l.id} className="flex justify-between text-[13px] py-1 border-b border-line">
              <span>{l.qty}× {l.name}</span>
              <span className="font-medium">{money(l.extPrice)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-[15px] font-semibold">
          <span>Subtotal</span>
          <span>{money(selectSubtotal(quote.lines))}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button className="justify-center">Buy now</Button>
          <Button className="justify-center">Save for later</Button>
        </div>
        <p className="text-[11px] text-ink-muted mt-3 text-center">
          A shared quote is a saved proposal, not an order. Take the number to the Pro Desk or convert it online.
        </p>
      </div>
    </Center>
  )
}
