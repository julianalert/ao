import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getSupabase } from './supabase'
import { NATURE_APPEL_OFFRE } from './fiche-utile'

export const PAGE_SIZE = 20

// The three type_marche slugs that map directly to DB enum values
export const TYPE_MARCHE_SLUGS = new Set(['travaux', 'services', 'fournitures'])

export const TYPE_MARCHE_LABELS: Record<string, string> = {
  travaux: 'Travaux',
  services: 'Services',
  fournitures: 'Fournitures',
}

/** Libellé d'une catégorie d'après son slug : type de marché, sinon libellé enregistré en base. */
export const getCategorieLabel = cache(async (categorie: string): Promise<string> => {
  if (TYPE_MARCHE_SLUGS.has(categorie)) return TYPE_MARCHE_LABELS[categorie]
  const sb = getSupabase()
  if (sb) {
    const { data } = await sb
      .from('appels_offre')
      .select('categorie_label')
      .eq('categorie', categorie)
      .not('categorie_label', 'is', null)
      .limit(1)
      .maybeSingle()
    if (data?.categorie_label) return data.categorie_label as string
  }
  const label = categorie.replace(/-/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
})

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

const EMPTY_PAGE = (page = 1): PaginatedResult => toPaginatedResult([], 0, page)

// Colonnes des listes : tout sauf raw_data (l'avis complet, volumineux), inutile pour une ligne
const COLONNES_LISTE =
  'id, reference, titre, slug, objet, acheteur, acheteur_siret, categorie, categorie_label, cpv_code, region, region_label, departement, type_marche, procedure, montant_estime, date_publication, date_limite, url_document, created_at'

// ─── Home ─────────────────────────────────────────────────────────────────────

export async function getLatestAppelsOffre(filters: AoFilters = {}): Promise<PaginatedResult> {
  const sb = getSupabase()
  if (!sb) return EMPTY_PAGE(filters.page)

  const page = filters.page ?? 1
  const [from, to] = paginatedRange(page)

  // Listes : seulement les avis de marché, pas les attributions, rectificatifs, annulations…
  let q = sb
    .from('appels_offre')
    .select(COLONNES_LISTE, { count: 'exact' })
    .eq('nature', NATURE_APPEL_OFFRE)
    .order('date_publication', { ascending: false })
    .range(from, to)

  if (filters.type) q = q.eq('type_marche', filters.type)
  if (filters.procedure) q = q.eq('procedure', filters.procedure)
  if (filters.region) q = q.eq('region', filters.region)
  if (filters.date_limite) q = q.lte('date_limite', new Date(filters.date_limite).toISOString())
  if (filters.secteur) q = q.eq('categorie', filters.secteur)

  const { data, error, count } = await q
  if (error) { console.error('getLatestAppelsOffre error:', error); return EMPTY_PAGE(page) }
  return toPaginatedResult(data as unknown as AppelOffre[], count, page)
}

// ─── By category (type_marche or CPV categorie) ───────────────────────────────

export async function getAppelsOffreByCategorie(
  categorie: string,
  filters: AoFilters = {},
): Promise<PaginatedResult> {
  const sb = getSupabase()
  if (!sb) return EMPTY_PAGE(filters.page)

  const page = filters.page ?? 1
  const [from, to] = paginatedRange(page)

  let q = sb
    .from('appels_offre')
    .select(COLONNES_LISTE, { count: 'exact' })
    .eq('nature', NATURE_APPEL_OFFRE)
    .order('date_publication', { ascending: false })
    .range(from, to)

  if (TYPE_MARCHE_SLUGS.has(categorie)) {
    q = q.eq('type_marche', categorie)
  } else {
    q = q.eq('categorie', categorie)
  }

  if (filters.type && !TYPE_MARCHE_SLUGS.has(categorie)) q = q.eq('type_marche', filters.type)
  if (filters.procedure) q = q.eq('procedure', filters.procedure)
  if (filters.region) q = q.eq('region', filters.region)
  if (filters.date_limite) q = q.lte('date_limite', new Date(filters.date_limite).toISOString())
  if (filters.secteur && TYPE_MARCHE_SLUGS.has(categorie)) q = q.eq('categorie', filters.secteur)

  const { data, error, count } = await q
  if (error) { console.error('getAppelsOffreByCategorie error:', error); return EMPTY_PAGE(page) }
  return toPaginatedResult(data as unknown as AppelOffre[], count, page)
}

// ─── By region ────────────────────────────────────────────────────────────────

export async function getAppelsOffreByRegion(
  categorie: string,
  region: string,
  filters: AoFilters = {},
): Promise<PaginatedResult> {
  const sb = getSupabase()
  if (!sb) return EMPTY_PAGE(filters.page)

  const page = filters.page ?? 1
  const [from, to] = paginatedRange(page)

  let q = sb
    .from('appels_offre')
    .select(COLONNES_LISTE, { count: 'exact' })
    .eq('nature', NATURE_APPEL_OFFRE)
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
  if (error) { console.error('getAppelsOffreByRegion error:', error); return EMPTY_PAGE(page) }
  return toPaginatedResult(data as unknown as AppelOffre[], count, page)
}

// ─── By département ───────────────────────────────────────────────────────────

/** `codes` : écritures du code en base (voir codesEnBase dans lib/departements.ts). */
export async function getAppelsOffreByDepartement(
  categorie: string,
  codes: string[],
  filters: AoFilters = {},
): Promise<PaginatedResult> {
  const sb = getSupabase()
  if (!sb) return EMPTY_PAGE(filters.page)

  const page = filters.page ?? 1
  const [from, to] = paginatedRange(page)

  let q = sb
    .from('appels_offre')
    .select(COLONNES_LISTE, { count: 'exact' })
    .eq('nature', NATURE_APPEL_OFFRE)
    .in('departement', codes)
    .order('date_publication', { ascending: false })
    .range(from, to)

  q = TYPE_MARCHE_SLUGS.has(categorie) ? q.eq('type_marche', categorie) : q.eq('categorie', categorie)
  if (filters.procedure) q = q.eq('procedure', filters.procedure)
  if (filters.date_limite) q = q.lte('date_limite', new Date(filters.date_limite).toISOString())

  const { data, error, count } = await q
  if (error) { console.error('getAppelsOffreByDepartement error:', error); return EMPTY_PAGE(page) }
  return toPaginatedResult(data as unknown as AppelOffre[], count, page)
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function getAppelOffreById(id: number): Promise<AppelOffre | null> {
  const sb = getSupabase()
  if (!sb) return null

  const { data, error } = await sb
    .from('appels_offre')
    .select('*')
    .eq('id', id)
    .single()

  if (error) { console.error('getAppelOffreById error:', error); return null }
  return data as AppelOffre
}

/** Fiche d'un avis d'après sa référence BOAMP (ex. l'appel d'offres visé par un rectificatif). */
export async function getAppelOffreByReference(
  reference: string,
): Promise<Pick<AppelOffre, 'id' | 'slug' | 'categorie' | 'titre'> | null> {
  const sb = getSupabase()
  if (!sb) return null

  const { data, error } = await sb
    .from('appels_offre')
    .select('id, slug, categorie, titre')
    .eq('reference', reference)
    .maybeSingle()

  if (error) { console.error('getAppelOffreByReference error:', error); return null }
  return data
}

/**
 * Appels d'offres ouverts du même secteur, dans la même région d'abord, puis partout en
 * France pour compléter.
 */
export async function getSimilarAppelsOffre(
  categorie: string,
  typeMarche: string | null,
  excludeId: number,
  region: string | null = null,
  limit = 4,
): Promise<AppelOffre[]> {
  const sb = getSupabase()
  if (!sb) return []

  const requete = (dansLaRegion: boolean) => {
    let q = sb
      .from('appels_offre')
      .select(COLONNES_LISTE)
      .eq('nature', NATURE_APPEL_OFFRE)
      .gte('date_limite', new Date().toISOString())
      .neq('id', excludeId)
      .order('date_publication', { ascending: false })
      .limit(limit)
    if (TYPE_MARCHE_SLUGS.has(categorie)) {
      q = q.eq('type_marche', categorie)
    } else {
      q = q.eq('categorie', categorie)
      if (typeMarche) q = q.eq('type_marche', typeMarche)
    }
    return dansLaRegion && region ? q.eq('region', region) : q
  }

  const proches = region ? await requete(true) : { data: [], error: null }
  if (proches.error) { console.error('getSimilarAppelsOffre error:', proches.error); return [] }
  const resultat = (proches.data ?? []) as unknown as AppelOffre[]
  if (resultat.length >= limit) return resultat

  const { data, error } = await requete(false)
  if (error) { console.error('getSimilarAppelsOffre error:', error); return resultat }
  const dejaVus = new Set(resultat.map((a) => a.id))
  for (const a of (data ?? []) as unknown as AppelOffre[]) {
    if (resultat.length >= limit) break
    if (!dejaVus.has(a.id)) resultat.push(a)
  }
  return resultat
}

// ─── Open AOs (blog) ──────────────────────────────────────────────────────────

export async function getOpenAppelsOffre(
  categorie: string,
  limit = 5,
): Promise<{ data: AppelOffre[]; count: number }> {
  const sb = getSupabase()
  if (!sb) return { data: [], count: 0 }

  let q = sb
    .from('appels_offre')
    .select('id, slug, titre, categorie, categorie_label, acheteur, region_label, date_publication, date_limite, type_marche', { count: 'exact' })
    .eq('nature', NATURE_APPEL_OFFRE)
    .gte('date_limite', new Date().toISOString())
    .order('date_publication', { ascending: false })
    .limit(limit)

  q = TYPE_MARCHE_SLUGS.has(categorie) ? q.eq('type_marche', categorie) : q.eq('categorie', categorie)

  const { data, error, count } = await q
  if (error) { console.error('getOpenAppelsOffre error:', error); return { data: [], count: 0 } }
  return { data: (data ?? []) as AppelOffre[], count: count ?? 0 }
}

// ─── Stats (page À propos) ────────────────────────────────────────────────────

export async function getAoStats(): Promise<{ total: number; open: number }> {
  const sb = getSupabase()
  if (!sb) return { total: 0, open: 0 }

  const [all, open] = await Promise.all([
    sb.from('appels_offre').select('id', { count: 'exact', head: true }).eq('nature', NATURE_APPEL_OFFRE),
    sb
      .from('appels_offre')
      .select('id', { count: 'exact', head: true })
      .eq('nature', NATURE_APPEL_OFFRE)
      .gte('date_limite', new Date().toISOString()),
  ])
  if (all.error || open.error) console.error('getAoStats error:', all.error ?? open.error)
  return { total: all.count ?? 0, open: open.count ?? 0 }
}

// ─── Accueil ──────────────────────────────────────────────────────────────────

// Métiers du BTP mis en avant sur l'accueil (slugs de catégorie présents en base)
export const METIERS_BTP: { categorie: string; label: string }[] = [
  { categorie: 'batiment', label: 'Bâtiment' },
  { categorie: 'gros-oeuvre', label: 'Gros œuvre' },
  { categorie: 'tous-corps-d-etat', label: "Tous corps d'état" },
  { categorie: 'electricite-travaux', label: 'Électricité' },
  { categorie: 'plomberie-travaux', label: 'Plomberie' },
  { categorie: 'chauffage-travaux', label: 'Chauffage' },
  { categorie: 'menuiserie', label: 'Menuiserie' },
  { categorie: 'couverture', label: 'Couverture' },
  { categorie: 'charpente', label: 'Charpente' },
  { categorie: 'maconnerie', label: 'Maçonnerie' },
  { categorie: 'peinture-travaux', label: 'Peinture' },
  { categorie: 'etancheite', label: 'Étanchéité' },
  { categorie: 'voirie-et-reseaux-divers', label: 'VRD' },
  { categorie: 'terrassement', label: 'Terrassement' },
  { categorie: 'demolition', label: 'Démolition' },
  { categorie: 'espaces-verts', label: 'Espaces verts' },
]

export type ChiffresAccueil = {
  ouverts: number
  ouvertsTravaux: number
  nouveauxSemaine: number
  metiers: { categorie: string; label: string; ouverts: number }[]
}

/**
 * Appels d'offres ouverts (tous, travaux, par métier BTP) et publiés ces 7 derniers jours.
 * L'accueil est rendu à chaque visite (filtres dans l'URL) : comptages mis en cache 1 h.
 */
export const getChiffresAccueil = unstable_cache(chiffresAccueil, ['chiffres-accueil'], { revalidate: 3600 })

async function chiffresAccueil(): Promise<ChiffresAccueil> {
  const sb = getSupabase()
  if (!sb) return { ouverts: 0, ouvertsTravaux: 0, nouveauxSemaine: 0, metiers: [] }

  const maintenant = new Date().toISOString()
  const semaine = new Date(Date.now() - 7 * 86_400_000).toISOString()
  const ouverts = () =>
    sb.from('appels_offre').select('id', { count: 'exact', head: true }).eq('nature', NATURE_APPEL_OFFRE).gte('date_limite', maintenant)

  const [tous, travaux, nouveaux, ...metiers] = await Promise.all([
    ouverts(),
    ouverts().eq('type_marche', 'travaux'),
    sb.from('appels_offre').select('id', { count: 'exact', head: true }).eq('nature', NATURE_APPEL_OFFRE).gte('date_publication', semaine),
    ...METIERS_BTP.map((m) => ouverts().eq('categorie', m.categorie)),
  ])

  // Une erreur n'est pas mise en cache par unstable_cache : on la lève plutôt que de figer des zéros
  const echec = [tous, travaux, nouveaux, ...metiers].find((r) => r.error)
  if (echec?.error) throw new Error(echec.error.message)

  return {
    ouverts: tous.count ?? 0,
    ouvertsTravaux: travaux.count ?? 0,
    nouveauxSemaine: nouveaux.count ?? 0,
    metiers: METIERS_BTP.map((m, i) => ({ ...m, ouverts: metiers[i].count ?? 0 }))
      .filter((m) => m.ouverts > 0)
      .sort((a, b) => b.ouverts - a.ouverts),
  }
}

// ─── Top categories (CPV) ─────────────────────────────────────────────────────

export async function getTopCategories(limit = 40): Promise<{ categorie: string; categorie_label: string; count: number }[]> {
  const sb = getSupabase()
  if (!sb) return []

  const { data, error } = await sb.rpc('get_top_categories', { lim: limit })

  if (!error && data) {
    return (data as { categorie: string; categorie_label: string; cnt: number }[]).map((r) => ({
      categorie: r.categorie,
      categorie_label: r.categorie_label,
      count: Number(r.cnt),
    }))
  }

  // Fallback: JS-side count (capped at 20k rows)
  console.warn('getTopCategories RPC failed, using fallback:', error?.message)
  const { data: rows } = await sb
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

/**
 * Top catégories en ne comptant que les avis de marché (le RPC get_top_categories compte
 * aussi les attributions et les rectificatifs) : on recompte les candidats du RPC.
 * Affiché dans les filtres de chaque liste : mis en cache 1 h.
 */
export const getTopCategoriesAo = unstable_cache(topCategoriesAo, ['top-categories-ao'], { revalidate: 3600 })

async function topCategoriesAo(
  limit = 24,
): Promise<{ categorie: string; categorie_label: string; count: number }[]> {
  const sb = getSupabase()
  if (!sb) return []
  const candidats = await getTopCategories(limit + 10)
  const recomptes = await Promise.all(
    candidats.map(async (c) => {
      const { count } = await sb
        .from('appels_offre')
        .select('id', { count: 'exact', head: true })
        .eq('categorie', c.categorie)
        .eq('nature', NATURE_APPEL_OFFRE)
      return { ...c, count: count ?? c.count }
    }),
  )
  return recomptes.sort((a, b) => b.count - a.count).slice(0, limit)
}

// ─── Regions by categorie ─────────────────────────────────────────────────────

export async function getRegionsByCategorie(
  categorie: string,
): Promise<{ region: string; region_label: string; count: number }[]> {
  const sb = getSupabase()
  if (!sb) return []

  let q = sb
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
