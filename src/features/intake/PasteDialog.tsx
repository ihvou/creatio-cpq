import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore } from '@/lib/store'
import { parseList } from '@/lib/parse'
import { SAMPLE_PASTE } from '@/data/sampleIntake'
import { Button } from '@/components/ui/primitives'

// Minimal intake feeder (foundation seed). Runs the emulated parse and adds the
// confident matches to the list. Slice C extends this into full reconciliation
// (low-confidence pick-from-candidates / unmatched search) + QR + realtime.
export function PasteDialog({ onClose }: { onClose: () => void }) {
  const applyParsed = useStore((s) => s.applyParsed)
  const [text, setText] = useState(SAMPLE_PASTE)
  const [done, setDone] = useState<{ added: number; review: number } | null>(null)

  function run() {
    const parsed = parseList(text)
    const high = parsed.filter((p) => p.sku && p.confidence === 'high')
    applyParsed(parsed)
    setDone({ added: high.length, review: parsed.length - high.length })
  }

  return (
    <div className="fixed inset-0 bg-black/45 z-40 flex p-6">
      <div className="m-auto bg-surface rounded-lg shadow-modal w-full max-w-[460px] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-semibold">Paste a list</span>
          <button onClick={onClose} aria-label="Close"><X size={18} className="text-ink-muted" /></button>
        </div>
        {done ? (
          <div className="text-[13px]">
            <div className="text-[var(--c-success)]">Added {done.added} matched item{done.added === 1 ? '' : 's'} to your list.</div>
            {done.review > 0 && (
              <div className="text-ink-muted mt-1">
                {done.review} item{done.review === 1 ? '' : 's'} need review (low-confidence / unmatched) — full reconciliation is slice C.
              </div>
            )}
            <Button className="mt-4" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <p className="text-[12px] text-ink-muted mb-2">Paste from a text, email or spreadsheet. Each line is matched to the catalogue.</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="w-full border border-line rounded-sm p-2 text-[13px] outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={run}>Add to list</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
