import { useState } from 'react'
import { UserPlus, ChevronDown, X, ArrowLeft, Check, ShieldCheck } from 'lucide-react'
import type { Account } from '@/lib/types'
import { useStore } from '@/lib/store'
import { searchAccounts, contactsForAccount } from '@/data/accounts'
import { Button, Chip } from '@/components/ui/primitives'

function gen4() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

// Top-right header action (SPEC §6.1). Identify / register a buyer, then validate
// the persona — visually (contact photo) or with a code (imitated OTP).
export function BuyerIdentify() {
  const buyer = useStore((s) => s.buyer)
  const verified = useStore((s) => s.verified)
  const setBuyer = useStore((s) => s.setBuyer)
  const registerBuyer = useStore((s) => s.registerBuyer)
  const verifyBuyer = useStore((s) => s.verifyBuyer)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'search' | 'register' | 'verify'>('search')
  const [q, setQ] = useState('')
  const [reg, setReg] = useState({ name: '', phone: '', email: '' })
  const [sel, setSel] = useState<Account | null>(null)
  const [sentCode, setSentCode] = useState<string | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const results = searchAccounts(q)
  const contact = sel ? contactsForAccount(sel.id)[0] : null

  function close() {
    setOpen(false)
    setMode('search')
    setReg({ name: '', phone: '', email: '' })
    setQ('')
    setSel(null)
    setSentCode(null)
    setCodeInput('')
  }

  function selectAccount(a: Account) {
    setBuyer(a.id)
    setSel(a)
    setSentCode(null)
    setCodeInput('')
    setMode('verify')
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 h-8 px-3 rounded-md bg-white/10 hover:bg-white/15 text-[13px]">
        <UserPlus size={15} />
        {buyer ? (
          <span className="text-white flex items-center gap-1">{buyer.name}{verified && <Check size={13} className="text-[var(--c-success)]" />}</span>
        ) : (
          <span className="text-white/80">Identify buyer</span>
        )}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[320px] bg-surface text-ink rounded-md shadow-modal border border-line p-3 z-50">
          {mode === 'search' && (
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
                  <button key={a.id} onClick={() => selectAccount(a)} className="text-left p-2 rounded-sm hover:bg-surface-2 border border-transparent">
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
                <button onClick={() => { setBuyer(null); close() }} className="mt-1 block text-[12px] text-ink-muted">Clear buyer (standard pricing)</button>
              )}
            </>
          )}

          {mode === 'register' && (
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
              <Button variant="primary" className="w-full justify-center mt-2" disabled={!reg.name.trim()} onClick={() => { registerBuyer({ name: reg.name.trim(), phone: reg.phone.trim(), email: reg.email.trim() }); close() }}>
                Create buyer
              </Button>
            </>
          )}

          {mode === 'verify' && sel && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setMode('search')} aria-label="Back"><ArrowLeft size={15} className="text-ink-muted" /></button>
                <span className="text-[13px] font-medium">Verify identity</span>
              </div>
              <div className="flex items-center gap-3">
                {contact?.photo ? (
                  <img src={contact.photo} alt={contact.name} className="w-14 h-14 rounded-full object-cover border border-line" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-surface-2 border border-line flex items-center justify-center text-[15px] font-medium text-ink-muted">
                    {(contact?.name ?? sel.name).slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-[14px] font-medium">{contact?.name ?? sel.name}</div>
                  <div className="text-[12px] text-ink-muted">{sel.name}</div>
                  <div className="text-[12px] text-ink-muted">{sel.phone}</div>
                </div>
              </div>
              <p className="text-[11px] text-ink-muted mt-2">Check the photo against the person, or send a one-time code to their phone.</p>
              <Button variant="primary" className="w-full justify-center mt-2" onClick={() => { verifyBuyer(); close() }}>
                <ShieldCheck size={14} /> Photo matches — verify
              </Button>

              <div className="mt-3 border-t border-line pt-3">
                {!sentCode ? (
                  <Button className="w-full justify-center" onClick={() => setSentCode(gen4())}>Send code to {sel.phone}</Button>
                ) : (
                  <>
                    <div className="text-[12px] text-ink-muted mb-1">Code sent to {sel.phone}. <span className="text-ink-secondary">(demo: {sentCode})</span></div>
                    <input
                      autoFocus
                      value={codeInput}
                      onChange={(e) => {
                        const v = e.target.value
                        setCodeInput(v)
                        if (v === sentCode) { verifyBuyer(); close() }
                      }}
                      placeholder="Enter the code the buyer reads back"
                      aria-label="Verification code"
                      className="w-full h-9 rounded-sm border border-line px-3 text-[13px] outline-none focus:border-primary"
                    />
                  </>
                )}
              </div>
              <button onClick={close} className="mt-2 text-[12px] text-ink-muted">Skip verification for now</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
