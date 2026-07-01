import { Star, Plus, Layers, Check } from 'lucide-react'
import type { Product, AvailabilityState } from '@/lib/types'
import { useStore } from '@/lib/store'
import { priceFor } from '@/lib/pricing'
import { availabilityOf } from '@/lib/inventory'
import { money } from '@/lib/format'
import { Button, Chip } from '@/components/ui/primitives'
import { ProductThumb } from '@/components/ui/ProductThumb'

const AVAIL: Record<AvailabilityState, { tone: 'green' | 'yellow' | 'red'; label: string }> = {
  available: { tone: 'green', label: 'In stock' },
  low: { tone: 'yellow', label: 'Low stock' },
  out: { tone: 'red', label: 'Out of stock' },
}

export function ProductTile({
  product,
  onViewRelated,
  onOpenDetail,
  selected,
  onToggleSelect,
}: {
  product: Product
  onViewRelated: (sku: string) => void
  onOpenDetail?: (sku: string) => void
  selected?: boolean
  onToggleSelect?: (sku: string) => void
}) {
  const priceListId = useStore((s) => s.priceListId())
  const addLine = useStore((s) => s.addLine)
  const inQuote = useStore((s) => s.quote.lines.find((l) => l.sku === product.sku && !l.originalSku)?.qty)
  const av = AVAIL[availabilityOf(product)]
  return (
    <div className="bg-surface border border-line rounded-md shadow-card p-3 flex flex-col gap-2 relative">
      {onToggleSelect && (
        <label className="absolute top-4 left-4 z-10 bg-surface/90 rounded-sm p-0.5 flex items-center" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={selected ?? false} onChange={() => onToggleSelect(product.sku)} aria-label={`Select ${product.name} to compare`} />
        </label>
      )}
      <button onClick={() => onOpenDetail?.(product.sku)} aria-label={`View details for ${product.name}`}>
        <ProductThumb product={product} size={28} className="aspect-[4/3] rounded-sm" />
      </button>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <button onClick={() => onOpenDetail?.(product.sku)} className="text-[13px] font-medium text-ink truncate block text-left hover:text-primary">
            {product.name}
          </button>
          <div className="text-[12px] text-ink-muted">{product.brand} · {product.sku}</div>
        </div>
        <Chip tone={av.tone}>{av.label}</Chip>
      </div>
      <div className="flex items-center gap-1 text-[12px] text-ink-secondary">
        <Star size={13} className="text-[var(--c-warning)]" /> {product.rating.toFixed(1)}
        {product.coverage && <span className="text-ink-muted">· {product.coverage}</span>}
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="text-[15px] font-semibold text-ink">
          {money(priceFor(product, priceListId))}
          <span className="text-[11px] text-ink-muted font-normal"> / {product.unit}</span>
        </div>
        <div className="flex gap-1.5">
          <Button variant="ghost" onClick={() => onViewRelated(product.sku)} aria-label="View related">
            <Layers size={14} /> Related
          </Button>
          {inQuote ? (
            <Button variant="secondary" onClick={() => addLine(product.sku)} aria-label={`Add another ${product.name}`}>
              <Check size={14} /> In quote ({inQuote})
            </Button>
          ) : (
            <Button variant="primary" onClick={() => addLine(product.sku)}>
              <Plus size={14} /> Add
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
