import { CheckCircle2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/primitives'

export function OrderConfirmStub() {
  const quote = useStore((s) => s.quote)
  const setView = useStore((s) => s.setView)
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="bg-surface border border-line rounded-md p-8 text-center shadow-card max-w-[420px]">
        <CheckCircle2 size={40} className="text-[var(--c-success)] mx-auto mb-3" />
        <div className="text-[16px] font-semibold">Order created (placeholder)</div>
        <div className="text-[12px] text-ink-muted mt-1">
          From quote {quote.number}. No real payment or fulfilment — out of scope (SPEC §14).
        </div>
        <Button className="mt-4" onClick={() => setView('catalog')}>Back to catalogue</Button>
      </div>
    </div>
  )
}
