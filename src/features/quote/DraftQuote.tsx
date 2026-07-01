import { useState } from 'react'
import { Plus, Minus, Trash2, Layers, FileText, RotateCcw } from 'lucide-react'
import { useStore, selectSubtotal, selectSavings } from '@/lib/store'
import { productBySku } from '@/data/catalog'
import { money } from '@/lib/format'
import { Button, Chip } from '@/components/ui/primitives'
import { ProductThumb } from '@/components/ui/ProductThumb'
import { ProductDetail } from '@/features/catalog/ProductDetail'
import { configCheck } from '@/lib/configCheck'
import { ConfigCheckDialog } from './ConfigCheckDialog'

// List-first canvas (SPEC §7): the draft quote IS the working surface.
export function DraftQuote({ onRelated }: { onRelated: (sku: string, lineId?: string) => void }) {
  const quote = useStore((s) => s.quote)
  const buyer = useStore((s) => s.buyer)
  const contact = useStore((s) => s.contact)
  const verified = useStore((s) => s.verified)
  const priceListId = useStore((s) => s.priceListId())
  const setQty = useStore((s) => s.setQty)
  const removeLine = useStore((s) => s.removeLine)
  const generateQuote = useStore((s) => s.generateQuote)
  const resetDraft = useStore((s) => s.resetDraft)
  const subtotal = selectSubtotal(quote.lines)
  const savings = selectSavings(quote.lines, priceListId)
  const [detail, setDetail] = useState<{ sku: string; lineId?: string } | null>(null)
  const [showCheck, setShowCheck] = useState(false)

  function onGenerate() {
    const { missing, blocks } = configCheck(quote.lines)
    if (missing.length || blocks.length) setShowCheck(true)
    else generateQuote()
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="max-w-[1040px] mx-auto bg-surface border border-line rounded-md shadow-card flex flex-col">
        <div className="p-4 border-b border-line flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-semibold">Quote {quote.number}</span>
              <Chip tone="neutral">draft</Chip>
              {buyer?.eligibilityBadge && <Chip tone="green">{buyer.eligibilityBadge}</Chip>}
              {quote.opportunityId && <Chip tone="blue">Opp {quote.opportunityId}</Chip>}
              {buyer && (verified ? <Chip tone="green">Verified</Chip> : <Chip tone="yellow">Unverified</Chip>)}
            </div>
            <div className="text-[12px] text-ink-muted mt-0.5">
              {buyer ? buyer.name : 'No buyer — standard pricing'}
              {buyer?.type === 'company' && contact ? ` · Attn: ${contact.name}` : ''}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {quote.lines.length > 0 && (
              <Button onClick={resetDraft}><RotateCcw size={13} /> New quote</Button>
            )}
            <Button variant="primary" onClick={onGenerate} disabled={quote.lines.length === 0}>
              <FileText size={14} /> Generate quote
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {quote.lines.length === 0 ? (
            <div className="p-10 text-center text-[13px] text-ink-muted">
              Your list is empty — search above to add products, or use Capture list / Browse.
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
                {quote.lines.map((l) => {
                  const p = productBySku(l.sku)
                  return (
                    <tr key={l.id} className="[&>td]:px-4 [&>td]:py-2 [&>td]:border-b [&>td]:border-line align-middle">
                      <td>
                        <div className="flex items-center gap-2.5">
                          {p && (
                            <button onClick={() => setDetail({ sku: l.sku, lineId: l.id })} aria-label={`View details for ${l.name}`}>
                              <ProductThumb product={p} size={14} className="w-9 h-9 rounded-sm shrink-0" />
                            </button>
                          )}
                          <div className="min-w-0">
                            <button onClick={() => setDetail({ sku: l.sku, lineId: l.id })} className="text-ink text-left hover:text-primary block truncate">{l.name}</button>
                            <div className="text-[11px] text-ink-muted">
                              {l.sku}
                              {l.availabilityState === 'unavailable' && <span className="text-[var(--c-danger)]"> · unavailable</span>}
                              {l.availabilityState === 'swapped' && l.originalSku && <span className="text-[var(--c-info)]"> · swapped from {l.originalSku}</span>}
                            </div>
                          </div>
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
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-line">
          <div className="text-[12px] text-ink-muted">
            Subtotal{savings > 0 && <span className="text-[var(--c-success)]"> · you save {money(savings)} with Pro pricing</span>}
          </div>
          <div className="text-[20px] font-semibold">{money(subtotal)}</div>
        </div>
      </div>

      {detail && (
        <ProductDetail
          sku={detail.sku}
          onClose={() => setDetail(null)}
          onViewRelated={(sku) => onRelated(sku, detail.lineId)}
        />
      )}
      {showCheck && (
        <ConfigCheckDialog
          onClose={() => setShowCheck(false)}
          onGenerate={generateQuote}
          onOpenDetail={(sku) => setDetail({ sku })}
          onViewRelated={(sku) => onRelated(sku)}
        />
      )}
    </div>
  )
}
