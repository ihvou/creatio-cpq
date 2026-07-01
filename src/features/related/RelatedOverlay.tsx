import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowLeftRight,
  Check,
  Columns3,
  LayoutGrid,
  Layers,
  List,
  Plus,
  Star,
  X,
} from 'lucide-react'
import type { AlternativeReason, AvailabilityState, Product, RelatedRef, TogetherReason } from '@/lib/types'
import { productBySku } from '@/data/catalog'
import { selectSubtotal, useStore } from '@/lib/store'
import { priceFor } from '@/lib/pricing'
import { availabilityOf } from '@/lib/inventory'
import { money } from '@/lib/format'
import { cn } from '@/lib/util'
import { Button, Chip } from '@/components/ui/primitives'
import { useEscape } from '@/lib/useEscape'

type RelatedTab = 'alternatives' | 'together'
type RelatedView = 'tiles' | 'list'
type Reason = AlternativeReason | TogetherReason

const ALT_REASONS: { value: AlternativeReason; label: string }[] = [
  { value: 'better_price', label: 'Better price' },
  { value: 'better_quality', label: 'Better quality' },
  { value: 'same_style', label: 'Same style' },
]

const TOGETHER_REASONS: { value: TogetherReason; label: string }[] = [
  { value: 'same_style', label: 'Same style' },
  { value: 'work_together', label: 'Work together' },
]

const AVAIL: Record<AvailabilityState, { tone: 'green' | 'yellow' | 'red'; label: string; sort: number }> = {
  available: { tone: 'green', label: 'In stock', sort: 0 },
  low: { tone: 'yellow', label: 'Low stock', sort: 1 },
  out: { tone: 'red', label: 'Out of stock', sort: 2 },
}

// Full View-related split overlay (SPEC §7).
export function RelatedOverlay({ sku, lineId, onClose }: { sku: string; lineId?: string; onClose: () => void }) {
  const product = productBySku(sku)
  const priceListId = useStore((s) => s.priceListId())
  const quote = useStore((s) => s.quote)
  const addLine = useStore((s) => s.addLine)
  const swapLine = useStore((s) => s.swapLine)
  const subtotal = selectSubtotal(quote.lines)
  const [tab, setTab] = useState<RelatedTab>('alternatives')
  const [altReason, setAltReason] = useState<AlternativeReason>('better_price')
  const [togetherReason, setTogetherReason] = useState<TogetherReason>('work_together')
  const [view, setView] = useState<RelatedView>('tiles')
  const [selected, setSelected] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)

  useEscape(() => (compareOpen ? setCompareOpen(false) : onClose()))

  useEffect(() => {
    if (!product) return
    setAltReason(firstReason(product.alternatives, ALT_REASONS, 'better_price'))
    setTogetherReason(firstReason(product.buyTogether, TOGETHER_REASONS, 'work_together'))
    setSelected([])
    setCompareOpen(false)
    setLastAction(null)
  }, [product])

  const refs = tab === 'alternatives' ? product?.alternatives ?? [] : product?.buyTogether ?? []
  const reason = tab === 'alternatives' ? altReason : togetherReason
  const reasons = tab === 'alternatives' ? ALT_REASONS : TOGETHER_REASONS
  const reasonCounts = useMemo(() => countReasons(refs), [refs])
  const items = useMemo(
    () =>
      refs
        .filter((ref) => ref.reason === reason)
        .map((ref) => ({ ref, product: productBySku(ref.sku) }))
        .filter((item): item is { ref: RelatedRef<Reason>; product: Product } => Boolean(item.product))
        .sort((a, b) => AVAIL[availabilityOf(a.product)].sort - AVAIL[availabilityOf(b.product)].sort || b.product.rating - a.product.rating),
    [reason, refs],
  )
  const selectedProducts = selected.map((selectedSku) => productBySku(selectedSku)).filter((p): p is Product => Boolean(p))

  if (!product) return null

  function handleAction(nextSku: string) {
    const next = productBySku(nextSku)
    if (!next) return
    if (tab === 'alternatives' && lineId) {
      swapLine(lineId, nextSku)
      setLastAction(`Swapped to ${next.name}`)
    } else {
      addLine(nextSku)
      setLastAction(`Added ${next.name}`)
    }
  }

  function toggleSelected(nextSku: string) {
    setSelected((current) => {
      if (current.includes(nextSku)) return current.filter((item) => item !== nextSku)
      if (current.length >= 4) return current
      return [...current, nextSku]
    })
  }

  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="m-auto bg-surface rounded-lg shadow-modal w-full h-full max-h-[92vh] max-w-[1180px] flex overflow-hidden">
        <section className="w-[330px] shrink-0 border-r border-line bg-surface-2 flex flex-col min-h-0">
          <div className="p-4 border-b border-line bg-surface">
            <button onClick={onClose} className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink">
              <ArrowLeft size={14} /> Back to quote
            </button>
          </div>
          <div className="p-4 overflow-auto">
            <ProductHero product={product} />
            <div className="mt-4">
              <div className="text-[16px] font-semibold text-ink">{product.name}</div>
              <div className="text-[12px] text-ink-muted mt-0.5">{product.brand} · {product.sku}</div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="text-[19px] font-semibold">{money(priceFor(product, priceListId))}</div>
              <span className="text-[12px] text-ink-muted">/ {product.unit}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <AvailabilityChip product={product} />
              <Chip tone="blue">{product.category}</Chip>
              <Chip tone="neutral">{product.color}</Chip>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
              <Spec label="Brand" value={product.brand} />
              <Spec label="Style" value={product.style} />
              <Spec label="Pack" value={`${product.packSize} / ${product.unit}`} />
              <Spec label="Coverage" value={product.coverage ?? '-'} />
              <Spec label="Rating" value={product.rating.toFixed(1)} />
              <Spec label="Stock" value={`${product.stockQty}`} />
              {Object.entries(product.specs).map(([key, value]) => (
                <Spec key={key} label={key} value={value} />
              ))}
            </dl>
          </div>
        </section>

        <section className="flex-1 min-w-0 flex flex-col">
          <div className="h-14 px-4 border-b border-line flex items-center justify-between shrink-0">
            <div className="flex gap-4 h-full">
              <TabButton
                active={tab === 'alternatives'}
                onClick={() => {
                  setTab('alternatives')
                  setSelected([])
                }}
              >
                Alternatives
              </TabButton>
              <TabButton
                active={tab === 'together'}
                onClick={() => {
                  setTab('together')
                  setSelected([])
                }}
              >
                They buy together
              </TabButton>
            </div>
            <button onClick={onClose} aria-label="Close"><X size={18} className="text-ink-muted" /></button>
          </div>

          <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-2 shrink-0">
            {reasons.map((item) => {
              const active = item.value === reason
              return (
                <button
                  key={item.value}
                  onClick={() => {
                    if (tab === 'alternatives') setAltReason(item.value as AlternativeReason)
                    else setTogetherReason(item.value as TogetherReason)
                    setSelected([])
                  }}
                  className={cn(
                    'h-7 px-2.5 rounded-[var(--c-radius-pill)] text-[12px] inline-flex items-center gap-1.5',
                    active ? 'bg-[var(--c-accent-soft)] text-ink' : 'bg-surface-2 text-ink-secondary hover:bg-bg',
                  )}
                >
                  {item.label}
                  <span className="text-[11px] text-ink-muted">{reasonCounts.get(item.value) ?? 0}</span>
                </button>
              )
            })}
            <div className="flex-1" />
            <div className="flex items-center gap-1 bg-surface border border-line rounded-sm p-0.5">
              <button onClick={() => setView('tiles')} className={cn('p-1.5 rounded-sm', view === 'tiles' ? 'bg-bg text-ink' : 'text-ink-muted')} aria-label="Tiles view">
                <LayoutGrid size={14} />
              </button>
              <button onClick={() => setView('list')} className={cn('p-1.5 rounded-sm', view === 'list' ? 'bg-bg text-ink' : 'text-ink-muted')} aria-label="List view">
                <List size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto p-4">
            {items.length === 0 ? (
              <div className="h-full min-h-[260px] border border-line rounded-md flex items-center justify-center text-[13px] text-ink-muted">
                No related items in this sub-tab.
              </div>
            ) : view === 'tiles' ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
                {items.map(({ ref, product: item }) => (
                  <RelatedCard
                    key={item.sku}
                    product={item}
                    reasonLabel={labelForReason(ref.reason)}
                    selected={selected.includes(item.sku)}
                    canSelect={selected.length < 4 || selected.includes(item.sku)}
                    actionLabel={actionLabel(tab, Boolean(lineId))}
                    onAction={() => handleAction(item.sku)}
                    onSelect={() => toggleSelected(item.sku)}
                  />
                ))}
              </div>
            ) : (
              <RelatedList
                items={items}
                selected={selected}
                canSelectMore={selected.length < 4}
                actionLabel={actionLabel(tab, Boolean(lineId))}
                onSelect={toggleSelected}
                onAction={handleAction}
              />
            )}
          </div>

          <div className="h-14 px-4 border-t border-line bg-surface flex items-center gap-3 shrink-0">
            <div>
              <div className="text-[11px] text-ink-muted">Running quote total</div>
              <div className="text-[18px] font-semibold">{money(subtotal)}</div>
            </div>
            {lastAction && <div className="text-[12px] text-[var(--c-success)] flex items-center gap-1"><Check size={13} /> {lastAction}</div>}
            <div className="flex-1" />
            <span className="text-[12px] text-ink-muted">{selected.length}/4 selected</span>
            <Button onClick={() => setCompareOpen(true)} disabled={selected.length < 2}>
              <Columns3 size={14} /> Compare
            </Button>
          </div>
        </section>
      </div>

      {compareOpen && (
        <CompareOverlay
          products={selectedProducts}
          actionLabel={actionLabel(tab, Boolean(lineId))}
          total={subtotal}
          onAction={handleAction}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </div>
  )
}

function ProductHero({ product }: { product: Product }) {
  return (
    <div className="aspect-[4/3] rounded-md bg-surface border border-line flex items-center justify-center text-ink-muted">
      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-md" /> : <Layers size={34} />}
    </div>
  )
}

function RelatedCard({
  product,
  reasonLabel,
  selected,
  canSelect,
  actionLabel,
  onAction,
  onSelect,
}: {
  product: Product
  reasonLabel: string
  selected: boolean
  canSelect: boolean
  actionLabel: string
  onAction: () => void
  onSelect: () => void
}) {
  const priceListId = useStore((s) => s.priceListId())
  return (
    <div className="bg-surface border border-line rounded-md shadow-card p-3 flex flex-col gap-2">
      <ProductHero product={product} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-ink truncate">{product.name}</div>
          <div className="text-[12px] text-ink-muted">{product.brand} · {product.sku}</div>
        </div>
        <AvailabilityChip product={product} />
      </div>
      <div className="flex items-center gap-1 text-[12px] text-ink-secondary">
        <Star size={13} className="text-[var(--c-warning)]" /> {product.rating.toFixed(1)}
        <span className="text-ink-muted">· {reasonLabel}</span>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <div className="text-[15px] font-semibold">
          {money(priceFor(product, priceListId))}
          <span className="text-[11px] text-ink-muted font-normal"> / {product.unit}</span>
        </div>
        <button
          onClick={onSelect}
          disabled={!canSelect}
          className={cn(
            'text-[12px] px-2 py-1 rounded-sm border disabled:opacity-40',
            selected ? 'border-primary text-primary bg-[var(--c-info-bg)]' : 'border-line text-ink-secondary hover:bg-surface-2',
          )}
        >
          {selected ? 'Selected' : 'Select'}
        </button>
      </div>
      <Button variant="primary" className="justify-center" onClick={onAction}>
        {actionLabel === 'Swap' ? <ArrowLeftRight size={14} /> : <Plus size={14} />}
        {actionLabel}
      </Button>
    </div>
  )
}

function RelatedList({
  items,
  selected,
  canSelectMore,
  actionLabel,
  onSelect,
  onAction,
}: {
  items: { ref: RelatedRef<Reason>; product: Product }[]
  selected: string[]
  canSelectMore: boolean
  actionLabel: string
  onSelect: (sku: string) => void
  onAction: (sku: string) => void
}) {
  const priceListId = useStore((s) => s.priceListId())
  return (
    <div className="border border-line rounded-md bg-surface overflow-auto">
      <table className="w-full text-[12px] border-collapse">
        <thead className="bg-surface-2 text-ink-muted sticky top-0">
          <tr className="[&>th]:text-left [&>th]:font-medium [&>th]:px-2 [&>th]:py-1.5">
            <th>Item</th>
            <th>Reason</th>
            <th>Specs</th>
            <th className="!text-right">Price</th>
            <th>Avail.</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ ref, product }) => {
            const isSelected = selected.includes(product.sku)
            return (
              <tr key={product.sku} className="border-t border-line hover:bg-surface-2 [&>td]:px-2 [&>td]:py-1.5">
                <td>
                  <div className="font-medium text-ink">{product.name}</div>
                  <div className="text-[11px] text-ink-muted">{product.brand} · {product.sku}</div>
                </td>
                <td className="text-ink-secondary whitespace-nowrap">{labelForReason(ref.reason)}</td>
                <td className="text-ink-secondary whitespace-nowrap">{product.color} · {product.style}</td>
                <td className="text-right font-medium whitespace-nowrap">{money(priceFor(product, priceListId))}</td>
                <td><AvailabilityChip product={product} /></td>
                <td>
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onSelect(product.sku)}
                      disabled={!canSelectMore && !isSelected}
                      className={cn('px-2 py-1 rounded-sm text-[12px] border disabled:opacity-40', isSelected ? 'border-primary text-primary bg-[var(--c-info-bg)]' : 'border-line text-ink-secondary hover:bg-bg')}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                    <Button variant="primary" onClick={() => onAction(product.sku)}>{actionLabel}</Button>
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

function CompareOverlay({
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
  return (
    <div className="fixed inset-0 bg-surface z-[60] flex flex-col">
      <div className="h-14 border-b border-line px-5 flex items-center gap-3 shrink-0">
        <button onClick={onClose} className="inline-flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink">
          <ArrowLeft size={15} /> Back to related
        </button>
        <div className="text-[15px] font-semibold text-ink">Compare selected items</div>
        <div className="flex-1" />
        <div className="text-[12px] text-ink-muted">Running total</div>
        <div className="text-[18px] font-semibold">{money(total)}</div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-5">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(220px, 1fr))` }}>
          {products.map((product) => (
            <div key={product.sku} className="border border-line rounded-md bg-surface shadow-card p-3 flex flex-col gap-3">
              <ProductHero product={product} />
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
      <Spec label="Availability" value={AVAIL[availabilityOf(product)].label} />
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

function TabButton({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn('text-[13px] border-b-2 px-0.5', active ? 'text-ink border-accent' : 'text-ink-muted border-transparent hover:text-ink')}
    >
      {children}
    </button>
  )
}

function AvailabilityChip({ product }: { product: Product }) {
  const availability = availabilityOf(product)
  return <Chip tone={AVAIL[availability].tone}>{AVAIL[availability].label}</Chip>
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-ink-muted capitalize truncate">{label}</dt>
      <dd className="text-ink truncate">{value}</dd>
    </div>
  )
}

function actionLabel(tab: RelatedTab, hasLine: boolean) {
  return tab === 'alternatives' && hasLine ? 'Swap' : 'Add'
}

function labelForReason(reason: Reason) {
  return [...ALT_REASONS, ...TOGETHER_REASONS].find((item) => item.value === reason)?.label ?? reason
}

function countReasons(refs: RelatedRef<Reason>[]) {
  const counts = new Map<Reason, number>()
  refs.forEach((ref) => counts.set(ref.reason, (counts.get(ref.reason) ?? 0) + 1))
  return counts
}

function firstReason<T extends Reason>(refs: RelatedRef<T>[], reasons: { value: T; label: string }[], fallback: T) {
  return reasons.find((reason) => refs.some((ref) => ref.reason === reason.value))?.value ?? fallback
}
