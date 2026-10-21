// Marchés attribués (DECP) : lecture depuis la table Supabase `marches_attribues`,
// ou directement depuis l'API tabulaire de data.gouv.fr tant que l'import n'est pas fait.
import { getSupabase } from '@/lib/supabase'
import { mapperLigne, pageTabulaire } from './mapping.mjs'
import { CPV_CORPS_ETAT, corpsEtatDuCpv } from './cpv'

export type TypeMarche = 'travaux' | 'services' | 'fournitures'

export type Marche = {
  id: string
  uid: string
  acheteur_id: string
  acheteur_nom: string | null
  acheteur_categorie: string | null
  acheteur_commune: string | null
  acheteur_departement: string | null
  titulaire_id: string | null
  titulaire_nom: string | null
  titulaire_categorie: string | null
  objet: string | null
  montant: number | null
  date_notification: string | null
  date_publication: string | null
  offres_recues: number | null
  procedure: string | null
  nature: string | null
  type: TypeMarche | null
  cpv: string | null
  duree_mois: number | null
}

export type Filtres = {
  corps?: string
  cpv?: string
  departement?: string
  /** SIRET ou partie du nom */
  acheteur?: string
  type?: TypeMarche
  /** Date de notification minimale (YYYY-MM-DD) */
  depuis: string
  /** Date de notification maximale incluse (YYYY-MM-DD) */
  jusqua?: string
  montantMin?: number
  montantMax?: number
  motCle?: string
}

export type Source = 'base' | 'api'

const REVALIDATE = { next: { revalidate: 86400 } }
let sourceCache: { source: Source; expire: number } | null = null

/** La table est-elle importée ? (vérifié toutes les 10 minutes) */
export async function sourceMarches(): Promise<Source> {
  if (sourceCache && sourceCache.expire > Date.now()) return sourceCache.source
  const sb = getSupabase()
  let source: Source = 'api'
  if (sb) {
    const { count, error } = await sb.from('marches_attribues').select('id', { count: 'estimated', head: true })
    if (!error && (count ?? 0) > 0) source = 'base'
  }
  sourceCache = { source, expire: Date.now() + 10 * 60 * 1000 }
  return source
}

const sur = (s: string) => s.replace(/[%,()*\\]/g, ' ').trim().slice(0, 80)

function prefixesCpv(f: Filtres): string[] {
  if (f.cpv && /^\d{2,8}$/.test(f.cpv)) return [f.cpv]
  return CPV_CORPS_ETAT.find((c) => c.slug === f.corps)?.prefixes ?? []
}

function requeteBase(f: Filtres, colonnes = '*', count = false) {
  const sb = getSupabase()!
  let q = sb.from('marches_attribues').select(colonnes, count ? { count: 'exact' } : undefined).gte('date_notification', f.depuis)
  if (f.jusqua) q = q.lte('date_notification', f.jusqua)
  if (f.type) q = q.eq('type', f.type)
  if (f.departement) q = q.eq('acheteur_departement', f.departement)
  if (f.acheteur) q = /^\d{14}$/.test(f.acheteur) ? q.eq('acheteur_id', f.acheteur) : q.ilike('acheteur_nom', `%${sur(f.acheteur)}%`)
  const prefixes = prefixesCpv(f)
  if (prefixes.length) q = q.or(prefixes.map((p) => `cpv.like.${p}*`).join(','))
  if (f.montantMin) q = q.gte('montant', f.montantMin)
  if (f.montantMax) q = q.lte('montant', f.montantMax)
  if (f.motCle) q = q.ilike('objet', `%${sur(f.motCle)}%`)
  return q.order('date_notification', { ascending: false }).order('id')
}

function paramsApi(f: Filtres): Record<string, string> {
  const p: Record<string, string> = {
    donneesActuelles__exact: 'true',
    dateNotification__greater: f.depuis,
    dateNotification__sort: 'desc',
  }
  if (f.jusqua) p.dateNotification__less = f.jusqua
  if (f.type) p.type__exact = f.type[0].toUpperCase() + f.type.slice(1)
  if (f.departement) p.acheteur_departement_code__exact = f.departement
  if (f.acheteur) {
    if (/^\d{14}$/.test(f.acheteur)) p.acheteur_id__exact = f.acheteur
    else p.acheteur_nom__contains = sur(f.acheteur).toUpperCase()
  }
  // L'API ne filtre que sur une sous-chaîne : premier préfixe seulement
  const prefixes = prefixesCpv(f)
  if (prefixes.length) p.codeCPV__contains = prefixes[0]
  if (f.montantMin) p.montant__greater = String(f.montantMin)
  if (f.montantMax) p.montant__less = String(f.montantMax)
  if (f.motCle) p.objet__contains = sur(f.motCle)
  return p
}

const enMarches = (rows: Record<string, unknown>[]) => rows.map((r) => mapperLigne(r)).filter((m): m is Marche => m !== null)

export async function rechercherMarches(f: Filtres, page = 1, parPage = 20): Promise<{ items: Marche[]; total: number; source: Source }> {
  const source = await sourceMarches()
  if (source === 'base') {
    const { data, count, error } = await requeteBase(f, '*', true).range((page - 1) * parPage, page * parPage - 1)
    if (error) {
      console.error('rechercherMarches:', error.message)
      return { items: [], total: 0, source }
    }
    return { items: (data ?? []) as unknown as Marche[], total: count ?? 0, source }
  }
  try {
    const { rows, total } = await pageTabulaire(paramsApi(f), page, parPage, { ...REVALIDATE, signal: AbortSignal.timeout(30000) })
    return { items: enMarches(rows), total, source }
  } catch (err) {
    console.error('rechercherMarches (API):', err)
    return { items: [], total: 0, source }
  }
}

/** Échantillon pour les statistiques : les `max` marchés les plus récents du segment. */
export async function echantillonMarches(f: Filtres, max = 3000): Promise<Marche[]> {
  const source = await sourceMarches()
  if (source === 'base') {
    const lots = await Promise.all(
      Array.from({ length: Math.ceil(max / 1000) }, (_, i) => requeteBase(f, '*').range(i * 1000, i * 1000 + 999)),
    )
    return lots.flatMap((l) => (l.data ?? []) as unknown as Marche[])
  }
  // Mode dégradé (table non importée) : échantillon réduit, l'API tabulaire étant lente sur les filtres texte
  const pages = Math.min(f.acheteur && /^\d{14}$/.test(f.acheteur) ? 5 : 2, Math.ceil(max / 200))
  const res = await Promise.allSettled(
    Array.from({ length: pages }, (_, i) => pageTabulaire(paramsApi(f), i + 1, 200, { ...REVALIDATE, signal: AbortSignal.timeout(30000) })),
  )
  return res.flatMap((r) => (r.status === 'fulfilled' ? enMarches(r.value.rows) : []))
}

export type Stats = {
  nbMarches: number
  nbLignes: number
  montantTotal: number
  montantMoyen: number | null
  offresMoyenne: number | null
  topTitulaires: { id: string; nom: string; nb: number; montant: number }[]
  parAnnee: { annee: string; nb: number; montant: number }[]
  parType: { type: string; nb: number }[]
  parCorps: { corps: string; nb: number }[]
}

/** Agrégats calculés sur des lignes « marché × titulaire » : chaque marché n'est compté qu'une fois. */
export function statistiques(rows: Marche[]): Stats {
  const parUid = new Map<string, Marche>()
  for (const r of rows) if (!parUid.has(r.uid)) parUid.set(r.uid, r)
  const marches = Array.from(parUid.values())
  const montants = marches.map((m) => m.montant).filter((m): m is number => m !== null)
  const offres = marches.map((m) => m.offres_recues).filter((o): o is number => o !== null && o > 0)

  const titulaires = new Map<string, { id: string; nom: string; nb: number; montant: number }>()
  for (const r of rows) {
    const cle = r.titulaire_id ?? r.titulaire_nom
    if (!cle) continue
    const t = titulaires.get(cle) ?? { id: r.titulaire_id ?? '', nom: r.titulaire_nom ?? r.titulaire_id ?? 'Inconnu', nb: 0, montant: 0 }
    t.nb++
    t.montant += r.montant ?? 0
    titulaires.set(cle, t)
  }

  const compter = <K extends string>(cles: (K | null)[]) => {
    const m = new Map<K, number>()
    for (const k of cles) if (k) m.set(k, (m.get(k) ?? 0) + 1)
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1])
  }
  const annees = new Map<string, { nb: number; montant: number }>()
  for (const m of marches) {
    const a = m.date_notification?.slice(0, 4)
    if (!a) continue
    const x = annees.get(a) ?? { nb: 0, montant: 0 }
    x.nb++
    x.montant += m.montant ?? 0
    annees.set(a, x)
  }

  return {
    nbMarches: marches.length,
    nbLignes: rows.length,
    montantTotal: montants.reduce((s, m) => s + m, 0),
    montantMoyen: montants.length ? montants.reduce((s, m) => s + m, 0) / montants.length : null,
    offresMoyenne: offres.length ? offres.reduce((s, o) => s + o, 0) / offres.length : null,
    topTitulaires: Array.from(titulaires.values()).sort((a, b) => b.nb - a.nb || b.montant - a.montant).slice(0, 10),
    parAnnee: Array.from(annees.entries()).map(([annee, v]) => ({ annee, ...v })).sort((a, b) => a.annee.localeCompare(b.annee)),
    parType: compter(marches.map((m) => m.type)).map(([type, nb]) => ({ type, nb })),
    parCorps: compter(marches.map((m) => corpsEtatDuCpv(m.cpv))).map(([corps, nb]) => ({ corps, nb })),
  }
}

/** Marchés d'un acheteur sur la période (jusqu'à 5 000 lignes). */
export async function marchesAcheteur(siret: string, depuis: string): Promise<Marche[]> {
  return echantillonMarches({ acheteur: siret, depuis }, 5000)
}

export type AcheteurIndex = { acheteur_id: string; nom: string | null; departement: string | null; commune: string | null; categorie: string | null; nb_marches: number; dernier_marche: string | null }

/** L'acheteur a-t-il des marchés attribués en base ? (null si absent ou base non importée) */
export async function acheteurIndexe(siret: string): Promise<AcheteurIndex | null> {
  const sb = getSupabase()
  if (!sb || !/^\d{14}$/.test(siret)) return null
  const { data, error } = await sb.from('acheteurs_index').select('*').eq('acheteur_id', siret).maybeSingle()
  if (error) return null
  return data as AcheteurIndex | null
}

/** Acheteurs ayant au moins `min` marchés (vue matérialisée, base importée uniquement). */
export async function acheteursIndex(min = 5, limit = 50000): Promise<AcheteurIndex[]> {
  const sb = getSupabase()
  if (!sb || (await sourceMarches()) !== 'base') return []
  const out: AcheteurIndex[] = []
  for (let from = 0; from < limit; from += 1000) {
    const { data, error } = await sb.from('acheteurs_index').select('*').gte('nb_marches', min).order('nb_marches', { ascending: false }).range(from, Math.min(from + 999, limit - 1))
    if (error || !data?.length) break
    out.push(...(data as AcheteurIndex[]))
    if (data.length < 1000) break
  }
  return out
}

export function slugAcheteur(nom: string | null, siret: string): string {
  const base = (nom ?? 'acheteur')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70)
  return `${base}-${siret}`
}

export function acheteurHref(nom: string | null, siret: string): string {
  return `/acheteurs/${slugAcheteur(nom, siret)}`
}

export function siretDepuisSlug(slug: string): string | null {
  const m = slug.match(/(\d{14})$/)
  return m ? m[1] : null
}
