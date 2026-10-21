// Pages par département : /[categorie]/[nom-du-departement]-[code], ex. /plomberie-travaux/rhone-69.
// En base, les codes sont écrits sans zéro initial (« 1 » pour l'Ain) et la Corse en « 20A » / « 20B ».
import { DEPARTEMENTS } from '@/lib/alertes/geo'
import { DEPT_TO_REGION, toSlug } from '@/lib/boampNormalize'

export type Departement = { code: string; nom: string; slug: string; region: string | null }

export const LISTE_DEPARTEMENTS: Departement[] = Object.entries(DEPARTEMENTS)
  .map(([code, nom]) => ({ code, nom, slug: `${toSlug(nom)}-${code.toLowerCase()}`, region: DEPT_TO_REGION[code]?.region ?? null }))
  .sort((a, b) => a.code.localeCompare(b.code, 'fr', { numeric: true }))

const PAR_SLUG = new Map(LISTE_DEPARTEMENTS.map((d) => [d.slug, d]))
const PAR_CODE = new Map(LISTE_DEPARTEMENTS.map((d) => [d.code, d]))

export function departementDepuisSlug(slug: string): Departement | null {
  return PAR_SLUG.get(slug) ?? null
}

/** Département d'un code tel qu'il est écrit en base (« 1 », « 01 », « 20A »…). */
export function departementDepuisCode(code: string | null): Departement | null {
  if (!code) return null
  const c = code.trim().toUpperCase().replace(/^20([AB])$/, '2$1')
  return PAR_CODE.get(/^\d$/.test(c) ? `0${c}` : c) ?? null
}

export function departementsDeRegion(region: string): Departement[] {
  return LISTE_DEPARTEMENTS.filter((d) => d.region === region)
}

/** Écritures possibles du code en base : « 01 » et « 1 », « 2A » et « 20A ». */
export function codesEnBase(code: string): string[] {
  const corse = code.match(/^2([AB])$/)
  if (corse) return [code, `20${corse[1]}`]
  return Array.from(new Set([code, code.replace(/^0(\d)$/, '$1')]))
}

/** « Rhône (69) » */
export function libelleDepartement(d: Departement): string {
  return `${d.nom} (${d.code})`
}

export function departementHref(categorie: string, d: Departement): string {
  return `/${categorie}/${d.slug}`
}
