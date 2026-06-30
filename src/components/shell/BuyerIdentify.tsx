import { useState } from 'react'
import { UserPlus, ChevronDown, X } from 'lucide-react'
import { useStore } from '@/lib/store'
import { searchAccounts } from '@/data/accounts'
import { Chip } from '@/components/ui/primitives'

// Top-right header action, available any time. Picking / switching the buyer
// re-prices the whole quote (SPEC §6.1, §7, §9). Register is a Phase-1 detail.
export function BuyerIdentify() {
  const buyer = useStore((s) => s.buyer)
  const setBuyer = useStore((s) => s.setBuyer)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const results = searchAccounts(q)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-8 px-3 rounded-md bg-white/10 hover:bg-white/15 text-[13px]"
      >
        <UserPlus size={15} />
        {buyer ? <span className="text-white">{buyer.name}</span> : <span className="text-white/80">Identify buyer</span>}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[320px] bg-surface text-ink rounded-md shadow-modal border border-line p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium">Identify buyer</span>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X size={15} className="text-ink-muted" />
            </button>
          </div>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Phone, email or Pro ID"
            className="w-full h-9 rounded-sm border border-line px-3 text-[13px] outline-none focus:border-primary"
          />
          <div className="mt-2 flex flex-col gap-1 max-h-[220px] overflow-auto">
            {results.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setBuyer(a.id)
                  setOpen(false)
                }}
                className="text-left p-2 rounded-sm hover:bg-surface-2 border border-transparent"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium">{a.name}</span>
                  {a.vip && <Chip tone="neutral">VIP</Chip>}
                </div>
                <div className="text-[12px] text-ink-muted">
                  {a.phone} · {a.externalId}
                </div>
                {a.eligibilityBadge && (
                  <div className="mt-1">
                    <Chip tone="green">{a.eligibilityBadge}</Chip>
                  </div>
                )}
              </button>
            ))}
            {results.length === 0 && (
              <div className="text-[12px] text-ink-muted p-2">No match. Quick-register is a Phase-1 slice.</div>
            )}
          </div>
          {buyer && (
            <button
              onClick={() => {
                setBuyer(null)
                setOpen(false)
              }}
              className="mt-2 text-[12px] text-primary"
            >
              Clear buyer (use standard pricing)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
