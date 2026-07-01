import { useState } from 'react'
import { UserPlus, ChevronDown, X, ArrowLeft } from 'lucide-react'
import { useStore } from '@/lib/store'
import { searchAccounts } from '@/data/accounts'
import { Button, Chip } from '@/components/ui/primitives'

// Top-right header action, available any time (SPEC §6.1). Identify an existing
// account or quick-register a new buyer; either re-prices the whole quote.
export function BuyerIdentify() {
  const buyer = useStore((s) => s.buyer)
  const setBuyer = useStore((s) => s.setBuyer)
  const registerBuyer = useStore((s) => s.registerBuyer)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'search' | 'register'>('search')
  const [q, setQ] = useState('')
  const [reg, setReg] = useState({ name: '', phone: '', email: '' })
  const results = searchAccounts(q)

  function close() {
    setOpen(false)
    setMode('search')
    setReg({ name: '', phone: '', email: '' })
    setQ('')
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 h-8 px-3 rounded-md bg-white/10 hover:bg-white/15 text-[13px]">
        <UserPlus size={15} />
        {buyer ? <span className="text-white">{buyer.name}</span> : <span className="text-white/80">Identify buyer</span>}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[320px] bg-surface text-ink rounded-md shadow-modal border border-line p-3 z-50">
          {mode === 'search' ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium">Identify buyer</span>
                <button onClick={close} aria-label="Close"><X size={15} className="text-ink-muted" /></button>
              </div>
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Phone, email or Pro ID"
                aria-label="Search buyer"
                className="w-full h-9 rounded-sm border border-line px-3 text-[13px] outline-none focus:border-primary"
              />
              <div className="mt-2 flex flex-col gap-1 max-h-[200px] overflow-auto">
                {results.map((a) => (
                  <button key={a.id} onClick={() => { setBuyer(a.id); close() }} className="text-left p-2 rounded-sm hover:bg-surface-2 border border-transparent">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium">{a.name}</span>
                      {a.vip && <Chip tone="neutral">VIP</Chip>}
                    </div>
                    <div className="text-[12px] text-ink-muted">{a.phone} · {a.externalId}</div>
                    {a.eligibilityBadge && <div className="mt-1"><Chip tone="green">{a.eligibilityBadge}</Chip></div>}
                  </button>
                ))}
                {results.length === 0 && <div className="text-[12px] text-ink-muted p-2">No match.</div>}
              </div>
              <button onClick={() => setMode('register')} className="mt-2 w-full text-[12px] text-primary text-left">+ Register a new buyer</button>
              {buyer && (
                <button onClick={() => { setBuyer(null); close() }} className="mt-1 block text-[12px] text-ink-muted">
                  Clear buyer (standard pricing)
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setMode('search')} aria-label="Back"><ArrowLeft size={15} className="text-ink-muted" /></button>
                <span className="text-[13px] font-medium">Register a new buyer</span>
              </div>
              <div className="flex flex-col gap-2">
                <input autoFocus value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} placeholder="Company or contact name" aria-label="Buyer name" className="w-full h-9 rounded-sm border border-line px-3 text-[13px] outline-none focus:border-primary" />
                <input value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} placeholder="Phone" aria-label="Phone" className="w-full h-9 rounded-sm border border-line px-3 text-[13px] outline-none focus:border-primary" />
                <input value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} placeholder="Email" aria-label="Email" className="w-full h-9 rounded-sm border border-line px-3 text-[13px] outline-none focus:border-primary" />
              </div>
              <p className="text-[11px] text-ink-muted mt-2">New buyers use standard pricing until a Pro account is linked.</p>
              <Button
                variant="primary"
                className="w-full justify-center mt-2"
                disabled={!reg.name.trim()}
                onClick={() => { registerBuyer({ name: reg.name.trim(), phone: reg.phone.trim(), email: reg.email.trim() }); close() }}
              >
                Create buyer
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
