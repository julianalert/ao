import { CORPS_ETAT } from './corps-etat'
import { departementLabel, normaliserDepartement, regionLabel } from './geo'

export type Frequence = 'quotidienne' | 'hebdomadaire'

export type Criteres = {
  /** Slugs de catégories (colonne `categorie` des avis) */
  categories: string[]
  /** Préfixes de codes CPV, 2 à 8 chiffres */
  cpv: string[]
  departements: string[]
  regions: string[]
  types: ('travaux' | 'fournitures' | 'services')[]
  procedures: ('ouvert' | 'restreint' | 'mapa' | 'negociee')[]
  montantMin: number | null
  montantMax: number | null
  motsCles: string[]
  exclus: string[]
  /** Noms d'acheteurs (rapprochés sans accents, voir lib/acheteurs.ts) */
  acheteurs: string[]
}

export const CRITERES_VIDES: Criteres = {
  categories: [], cpv: [], departements: [], regions: [], types: [], procedures: [],
  montantMin: null, montantMax: null, motsCles: [], exclus: [], acheteurs: [],
}

export const PROCEDURE_LABELS: Record<Criteres['procedures'][number], string> = {
  ouvert: 'Appel d\'offres ouvert',
  restreint: 'Appel d\'offres restreint',
  mapa: 'MAPA',
  negociee: 'Négociée',
}

export const MAX_ALERTES_PAR_ABONNE = 10

const slug = (s: unknown) => typeof s === 'string' && /^[a-z0-9-]{1,80}$/.test(s)
// Mots-clés : lettres, chiffres, espaces, apostrophes et tirets (sûrs pour les filtres PostgREST)
const motCle = (s: string) => s.replace(/[^a-zA-Z0-9À-ÖØ-öø-ÿŒœ\s'-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40)

function liste<T>(v: unknown, ok: (x: unknown) => boolean, max = 50): T[] {
  return Array.isArray(v) ? (Array.from(new Set(v.filter(ok))) as T[]).slice(0, max) : []
}

function montant(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v.replace(/\s/g, '')) : NaN
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null
}

/** Nettoie des critères reçus du client. */
export function validerCriteres(input: unknown): Criteres {
  const o = (input ?? {}) as Record<string, unknown>
  const mots = (v: unknown) => (Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : []).map((s) => motCle(String(s))).filter((s) => s.length >= 2).slice(0, 15)
  return {
    categories: liste<string>(o.categories, slug, 80),
    cpv: liste<string>(o.cpv, (x) => typeof x === 'string' && /^\d{2,8}$/.test(x), 20),
    departements: liste<string>(
      Array.isArray(o.departements) ? o.departements.map((d) => (typeof d === 'string' ? normaliserDepartement(d) : d)) : [],
      (x) => typeof x === 'string' && /^(\d{2}|2A|2B|97\d)$/.test(x),
      101,
    ),
    regions: liste<string>(o.regions, slug, 18),
    types: liste(o.types, (x) => x === 'travaux' || x === 'fournitures' || x === 'services', 3),
    procedures: liste(o.procedures, (x) => typeof x === 'string' && x in PROCEDURE_LABELS, 4),
    montantMin: montant(o.montantMin),
    montantMax: montant(o.montantMax),
    motsCles: mots(o.motsCles),
    exclus: mots(o.exclus),
    acheteurs: (Array.isArray(o.acheteurs) ? o.acheteurs : []).map((s) => String(s).replace(/[^a-zA-Z0-9À-ÖØ-öø-ÿŒœ\s'()-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)).filter((s) => s.length >= 3).slice(0, 5),
  }
}

export function criteresVides(c: Criteres): boolean {
  return !c.categories.length && !c.cpv.length && !c.motsCles.length && !c.acheteurs.length
}

/** Résumé lisible, pour les emails et la page de gestion. */
export function decrireCriteres(c: Criteres, categoriesLabels: Record<string, string> = {}): string {
  const parts: string[] = []
  const corps = CORPS_ETAT.filter((g) => g.categories.every((s) => c.categories.includes(s)))
  const couvertes = new Set(corps.flatMap((g) => g.categories))
  const autres = c.categories.filter((s) => !couvertes.has(s)).map((s) => categoriesLabels[s] ?? s.replace(/-/g, ' '))
  const metiers = [...corps.map((g) => g.label), ...autres]
  if (metiers.length) parts.push(metiers.slice(0, 4).join(', ') + (metiers.length > 4 ? ` et ${metiers.length - 4} autres` : ''))
  if (c.cpv.length) parts.push(`CPV ${c.cpv.join(', ')}`)
  if (c.motsCles.length) parts.push(`« ${c.motsCles.join(' », « ')} »`)
  if (c.acheteurs.length) parts.push(`acheteur : ${c.acheteurs.join(', ')}`)
  const zones = [...c.regions.map(regionLabel), ...c.departements.map(departementLabel)]
  parts.push(zones.length ? zones.slice(0, 4).join(', ') + (zones.length > 4 ? ` et ${zones.length - 4} autres` : '') : 'toute la France')
  if (c.montantMin || c.montantMax) {
    const f = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} €`
    parts.push(c.montantMin && c.montantMax ? `${f(c.montantMin)} à ${f(c.montantMax)}` : c.montantMin ? `plus de ${f(c.montantMin)}` : `moins de ${f(c.montantMax!)}`)
  }
  if (c.types.length) parts.push(c.types.join(', '))
  if (c.procedures.length) parts.push(c.procedures.map((p) => PROCEDURE_LABELS[p]).join(', '))
  if (c.exclus.length) parts.push(`sans « ${c.exclus.join(' », « ')} »`)
  return parts.join(' · ')
}

/** Critères ↔ paramètres d'URL (pré-remplissage du formulaire depuis le contexte). */
export function criteresVersParams(c: Partial<Criteres>): string {
  const p = new URLSearchParams()
  if (c.categories?.length) p.set('categories', c.categories.join(','))
  if (c.departements?.length) p.set('departements', c.departements.join(','))
  if (c.regions?.length) p.set('regions', c.regions.join(','))
  if (c.types?.length) p.set('types', c.types.join(','))
  if (c.acheteurs?.length) p.set('acheteurs', c.acheteurs.join('|'))
  return p.toString()
}

export function criteresDepuisParams(sp: URLSearchParams): Partial<Criteres> {
  const l = (k: string) => sp.get(k)?.split(',').filter(Boolean) ?? []
  const acheteurs = sp.get('acheteurs')?.split('|').filter(Boolean) ?? []
  return validerCriteres({ categories: l('categories'), departements: l('departements'), regions: l('regions'), types: l('types'), cpv: l('cpv'), acheteurs })
}
