import { ArrowDown, ArrowUp, ArrowUpDown, Layers, Plus } from 'lucide-react'
import type { Product, AvailabilityState } from '@/lib/types'
import { useStore } from '@/lib/store'
import { priceFor } from '@/lib/pricing'
import { availabilityOf } from '@/lib/inventory'
import { money } from '@/lib/format'
import { cn } from '@/lib/util'
import { Chip } from '@/components/ui/primitives'

const AVAIL: Record<AvailabilityState, 'green' | 'yellow' | 'red'> = { available: 'green', low: 'yellow', out: 'red' }
const AVAIL_LABEL: Record<AvailabilityState, string> = { available: 'In stock', low: 'Low', out: 'Out' }

export type CatalogSort = 'best_match' | 'price_asc' | 'price_desc' | 'availability' | 'rating'

// Dense procurement-style list (SPEC §7): small font, many metadata columns,
// horizontal overflow, and sortable procurement fields.
export function CatalogTable({
  products,
  onViewRelated,
  sort,
  onSort,
}: {
  products: Product[]
  onViewRelated: (sku: string) => void
  sort: CatalogSort
  onSort: (sort: CatalogSort) => void
}) {
  const priceListId = useStore((s) => s.priceListId())
  const addLine = useStore((s) => s.addLine)
  return (
    <div className="overflow-auto border border-line rounded-md bg-surface">
      <table className="w-full text-[12px] border-collapse">
        <thead className="text-ink-muted bg-surface-2 sticky top-0">
          <tr className="[&>th]:text-left [&>th]:font-medium [&>th]:px-2 [&>th]:py-1.5 [&>th]:whitespace-nowrap">
            <th>SKU</th>
            <th>
              <button onClick={() => onSort('best_match')} className="inline-flex items-center gap-1 hover:text-ink">
                Name <ArrowUpDown size={12} />
              </button>
            </th>
            <th>Brand</th>
            <th>Category</th>
            <th>Colour</th>
            <th>Style</th>
            <th>Pack</th>
            <th>Coverage</th>
            <SortHeader align="right" active={sort === 'price_asc' || sort === 'price_desc'} direction={sort === 'price_desc' ? 'desc' : 'asc'} onClick={() => onSort(sort === 'price_asc' ? 'price_desc' : 'price_asc')}>
              Price
            </SortHeader>
            <SortHeader active={sort === 'availability'} onClick={() => onSort('availability')}>Avail.</SortHeader>
            <SortHeader active={sort === 'rating'} onClick={() => onSort('rating')}>Rating</SortHeader>
            <th></th>
          </tr>
        </thead>
        <tbody className="text-ink">
          {products.map((p) => (
            <tr key={p.sku} className="border-t border-line hover:bg-surface-2 [&>td]:px-2 [&>td]:py-1.5 [&>td]:align-middle">
              <td className="font-mono text-[11px] text-ink-secondary whitespace-nowrap">{p.sku}</td>
              <td className="whitespace-nowrap">{p.name}</td>
              <td className="text-ink-secondary">{p.brand}</td>
              <td className="text-ink-secondary">{p.category}</td>
              <td className="text-ink-secondary">{p.color}</td>
              <td className="text-ink-secondary">{p.style}</td>
              <td className="text-ink-secondary whitespace-nowrap">{p.packSize} / {p.unit}</td>
              <td className="text-ink-secondary whitespace-nowrap">{p.coverage ?? '—'}</td>
              <td className="text-right font-medium whitespace-nowrap">{money(priceFor(p, priceListId))}</td>
              <td><Chip tone={AVAIL[availabilityOf(p)]}>{AVAIL_LABEL[availabilityOf(p)]}</Chip></td>
              <td className="text-ink-secondary">{p.rating.toFixed(1)}</td>
              <td>
                <div className="flex gap-1 justify-end">
                  <button onClick={() => onViewRelated(p.sku)} className="p-1 rounded hover:bg-bg text-ink-secondary" aria-label="View related"><Layers size={14} /></button>
                  <button onClick={() => addLine(p.sku)} className="p-1 rounded hover:bg-bg text-primary" aria-label="Add"><Plus size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
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
