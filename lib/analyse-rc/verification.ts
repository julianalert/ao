// Contrôle « zéro invention » : chaque extrait cité doit se retrouver dans le texte des documents.
// Un champ dont l'extrait est introuvable est retiré de la fiche ; un document scanné
// (sans couche texte) ne permet pas ce contrôle et ses sources sont signalées « à vérifier ».
import type { DocPrepare } from './extraction'
import type { Fiche, Source, SourceVerifiee } from './schema'

function normaliser(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/-\s*\n\s*/g, '')
    .replace(/[\s ​]+/g, '')
}

type Index = { doc: DocPrepare; pages: string[] | null }

function trouverDoc(index: Index[], nom: string): Index | undefined {
  const n = nom.toLowerCase()
  return (
    index.find((i) => i.doc.nom.toLowerCase() === n) ??
    index.find((i) => i.doc.nom.toLowerCase().includes(n) || n.includes(i.doc.nom.toLowerCase().split('/').pop() ?? '')) ??
    (index.length === 1 ? index[0] : undefined)
  )
}

/** Retourne la page où l'extrait figure (1-indexée), 0 si non paginé, null si introuvable. */
function localiser(i: Index, extrait: string): number | null {
  if (!i.pages) return null
  const e = normaliser(extrait)
  if (e.length < 6) return null
  const debut = e.slice(0, 40)
  const fin = e.slice(-25)
  for (let p = 0; p < i.pages.length; p++) {
    const t = i.pages[p]
    if (t.includes(e) || (e.length > 80 && t.includes(debut) && t.includes(fin))) return i.doc.pagine ? p + 1 : 0
  }
  // Extrait à cheval sur deux pages
  for (let p = 0; p + 1 < i.pages.length; p++) {
    if ((i.pages[p] + i.pages[p + 1]).includes(e)) return i.doc.pagine ? p + 1 : 0
  }
  return null
}

export type BilanVerification = { verifiees: number; ecartees: number; nonVerifiables: number }

/** Vérifie et nettoie la fiche en place ; ajoute `verifie` à chaque source conservée. */
export function verifierFiche(fiche: Fiche, docs: DocPrepare[]): BilanVerification {
  const index: Index[] = docs.map((doc) => ({ doc, pages: doc.pages ? doc.pages.map(normaliser) : null }))
  const bilan: BilanVerification = { verifiees: 0, ecartees: 0, nonVerifiables: 0 }

  const verifier = (source: Source): boolean => {
    const s = source as SourceVerifiee
    const i = trouverDoc(index, s.document)
    if (i && !i.pages && i.doc.pdfBase64) {
      s.verifie = null
      bilan.nonVerifiables++
      return true
    }
    // Cherche d'abord dans le document cité, puis dans tous les autres
    const candidats = i ? [i, ...index.filter((x) => x !== i)] : index
    for (const c of candidats) {
      const page = localiser(c, s.extrait)
      if (page !== null) {
        s.document = c.doc.nom
        s.page = c.doc.pagine ? page : null
        s.verifie = true
        bilan.verifiees++
        return true
      }
    }
    bilan.ecartees++
    return false
  }

  const champs = <T extends Record<string, { source: Source } | null>>(groupe: T) => {
    for (const k of Object.keys(groupe) as (keyof T)[]) {
      const v = groupe[k]
      if (v && !verifier(v.source)) (groupe as Record<keyof T, unknown>)[k] = null
    }
  }

  champs(fiche.identite)
  champs(fiche.calendrier)
  champs(fiche.conditions)
  const { allotissement, plusieurs_lots } = fiche.lots
  const lotsChamps = { allotissement, plusieurs_lots }
  champs(lotsChamps)
  fiche.lots.allotissement = lotsChamps.allotissement
  fiche.lots.plusieurs_lots = lotsChamps.plusieurs_lots
  fiche.lots.liste = fiche.lots.liste.filter((l) => verifier(l.source))
  const methode = { methode_notation_prix: fiche.criteres.methode_notation_prix }
  champs(methode)
  fiche.criteres.methode_notation_prix = methode.methode_notation_prix
  fiche.criteres.liste = fiche.criteres.liste.filter((c) => verifier(c.source))
  fiche.pieces.candidature = fiche.pieces.candidature.filter((p) => verifier(p.source))
  fiche.pieces.offre = fiche.pieces.offre.filter((p) => verifier(p.source))
  fiche.points_attention = fiche.points_attention.filter((p) => verifier(p.source))

  // Sans critère sourcé, la méthode et le poids du prix ne sont pas exploitables
  if (!fiche.criteres.liste.length && !fiche.criteres.methode_notation_prix) {
    fiche.criteres.methode_code = 'non_precisee'
    fiche.criteres.poids_prix = null
  }
  return bilan
}
