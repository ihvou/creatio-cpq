import { useMemo, useState, type ReactNode } from 'react'
import { Columns3, LayoutGrid, List, Search, X } from 'lucide-react'
import type { AvailabilityState, PriceListId, Product } from '@/lib/types'
import { useStore, selectSubtotal } from '@/lib/store'
import { searchCatalog, catalogIndex, productBySku } from '@/data/catalog'
import { cn } from '@/lib/util'
import { priceFor } from '@/lib/pricing'
import { availabilityOf } from '@/lib/inventory'
import { ProductTile } from './ProductTile'
import { CatalogTable, type CatalogSort } from './CatalogTable'
import { ProductDetail } from './ProductDetail'
import { CompareOverlay } from '@/features/related/CompareOverlay'
import { Button } from '@/components/ui/primitives'

type FacetKey = 'category' | 'color' | 'style' | 'brand' | 'availability'
type PriceBandId = 'under_10' | '10_20' | '20_30' | '30_50' | '50_plus'

interface Filters {
  category: string[]
  color: string[]
  style: string[]
  brand: string[]
  availability: AvailabilityState[]
  priceBand: PriceBandId | null
  ratingMin: number | null
}

const EMPTY_FILTERS: Filters = { category: [], color: [], style: [], brand: [], availability: [], priceBand: null, ratingMin: null }

const AVAIL_LABEL: Record<AvailabilityState, string> = { available: 'In stock', low: 'Low stock', out: 'Out of stock' }

const PRICE_BANDS: { id: PriceBandId; label: string; test: (price: number) => boolean }[] = [
  { id: 'under_10', label: 'Under $10', test: (price) => price < 10 },
  { id: '10_20', label: '$10-$20', test: (price) => price >= 10 && price < 20 },
  { id: '20_30', label: '$20-$30', test: (price) => price >= 20 && price < 30 },
  { id: '30_50', label: '$30-$50', test: (price) => price >= 30 && price < 50 },
  { id: '50_plus', label: '$50+', test: (price) => price >= 50 },
]

const RATING_FILTERS = [
  { value: 4.5, label: '4.5+' },
  { value: 4.0, label: '4.0+' },
  { value: 3.5, label: '3.5+' },
]

const AVAIL_SORT_WEIGHT: Record<AvailabilityState, number> = { available: 0, low: 1, out: 2 }

export function CatalogView({ onViewRelated, initialQuery = '' }: { onViewRelated: (sku: string) => void; initialQuery?: string }) {
  const catalogView = useStore((s) => s.catalogView)
  const setCatalogView = useStore((s) => s.setCatalogView)
  const priceListId = useStore((s) => s.priceListId())
  const [q, setQ] = useState(initialQuery)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<CatalogSort>('best_match')
  const [detailSku, setDetailSku] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  const addLine = useStore((s) => s.addLine)
  const subtotal = useStore((s) => selectSubtotal(s.quote.lines))

  const searched = useMemo(() => searchCatalog(q), [q])
  const products = useMemo(() => {
    const filtered = searched.filter((p) => matchesFilters(p, filters, priceListId))
    return sortProducts(filtered, sort, q, priceListId)
  }, [filters, priceListId, q, searched, sort])

  // F2: facet counts memoized instead of recomputed inline on every render.
  const facets = useMemo(
    () => ({
      category: facetOptions('category', searched, filters, priceListId),
      color: facetOptions('color', searched, filters, priceListId),
      style: facetOptions('style', searched, filters, priceListId),
      brand: facetOptions('brand', searched, filters, priceListId),
      availability: facetOptions('availability', searched, filters, priceListId),
      priceBands: PRICE_BANDS.map((band) => ({ ...band, count: countWithFilters(searched, filters, priceListId, 'priceBand', band.id) })),
      ratings: RATING_FILTERS.map((r) => ({ ...r, count: countWithFilters(searched, filters, priceListId, 'ratingMin', r.value) })),
    }),
    [searched, filters, priceListId],
  )

  const activeFilters = useMemo(() => activeFilterChips(filters), [filters])
  const hasFilters = activeFilters.length > 0

  function setMultiFilter(key: FacetKey, value: string) {
    setFilters((current) => {
      const values = current[key] as string[]
      return { ...current, [key]: values.includes(value) ? values.filter((v) => v !== value) : [...values, value] }
    })
  }

  function removeFilter(id: string) {
    setFilters((current) => removeFilterById(current, id))
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS)
  }

  function toggleSelect(sku: string) {
    setSelected((cur) => (cur.includes(sku) ? cur.filter((s) => s !== sku) : cur.length >= 4 ? cur : [...cur, sku]))
  }
  const selectedProducts = selected.map((s) => productBySku(s)).filter((p): p is Product => Boolean(p))

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-surface border border-line rounded-sm px-2.5 h-9 flex-1 max-w-[360px]">
              <Search size={15} className="text-ink-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search the catalogue"
                aria-label="Search the catalogue"
                className="flex-1 text-[13px] outline-none bg-transparent"
              />
            </div>
            <label className="text-[12px] text-ink-muted flex items-center gap-1">
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value as CatalogSort)} className="h-9 bg-surface border border-line rounded-sm px-2 text-[12px] text-ink outline-none">
                <option value="best_match">Best match</option>
                <option value="price_asc">Price low-high</option>
                <option value="price_desc">Price high-low</option>
                <option value="availability">Availability</option>
                <option value="rating">Rating</option>
              </select>
            </label>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 min-h-6">
            <span className="text-[12px] text-ink-muted">
              {products.length} of {searched.length} match{searched.length === 1 ? '' : 'es'}
            </span>
            {activeFilters.map((chip) => (
              <button
                key={chip.id}
                onClick={() => removeFilter(chip.id)}
                className="inline-flex items-center gap-1 rounded-[var(--c-radius-pill)] bg-[var(--c-chip-neutral-bg)] text-[var(--c-chip-neutral-fg)] px-2 py-0.5 text-[11px] font-medium hover:opacity-80"
              >
                {chip.label}
                <X size={11} />
              </button>
            ))}
            {hasFilters && (
              <button onClick={resetFilters} className="text-[12px] text-primary hover:underline">Clear filters</button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 bg-surface border border-line rounded-sm p-0.5">
          <button onClick={() => setCatalogView('tiles')} className={cn('p-1.5 rounded-sm', catalogView === 'tiles' ? 'bg-bg text-ink' : 'text-ink-muted')} aria-label="Tiles view">
            <LayoutGrid size={15} />
          </button>
          <button onClick={() => setCatalogView('table')} className={cn('p-1.5 rounded-sm', catalogView === 'table' ? 'bg-bg text-ink' : 'text-ink-muted')} aria-label="List view">
            <List size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[220px_minmax(0,1fr)] gap-3">
        <aside className="bg-surface border border-line rounded-md overflow-auto p-3">
          <FacetGroup title="Category">
            {facets.category.map((o) => (
              <FacetButton key={o.value} label={o.value} count={o.count} selected={filters.category.includes(o.value)} onClick={() => setMultiFilter('category', o.value)} />
            ))}
          </FacetGroup>
          <FacetGroup title="Colour / finish">
            {facets.color.map((o) => (
              <FacetButton key={o.value} label={o.value} count={o.count} selected={filters.color.includes(o.value)} onClick={() => setMultiFilter('color', o.value)} />
            ))}
          </FacetGroup>
          <FacetGroup title="Material / style">
            {facets.style.map((o) => (
              <FacetButton key={o.value} label={o.value} count={o.count} selected={filters.style.includes(o.value)} onClick={() => setMultiFilter('style', o.value)} />
            ))}
          </FacetGroup>
          <FacetGroup title="Brand">
            {facets.brand.map((o) => (
              <FacetButton key={o.value} label={o.value} count={o.count} selected={filters.brand.includes(o.value)} onClick={() => setMultiFilter('brand', o.value)} />
            ))}
          </FacetGroup>
          <FacetGroup title="Availability">
            {facets.availability.map((o) => (
              <FacetButton key={o.value} label={AVAIL_LABEL[o.value as AvailabilityState]} count={o.count} selected={filters.availability.includes(o.value as AvailabilityState)} onClick={() => setMultiFilter('availability', o.value)} />
            ))}
          </FacetGroup>
          <FacetGroup title="Price range">
            {facets.priceBands.map((band) => (
              <FacetButton key={band.id} label={band.label} count={band.count} selected={filters.priceBand === band.id} onClick={() => setFilters((current) => ({ ...current, priceBand: current.priceBand === band.id ? null : band.id }))} />
            ))}
          </FacetGroup>
          <FacetGroup title="Rating">
            {facets.ratings.map((rating) => (
              <FacetButton key={rating.value} label={rating.label} count={rating.count} selected={filters.ratingMin === rating.value} onClick={() => setFilters((current) => ({ ...current, ratingMin: current.ratingMin === rating.value ? null : rating.value }))} />
            ))}
          </FacetGroup>
        </aside>

        <div className="min-h-0 overflow-auto">
          {products.length === 0 ? (
            <div className="h-full min-h-[280px] bg-surface border border-line rounded-md flex flex-col items-center justify-center text-center p-6">
              <div className="text-[14px] font-semibold text-ink">No catalogue items match</div>
              <div className="text-[12px] text-ink-muted mt-1 max-w-[320px]">Relax one filter or clear the search to widen the result set.</div>
              {activeFilters[0] && (
                <button onClick={() => removeFilter(activeFilters[0].id)} className="mt-3 text-[13px] text-primary hover:underline">
                  Remove "{activeFilters[0].label}"
                </button>
              )}
            </div>
          ) : catalogView === 'tiles' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
              {products.map((p) => (
                <ProductTile key={p.sku} product={p} onViewRelated={onViewRelated} onOpenDetail={setDetailSku} selected={selected.includes(p.sku)} onToggleSelect={toggleSelect} />
              ))}
            </div>
          ) : (
            <CatalogTable products={products} onViewRelated={onViewRelated} onOpenDetail={setDetailSku} sort={sort} onSort={setSort} selected={new Set(selected)} onToggleSelect={toggleSelect} />
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="shrink-0 mt-3 flex items-center gap-3 bg-surface border border-line rounded-md px-3 h-11">
          <span className="text-[12px] text-ink-secondary">{selected.length} selected to compare</span>
          <div className="flex-1" />
          <button onClick={() => setSelected([])} className="text-[12px] text-ink-muted hover:text-ink">Clear</button>
          <Button variant="primary" onClick={() => setCompareOpen(true)} disabled={selected.length < 2}>
            <Columns3 size={14} /> Compare ({selected.length})
          </Button>
        </div>
      )}

      {detailSku && <ProductDetail sku={detailSku} onClose={() => setDetailSku(null)} onViewRelated={onViewRelated} />}
      {compareOpen && (
        <CompareOverlay products={selectedProducts} actionLabel="Add" total={subtotal} onAction={(sku) => addLine(sku)} onClose={() => setCompareOpen(false)} />
      )}
    </div>
  )
}

function FacetGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-line pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
      <div className="text-[12px] font-medium text-ink mb-1.5">{title}</div>
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  )
}

function FacetButton({ label, count, selected, onClick }: { label: string; count: number; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={count === 0 && !selected}
      className={cn(
        'h-7 px-2 rounded-sm text-[12px] flex items-center justify-between gap-2 text-left disabled:opacity-40 disabled:cursor-not-allowed',
        selected ? 'bg-[var(--c-info-bg)] text-primary' : 'text-ink-secondary hover:bg-surface-2',
      )}
    >
      <span className="truncate">{label}</span>
      <span className="text-[11px] text-ink-muted">{count}</span>
    </button>
  )
}

function facetOptions(key: FacetKey, products: Product[], filters: Filters, priceListId: PriceListId) {
  const values = Array.from(
    new Set((key === 'availability' ? products.map((p) => availabilityOf(p)) : products.map((p) => String(p[key]))).filter((v) => v && v !== '—')),
  )
  return values
    .map((value) => ({ value, count: countWithFilters(products, filters, priceListId, key, value) }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}

function matchesFilters(
  product: Product,
  filters: Filters,
  priceListId: PriceListId,
  overrides?: Partial<Record<FacetKey | 'priceBand' | 'ratingMin', string | number | null>>,
): boolean {
  const category = overrides?.category !== undefined ? [String(overrides.category)] : filters.category
  const color = overrides?.color !== undefined ? [String(overrides.color)] : filters.color
  const style = overrides?.style !== undefined ? [String(overrides.style)] : filters.style
  const brand = overrides?.brand !== undefined ? [String(overrides.brand)] : filters.brand
  const availability = overrides?.availability !== undefined ? [String(overrides.availability) as AvailabilityState] : filters.availability
  const priceBand = (overrides?.priceBand !== undefined ? overrides.priceBand : filters.priceBand) as PriceBandId | null
  const ratingMin = (overrides?.ratingMin !== undefined ? overrides.ratingMin : filters.ratingMin) as number | null
  const price = priceFor(product, priceListId)

  return (
    (category.length === 0 || category.includes(product.category)) &&
    (color.length === 0 || color.includes(product.color)) &&
    (style.length === 0 || style.includes(product.style)) &&
    (brand.length === 0 || brand.includes(product.brand)) &&
    (availability.length === 0 || availability.includes(availabilityOf(product))) &&
    (!priceBand || Boolean(PRICE_BANDS.find((band) => band.id === priceBand)?.test(price))) &&
    (!ratingMin || product.rating >= ratingMin)
  )
}

function countWithFilters(products: Product[], filters: Filters, priceListId: PriceListId, key: FacetKey | 'priceBand' | 'ratingMin', value: string | number) {
  return products.filter((p) => matchesFilters(p, filters, priceListId, { [key]: value })).length
}

function sortProducts(products: Product[], sort: CatalogSort, q: string, priceListId: PriceListId) {
  const term = q.trim().toLowerCase()
  return [...products].sort((a, b) => {
    if (sort === 'price_asc') return priceFor(a, priceListId) - priceFor(b, priceListId)
    if (sort === 'price_desc') return priceFor(b, priceListId) - priceFor(a, priceListId)
    if (sort === 'availability') return AVAIL_SORT_WEIGHT[availabilityOf(a)] - AVAIL_SORT_WEIGHT[availabilityOf(b)] || b.rating - a.rating
    if (sort === 'rating') return b.rating - a.rating || priceFor(a, priceListId) - priceFor(b, priceListId)
    return matchScore(b, term) - matchScore(a, term) || catalogIndex(a.sku) - catalogIndex(b.sku)
  })
}

function matchScore(product: Product, term: string): number {
  if (!term) return 0
  const haystack = [product.sku, product.name, product.brand, product.category, product.color, product.style]
  return haystack.reduce((score, value, index) => {
    const text = value.toLowerCase()
    if (text === term) return score + 30 - index
    if (text.startsWith(term)) return score + 20 - index
    if (text.includes(term)) return score + 10 - index
    return score
  }, 0)
}

function activeFilterChips(filters: Filters) {
  const chips: { id: string; label: string }[] = []
  ;(['category', 'color', 'style', 'brand'] as const).forEach((key) => {
    filters[key].forEach((value) => chips.push({ id: `${key}:${value}`, label: value }))
  })
  filters.availability.forEach((value) => chips.push({ id: `availability:${value}`, label: AVAIL_LABEL[value] }))
  if (filters.priceBand) {
    const band = PRICE_BANDS.find((p) => p.id === filters.priceBand)
    if (band) chips.push({ id: `priceBand:${band.id}`, label: band.label })
  }
  if (filters.ratingMin) chips.push({ id: `ratingMin:${filters.ratingMin}`, label: `${filters.ratingMin}+ stars` })
  return chips
}

function removeFilterById(filters: Filters, id: string): Filters {
  const [key, value] = id.split(':') as [FacetKey | 'priceBand' | 'ratingMin', string]
  if (key === 'priceBand') return { ...filters, priceBand: null }
  if (key === 'ratingMin') return { ...filters, ratingMin: null }
  return { ...filters, [key]: (filters[key] as string[]).filter((v) => v !== value) }
}
