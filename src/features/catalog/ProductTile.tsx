import { Star, Plus, Layers } from 'lucide-react'
import type { Product, AvailabilityState } from '@/lib/types'
import { useStore } from '@/lib/store'
import { priceFor } from '@/lib/pricing'
import { availabilityOf } from '@/lib/inventory'
import { money } from '@/lib/format'
import { Button, Chip } from '@/components/ui/primitives'

const AVAIL: Record<AvailabilityState, { tone: 'green' | 'yellow' | 'red'; label: string }> = {
  available: { tone: 'green', label: 'In stock' },
  low: { tone: 'yellow', label: 'Low stock' },
  out: { tone: 'red', label: 'Out of stock' },
}

export function ProductTile({ product, onViewRelated }: { product: Product; onViewRelated: (sku: string) => void }) {
  const priceListId = useStore((s) => s.priceListId())
  const addLine = useStore((s) => s.addLine)
  const av = AVAIL[availabilityOf(product)]
  return (
    <div className="bg-surface border border-line rounded-md shadow-card p-3 flex flex-col gap-2">
      <div className="aspect-[4/3] rounded-sm bg-surface-2 border border-line flex items-center justify-center text-ink-muted">
        <Layers size={28} />
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-ink truncate">{product.name}</div>
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
          <Button variant="primary" onClick={() => addLine(product.sku)}>
            <Plus size={14} /> Add
          </Button>
        </div>
      </div>
    </div>
  )
}
