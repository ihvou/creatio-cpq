import { useState } from 'react'
import { UserPlus, ChevronDown, X, ArrowLeft, Check, ShieldCheck } from 'lucide-react'
import type { Account, Contact } from '@/lib/types'
import { useStore } from '@/lib/store'
import { searchAccounts, contactsForAccount } from '@/data/accounts'
import { cn } from '@/lib/util'
import { Button, Chip } from '@/components/ui/primitives'

function gen4() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function Avatar({ photo, name, size }: { photo?: string; name: string; size: number }) {
  const [broken, setBroken] = useState(false)
  return (
    <div
      className="rounded-full bg-surface-2 border border-line flex items-center justify-center overflow-hidden shrink-0 text-ink-muted font-medium"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {photo && !broken ? (
        <img src={photo} alt="" onError={() => setBroken(true)} className="w-full h-full object-cover" />
      ) : (
        (name || '?').slice(0, 1).toUpperCase()
      )}
    </div>
  )
}

// Top-right header action (SPEC §6.1). Identify / register a buyer (business or
// individual), then validate the persona — visually (photo) or with a code (OTP).
export function BuyerIdentify() {
  const buyer = useStore((s) => s.buyer)
  const buyerContact = useStore((s) => s.contact)
  const verified = useStore((s) => s.verified)
  const setBuyer = useStore((s) => s.setBuyer)
  const registerBuyer = useStore((s) => s.registerBuyer)
  const verifyBuyer = useStore((s) => s.verifyBuyer)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'search' | 'register' | 'verify'>('search')
  const [q, setQ] = useState('')
  const [kind, setKind] = useState<'company' | 'individual'>('company')
  const [reg, setReg] = useState({ name: '', phone: '', email: '' })
  const [sel, setSel] = useState<Account | null>(null)
  const [sentCode, setSentCode] = useState<string | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const results = searchAccounts(q)
  const selContact: Contact | undefined = sel ? contactsForAccount(sel.id)[0] : undefined

  function close() {
    setOpen(false)
    setMode('search')
    setKind('company')
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
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 h-8 pl-1.5 pr-3 rounded-md bg-white/10 hover:bg-white/15 text-[13px]">
        {buyer ? <Avatar photo={buyerContact?.photo} name={buyer.name} size={22} /> : <UserPlus size={15} className="ml-1" />}
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
              <div className="mt-2 flex flex-col gap-1 max-h-[220px] overflow-auto">
                {results.map((a) => {
                  const c = contactsForAccount(a.id)[0]
                  return (
                    <button key={a.id} onClick={() => selectAccount(a)} className="flex items-center gap-2 text-left p-2 rounded-sm hover:bg-surface-2 border border-transparent">
                      <Avatar photo={c?.photo} name={a.name} size={34} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-medium truncate">{a.name}</span>
                          {a.vip && <Chip tone="neutral">VIP</Chip>}
                        </div>
                        <div className="text-[12px] text-ink-muted truncate">
                          {a.type === 'company' && c ? `${c.name} · ` : ''}{a.phone}
                        </div>
                        {a.eligibilityBadge && <div className="mt-1"><Chip tone="green">{a.eligibilityBadge}</Chip></div>}
                      </div>
                    </button>
                  )
                })}
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
              <div className="flex gap-1 mb-2">
                {(['company', 'individual'] as const).map((k) => (
                  <button key={k} onClick={() => setKind(k)} className={cn('flex-1 h-8 rounded-sm text-[12px] border', kind === k ? 'border-primary text-primary bg-[var(--c-info-bg)]' : 'border-line text-ink-secondary hover:bg-surface-2')}>
                    {k === 'company' ? 'Business' : 'Individual'}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <input autoFocus value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} placeholder={kind === 'company' ? 'Business name' : 'Full name'} aria-label="Buyer name" className="w-full h-9 rounded-sm border border-line px-3 text-[13px] outline-none focus:border-primary" />
                <input value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} placeholder="Phone" aria-label="Phone" className="w-full h-9 rounded-sm border border-line px-3 text-[13px] outline-none focus:border-primary" />
                <input value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} placeholder="Email" aria-label="Email" className="w-full h-9 rounded-sm border border-line px-3 text-[13px] outline-none focus:border-primary" />
              </div>
              <p className="text-[11px] text-ink-muted mt-2">New buyers use standard pricing until a Pro account is linked.</p>
              <Button variant="primary" className="w-full justify-center mt-2" disabled={!reg.name.trim()} onClick={() => { registerBuyer({ name: reg.name.trim(), phone: reg.phone.trim(), email: reg.email.trim(), type: kind }); close() }}>
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
                <Avatar photo={selContact?.photo} name={selContact?.name ?? sel.name} size={56} />
                <div className="min-w-0">
                  <div className="text-[14px] font-medium">{selContact?.name ?? sel.name}</div>
                  {sel.type === 'company' && <div className="text-[12px] text-ink-muted">Contact · {sel.name}</div>}
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
