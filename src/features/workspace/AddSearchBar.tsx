import { useEffect, useRef, useState } from 'react'
import { Search, Plus, Layers } from 'lucide-react'
import type { AvailabilityState } from '@/lib/types'
import { useStore } from '@/lib/store'
import { searchCatalog } from '@/data/catalog'
import { priceFor } from '@/lib/pricing'
import { availabilityOf } from '@/lib/inventory'
import { money } from '@/lib/format'
import { Chip } from '@/components/ui/primitives'

const AVAIL: Record<AvailabilityState, { tone: 'green' | 'yellow' | 'red'; label: string }> = {
  available: { tone: 'green', label: 'In stock' },
  low: { tone: 'yellow', label: 'Low' },
  out: { tone: 'red', label: 'Out' },
}

// Primary add affordance (list-first): a full-width page-level search with a rich
// autocomplete. Adds lines inline; "Browse" opens the faceted picker for explore.
export function AddSearchBar({ onBrowse }: { onBrowse: () => void }) {
  const priceListId = useStore((s) => s.priceListId())
  const addLine = useStore((s) => s.addLine)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const all = q.trim() ? searchCatalog(q) : []
  const results = all.slice(0, 7)
  const show = open && q.trim().length > 0

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <div className="flex items-center gap-2 bg-surface border border-line rounded-md px-3 h-10 shadow-card">
        <Search size={16} className="text-ink-muted" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) addLine(results[0].sku)
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder="Add products to the quote — search by name, SKU, brand…"
          className="flex-1 text-[14px] outline-none bg-transparent"
        />
      </div>

      {show && (
        <div className="absolute left-0 right-0 mt-1.5 bg-surface border border-line rounded-md shadow-modal z-30 overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-[13px] text-ink-muted">
              No matches.{' '}
              <button onClick={() => { onBrowse(); setOpen(false) }} className="text-primary">Browse the catalogue →</button>
            </div>
          ) : (
            <>
              {results.map((p) => {
                const av = AVAIL[availabilityOf(p)]
                return (
                  <div key={p.sku} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-2 border-b border-line last:border-0">
                    <div className="w-10 h-10 rounded-sm bg-surface-2 border border-line overflow-hidden flex items-center justify-center text-ink-muted shrink-0">
                      {p.imageUrl ? <img src={p.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" /> : <Layers size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] text-ink truncate">{p.name}</div>
                      <div className="text-[11px] text-ink-muted truncate">{p.brand} · {p.sku}</div>
                    </div>
                    <Chip tone={av.tone}>{av.label}</Chip>
                    <span className="text-[13px] font-medium w-16 text-right shrink-0">{money(priceFor(p, priceListId))}</span>
                    <button
                      onClick={() => addLine(p.sku)}
                      className="inline-flex items-center gap-1 text-[12px] text-white bg-primary hover:bg-primary-hover rounded-sm px-2.5 py-1.5 shrink-0"
                      aria-label={`Add ${p.name}`}
                    >
                      <Plus size={13} /> Add
                    </button>
                  </div>
                )
              })}
              <button onClick={() => { onBrowse(); setOpen(false) }} className="w-full text-left px-3 py-2 text-[12px] text-primary hover:bg-surface-2">
                See all {all.length} match{all.length === 1 ? '' : 'es'} in Browse →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
