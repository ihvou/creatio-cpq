import { useState } from 'react'
import { X, Plus, Layers } from 'lucide-react'
import type { AlternativeReason, TogetherReason } from '@/lib/types'
import { productBySku } from '@/data/catalog'
import { useStore } from '@/lib/store'
import { priceFor } from '@/lib/pricing'
import { money } from '@/lib/format'
import { cn } from '@/lib/util'
import { Button, Chip } from '@/components/ui/primitives'

const ALT_LABEL: Record<AlternativeReason, string> = {
  better_price: 'Better price',
  better_quality: 'Better quality',
  same_style: 'Same style',
}
const TOG_LABEL: Record<TogetherReason, string> = {
  same_style: 'Same style',
  work_together: 'Work together',
}

// MINIMAL reference of the View-related split overlay (SPEC §7): left = selected
// item detail, right = related items with Alternatives / They-buy-together tabs.
// Codex extends with sub-tab filter chips, Compare, and Swap-from-quote-line.
export function RelatedOverlayStub({ sku, onClose }: { sku: string; onClose: () => void }) {
  const product = productBySku(sku)
  const priceListId = useStore((s) => s.priceListId())
  const addLine = useStore((s) => s.addLine)
  const [tab, setTab] = useState<'alternatives' | 'together'>('alternatives')
  if (!product) return null

  const items =
    tab === 'alternatives'
      ? product.alternatives.map((r) => ({ p: productBySku(r.sku), label: ALT_LABEL[r.reason] }))
      : product.buyTogether.map((r) => ({ p: productBySku(r.sku), label: TOG_LABEL[r.reason] }))

  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex p-6">
      <div className="m-auto bg-surface rounded-lg shadow-modal w-full max-w-[920px] h-[80vh] flex overflow-hidden">
        <div className="w-[300px] shrink-0 border-r border-line p-4 flex flex-col gap-3">
          <div className="aspect-[4/3] rounded-sm bg-surface-2 border border-line flex items-center justify-center text-ink-muted">
            <Layers size={32} />
          </div>
          <div className="text-[14px] font-semibold text-ink">{product.name}</div>
          <div className="text-[12px] text-ink-muted">{product.brand} · {product.sku}</div>
          <div className="text-[16px] font-semibold">{money(priceFor(product, priceListId))}</div>
          <div className="text-[12px] text-ink-secondary flex flex-col gap-0.5">
            {Object.entries(product.specs).map(([k, v]) => (
              <div key={k}><span className="text-ink-muted">{k}:</span> {v}</div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-4 h-12 border-b border-line">
            <div className="flex gap-4">
              {(['alternatives', 'together'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn('text-[13px] py-3 border-b-2', tab === t ? 'text-ink' : 'text-ink-muted border-transparent')}
                  style={tab === t ? { borderColor: 'var(--c-accent)' } : undefined}
                >
                  {t === 'alternatives' ? 'Alternatives' : 'They buy together'}
                </button>
              ))}
            </div>
            <button onClick={onClose} aria-label="Close"><X size={18} className="text-ink-muted" /></button>
          </div>
          <div className="flex-1 overflow-auto p-4 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 content-start">
            {items.length === 0 && <div className="text-[12px] text-ink-muted">No items in this tab.</div>}
            {items.map(({ p, label }) =>
              p ? (
                <div key={p.sku} className="border border-line rounded-md p-3 flex flex-col gap-2">
                  <div className="aspect-[4/3] rounded-sm bg-surface-2 border border-line flex items-center justify-center text-ink-muted"><Layers size={24} /></div>
                  <Chip tone="neutral">{label}</Chip>
                  <div className="text-[12px] font-medium text-ink">{p.name}</div>
                  <div className="text-[14px] font-semibold">{money(priceFor(p, priceListId))}</div>
                  <Button variant="primary" className="justify-center" onClick={() => { addLine(p.sku); onClose() }}>
                    <Plus size={14} /> Add to quote
                  </Button>
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
