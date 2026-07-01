import { X, Plus, Layers, Star } from 'lucide-react'
import type { AvailabilityState } from '@/lib/types'
import { productBySku } from '@/data/catalog'
import { useStore } from '@/lib/store'
import { priceFor } from '@/lib/pricing'
import { availabilityOf } from '@/lib/inventory'
import { money } from '@/lib/format'
import { useEscape } from '@/lib/useEscape'
import { Button, Chip } from '@/components/ui/primitives'

const AVAIL: Record<AvailabilityState, { tone: 'green' | 'yellow' | 'red'; label: string }> = {
  available: { tone: 'green', label: 'In stock' },
  low: { tone: 'yellow', label: 'Low stock' },
  out: { tone: 'red', label: 'Out of stock' },
}

// Full product detail view (SPEC §7, review F7). Opened from a catalogue tile /
// table row. Closes on Escape or backdrop click (F4).
export function ProductDetail({ sku, onClose, onViewRelated }: { sku: string; onClose: () => void; onViewRelated: (sku: string) => void }) {
  const priceListId = useStore((s) => s.priceListId())
  const addLine = useStore((s) => s.addLine)
  const product = productBySku(sku)
  useEscape(onClose)
  if (!product) return null
  const av = AVAIL[availabilityOf(product)]

  return (
    <div className="fixed inset-0 bg-black/45 z-[55] flex p-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="m-auto bg-surface rounded-lg shadow-modal w-full max-w-[900px] max-h-[88vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 h-12 border-b border-line shrink-0">
          <span className="text-[15px] font-semibold">Product details</span>
          <button onClick={onClose} aria-label="Close"><X size={18} className="text-ink-muted" /></button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-5 grid grid-cols-[minmax(0,1fr)_320px] gap-6">
          <div className="aspect-[4/3] rounded-md bg-surface-2 border border-line overflow-hidden flex items-center justify-center text-ink-muted">
            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <Layers size={40} />}
          </div>
          <div>
            <div className="text-[18px] font-semibold text-ink">{product.name}</div>
            <div className="text-[12px] text-ink-muted mt-0.5">{product.brand} · {product.sku}</div>
            <div className="mt-3 flex items-center gap-2">
              <div className="text-[22px] font-semibold">{money(priceFor(product, priceListId))}</div>
              <span className="text-[12px] text-ink-muted">/ {product.unit}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Chip tone={av.tone}>{av.label}</Chip>
              <Chip tone="blue">{product.category}</Chip>
              <span className="inline-flex items-center gap-1 text-[12px] text-ink-secondary"><Star size={13} className="text-[var(--c-warning)]" /> {product.rating.toFixed(1)}</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
              <Spec label="Brand" value={product.brand} />
              <Spec label="Colour" value={product.color} />
              <Spec label="Style" value={product.style} />
              <Spec label="Pack" value={`${product.packSize} / ${product.unit}`} />
              <Spec label="Coverage" value={product.coverage ?? '—'} />
              <Spec label="Stock" value={`${product.stockQty}`} />
              {Object.entries(product.specs).map(([k, v]) => <Spec key={k} label={k} value={v} />)}
            </dl>
            <div className="mt-5 flex gap-2">
              <Button variant="primary" onClick={() => { addLine(product.sku); onClose() }}><Plus size={14} /> Add to quote</Button>
              <Button onClick={() => { onViewRelated(product.sku); onClose() }}><Layers size={14} /> View related</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-ink-muted capitalize truncate">{label}</dt>
      <dd className="text-ink truncate">{value}</dd>
    </div>
  )
}
