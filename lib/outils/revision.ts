import type { IndiceObs } from '@/lib/indices'
import { addMonths, diffMonths } from '@/lib/format'

export const PARTIE_FIXE_DEFAUT = 0.125

export type ValeurIndice = {
  code: string
  /** Mois demandé */
  mois: string
  valeur: number | null
  /** Mois réellement utilisé (≠ mois demandé si l'index n'est pas encore publié) */
  moisUtilise: string | null
  def: boolean
  jo: string | null
  statut: 'ok' | 'provisoire' | 'non-publie' | 'hors-serie' | 'manuel'
}

/** Valeur d'un index pour un mois ; à défaut de publication, la dernière valeur connue. */
export function valeurIndice(code: string, obs: IndiceObs[] | undefined, mois: string, manuel?: number | null): ValeurIndice {
  if (manuel && manuel > 0) {
    return { code, mois, valeur: manuel, moisUtilise: mois, def: true, jo: null, statut: 'manuel' }
  }
  const vide: ValeurIndice = { code, mois, valeur: null, moisUtilise: null, def: false, jo: null, statut: 'hors-serie' }
  if (!obs?.length) return vide
  const exact = obs.find((o) => o.p === mois)
  if (exact) {
    return { code, mois, valeur: exact.v, moisUtilise: exact.p, def: exact.def, jo: exact.jo, statut: exact.def ? 'ok' : 'provisoire' }
  }
  const last = obs[obs.length - 1]
  if (mois > last.p) {
    return { code, mois, valeur: last.v, moisUtilise: last.p, def: last.def, jo: last.jo, statut: 'non-publie' }
  }
  return vide
}

export type Terme = { code: string; poids: number }

export type ResultatRevision = {
  coefficient: number | null
  montant: number | null
  ecart: number | null
  ecartPct: number | null
  valeurs: { terme: Terme; i0: ValeurIndice; im: ValeurIndice }[]
  sommePoids: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Révision : P = P0 × (a + Σ bᵢ × Imᵢ / I0ᵢ).
 * `valeur` renvoie la valeur d'un index pour un mois (voir valeurIndice).
 */
export function calculerRevision(
  p0: number,
  partieFixe: number,
  termes: Terme[],
  mois0: string,
  moisM: string,
  valeur: (code: string, mois: string, role: 'i0' | 'im') => ValeurIndice,
): ResultatRevision {
  const valeurs = termes.map((terme) => ({ terme, i0: valeur(terme.code, mois0, 'i0'), im: valeur(terme.code, moisM, 'im') }))
  const sommePoids = partieFixe + termes.reduce((s, t) => s + t.poids, 0)
  const complet = valeurs.every((v) => v.i0.valeur && v.im.valeur)
  if (!complet || !(p0 > 0)) return { coefficient: null, montant: null, ecart: null, ecartPct: null, valeurs, sommePoids }

  const coefficient = partieFixe + valeurs.reduce((s, v) => s + (v.terme.poids * v.im.valeur!) / v.i0.valeur!, 0)
  const montant = round2(p0 * coefficient)
  return { coefficient, montant, ecart: round2(montant - p0), ecartPct: (coefficient - 1) * 100, valeurs, sommePoids }
}

export type ResultatActualisation = {
  applicable: boolean
  /** Mois d - 3 */
  moisReference: string
  coefficient: number | null
  montant: number | null
  ecart: number | null
  ecartPct: number | null
  i0: ValeurIndice
  id3: ValeurIndice
}

/**
 * Actualisation d'un prix ferme : P = P0 × I(d−3) / I0, si plus de 3 mois
 * séparent le mois zéro du début d'exécution (art. R2112-11).
 */
export function calculerActualisation(
  p0: number,
  code: string,
  mois0: string,
  moisDebut: string,
  valeur: (code: string, mois: string, role: 'i0' | 'im') => ValeurIndice,
): ResultatActualisation {
  const moisReference = addMonths(moisDebut, -3)
  const i0 = valeur(code, mois0, 'i0')
  const id3 = valeur(code, moisReference, 'im')
  const applicable = diffMonths(mois0, moisDebut) > 3
  if (!applicable) {
    return { applicable, moisReference, coefficient: 1, montant: p0 > 0 ? p0 : null, ecart: 0, ecartPct: 0, i0, id3 }
  }
  if (!i0.valeur || !id3.valeur || !(p0 > 0)) {
    return { applicable, moisReference, coefficient: null, montant: null, ecart: null, ecartPct: null, i0, id3 }
  }
  const coefficient = id3.valeur / i0.valeur
  const montant = round2(p0 * coefficient)
  return { applicable, moisReference, coefficient, montant, ecart: round2(montant - p0), ecartPct: (coefficient - 1) * 100, i0, id3 }
}
