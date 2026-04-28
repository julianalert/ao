import { getSupabase } from './supabase'

export type SitemapAo = {
  id: number
  slug: string | null
  categorie: string | null
  date_publication: string | null
}

export type SitemapCategorieRegion = {
  categorie: string
  region: string
}

/**
 * Returns all AOs with the minimal fields needed to build sitemap URLs.
 * Capped at 50 000 rows (max URLs per sitemap file). If you exceed this,
 * switch to `generateSitemaps` to produce a sitemap index.
 */
export async function getAosForSitemap(limit = 50_000): Promise<SitemapAo[]> {
  const sb = getSupabase()
  if (!sb) return []

  const { data, error } = await sb
    .from('appels_offre')
    .select('id, slug, categorie, date_publication')
    .not('slug', 'is', null)
    .order('date_publication', { ascending: false })
    .limit(limit)

  if (error) { console.error('getAosForSitemap error:', error); return [] }
  return (data ?? []) as SitemapAo[]
}

/**
 * Returns all distinct categorie slugs present in the DB, plus the three
 * type_marche slugs which are always valid category pages.
 */
export async function getAllCategoriesForSitemap(): Promise<string[]> {
  const sb = getSupabase()
  if (!sb) return ['travaux', 'services', 'fournitures']

  const { data, error } = await sb
    .from('appels_offre')
    .select('categorie')
    .not('categorie', 'is', null)
    .limit(20_000)

  if (error) { console.error('getAllCategoriesForSitemap error:', error); return [] }

  const slugs = new Set<string>(['travaux', 'services', 'fournitures'])
  for (const row of data ?? []) {
    if (row.categorie) slugs.add(row.categorie as string)
  }
  return Array.from(slugs)
}

/**
 * Returns all distinct (categorie, region) pairs that exist in the DB.
 * Each AO contributes both its CPV categorie and its type_marche as valid
 * category-level keys.
 */
export async function getAllCategorieRegionsForSitemap(): Promise<SitemapCategorieRegion[]> {
  const sb = getSupabase()
  if (!sb) return []

  const { data, error } = await sb
    .from('appels_offre')
    .select('categorie, type_marche, region')
    .not('region', 'is', null)
    .limit(20_000)

  if (error) { console.error('getAllCategorieRegionsForSitemap error:', error); return [] }

  const seen = new Set<string>()
  const results: SitemapCategorieRegion[] = []

  for (const row of data ?? []) {
    const cats = [row.categorie, row.type_marche].filter(Boolean) as string[]
    for (const cat of cats) {
      if (!row.region) continue
      const key = `${cat}|${row.region}`
      if (!seen.has(key)) {
        seen.add(key)
        results.push({ categorie: cat, region: row.region as string })
      }
    }
  }
  return results
}
