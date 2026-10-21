// Une fiche AO est « utile » tant qu'une entreprise peut encore y répondre. Seules ces
// fiches sont indexées et listées dans le sitemap ; les autres (appels d'offres clôturés,
// avis d'attribution, rectificatifs, annulations…) restent consultables en noindex.

/** Type d'avis BOAMP des appels à candidatures ; les autres types n'en sont pas. */
export const NATURE_APPEL_OFFRE = 'APPEL_OFFRE'

/** Sans date limite connue, un avis est considéré comme clos passé ce délai. */
export const JOURS_SANS_DATE_LIMITE = 60

type FicheAo = Pick<AppelOffre, 'date_limite' | 'date_publication' | 'raw_data'> & { nature?: string | null }

/** Type d'avis BOAMP : colonne `nature` si la migration est passée, sinon raw_data. */
export function natureAvis(ao: FicheAo): string | null {
  if (ao.nature) return ao.nature
  const n = ao.raw_data?.nature
  return typeof n === 'string' ? n : null
}

/** Date de publication au-delà de laquelle un avis sans date limite est considéré comme clos. */
export function seuilSansDateLimite(maintenant = new Date()): Date {
  return new Date(maintenant.getTime() - JOURS_SANS_DATE_LIMITE * 86_400_000)
}

export type StatutFiche =
  | { utile: true }
  | { utile: false; raison: 'cloture' | 'sans-date-ancien' | 'autre-avis'; nature: string | null }

export function statutFiche(ao: FicheAo, maintenant = new Date()): StatutFiche {
  const nature = natureAvis(ao)
  if (nature && nature !== NATURE_APPEL_OFFRE) return { utile: false, raison: 'autre-avis', nature }
  if (ao.date_limite) {
    return new Date(ao.date_limite) >= maintenant ? { utile: true } : { utile: false, raison: 'cloture', nature }
  }
  if (ao.date_publication && new Date(ao.date_publication) >= seuilSansDateLimite(maintenant)) return { utile: true }
  return { utile: false, raison: 'sans-date-ancien', nature }
}
