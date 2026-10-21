import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabase, lirePagine } from './supabase'
import { NATURE_APPEL_OFFRE, seuilSansDateLimite } from './fiche-utile'
import { METIERS_BTP } from './getAppelsOffre'
import { departementDepuisCode } from './departements'
import { SEUIL_INDEXATION } from './stats-segment'

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

// Un fichier sitemap est limité à 50 000 URL ; on garde de la marge.
export const AO_PAR_SITEMAP = 40_000

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
 * Pages de liste du sitemap, en un seul parcours de la table : catégories (slugs CPV et
 * types de marché), couples catégorie × région et, pour les métiers du BTP, catégorie ×
 * département. Seules celles qui comptent au moins SEUIL_INDEXATION avis de marché sur
 * 12 mois y figurent ; les autres sont en noindex (lib/stats-segment.ts).
 */
export async function getCategoriesEtRegionsForSitemap(): Promise<{
  categories: string[]
  categorieRegions: SitemapCategorieRegion[]
  categorieDepartements: { categorie: string; slug: string }[]
}> {
  const vide = { categories: ['travaux', 'services', 'fournitures'], categorieRegions: [], categorieDepartements: [] }
  const sb = getSupabase()
  if (!sb) return vide

  const debut = new Date(Date.now() - 365 * 86_400_000).toISOString()
  const requete = (colonnes: string, compter = false) =>
    sb
      .from('appels_offre')
      .select(colonnes, compter ? { count: 'exact', head: true } : undefined)
      .eq('nature', NATURE_APPEL_OFFRE)
      .gte('date_publication', debut)

  const { count, error } = await requete('id', true)
  if (error) { console.error('getCategoriesEtRegionsForSitemap error:', error); return vide }

  type Ligne = { categorie: string | null; type_marche: string | null; region: string | null; departement: string | null }
  let rows: Ligne[] = []
  try {
    rows = await lirePagine<Ligne>(0, count ?? 0, async (from, to) => {
      const { data, error: e } = await requete('categorie, type_marche, region, departement').order('id', { ascending: true }).range(from, to)
      return { data: data as Ligne[] | null, error: e }
    })
  } catch (err) {
    console.error('getCategoriesEtRegionsForSitemap error:', err)
    return vide
  }

  const compter = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1)
  const parCategorie = new Map<string, number>()
  const parRegion = new Map<string, number>()
  const parDepartement = new Map<string, number>()
  const btp = new Set(['travaux', ...METIERS_BTP.map((m) => m.categorie)])

  for (const row of rows) {
    // Chaque AO compte pour sa catégorie CPV et pour son type de marché
    for (const cat of [row.categorie, row.type_marche]) {
      if (!cat) continue
      compter(parCategorie, cat)
      if (row.region) compter(parRegion, `${cat}|${row.region}`)
      const dep = btp.has(cat) ? departementDepuisCode(row.departement) : null
      if (dep) compter(parDepartement, `${cat}|${dep.slug}`)
    }
  }

  const assez = ([, n]: [string, number]) => n >= SEUIL_INDEXATION
  const categories = new Set(vide.categories)
  for (const [cat] of Array.from(parCategorie).filter(assez)) categories.add(cat)

  return {
    categories: Array.from(categories),
    categorieRegions: Array.from(parRegion).filter(assez).map(([k]) => {
      const [categorie, region] = k.split('|')
      return { categorie, region }
    }),
    categorieDepartements: Array.from(parDepartement).filter(assez).map(([k]) => {
      const [categorie, slug] = k.split('|')
      return { categorie, slug }
    }),
  }
}
