import { X, AlertTriangle, AlertOctagon, Plus, Trash2, Check } from 'lucide-react'
import { useStore } from '@/lib/store'
import { configCheck } from '@/lib/configCheck'
import { priceFor } from '@/lib/pricing'
import { money } from '@/lib/format'
import { useEscape } from '@/lib/useEscape'
import { Button } from '@/components/ui/primitives'
import { ProductThumb } from '@/components/ui/ProductThumb'

// Configuration check before Generate quote (Codex #3). Non-blocking warnings
// (missing essentials, quick-add) + a hard block on incompatible items.
export function ConfigCheckDialog({ onClose, onGenerate }: { onClose: () => void; onGenerate: () => void }) {
  const lines = useStore((s) => s.quote.lines)
  const addLine = useStore((s) => s.addLine)
  const removeLine = useStore((s) => s.removeLine)
  const priceListId = useStore((s) => s.priceListId())
  useEscape(onClose)
  const { missing, blocks } = configCheck(lines)

  return (
    <div className="fixed inset-0 bg-black/45 z-40 flex p-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="m-auto bg-surface rounded-lg shadow-modal w-full max-w-[520px] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 h-12 border-b border-line shrink-0">
          <span className="text-[15px] font-semibold">Configuration check</span>
          <button onClick={onClose} aria-label="Close"><X size={18} className="text-ink-muted" /></button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto p-5 flex flex-col gap-3">
          {blocks.length === 0 && missing.length === 0 && (
            <div className="flex items-center gap-2 text-[13px] text-[var(--c-success)]">
              <Check size={16} /> Configuration looks good — nothing missing or incompatible.
            </div>
          )}

          {blocks.map((b, i) => (
            <div key={i} className="rounded-md p-3 border" style={{ borderColor: 'var(--c-danger)', background: 'var(--c-danger-bg)' }}>
              <div className="flex items-center gap-2 text-[13px] font-medium" style={{ color: 'var(--c-danger)' }}>
                <AlertOctagon size={15} /> Incompatible items — must resolve
              </div>
              <div className="text-[12px] text-ink-secondary mt-1">{b.reason}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[b.a, b.b].map((p) => (
                  <button
                    key={p.sku}
                    onClick={() => { const l = lines.find((x) => x.sku === p.sku); if (l) removeLine(l.id) }}
                    className="inline-flex items-center gap-1 text-[12px] border border-line rounded-sm px-2 py-1 bg-surface hover:bg-surface-2"
                  >
                    <Trash2 size={12} /> Remove {p.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {missing.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#7a4d00]">
                <AlertTriangle size={15} /> Likely missing essentials
              </div>
              <div className="text-[12px] text-ink-muted mt-0.5 mb-2">Common companions for what you added — add any that apply.</div>
              <div className="flex flex-col gap-2">
                {missing.map((p) => (
                  <div key={p.sku} className="flex items-center gap-2 border border-line rounded-sm p-2">
                    <ProductThumb product={p} size={16} className="w-9 h-9 rounded-sm shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] text-ink truncate">{p.name}</div>
                      <div className="text-[11px] text-ink-muted">{p.category} · {money(priceFor(p, priceListId))}</div>
                    </div>
                    <Button onClick={() => addLine(p.sku)}><Plus size={13} /> Add</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 h-14 border-t border-line flex items-center justify-between shrink-0">
          <span className="text-[12px] text-ink-muted">{blocks.length > 0 ? 'Resolve incompatibilities to continue' : 'Warnings are optional'}</span>
          <div className="flex gap-2">
            <Button onClick={onClose}>Back</Button>
            <Button variant="primary" disabled={blocks.length > 0} onClick={() => { onGenerate(); onClose() }}>Generate quote</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
