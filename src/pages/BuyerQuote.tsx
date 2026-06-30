import { useParams } from 'react-router-dom'

// Buyer-facing read-only quote + next actions (SPEC Scenario 4). Placeholder —
// the foundation owner builds this alongside the quote slice.
export function BuyerQuote() {
  const { quoteId = '' } = useParams()
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-surface border border-line rounded-md p-5 shadow-card text-center">
        <div className="text-[16px] font-semibold">Quote {quoteId}</div>
        <p className="text-[12px] text-ink-muted mt-2">
          Buyer-facing read-only quote with next actions is a Phase-1 slice (features/quote). Placeholder.
        </p>
      </div>
    </div>
  )
}
