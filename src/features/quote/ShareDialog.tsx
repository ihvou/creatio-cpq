import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Copy, Mail, Check } from 'lucide-react'
import { useStore } from '@/lib/store'
import { saveSharedQuote } from './quoteShare'
import { Button } from '@/components/ui/primitives'

// Share the quote: QR + link + email (SPEC §7 / Scenario 4). On open it marks
// the quote shared and persists it so the buyer page (/q/:id) can load it.
export function ShareDialog({ onClose }: { onClose: () => void }) {
  const quote = useStore((s) => s.quote)
  const buyer = useStore((s) => s.buyer)
  const shareQuote = useStore((s) => s.shareQuote)
  const [copied, setCopied] = useState(false)
  const url = `${location.origin}/q/${quote.id}`

  useEffect(() => {
    shareQuote()
    void saveSharedQuote({ ...quote, status: 'shared' }, buyer?.name ?? null, buyer?.eligibilityBadge ?? null)
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  const mailto = `mailto:${buyer?.email ?? ''}?subject=${encodeURIComponent(`Quote ${quote.number}`)}&body=${encodeURIComponent(`Your quote ${quote.number}: ${url}`)}`

  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex p-6">
      <div className="m-auto bg-surface rounded-lg shadow-modal w-full max-w-[420px] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-semibold">Share quote {quote.number}</span>
          <button onClick={onClose} aria-label="Close"><X size={18} className="text-ink-muted" /></button>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-white border border-line rounded-md">
            <QRCodeSVG value={url} size={140} />
          </div>
          <div className="text-[12px] text-ink-muted text-center">Scan to open on the buyer's phone, or share the link.</div>
          <div className="w-full flex items-center gap-2 border border-line rounded-sm px-2 h-9 text-[12px] text-ink-secondary">
            <span className="truncate flex-1">{url}</span>
            <button onClick={copy} className="text-primary inline-flex items-center gap-1">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <a href={mailto} className="w-full">
            <Button className="w-full justify-center"><Mail size={14} /> Email to buyer</Button>
          </a>
        </div>
        <p className="text-[11px] text-ink-muted mt-3 text-center">
          A shared quote is a saved proposal, not an order — the buyer opens it and chooses an action, or you convert it.
        </p>
      </div>
    </div>
  )
}
