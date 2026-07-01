import { useState } from 'react'
import { ClipboardList, LayoutGrid } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/primitives'
import { ProcessBar } from '@/components/shell/ProcessBar'
import { AddSearchBar } from './AddSearchBar'
import { BrowsePanel } from './BrowsePanel'
import { DraftQuote } from '@/features/quote/DraftQuote'
import { QuoteView } from '@/features/quote/QuoteView'
import { OrderConfirm } from '@/features/quote/OrderConfirm'
import { RelatedOverlay } from '@/features/related/RelatedOverlay'
import { CaptureListDialog } from '@/features/intake/CaptureListDialog'

export function Workspace() {
  const view = useStore((s) => s.view)
  const [related, setRelated] = useState<{ sku: string; lineId?: string } | null>(null)
  const [browseOpen, setBrowseOpen] = useState(false)
  const [browseQuery, setBrowseQuery] = useState('')
  const [captureOpen, setCaptureOpen] = useState(false)

  function openBrowse(query?: string) {
    setBrowseQuery(query ?? '')
    setBrowseOpen(true)
  }

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      <div className="flex items-center justify-between no-print">
        <h1 className="text-[18px] font-semibold text-ink">CPQ · Quote builder</h1>
        <ProcessBar />
      </div>

      {view === 'catalog' &&
        (browseOpen ? (
          <BrowsePanel initialQuery={browseQuery} onRelated={(sku) => setRelated({ sku })} onClose={() => setBrowseOpen(false)} />
        ) : (
          <>
            <div className="flex items-center gap-2 no-print">
              <AddSearchBar onBrowse={openBrowse} />
              <Button onClick={() => setCaptureOpen(true)}><ClipboardList size={14} /> Capture list</Button>
              <Button onClick={() => openBrowse()}><LayoutGrid size={14} /> Browse</Button>
            </div>
            <DraftQuote onRelated={(sku, lineId) => setRelated({ sku, lineId })} />
          </>
        ))}
      {view === 'quote' && <QuoteView />}
      {view === 'order' && <OrderConfirm />}

      {captureOpen && <CaptureListDialog onClose={() => setCaptureOpen(false)} />}
      {related && <RelatedOverlay sku={related.sku} lineId={related.lineId} onClose={() => setRelated(null)} />}
    </div>
  )
}
