import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { SAMPLE_PASTE } from '@/data/sampleIntake'
import { upsertSession, SUPABASE_READY } from '@/lib/supabase'

// Buyer-phone temp-link landing (SPEC Scenario 2). Stub: writes the paste to the
// shared session. Codex builds the full reconciliation handoff (features/intake).
export function IntakePaste() {
  const { sessionId = '' } = useParams()
  const [text, setText] = useState(SAMPLE_PASTE)
  const [sent, setSent] = useState(false)

  async function send() {
    await upsertSession(sessionId, { paste: text, at: new Date().toISOString() })
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-surface border border-line rounded-md p-5 shadow-card">
        <div className="text-[16px] font-semibold mb-1">Send your list</div>
        <div className="text-[12px] text-ink-muted mb-3">
          Session {sessionId.slice(0, 8)} {SUPABASE_READY ? '' : '· offline mode'}
        </div>
        {sent ? (
          <div className="text-[13px] text-[var(--c-success)]">Sent to the consultant. You can put your phone down.</div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              className="w-full border border-line rounded-sm p-2 text-[13px] outline-none focus:border-primary"
            />
            <button onClick={send} className="mt-3 w-full bg-primary text-white rounded-sm py-2 text-[13px] font-medium">
              Send to consultant
            </button>
            <p className="text-[11px] text-ink-muted mt-2">
              Full reconciliation is a Codex slice (features/intake). This stub writes the paste to the shared session.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
