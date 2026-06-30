import type { Quote } from '@/lib/types'
import { SUPABASE_READY, upsertSession, getSession } from '@/lib/supabase'

// Persist a shared quote so the buyer page (/q/:id) can load it. Uses Supabase
// when configured (cross-device), else localStorage (same-device, multi-tab).
const key = (id: string) => `cpq:quote:${id}`

export async function saveSharedQuote(quote: Quote): Promise<void> {
  try {
    localStorage.setItem(key(quote.id), JSON.stringify(quote))
  } catch {
    /* ignore */
  }
  if (SUPABASE_READY) await upsertSession(key(quote.id), quote)
}

export async function loadSharedQuote(id: string): Promise<Quote | null> {
  if (SUPABASE_READY) {
    const remote = await getSession<Quote>(key(id))
    if (remote) return remote
  }
  try {
    const raw = localStorage.getItem(key(id))
    return raw ? (JSON.parse(raw) as Quote) : null
  } catch {
    return null
  }
}
