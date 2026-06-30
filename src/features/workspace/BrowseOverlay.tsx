import { X } from 'lucide-react'
import { CatalogView } from '@/features/catalog/CatalogView'

// Optional catalogue picker (SPEC §7). The default flow never forces full-catalogue
// browsing — this opens on demand and adds items into the draft list.
export function BrowseOverlay({ onRelated, onClose }: { onRelated: (sku: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/45 z-40 flex p-6">
      <div className="m-auto bg-surface rounded-lg shadow-modal w-full max-w-[1080px] h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 h-12 border-b border-line">
          <span className="text-[14px] font-semibold">Browse catalogue</span>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-ink-muted">Add items to your list</span>
            <button onClick={onClose} aria-label="Close"><X size={18} className="text-ink-muted" /></button>
          </div>
        </div>
        <div className="flex-1 min-h-0 p-4">
          <CatalogView onViewRelated={onRelated} />
        </div>
      </div>
    </div>
  )
}
