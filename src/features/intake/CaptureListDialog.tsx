import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Search, Check } from 'lucide-react'
import type { ParsedLine, PriceListId } from '@/lib/types'
import { useStore } from '@/lib/store'
import { parseList } from '@/lib/parse'
import { SAMPLE_PASTE } from '@/data/sampleIntake'
import { productBySku, searchCatalog } from '@/data/catalog'
import { subscribeSession, SUPABASE_READY } from '@/lib/supabase'
import { priceFor } from '@/lib/pricing'
import { money } from '@/lib/format'
import { genId, cn } from '@/lib/util'
import { useEscape } from '@/lib/useEscape'
import { Button, Chip } from '@/components/ui/primitives'

// Intake (SPEC Scenario 2, §10). Capture the buyer's list via a QR temp link
// (buyer pastes on their phone → Supabase realtime) or the consultant pastes
// directly. Then reconcile: matched / choose-from-candidates / unmatched-search.
type Row = ParsedLine & { resolvedSku: string | null; include: boolean }

function toRows(parsed: ParsedLine[]): Row[] {
  return parsed.map((p) => ({ ...p, resolvedSku: p.sku, include: p.sku != null }))
}

export function CaptureListDialog({ onClose }: { onClose: () => void }) {
  const addLine = useStore((s) => s.addLine)
  const priceListId = useStore((s) => s.priceListId())
  const sessionId = useRef(genId('sess')).current
  const [phase, setPhase] = useState<'capture' | 'reconcile'>('capture')
  const [text, setText] = useState(SAMPLE_PASTE)
  const [rows, setRows] = useState<Row[]>([])

  useEscape(onClose)

  useEffect(() => {
    const unsub = subscribeSession(sessionId, (data) => {
      const paste = (data as { paste?: unknown } | null)?.paste
      if (typeof paste === 'string' && paste.trim()) {
        setText(paste)
        setRows(toRows(parseList(paste)))
        setPhase('reconcile')
      }
    })
    return unsub
  }, [sessionId])

  function parse() {
    setRows(toRows(parseList(text)))
    setPhase('reconcile')
  }

  function update(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  function addAll() {
    rows.forEach((r) => {
      if (r.include && r.resolvedSku) addLine(r.resolvedSku, r.qty)
    })
    onClose()
  }

  const url = `${location.origin}/t/${sessionId}`
  const includedCount = rows.filter((r) => r.include && r.resolvedSku).length

  return (
    <div className="fixed inset-0 bg-black/45 z-40 flex p-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="m-auto bg-surface rounded-lg shadow-modal w-full max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 h-12 border-b border-line shrink-0">
          <span className="text-[15px] font-semibold">Capture the buyer's list</span>
          <button onClick={onClose} aria-label="Close"><X size={18} className="text-ink-muted" /></button>
        </div>

        {phase === 'capture' ? (
          <div className="p-5 flex gap-5">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="p-3 bg-white border border-line rounded-md"><QRCodeSVG value={url} size={130} /></div>
              <div className="text-[12px] text-ink-muted text-center w-[150px]">
                Scan to paste from the buyer's phone{SUPABASE_READY ? '' : ' — needs Supabase (offline now)'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[12px] text-ink-muted">Or paste the list here</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                className="mt-1 w-full border border-line rounded-sm p-2 text-[13px] outline-none focus:border-primary"
              />
              <div className="flex justify-end mt-3">
                <Button variant="primary" onClick={parse} disabled={!text.trim()}>Parse list</Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-auto p-5 flex flex-col gap-2">
              {rows.map((r, i) => (
                <ReconRow key={i} row={r} priceListId={priceListId} onChange={(patch) => update(i, patch)} />
              ))}
            </div>
            <div className="px-5 h-14 border-t border-line flex items-center justify-between shrink-0">
              <button onClick={() => setPhase('capture')} className="text-[12px] text-ink-muted">← Back</button>
              <Button variant="primary" onClick={addAll} disabled={includedCount === 0}>
                Add {includedCount} item{includedCount === 1 ? '' : 's'} to the list
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ReconRow({ row, priceListId, onChange }: { row: Row; priceListId: PriceListId; onChange: (patch: Partial<Row>) => void }) {
  const [q, setQ] = useState('')
  const matched = row.resolvedSku ? productBySku(row.resolvedSku) : undefined
  const status = row.sku && row.confidence === 'high' ? 'high' : row.sku && row.confidence === 'low' ? 'low' : 'unmatched'
  const chip =
    status === 'high'
      ? { tone: 'green' as const, label: 'Matched' }
      : status === 'low'
        ? { tone: 'yellow' as const, label: 'Choose' }
        : row.resolvedSku
          ? { tone: 'green' as const, label: 'Resolved' }
          : { tone: 'red' as const, label: 'Unmatched' }

  return (
    <div className="border border-line rounded-sm p-3">
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-ink-muted flex-1 truncate">"{row.rawLine}"</span>
        <Chip tone={chip.tone}>{chip.label}</Chip>
        {row.resolvedSku && (
          <label className="flex items-center gap-1 text-[12px] text-ink-secondary">
            <input type="checkbox" checked={row.include} onChange={(e) => onChange({ include: e.target.checked })} /> include
          </label>
        )}
      </div>

      {matched && (
        <div className="mt-2 flex items-center gap-2 text-[13px]">
          <Check size={14} className="text-[var(--c-success)]" />
          <span className="flex-1">{matched.name} <span className="text-ink-muted">· qty {row.qty}</span></span>
          <span className="font-medium">{money(priceFor(matched, priceListId))}</span>
        </div>
      )}

      {status === 'low' && row.candidateSkus && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {row.candidateSkus.map((sku) => {
            const p = productBySku(sku)
            if (!p) return null
            const sel = row.resolvedSku === sku
            return (
              <button
                key={sku}
                onClick={() => onChange({ resolvedSku: sku, include: true })}
                className={cn('text-[12px] px-2 py-1 rounded-sm border', sel ? 'border-primary text-primary bg-[var(--c-info-bg)]' : 'border-line text-ink-secondary hover:bg-surface-2')}
              >
                {p.name}
              </button>
            )
          })}
        </div>
      )}

      {status === 'unmatched' && !row.resolvedSku && (
        <div className="mt-2">
          <div className="flex items-center gap-2 border border-line rounded-sm px-2 h-8">
            <Search size={13} className="text-ink-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the catalogue to match…"
              className="flex-1 text-[12px] outline-none bg-transparent"
            />
          </div>
          {q.trim() && (
            <div className="mt-1 border border-line rounded-sm overflow-hidden">
              {searchCatalog(q).slice(0, 4).map((p) => (
                <button
                  key={p.sku}
                  onClick={() => onChange({ resolvedSku: p.sku, include: true })}
                  className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-surface-2 border-b border-line last:border-0"
                >
                  {p.name} <span className="text-ink-muted">· {p.sku}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
