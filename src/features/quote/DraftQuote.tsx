import { useState } from 'react'
import { Search, Plus, Minus, Trash2, Layers, FileText, LayoutGrid, ClipboardList } from 'lucide-react'
import type { AvailabilityState } from '@/lib/types'
import { useStore, selectSubtotal } from '@/lib/store'
import { searchCatalog } from '@/data/catalog'
import { priceFor } from '@/lib/pricing'
import { availabilityOf } from '@/lib/inventory'
import { money } from '@/lib/format'
import { Button, Chip } from '@/components/ui/primitives'

const AVAIL: Record<AvailabilityState, { tone: 'green' | 'yellow' | 'red'; label: string }> = {
  available: { tone: 'green', label: 'In stock' },
  low: { tone: 'yellow', label: 'Low' },
  out: { tone: 'red', label: 'Out' },
}

// List-first canvas (SPEC §7): the draft quote IS the working surface. Items are
// added via search-to-add, Paste list (intake), Browse catalogue, or Related.
export function DraftQuote({
  onRelated,
  onBrowse,
  onCapture,
}: {
  onRelated: (sku: string, lineId: string) => void
  onBrowse: () => void
  onCapture: () => void
}) {
  const quote = useStore((s) => s.quote)
  const buyer = useStore((s) => s.buyer)
  const priceListId = useStore((s) => s.priceListId())
  const addLine = useStore((s) => s.addLine)
  const setQty = useStore((s) => s.setQty)
  const removeLine = useStore((s) => s.removeLine)
  const generateQuote = useStore((s) => s.generateQuote)
  const subtotal = selectSubtotal(quote.lines)

  const [q, setQ] = useState('')
  const results = q.trim() ? searchCatalog(q).slice(0, 6) : []

  function add(sku: string) {
    addLine(sku)
    setQ('')
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="max-w-[880px] mx-auto bg-surface border border-line rounded-md shadow-card flex flex-col">
        <div className="p-4 border-b border-line flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-semibold">Quote {quote.number}</span>
              <Chip tone="neutral">draft</Chip>
              {buyer?.eligibilityBadge && <Chip tone="green">{buyer.eligibilityBadge}</Chip>}
            </div>
            <div className="text-[12px] text-ink-muted mt-0.5">{buyer ? buyer.name : 'No buyer — standard pricing'}</div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onCapture}><ClipboardList size={14} /> Capture list</Button>
            <Button onClick={onBrowse}><LayoutGrid size={14} /> Browse catalogue</Button>
          </div>
        </div>

        <div className="p-4 border-b border-line">
          <div className="relative">
            <div className="flex items-center gap-2 bg-surface border border-line rounded-sm px-2.5 h-9">
              <Search size={15} className="text-ink-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && results[0]) add(results[0].sku)
                }}
                placeholder="Add items — search the catalogue by name, SKU, brand…"
                className="flex-1 text-[13px] outline-none bg-transparent"
              />
            </div>
            {results.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-surface border border-line rounded-sm shadow-pop z-20 overflow-hidden">
                {results.map((p) => {
                  const av = AVAIL[availabilityOf(p)]
                  return (
                    <button
                      key={p.sku}
                      onClick={() => add(p.sku)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-2 text-left border-b border-line last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] text-ink truncate">{p.name}</div>
                        <div className="text-[11px] text-ink-muted">{p.brand} · {p.sku}</div>
                      </div>
                      <Chip tone={av.tone}>{av.label}</Chip>
                      <span className="text-[13px] font-medium w-16 text-right">{money(priceFor(p, priceListId))}</span>
                      <Plus size={15} className="text-primary" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {quote.lines.length === 0 ? (
            <div className="p-10 text-center text-[13px] text-ink-muted">
              Your list is empty. Search above,{' '}
              <button onClick={onCapture} className="text-primary">capture a list</button>, or{' '}
              <button onClick={onBrowse} className="text-primary">browse the catalogue</button>.
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="text-ink-muted">
                <tr className="[&>th]:text-left [&>th]:font-medium [&>th]:px-4 [&>th]:py-2 [&>th]:border-b [&>th]:border-line">
                  <th>Item</th>
                  <th className="!text-center">Qty</th>
                  <th className="!text-right">Unit</th>
                  <th className="!text-right">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {quote.lines.map((l) => (
                  <tr key={l.id} className="[&>td]:px-4 [&>td]:py-2 [&>td]:border-b [&>td]:border-line align-middle">
                    <td>
                      <div className="text-ink">{l.name}</div>
                      <div className="text-[11px] text-ink-muted">
                        {l.sku}
                        {l.availabilityState === 'unavailable' && <span className="text-[var(--c-danger)]"> · unavailable</span>}
                        {l.availabilityState === 'swapped' && l.originalSku && <span className="text-[var(--c-info)]"> · swapped from {l.originalSku}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setQty(l.id, l.qty - 1)} className="p-1 rounded hover:bg-bg text-ink-muted" aria-label="Decrease"><Minus size={12} /></button>
                        <span className="w-6 text-center">{l.qty}</span>
                        <button onClick={() => setQty(l.id, l.qty + 1)} className="p-1 rounded hover:bg-bg text-ink-muted" aria-label="Increase"><Plus size={12} /></button>
                      </div>
                    </td>
                    <td className="text-right">{money(l.unitPrice)}</td>
                    <td className="text-right font-medium">{money(l.extPrice)}</td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => onRelated(l.sku, l.id)} className="inline-flex items-center gap-1 text-[12px] text-ink-secondary hover:text-ink" aria-label="View related">
                          <Layers size={14} /> Related
                        </button>
                        <button onClick={() => removeLine(l.id)} className="p-1 rounded hover:bg-bg text-ink-muted" aria-label="Remove"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-line flex items-center justify-between">
          <div>
            <div className="text-[12px] text-ink-muted">Subtotal</div>
            <div className="text-[20px] font-semibold">{money(subtotal)}</div>
          </div>
          <Button variant="primary" onClick={generateQuote} disabled={quote.lines.length === 0}>
            <FileText size={14} /> Generate quote
          </Button>
        </div>
      </div>
    </div>
  )
}
