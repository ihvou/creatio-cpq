import { useState } from 'react'
import { ClipboardList, LayoutGrid } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/primitives'
import { ProcessBar } from '@/components/shell/ProcessBar'
import { AddSearchBar } from './AddSearchBar'
import { DraftQuote } from '@/features/quote/DraftQuote'
import { QuoteView } from '@/features/quote/QuoteView'
import { OrderConfirm } from '@/features/quote/OrderConfirm'
import { RelatedOverlayStub } from '@/features/related/RelatedOverlayStub'
import { BrowseOverlay } from './BrowseOverlay'
import { CaptureListDialog } from '@/features/intake/CaptureListDialog'

export function Workspace() {
  const view = useStore((s) => s.view)
  const [related, setRelated] = useState<{ sku: string; lineId?: string } | null>(null)
  const [browseOpen, setBrowseOpen] = useState(false)
  const [captureOpen, setCaptureOpen] = useState(false)

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      <div className="flex items-center justify-between no-print">
        <h1 className="text-[18px] font-semibold text-ink">CPQ · Quote builder</h1>
        <ProcessBar />
      </div>

      {view === 'catalog' && (
        <>
          <div className="flex items-center gap-2 no-print">
            <AddSearchBar onBrowse={() => setBrowseOpen(true)} />
            <Button onClick={() => setCaptureOpen(true)}><ClipboardList size={14} /> Capture list</Button>
            <Button onClick={() => setBrowseOpen(true)}><LayoutGrid size={14} /> Browse</Button>
          </div>
          <DraftQuote onRelated={(sku, lineId) => setRelated({ sku, lineId })} />
        </>
      )}
      {view === 'quote' && <QuoteView />}
      {view === 'order' && <OrderConfirm />}

      {browseOpen && <BrowseOverlay onRelated={(sku) => setRelated({ sku })} onClose={() => setBrowseOpen(false)} />}
      {captureOpen && <CaptureListDialog onClose={() => setCaptureOpen(false)} />}
      {related && <RelatedOverlayStub sku={related.sku} lineId={related.lineId} onClose={() => setRelated(null)} />}
    </div>
  )
}
