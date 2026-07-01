import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null = url && anon ? createClient(url, anon) : null
// True → real cross-device (scan the QR with a phone). False → the app still works
// same-browser cross-tab via the BroadcastChannel fallback below (finding 3).
export const SUPABASE_READY = supabase !== null

const TABLE = 'sessions' // { id text pk, data jsonb, updated_at timestamptz }
const KEY = (id: string) => `cpq:session:${id}`
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('cpq-session') : null

export async function upsertSession(id: string, data: unknown): Promise<void> {
  if (supabase) {
    await supabase.from(TABLE).upsert({ id, data, updated_at: new Date().toISOString() })
    return
  }
  // No backend: persist for reload + notify other tabs on this device.
  try {
    localStorage.setItem(KEY(id), JSON.stringify(data))
  } catch {
    /* ignore */
  }
  channel?.postMessage({ id, data })
}

export async function getSession<T = unknown>(id: string): Promise<T | null> {
  if (supabase) {
    const { data } = await supabase.from(TABLE).select('data').eq('id', id).maybeSingle()
    return ((data?.data as T) ?? null) as T | null
  }
  try {
    const raw = localStorage.getItem(KEY(id))
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function subscribeSession(id: string, cb: (data: unknown) => void): () => void {
  if (supabase) {
    const ch = supabase
      .channel(`session:${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE, filter: `id=eq.${id}` }, (payload) =>
        cb((payload.new as { data?: unknown } | null)?.data),
      )
      .subscribe()
    return () => {
      supabase?.removeChannel(ch)
    }
  }
  if (!channel) return () => {}
  const handler = (e: MessageEvent) => {
    if (e.data?.id === id) cb(e.data.data)
  }
  channel.addEventListener('message', handler)
  return () => channel.removeEventListener('message', handler)
}
