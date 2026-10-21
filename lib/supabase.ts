import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazily created — safe at build time when env vars may be absent
let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  _client = createClient(url, key)
  return _client
}

// Used by the cron route (server-side only)
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// PostgREST renvoie au plus 1 000 lignes par requête : au-delà, il faut paginer avec range().
const PAGE = 1000
const REQUETES_PARALLELES = 8

export type Lecture<T> = (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>

/** Lit les lignes [debut, fin[ par pages de 1 000, plusieurs pages à la fois. */
export async function lirePagine<T>(debut: number, fin: number, lire: Lecture<T>): Promise<T[]> {
  const pages: number[] = []
  for (let from = debut; from < fin; from += PAGE) pages.push(from)

  const out: T[] = []
  for (let i = 0; i < pages.length; i += REQUETES_PARALLELES) {
    const lot = await Promise.all(
      pages.slice(i, i + REQUETES_PARALLELES).map(async (from) => {
        const { data, error } = await lire(from, Math.min(from + PAGE, fin) - 1)
        if (error) throw new Error(error.message)
        return data ?? []
      }),
    )
    for (const rows of lot) out.push(...rows)
  }
  return out
}
