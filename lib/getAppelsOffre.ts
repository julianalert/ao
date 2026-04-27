import { supabase } from './supabase'

export const PAGE_SIZE = 20

// The three type_marche slugs that map directly to DB enum values
export const TYPE_MARCHE_SLUGS = new Set(['travaux', 'services', 'fournitures'])

export type AoFilters = {
  type?: string        // type_marche
  procedure?: string
  region?: string
  date_limite?: string // ISO date — show AOs expiring before this date
  secteur?: string     // CPV categorie slug
  page?: number
}

export type PaginatedResult = {
  data: AppelOffre[]
  count: number
  page: number
  totalPages: number
}

function paginatedRange(page: number): [number, number] {
  const p = Math.max(1, page)
  const from = (p - 1) * PAGE_SIZE
  return [from, from + PAGE_SIZE - 1]
}

function toPaginatedResult(
  data: AppelOffre[] | null,
  count: number | null,
  page: number,
): PaginatedResult {
  const total = count ?? 0
  return {
    data: data ?? [],
    count: total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  }
}

// ─── Home ─────────────────────────────────────────────────────────────────────

export async function getLatestAppelsOffre(filters: AoFilters = {}): Promise<PaginatedResult> {
  const page = filters.page ?? 1
  const [from, to] = paginatedRange(page)

  let q = supabase
    .from('appels_offre')
    .select('*', { count: 'exact' })
    .order('date_publication', { ascending: false })
    .range(from, to)

  if (filters.type) q = q.eq('type_marche', filters.type)
  if (filters.procedure) q = q.eq('procedure', filters.procedure)
  if (filters.region) q = q.eq('region', filters.region)
  if (filters.date_limite) q = q.lte('date_limite', new Date(filters.date_limite).toISOString())
  if (filters.secteur) q = q.eq('categorie', filters.secteur)

  const { data, error, count } = await q
  if (error) { console.error('getLatestAppelsOffre error:', error); return toPaginatedResult([], 0, page) }
  return toPaginatedResult(data as AppelOffre[], count, page)
}

// ─── By category (type_marche or CPV categorie) ───────────────────────────────

export async function getAppelsOffreByCategorie(
  categorie: string,
  filters: AoFilters = {},
): Promise<PaginatedResult> {
  const page = filters.page ?? 1
  const [from, to] = paginatedRange(page)

  let q = supabase
    .from('appels_offre')
    .select('*', { count: 'exact' })
    .order('date_publication', { ascending: false })
    .range(from, to)

  if (TYPE_MARCHE_SLUGS.has(categorie)) {
    q = q.eq('type_marche', categorie)
  } else {
    q = q.eq('categorie', categorie)
  }

  // Extra filters (skip type/secteur if already handled by categorie param)
  if (filters.type && !TYPE_MARCHE_SLUGS.has(categorie)) q = q.eq('type_marche', filters.type)
  if (filters.procedure) q = q.eq('procedure', filters.procedure)
  if (filters.region) q = q.eq('region', filters.region)
  if (filters.date_limite) q = q.lte('date_limite', new Date(filters.date_limite).toISOString())
  // secteur only applies when on a type_marche page (e.g. /travaux?secteur=nettoyage)
  if (filters.secteur && TYPE_MARCHE_SLUGS.has(categorie)) q = q.eq('categorie', filters.secteur)

  const { data, error, count } = await q
  if (error) { console.error('getAppelsOffreByCategorie error:', error); return toPaginatedResult([], 0, page) }
  return toPaginatedResult(data as AppelOffre[], count, page)
}

// ─── By region ────────────────────────────────────────────────────────────────

export async function getAppelsOffreByRegion(
  categorie: string,
  region: string,
  filters: AoFilters = {},
): Promise<PaginatedResult> {
  const page = filters.page ?? 1
  const [from, to] = paginatedRange(page)

  let q = supabase
    .from('appels_offre')
    .select('*', { count: 'exact' })
    .order('date_publication', { ascending: false })
    .range(from, to)
    .eq('region', region)

  if (TYPE_MARCHE_SLUGS.has(categorie)) {
    q = q.eq('type_marche', categorie)
  } else {
    q = q.eq('categorie', categorie)
  }

  if (filters.procedure) q = q.eq('procedure', filters.procedure)
  if (filters.date_limite) q = q.lte('date_limite', new Date(filters.date_limite).toISOString())
  if (filters.secteur && TYPE_MARCHE_SLUGS.has(categorie)) q = q.eq('categorie', filters.secteur)

  const { data, error, count } = await q
  if (error) { console.error('getAppelsOffreByRegion error:', error); return toPaginatedResult([], 0, page) }
  return toPaginatedResult(data as AppelOffre[], count, page)
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function getAppelOffreById(id: number): Promise<AppelOffre | null> {
  const { data, error } = await supabase
    .from('appels_offre')
    .select('*')
    .eq('id', id)
    .single()

  if (error) { console.error('getAppelOffreById error:', error); return null }
  return data as AppelOffre
}

export async function getSimilarAppelsOffre(
  categorie: string,
  typeMarche: string | null,
  excludeId: number,
  limit = 4,
): Promise<AppelOffre[]> {
  let q = supabase
    .from('appels_offre')
    .select('*')
    .neq('id', excludeId)
    .order('date_publication', { ascending: false })
    .limit(limit)

  if (TYPE_MARCHE_SLUGS.has(categorie)) {
    q = q.eq('type_marche', categorie)
  } else {
    q = q.eq('categorie', categorie)
    if (typeMarche) q = q.eq('type_marche', typeMarche)
  }

  const { data, error } = await q
  if (error) { console.error('getSimilarAppelsOffre error:', error); return [] }
  return (data ?? []) as AppelOffre[]
}

// ─── Top categories (CPV) ─────────────────────────────────────────────────────

export async function getTopCategories(limit = 40): Promise<{ categorie: string; categorie_label: string; count: number }[]> {
  // Use RPC for accurate GROUP BY counts (no row limit issue)
  const { data, error } = await supabase.rpc('get_top_categories', { lim: limit })

  if (!error && data) {
    return (data as { categorie: string; categorie_label: string; cnt: number }[]).map((r) => ({
      categorie: r.categorie,
      categorie_label: r.categorie_label,
      count: Number(r.cnt),
    }))
  }

  // Fallback: JS-side count (capped at 20k rows)
  console.warn('getTopCategories RPC failed, using fallback:', error?.message)
  const { data: rows } = await supabase
    .from('appels_offre')
    .select('categorie, categorie_label')
    .not('categorie', 'is', null)
    .limit(20000)

  const counts: Record<string, { categorie: string; categorie_label: string; count: number }> = {}
  for (const row of rows ?? []) {
    const cat = row.categorie as string
    if (!cat || TYPE_MARCHE_SLUGS.has(cat)) continue
    if (!counts[cat]) {
      counts[cat] = { categorie: cat, categorie_label: (row.categorie_label as string) ?? cat, count: 0 }
    }
    counts[cat].count++
  }
  return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, limit)
}

// ─── Regions by categorie ─────────────────────────────────────────────────────

export async function getRegionsByCategorie(
  categorie: string,
): Promise<{ region: string; region_label: string; count: number }[]> {
  let q = supabase
    .from('appels_offre')
    .select('region, region_label')
    .not('region', 'is', null)
    .limit(2000)

  if (TYPE_MARCHE_SLUGS.has(categorie)) {
    q = q.eq('type_marche', categorie)
  } else {
    q = q.eq('categorie', categorie)
  }

  const { data, error } = await q
  if (error) { console.error('getRegionsByCategorie error:', error); return [] }

  const counts: Record<string, { region: string; region_label: string; count: number }> = {}
  for (const row of data ?? []) {
    if (!row.region) continue
    if (!counts[row.region]) {
      counts[row.region] = {
        region: row.region as string,
        region_label: (row.region_label as string) ?? (row.region as string),
        count: 0,
      }
    }
    counts[row.region].count++
  }
  return Object.values(counts).sort((a, b) => b.count - a.count)
}
