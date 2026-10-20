export type Outil = {
  slug: string
  href: string
  emoji: string
  title: string
  /** Une ligne, pour le menu et les cartes */
  description: string
  cta: string
}

export const OUTILS: Outil[] = [
  {
    slug: 'revision-de-prix',
    href: '/outils/revision-de-prix',
    emoji: '📈',
    title: 'Calculateur de révision de prix',
    description: 'Prix révisé ou actualisé de votre marché avec les index BT et TP de l\'INSEE, à jour chaque mois.',
    cta: 'Réviser mon prix',
  },
  {
    slug: 'interets-moratoires',
    href: '/outils/interets-moratoires',
    emoji: '⏱️',
    title: 'Calculateur d\'intérêts moratoires',
    description: 'Acheteur public en retard de paiement : intérêts, indemnité de 40 € et courrier de réclamation prêt à envoyer.',
    cta: 'Calculer mes intérêts',
  },
  {
    slug: 'note-prix',
    href: '/outils/note-prix',
    emoji: '🏆',
    title: 'Simulateur de note prix',
    description: 'Votre note financière et votre classement selon la méthode de l\'acheteur, et le prix qui vous fait passer 1er.',
    cta: 'Simuler ma note',
  },
]

export const OUTILS_BIENTOT: Omit<Outil, 'href' | 'cta'>[] = [
  {
    slug: 'go-no-go',
    emoji: '🚦',
    title: 'Go / No-Go appel d\'offres',
    description: 'Quelques questions sur le marché et votre entreprise : faut-il répondre, et avec quelles chances ?',
  },
  {
    slug: 'analyse-rc',
    emoji: '📑',
    title: 'Analyseur de règlement de consultation',
    description: 'Critères, pondérations, pièces à fournir et dates clés extraits du RC en quelques secondes.',
  },
]

export function getOutil(slug: string): Outil {
  const outil = OUTILS.find((o) => o.slug === slug)
  if (!outil) throw new Error(`Outil inconnu : ${slug}`)
  return outil
}
