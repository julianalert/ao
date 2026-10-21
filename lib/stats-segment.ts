// Chiffres d'un segment (catégorie, éventuellement région ou département) calculés sur les
// appels d'offres publiés ces 12 derniers mois. Ils donnent aux pages de liste un contenu
// propre, au-delà de la liste elle-même. Mis en cache 24 h.
import { unstable_cache } from 'next/cache'
import { getSupabase, lirePagine } from './supabase'
import { NATURE_APPEL_OFFRE } from './fiche-utile'
import { TYPE_MARCHE_SLUGS } from './getAppelsOffre'
import { departementDepuisCode } from './departements'

export type Segment = { categorie: string; region?: string; departements?: string[] }

export type StatsSegment = {
  /** Début réel de la période couverte (les données commencent parfois après J-365) */
  depuis: string | null
  publies: number
  publies30j: number
  ouverts: number
  montantMedian: number | null
  delaiMedianJours: number | null
  procedures: { procedure: string; part: number }[]
  acheteurs: { nom: string; nb: number }[]
  /** Nombre d'AO par code département (codes normalisés, ex. « 01 », « 2A ») */
  parDepartement: Record<string, number>
  /** Nombre d'AO par région (slug) */
  parRegion: Record<string, number>
}

type Ligne = {
  acheteur: string | null
  procedure: string | null
  montant_estime: number | null
  date_publication: string | null
  date_limite: string | null
  departement: string | null
  region: string | null
}

const JOUR = 86_400_000

function mediane(valeurs: number[]): number | null {
  if (valeurs.length === 0) return null
  const v = [...valeurs].sort((a, b) => a - b)
  const m = Math.floor(v.length / 2)
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2
}

// Lève une erreur en cas d'échec : unstable_cache ne met pas les erreurs en cache
async function calculer(segment: Segment): Promise<StatsSegment> {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase non configuré')

  const debut = new Date(Date.now() - 365 * JOUR).toISOString()
  const requete = (colonnes: string, compter = false) => {
    let q = sb
      .from('appels_offre')
      .select(colonnes, compter ? { count: 'exact', head: true } : undefined)
      .eq('nature', NATURE_APPEL_OFFRE)
      .gte('date_publication', debut)
    q = TYPE_MARCHE_SLUGS.has(segment.categorie) ? q.eq('type_marche', segment.categorie) : q.eq('categorie', segment.categorie)
    if (segment.region) q = q.eq('region', segment.region)
    if (segment.departements?.length) q = q.in('departement', segment.departements)
    return q
  }

  const { count, error } = await requete('id', true)
  if (error) throw new Error(error.message)

  const lignes = await lirePagine<Ligne>(0, count ?? 0, async (from, to) => {
    const { data, error: e } = await requete('acheteur, procedure, montant_estime, date_publication, date_limite, departement, region')
      .order('id', { ascending: true })
      .range(from, to)
    return { data: data as Ligne[] | null, error: e }
  })

  const maintenant = Date.now()
  const procedures: Record<string, number> = {}
  const acheteurs: Record<string, number> = {}
  const parDepartement: Record<string, number> = {}
  const parRegion: Record<string, number> = {}
  const montants: number[] = []
  const delais: number[] = []
  let publies30j = 0
  let ouverts = 0
  let depuis: string | null = null

  for (const l of lignes) {
    const pub = l.date_publication ? new Date(l.date_publication).getTime() : null
    const lim = l.date_limite ? new Date(l.date_limite).getTime() : null
    if (l.date_publication && (!depuis || l.date_publication < depuis)) depuis = l.date_publication
    if (pub && pub >= maintenant - 30 * JOUR) publies30j++
    if (lim && lim >= maintenant) ouverts++
    if (pub && lim) {
      const jours = Math.round((lim - pub) / JOUR)
      if (jours >= 1 && jours <= 120) delais.push(jours)
    }
    if (l.montant_estime && l.montant_estime > 0) montants.push(Number(l.montant_estime))
    const p = l.procedure ?? 'autre'
    procedures[p] = (procedures[p] ?? 0) + 1
    const nom = l.acheteur?.trim()
    if (nom) acheteurs[nom] = (acheteurs[nom] ?? 0) + 1
    const dep = departementDepuisCode(l.departement)
    if (dep) parDepartement[dep.code] = (parDepartement[dep.code] ?? 0) + 1
    if (l.region) parRegion[l.region] = (parRegion[l.region] ?? 0) + 1
  }

  const total = lignes.length
  return {
    depuis,
    publies: total,
    publies30j,
    ouverts,
    montantMedian: montants.length >= 5 ? mediane(montants) : null,
    delaiMedianJours: delais.length >= 5 ? mediane(delais) : null,
    procedures: Object.entries(procedures)
      .map(([procedure, n]) => ({ procedure, part: Math.round((n / Math.max(total, 1)) * 100) }))
      .sort((a, b) => b.part - a.part),
    acheteurs: Object.entries(acheteurs)
      .map(([nom, nb]) => ({ nom, nb }))
      .sort((a, b) => b.nb - a.nb)
      .slice(0, 5),
    parDepartement,
    parRegion,
  }
}

const calculerEnCache = unstable_cache(calculer, ['stats-segment'], { revalidate: 86_400 })

/** Chiffres du segment, ou null si la base ne répond pas (la page s'affiche sans eux). */
export async function getStatsSegment(segment: Segment): Promise<StatsSegment | null> {
  try {
    return await calculerEnCache(segment)
  } catch (err) {
    console.error('stats segment :', err)
    return null
  }
}

/** En dessous, une page de liste est trop mince pour être indexée. */
export const SEUIL_INDEXATION = 5
