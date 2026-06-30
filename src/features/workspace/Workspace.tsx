import { useState } from 'react'
import { useStore } from '@/lib/store'
import { ProcessBar } from '@/components/shell/ProcessBar'
import { CatalogView } from '@/features/catalog/CatalogView'
import { QuotePanel } from '@/features/quote/QuotePanel'
import { QuoteView } from '@/features/quote/QuoteView'
import { OrderConfirm } from '@/features/quote/OrderConfirm'
import { RelatedOverlayStub } from '@/features/related/RelatedOverlayStub'

export function Workspace() {
  const view = useStore((s) => s.view)
  const [relatedSku, setRelatedSku] = useState<string | null>(null)

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      <div className="flex items-center justify-between no-print">
        <h1 className="text-[18px] font-semibold text-ink">CPQ · Quote builder</h1>
        <ProcessBar />
      </div>

      {view === 'catalog' && (
        <div className="flex-1 min-h-0 grid grid-cols-[1fr_360px] gap-4">
          <CatalogView onViewRelated={setRelatedSku} />
          <QuotePanel />
        </div>
      )}
      {view === 'quote' && <QuoteView />}
      {view === 'order' && <OrderConfirm />}

      {relatedSku && <RelatedOverlayStub sku={relatedSku} onClose={() => setRelatedSku(null)} />}
    </div>
  )
}
