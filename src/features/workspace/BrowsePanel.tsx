import { ArrowLeft } from 'lucide-react'
import { useStore, selectSubtotal } from '@/lib/store'
import { money } from '@/lib/format'
import { Button } from '@/components/ui/primitives'
import { CatalogView } from '@/features/catalog/CatalogView'

// Full-page catalogue browse (review D0 / F5 / F9): replaces the quote canvas so
// facets + table + tiles use the full width. Not an overlay — no popup-over-popup
// when opening Related. The running quote total stays visible in the header.
export function BrowsePanel({
  initialQuery,
  onRelated,
  onClose,
}: {
  initialQuery?: string
  onRelated: (sku: string) => void
  onClose: () => void
}) {
  const quote = useStore((s) => s.quote)
  const subtotal = selectSubtotal(quote.lines)
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-surface border border-line rounded-md overflow-hidden">
      <div className="h-12 px-4 border-b border-line flex items-center gap-3 shrink-0">
        <button onClick={onClose} className="inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-ink">
          <ArrowLeft size={15} /> Back to quote
        </button>
        <div className="text-[14px] font-semibold text-ink">Browse catalogue</div>
        <div className="flex-1" />
        <div className="text-[12px] text-ink-muted">
          {quote.lines.length} line{quote.lines.length === 1 ? '' : 's'} · {money(subtotal)}
        </div>
        <Button variant="primary" onClick={onClose}>Done</Button>
      </div>
      <div className="flex-1 min-h-0 p-4">
        <CatalogView onViewRelated={onRelated} initialQuery={initialQuery} />
      </div>
    </div>
  )
}
