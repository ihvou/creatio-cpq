import { ArrowDown, ArrowUp, ArrowUpDown, Check, Layers, Plus } from 'lucide-react'
import type { Product, AvailabilityState } from '@/lib/types'
import { useStore } from '@/lib/store'
import { priceFor } from '@/lib/pricing'
import { availabilityOf } from '@/lib/inventory'
import { money } from '@/lib/format'
import { cn } from '@/lib/util'
import { Chip } from '@/components/ui/primitives'
import { ProductThumb } from '@/components/ui/ProductThumb'

const AVAIL: Record<AvailabilityState, 'green' | 'yellow' | 'red'> = { available: 'green', low: 'yellow', out: 'red' }
const AVAIL_LABEL: Record<AvailabilityState, string> = { available: 'In stock', low: 'Low', out: 'Out' }

export type CatalogSort = 'best_match' | 'price_asc' | 'price_desc' | 'availability' | 'rating'

// Dense procurement-style list (SPEC §7; findings 4/6/10/11): thumbnail + merged
// metadata + in-quote feedback + optional compare-select.
export function CatalogTable({
  products,
  onViewRelated,
  onOpenDetail,
  sort,
  onSort,
  selected,
  onToggleSelect,
}: {
  products: Product[]
  onViewRelated: (sku: string) => void
  onOpenDetail?: (sku: string) => void
  sort: CatalogSort
  onSort: (sort: CatalogSort) => void
  selected?: Set<string>
  onToggleSelect?: (sku: string) => void
}) {
  const priceListId = useStore((s) => s.priceListId())
  const addLine = useStore((s) => s.addLine)
  const lines = useStore((s) => s.quote.lines)
  const inQuote = new Map(lines.filter((l) => !l.originalSku).map((l) => [l.sku, l.qty]))
  const canSelect = Boolean(onToggleSelect)

  return (
    <div className="overflow-x-auto border border-line rounded-md bg-surface">
      <table className="w-full text-[12px] border-collapse">
        <thead className="text-ink-muted bg-surface-2 sticky top-0">
          <tr className="[&>th]:text-left [&>th]:font-medium [&>th]:px-2 [&>th]:py-1.5 [&>th]:whitespace-nowrap">
            {canSelect && <th></th>}
            <th></th>
            <th>SKU</th>
            <th>
              <button onClick={() => onSort('best_match')} className="inline-flex items-center gap-1 hover:text-ink">
                Name <ArrowUpDown size={12} />
              </button>
            </th>
            <th>Brand</th>
            <th>Category</th>
            <th>Colour / style</th>
            <th>Pack / coverage</th>
            <SortHeader align="right" active={sort === 'price_asc' || sort === 'price_desc'} direction={sort === 'price_desc' ? 'desc' : 'asc'} onClick={() => onSort(sort === 'price_asc' ? 'price_desc' : 'price_asc')}>
              Price
            </SortHeader>
            <SortHeader active={sort === 'availability'} onClick={() => onSort('availability')}>Avail.</SortHeader>
            <SortHeader align="right" active={sort === 'rating'} onClick={() => onSort('rating')}>Rating</SortHeader>
            <th className="sticky right-0 bg-surface-2 border-l border-line z-20"></th>
          </tr>
        </thead>
        <tbody className="text-ink">
          {products.map((p) => {
            const qty = inQuote.get(p.sku)
            return (
              <tr key={p.sku} className="border-t border-line hover:bg-surface-2 [&>td]:px-2 [&>td]:py-1.5 [&>td]:align-middle">
                {canSelect && (
                  <td>
                    <input type="checkbox" checked={selected?.has(p.sku) ?? false} onChange={() => onToggleSelect?.(p.sku)} aria-label={`Select ${p.name} to compare`} />
                  </td>
                )}
                <td>
                  <button onClick={() => onOpenDetail?.(p.sku)} className="w-9 h-9 rounded-sm shrink-0" aria-label={`View details for ${p.name}`}>
                    <ProductThumb product={p} size={14} className="w-9 h-9 rounded-sm" />
                  </button>
                </td>
                <td className="font-mono text-[11px] text-ink-secondary whitespace-nowrap">{p.sku}</td>
                <td className="max-w-[220px]">
                  <button onClick={() => onOpenDetail?.(p.sku)} className="truncate block text-left hover:text-primary max-w-[220px]">{p.name}</button>
                </td>
                <td className="text-ink-secondary whitespace-nowrap">{p.brand}</td>
                <td className="text-ink-secondary whitespace-nowrap">{p.category}</td>
                <td className="text-ink-secondary whitespace-nowrap">{p.color}{p.style !== '—' ? ` · ${p.style}` : ''}</td>
                <td className="text-ink-secondary whitespace-nowrap">{p.packSize} / {p.unit}{p.coverage ? ` · ${p.coverage}` : ''}</td>
                <td className="text-right font-medium whitespace-nowrap">{money(priceFor(p, priceListId))}</td>
                <td><Chip tone={AVAIL[availabilityOf(p)]}>{AVAIL_LABEL[availabilityOf(p)]}</Chip></td>
                <td className="text-right text-ink-secondary">{p.rating.toFixed(1)}</td>
                <td className="sticky right-0 bg-surface border-l border-line z-10">
                  <div className="flex gap-1 justify-end items-center">
                    <button onClick={() => onViewRelated(p.sku)} className="p-1 rounded hover:bg-bg text-ink-secondary" aria-label="View related"><Layers size={14} /></button>
                    {qty ? (
                      <button onClick={() => addLine(p.sku)} className="p-1 rounded hover:bg-bg inline-flex items-center gap-0.5 text-[var(--c-success)]" aria-label={`In quote (${qty}), add another`} title={`In quote: ${qty}`}>
                        <Check size={14} /><span className="text-[10px]">{qty}</span>
                      </button>
                    ) : (
                      <button onClick={() => addLine(p.sku)} className="p-1 rounded hover:bg-bg text-primary" aria-label="Add"><Plus size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function SortHeader({
  children,
  active,
  direction = 'desc',
  align,
  onClick,
}: {
  children: string
  active: boolean
  direction?: 'asc' | 'desc'
  align?: 'right'
  onClick: () => void
}) {
  const Icon = !active ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown
  return (
    <th className={cn(align === 'right' && '!text-right')}>
      <button onClick={onClick} className={cn('inline-flex items-center gap-1 hover:text-ink', align === 'right' && 'justify-end w-full')}>
        {children}
        <Icon size={12} />
      </button>
    </th>
  )
}
