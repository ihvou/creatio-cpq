import { useState } from 'react'
import { LayoutGrid, List, Search } from 'lucide-react'
import { useStore } from '@/lib/store'
import { searchCatalog } from '@/data/catalog'
import { cn } from '@/lib/util'
import { ProductTile } from './ProductTile'
import { CatalogTable } from './CatalogTable'

// REFERENCE SLICE (foundation). Codex extends into the full features/catalog:
// faceted filters (category/color/style/brand/price/rating/availability), sort,
// and richer dense columns. See BUILD_TASKS.md › slice A.
export function CatalogView({ onViewRelated }: { onViewRelated: (sku: string) => void }) {
  const catalogView = useStore((s) => s.catalogView)
  const setCatalogView = useStore((s) => s.setCatalogView)
  const [q, setQ] = useState('')
  const products = searchCatalog(q)

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-2 bg-surface border border-line rounded-sm px-2.5 h-9 flex-1 max-w-[360px]">
          <Search size={15} className="text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the catalogue"
            className="flex-1 text-[13px] outline-none bg-transparent"
          />
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1 bg-surface border border-line rounded-sm p-0.5">
          <button onClick={() => setCatalogView('tiles')} className={cn('p-1.5 rounded-sm', catalogView === 'tiles' ? 'bg-bg text-ink' : 'text-ink-muted')} aria-label="Tiles view">
            <LayoutGrid size={15} />
          </button>
          <button onClick={() => setCatalogView('table')} className={cn('p-1.5 rounded-sm', catalogView === 'table' ? 'bg-bg text-ink' : 'text-ink-muted')} aria-label="List view">
            <List size={15} />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        {catalogView === 'tiles' ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {products.map((p) => (
              <ProductTile key={p.sku} product={p} onViewRelated={onViewRelated} />
            ))}
          </div>
        ) : (
          <CatalogTable products={products} onViewRelated={onViewRelated} />
        )}
      </div>
    </div>
  )
}
