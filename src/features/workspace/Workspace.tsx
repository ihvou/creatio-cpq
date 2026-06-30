import { useState } from 'react'
import { useStore } from '@/lib/store'
import { ProcessBar } from '@/components/shell/ProcessBar'
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
        <DraftQuote
          onRelated={(sku, lineId) => setRelated({ sku, lineId })}
          onBrowse={() => setBrowseOpen(true)}
          onCapture={() => setCaptureOpen(true)}
        />
      )}
      {view === 'quote' && <QuoteView />}
      {view === 'order' && <OrderConfirm />}

      {browseOpen && <BrowseOverlay onRelated={(sku) => setRelated({ sku })} onClose={() => setBrowseOpen(false)} />}
      {captureOpen && <CaptureListDialog onClose={() => setCaptureOpen(false)} />}
      {related && <RelatedOverlayStub sku={related.sku} lineId={related.lineId} onClose={() => setRelated(null)} />}
    </div>
  )
}
