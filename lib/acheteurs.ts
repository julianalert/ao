// Rapprochement des noms d'acheteurs entre les DECP (« COMMUNE DE VENISSIEUX (MAIRIE) »)
// et les avis BOAMP (« Commune de Vénissieux »), sans dépendre des accents ni de la casse.

const GENERIQUES = new Set([
  'commune', 'communes', 'ville', 'mairie', 'cne', 'de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'sur', 'sous', 'aux', 'au',
  'ctre', 'centre', 'conseil', 'departement', 'departemental', 'departementale', 'dept', 'region', 'regional', 'regionale',
  'communaute', 'agglomeration', 'cc', 'ca', 'cu', 'syndicat', 'intercommunal', 'intercommunale', 'office', 'public', 'publique',
  'etablissement', 'service', 'services', 'direction', 'sa', 'sas', 'sem', 'spl', 'epic', 'mixte',
])

/**
 * Motif PostgREST (ilike) : mots distinctifs dans l'ordre, voyelles et « c » remplacés par « _ »
 * (un caractère quelconque) pour tolérer les accents. Ex. « v_n_ss__x ».
 */
export function motifAcheteur(nom: string): string | null {
  const mots = nom
    .replace(/\(.*?\)/g, ' ')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((m) => m.length >= 3 && !GENERIQUES.has(m))
    .slice(0, 4)
  if (!mots.length) return null
  return mots.map((m) => m.replace(/[aeiouyc]/g, '_')).join('*')
}

const PETITS_MOTS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'sur', 'sous', 'aux', 'au', 'd', 'l'])
const SIGLES = new Set(['sa', 'sas', 'sarl', 'sem', 'spl', 'epic', 'oph', 'chu', 'ccas', 'sdis', 'sivom', 'sivu', 'gip', 'crous', 'ehpad', 'sncf', 'ratp', 'edf', 'gie'])

/** « COMMUNE DE VENISSIEUX (MAIRIE) » → « Commune de Venissieux (Mairie) » ; les noms déjà en casse mixte sont gardés. */
export function nomAffiche(nom: string | null): string | null {
  if (!nom || nom !== nom.toUpperCase()) return nom
  return nom
    .toLowerCase()
    .replace(/[a-zà-öø-ÿœ0-9]+/g, (mot, offset: number) => {
      if (SIGLES.has(mot)) return mot.toUpperCase()
      if (offset > 0 && PETITS_MOTS.has(mot)) return mot
      return mot.charAt(0).toUpperCase() + mot.slice(1)
    })
    .replace(/\b(D|L)'([a-zà-öø-ÿ])/gi, (_, a: string, b: string) => `${a.toLowerCase()}'${b.toUpperCase()}`)
}
