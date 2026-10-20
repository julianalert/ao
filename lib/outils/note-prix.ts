export type Methode = 'proportionnelle' | 'lineaire' | 'minmax' | 'coefficient'

export const METHODES: { value: Methode; label: string; formule: string }[] = [
  { value: 'proportionnelle', label: 'Proportionnelle (la plus courante)', formule: 'N = Nmax × Pmin / P' },
  { value: 'lineaire', label: 'Linéaire simple', formule: 'N = Nmax × (1 − (P − Pmin) / Pmin), plancher 0' },
  { value: 'minmax', label: 'Linéaire min–max', formule: 'N = Nmax × (Pmax − P) / (Pmax − Pmin)' },
  { value: 'coefficient', label: 'Linéaire à coefficient', formule: 'N = Nmax × (1 − k × (P − Pmin) / Pmin), plancher 0' },
]

export type ParamsNotation = {
  methode: Methode
  nmax: number
  /** Pondération du prix, en % (la technique = 100 − prix) */
  poidsPrix: number
  /** Coefficient k de la méthode linéaire à coefficient */
  k: number
}

export type Candidat = { id: string; nom: string; prix: number; noteTech: number; moi?: boolean; hypothese?: boolean }

export type CandidatNote = Candidat & {
  notePrix: number
  notePrixPond: number
  noteTechPond: number
  noteFinale: number
  rang: number
}

export function notePrix(prix: number, pmin: number, pmax: number, p: ParamsNotation): number {
  if (prix <= 0 || pmin <= 0) return 0
  switch (p.methode) {
    case 'proportionnelle':
      return (p.nmax * pmin) / prix
    case 'lineaire':
      return Math.max(0, p.nmax * (1 - (prix - pmin) / pmin))
    case 'minmax':
      return pmax === pmin ? p.nmax : Math.max(0, (p.nmax * (pmax - prix)) / (pmax - pmin))
    case 'coefficient':
      return Math.max(0, p.nmax * (1 - (p.k * (prix - pmin)) / pmin))
  }
}

export function noterCandidats(candidats: Candidat[], p: ParamsNotation): CandidatNote[] {
  const valides = candidats.filter((c) => c.prix > 0)
  if (!valides.length) return []
  const prix = valides.map((c) => c.prix)
  const pmin = Math.min(...prix)
  const pmax = Math.max(...prix)
  const poidsTech = 100 - p.poidsPrix

  const notes = valides.map((c) => {
    const np = notePrix(c.prix, pmin, pmax, p)
    const notePrixPond = (np * p.poidsPrix) / 100
    const noteTechPond = (Math.min(c.noteTech, p.nmax) * poidsTech) / 100
    return { ...c, notePrix: np, notePrixPond, noteTechPond, noteFinale: notePrixPond + noteTechPond, rang: 0 }
  })

  // Classement : les ex æquo (à 0,001 près) partagent le même rang
  const sorted = [...notes].sort((a, b) => b.noteFinale - a.noteFinale)
  sorted.forEach((c, i) => {
    const prev = sorted[i - 1]
    c.rang = prev && Math.abs(prev.noteFinale - c.noteFinale) < 1e-3 ? prev.rang : i + 1
  })
  return sorted
}

/** Note finale du candidat « moi » et du meilleur concurrent si « moi » propose `prix`. */
export function duelAuPrix(moi: Candidat, autres: Candidat[], prix: number, p: ParamsNotation) {
  const notes = noterCandidats([{ ...moi, prix }, ...autres], p)
  const me = notes.find((c) => c.id === moi.id)!
  const best = notes.filter((c) => c.id !== moi.id).reduce((a, b) => (b.noteFinale > a.noteFinale ? b : a))
  return { moi: me.noteFinale, meilleur: best.noteFinale }
}

export type PrixPremier =
  | { statut: 'ok'; prix: number }
  | { statut: 'toujours' }
  | { statut: 'impossible' }

/**
 * Prix maximum auquel « moi » termine 1er (strictement), notes techniques inchangées.
 * Échantillonnage puis dichotomie : robuste même si la courbe n'est pas monotone.
 */
export function prixPourPasserPremier(moi: Candidat, autres: Candidat[], p: ParamsNotation): PrixPremier {
  const autresValides = autres.filter((c) => c.prix > 0)
  if (!autresValides.length) return { statut: 'toujours' }
  const prixAutres = autresValides.map((c) => c.prix)
  const lo = Math.min(...prixAutres) * 0.2
  const hi = Math.max(...prixAutres, moi.prix) * 3
  const ecart = (prix: number) => {
    const d = duelAuPrix(moi, autresValides, prix, p)
    return d.moi - d.meilleur
  }

  const N = 400
  const ratio = Math.pow(hi / lo, 1 / N)
  let dernierGagnant = -1
  const samples: number[] = []
  for (let i = 0; i <= N; i++) {
    const prix = lo * Math.pow(ratio, i)
    samples.push(prix)
    if (ecart(prix) > 1e-9) dernierGagnant = i
  }
  if (dernierGagnant < 0) return { statut: 'impossible' }
  if (dernierGagnant === N) return { statut: 'toujours' }

  let a = samples[dernierGagnant]
  let b = samples[dernierGagnant + 1]
  for (let i = 0; i < 60; i++) {
    const mid = (a + b) / 2
    if (ecart(mid) > 1e-9) a = mid
    else b = mid
  }
  return { statut: 'ok', prix: Math.floor(a) }
}

/**
 * Points de note technique (sur Nmax) nécessaires pour compenser un prix
 * supérieur de `ecartPct` % à celui du moins-disant.
 */
export function compensationTechnique(ecartPct: number, pmin: number, pmax: number, p: ParamsNotation) {
  const prix = pmin * (1 + ecartPct / 100)
  const perteNotePrix = p.nmax - notePrix(prix, pmin, Math.max(pmax, prix), p)
  const perteFinale = (perteNotePrix * p.poidsPrix) / 100
  const poidsTech = 100 - p.poidsPrix
  const pointsTech = poidsTech > 0 ? (perteFinale * 100) / poidsTech : Infinity
  return { perteNotePrix, perteFinale, pointsTech }
}

/** Concurrents fictifs répartis autour de votre prix (option « je ne connais pas les concurrents »). */
export function concurrentsHypothese(monPrix: number, nombre: number, dispersionPct: number, noteTech: number): Candidat[] {
  const d = dispersionPct / 100
  return Array.from({ length: nombre }, (_, i) => {
    const facteur = nombre === 1 ? 1 - d : 1 - d + (2 * d * i) / (nombre - 1)
    return {
      id: `h${i}`,
      nom: `Concurrent ${String.fromCharCode(65 + i)}`,
      prix: Math.round(monPrix * facteur),
      noteTech,
      hypothese: true,
    }
  })
}
