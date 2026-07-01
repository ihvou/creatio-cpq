import { useState } from 'react'
import { AlertTriangle, Printer, Share2, ArrowLeft, ShoppingCart } from 'lucide-react'
import { useStore, selectSubtotal, selectSavings } from '@/lib/store'
import { readinessFor } from '@/lib/readiness'
import type { ReadinessIssue } from '@/lib/types'
import { money } from '@/lib/format'
import { cn } from '@/lib/util'
import { Button, Chip } from '@/components/ui/primitives'
import { ShareDialog } from './ShareDialog'

const CURRENCY = 'USD'

function SummaryRow({ label, value, muted, tone }: { label: string; value: string; muted?: boolean; tone?: 'success' }) {
  return (
    <div className={cn('flex justify-between py-0.5', tone === 'success' && 'text-[var(--c-success)]')}>
      <span className={muted ? 'text-ink-muted' : 'text-ink-secondary'}>{label}</span>
      <span className={muted ? 'text-ink-muted' : ''}>{value}</span>
    </div>
  )
}

const ISSUE_LABEL: Record<ReadinessIssue, string> = {
  unavailable: 'Unavailable / not enough stock',
  quality_mismatch: 'Quality differs from the original request',
}

const STATUS_TONE = { draft: 'neutral', shared: 'blue', ordered: 'green' } as const

// Full quote view (SPEC §7): number, validity, lines, totals, notes, share/print,
// and the order-readiness check at Create order (tiny inline per-row markers).
export function QuoteView() {
  const quote = useStore((s) => s.quote)
  const buyer = useStore((s) => s.buyer)
  const contact = useStore((s) => s.contact)
  const setNote = useStore((s) => s.setNote)
  const setView = useStore((s) => s.setView)
  const createOrder = useStore((s) => s.createOrder)
  const subtotal = selectSubtotal(quote.lines)
  const priceListId = useStore((s) => s.priceListId())
  const savings = selectSavings(quote.lines, priceListId)

  const [shareOpen, setShareOpen] = useState(false)
  const [showFlags, setShowFlags] = useState(false)

  const flags = readinessFor(quote.lines)
  const flagMap = new Map(flags.map((f) => [f.lineId, f.issues]))

  function onCreateOrder() {
    if (flags.length > 0 && !showFlags) {
      setShowFlags(true) // first click surfaces the markers; second click proceeds
      return
    }
    createOrder()
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="max-w-[820px] mx-auto bg-surface border border-line rounded-md shadow-card">
        <div className="flex items-start justify-between p-5 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-semibold">Quote {quote.number}</span>
              <Chip tone={STATUS_TONE[quote.status]}>{quote.status}</Chip>
            </div>
            <div className="text-[12px] text-ink-muted mt-1">
              {buyer ? buyer.name : 'No buyer — standard pricing'}
              {contact ? ` · ${contact.name}` : ''} · valid until {quote.validUntil}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {buyer?.eligibilityBadge && <Chip tone="green">{buyer.eligibilityBadge}</Chip>}
              {quote.opportunityId && <Chip tone="blue">Source: Opp {quote.opportunityId}</Chip>}
              {quote.status !== 'draft' && <Chip tone="neutral">Prices locked on share</Chip>}
            </div>
          </div>
          <div className="flex gap-2 no-print">
            <Button onClick={() => setView('catalog')}><ArrowLeft size={14} /> Catalogue</Button>
            <Button onClick={() => window.print()}><Printer size={14} /> Print</Button>
            <Button onClick={() => setShareOpen(true)}><Share2 size={14} /> Share</Button>
            <Button variant="primary" onClick={onCreateOrder} disabled={quote.lines.length === 0}>
              <ShoppingCart size={14} /> Create order
            </Button>
          </div>
        </div>

        {showFlags && flags.length > 0 && quote.status !== 'ordered' && (
          <div className="mx-5 mt-4 flex items-center gap-2 text-[12px] bg-[var(--c-warning-bg)] text-[#7a4d00] rounded-sm px-3 py-2 no-print">
            <AlertTriangle size={15} />
            {flags.length} line{flags.length > 1 ? 's' : ''} {flags.length > 1 ? 'need' : 'needs'} attention — review the markers below, or click Create order again to proceed anyway.
          </div>
        )}

        <div className="p-5">
          <table className="w-full text-[13px]">
            <thead className="text-ink-muted">
              <tr className="[&>th]:text-left [&>th]:font-medium [&>th]:py-1.5 [&>th]:border-b [&>th]:border-line">
                <th>Item</th>
                <th className="!text-right">Qty</th>
                <th className="!text-right">Unit</th>
                <th className="!text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {quote.lines.map((l) => {
                const issues = flagMap.get(l.id)
                return (
                  <tr key={l.id} className="[&>td]:py-2 [&>td]:border-b [&>td]:border-line align-top">
                    <td>
                      <div className="flex items-center gap-2">
                        <span>{l.name}</span>
                        {showFlags && issues && (
                          <span
                            title={issues.map((i) => ISSUE_LABEL[i]).join(' · ')}
                            className="inline-flex items-center text-[var(--c-danger)]"
                            aria-label={issues.map((i) => ISSUE_LABEL[i]).join(' · ')}
                          >
                            <AlertTriangle size={14} />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        {l.sku}
                        {l.availabilityState === 'swapped' && l.originalSku ? ` · swapped from ${l.originalSku}` : ''}
                      </div>
                    </td>
                    <td className="text-right">{l.qty}</td>
                    <td className="text-right">{money(l.unitPrice)}</td>
                    <td className="text-right font-medium">{money(l.extPrice)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="flex justify-end mt-3">
            <div className="w-[300px] text-[13px]">
              <SummaryRow label="Subtotal" value={money(subtotal)} />
              {savings > 0 && <SummaryRow label="Pro pricing savings" value={`−${money(savings)}`} tone="success" />}
              <SummaryRow label="Estimated tax" value="Calculated at order" muted />
              <SummaryRow label="Delivery" value="Pickup or delivery — set at order" muted />
              <div className="flex justify-between font-semibold text-[15px] border-t border-line mt-1 pt-1">
                <span>Total ({CURRENCY})</span>
                <span>{money(subtotal)}</span>
              </div>
              <SummaryRow label="Valid until" value={quote.validUntil} muted />
              <SummaryRow label="Payment terms" value={buyer ? 'Net 30 (Pro account)' : 'Due at order'} muted />
            </div>
          </div>

          <div className="mt-5 no-print">
            <label className="text-[12px] text-ink-muted">Notes</label>
            <textarea
              value={quote.notes}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Add a note for the buyer…"
              className="mt-1 w-full border border-line rounded-sm p-2 text-[13px] outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {shareOpen && <ShareDialog onClose={() => setShareOpen(false)} />}
    </div>
  )
}
