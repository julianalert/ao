import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabase } from './supabase'
import { NATURE_APPEL_OFFRE, seuilSansDateLimite } from './fiche-utile'

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

// PostgREST renvoie au plus 1 000 lignes par requête : au-delà, il faut paginer avec range().
const PAGE = 1000
const REQUETES_PARALLELES = 8

// Un fichier sitemap est limité à 50 000 URL ; on garde de la marge.
export const AO_PAR_SITEMAP = 40_000

type Lecture<T> = (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>

/** Lit les lignes [debut, fin[ par pages de 1 000, plusieurs pages à la fois. */
async function lirePagine<T>(debut: number, fin: number, lire: Lecture<T>): Promise<T[]> {
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

/** La colonne `nature` existe-t-elle ? (migration 20261021_05_nature_avis.sql) */
async function aColonneNature(sb: SupabaseClient): Promise<boolean> {
  const { error } = await sb.from('appels_offre').select('nature').limit(1)
  return !error
}

/**
 * Requête sur les fiches AO du sitemap : seulement les fiches utiles (lib/fiche-utile.ts),
 * avec un slug. Sans la colonne `nature`, on se limite aux AO dont la date limite n'est pas passée.
 */
function fichesUtiles(sb: SupabaseClient, colonnes: string, avecNature: boolean, compter = false) {
  const maintenant = new Date().toISOString()
  const q = sb
    .from('appels_offre')
    .select(colonnes, compter ? { count: 'exact', head: true } : undefined)
    .not('slug', 'is', null)
  if (!avecNature) return q.gte('date_limite', maintenant)
  // Une date limite à venir suffit tant que `nature` n'est pas remplie (remplissage en cours)
  return q.or(
    `and(date_limite.gte.${maintenant},or(nature.eq.${NATURE_APPEL_OFFRE},nature.is.null)),` +
      `and(date_limite.is.null,date_publication.gte.${seuilSansDateLimite().toISOString()},nature.eq.${NATURE_APPEL_OFFRE})`,
  )
}

/** Nombre de fiches AO publiables dans le sitemap. */
export async function countAosForSitemap(): Promise<number> {
  const sb = getSupabase()
  if (!sb) return 0
  const avecNature = await aColonneNature(sb)
  const { count, error } = await fichesUtiles(sb, 'id', avecNature, true)
  if (error) { console.error('countAosForSitemap error:', error); return 0 }
  return count ?? 0
}

/** Fiches AO du fichier sitemap n° `chunk` (AO_PAR_SITEMAP par fichier), triées par id. */
export async function getAosForSitemap(chunk: number): Promise<SitemapAo[]> {
  const sb = getSupabase()
  if (!sb) return []

  const total = await countAosForSitemap()
  const debut = chunk * AO_PAR_SITEMAP
  const fin = Math.min(debut + AO_PAR_SITEMAP, total)
  if (debut >= fin) return []

  const avecNature = await aColonneNature(sb)
  try {
    return await lirePagine<SitemapAo>(debut, fin, async (from, to) => {
      const { data, error } = await fichesUtiles(sb, 'id, slug, categorie, date_publication', avecNature)
        .order('id', { ascending: true })
        .range(from, to)
      return { data: data as SitemapAo[] | null, error }
    })
  } catch (err) {
    console.error('getAosForSitemap error:', err)
    return []
  }
}

/**
 * Catégories (slugs CPV et les trois types de marché) et couples catégorie × région
 * présents en base, en un seul parcours de la table.
 */
export async function getCategoriesEtRegionsForSitemap(): Promise<{
  categories: string[]
  categorieRegions: SitemapCategorieRegion[]
}> {
  const categories = new Set<string>(['travaux', 'services', 'fournitures'])
  const categorieRegions: SitemapCategorieRegion[] = []

  const sb = getSupabase()
  if (!sb) return { categories: Array.from(categories), categorieRegions }

  const { count, error } = await sb.from('appels_offre').select('id', { count: 'exact', head: true })
  if (error) { console.error('getCategoriesEtRegionsForSitemap error:', error); return { categories: Array.from(categories), categorieRegions } }

  let rows: { categorie: string | null; type_marche: string | null; region: string | null }[] = []
  try {
    rows = await lirePagine(0, count ?? 0, (from, to) =>
      sb.from('appels_offre').select('categorie, type_marche, region').order('id', { ascending: true }).range(from, to),
    )
  } catch (err) {
    console.error('getCategoriesEtRegionsForSitemap error:', err)
  }

  const vus = new Set<string>()
  for (const row of rows) {
    if (row.categorie) categories.add(row.categorie)
    if (!row.region) continue
    // Chaque AO rend valides sa catégorie CPV et son type de marché
    for (const cat of [row.categorie, row.type_marche]) {
      if (!cat) continue
      const key = `${cat}|${row.region}`
      if (vus.has(key)) continue
      vus.add(key)
      categorieRegions.push({ categorie: cat, region: row.region })
    }
  }

  return { categories: Array.from(categories), categorieRegions }
}
