import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Null when env is not configured → the app runs single-device and degrades
// gracefully (see SUPABASE_READY guards in the intake / quote slices).
export const supabase: SupabaseClient | null = url && anon ? createClient(url, anon) : null
export const SUPABASE_READY = supabase !== null

const TABLE = 'sessions' // { id uuid pk, data jsonb, updated_at timestamptz }

export async function upsertSession(id: string, data: unknown): Promise<void> {
  if (!supabase) return
  await supabase.from(TABLE).upsert({ id, data, updated_at: new Date().toISOString() })
}

export async function getSession<T = unknown>(id: string): Promise<T | null> {
  if (!supabase) return null
  const { data } = await supabase.from(TABLE).select('data').eq('id', id).maybeSingle()
  return ((data?.data as T) ?? null) as T | null
}

export function subscribeSession(id: string, cb: (data: unknown) => void): () => void {
  if (!supabase) return () => {}
  const channel = supabase
    .channel(`session:${id}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE, filter: `id=eq.${id}` },
      (payload) => cb((payload.new as { data?: unknown } | null)?.data),
    )
    .subscribe()
  return () => {
    supabase?.removeChannel(channel)
  }
}
