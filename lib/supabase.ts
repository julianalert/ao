import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  if (!_client) _client = createClient(url, key)
  return _client
}

// Convenience singleton — safe to call at module level only in server context
export function getSupabaseOrThrow(): SupabaseClient {
  const client = getSupabase()
  if (!client) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return client
}

// Legacy default export used across the codebase — resolved lazily
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase()
    if (!client) return () => ({ data: null, error: { message: 'Supabase not configured' } })
    return (client as unknown as Record<string | symbol, unknown>)[prop]
  },
})
