import type { Quote } from '@/lib/types'
import { upsertSession, getSession } from '@/lib/supabase'

// Buyer name/badge are denormalized onto the shared payload so the buyer page
// can show them even for a just-registered account not in the mock list (finding 2).
export interface SharedQuote {
  quote: Quote
  buyerName: string | null
  badge: string | null
}

const key = (id: string) => `cpq:quote:${id}`

export async function saveSharedQuote(quote: Quote, buyerName: string | null, badge: string | null): Promise<void> {
  await upsertSession(key(quote.id), { quote, buyerName, badge } satisfies SharedQuote)
}

export async function loadSharedQuote(id: string): Promise<SharedQuote | null> {
  return getSession<SharedQuote>(key(id))
}
