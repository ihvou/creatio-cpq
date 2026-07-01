import { ArrowLeft, ArrowLeftRight, Plus } from 'lucide-react'
import type { AvailabilityState, Product } from '@/lib/types'
import { useStore } from '@/lib/store'
import { priceFor } from '@/lib/pricing'
import { availabilityOf } from '@/lib/inventory'
import { money } from '@/lib/format'
import { useEscape } from '@/lib/useEscape'
import { Button } from '@/components/ui/primitives'
import { ProductThumb } from '@/components/ui/ProductThumb'

const AVAIL_LABEL: Record<AvailabilityState, string> = { available: 'In stock', low: 'Low stock', out: 'Out of stock' }

// Full-screen side-by-side compare (SPEC §7). Shared by the Related overlay and
// the catalogue (finding 11). Closes on Escape / Back.
export function CompareOverlay({
  products,
  actionLabel,
  total,
  onAction,
  onClose,
}: {
  products: Product[]
  actionLabel: string
  total: number
  onAction: (sku: string) => void
  onClose: () => void
}) {
  useEscape(onClose)
  return (
    <div className="fixed inset-0 bg-surface z-[60] flex flex-col">
      <div className="h-14 border-b border-line px-5 flex items-center gap-3 shrink-0">
        <button onClick={onClose} className="inline-flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="text-[15px] font-semibold text-ink">Compare items</div>
        <div className="flex-1" />
        <div className="text-[12px] text-ink-muted">Running total</div>
        <div className="text-[18px] font-semibold">{money(total)}</div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-5">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(220px, 1fr))` }}>
          {products.map((product) => (
            <div key={product.sku} className="border border-line rounded-md bg-surface shadow-card p-3 flex flex-col gap-3">
              <ProductThumb product={product} size={32} className="aspect-[4/3] rounded-md" />
              <div>
                <div className="text-[14px] font-semibold">{product.name}</div>
                <div className="text-[12px] text-ink-muted">{product.brand} · {product.sku}</div>
              </div>
              <CompareSpecs product={product} />
              <Button variant="primary" className="justify-center mt-auto" onClick={() => onAction(product.sku)}>
                {actionLabel === 'Swap' ? <ArrowLeftRight size={14} /> : <Plus size={14} />}
                {actionLabel}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CompareSpecs({ product }: { product: Product }) {
  const priceListId = useStore((s) => s.priceListId())
  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
      <Spec label="Price" value={money(priceFor(product, priceListId))} />
      <Spec label="Availability" value={AVAIL_LABEL[availabilityOf(product)]} />
      <Spec label="Rating" value={product.rating.toFixed(1)} />
      <Spec label="Quality" value={`Tier ${product.qualityTier}`} />
      <Spec label="Colour" value={product.color} />
      <Spec label="Style" value={product.style} />
      {Object.entries(product.specs).map(([key, value]) => (
        <Spec key={key} label={key} value={value} />
      ))}
    </dl>
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
