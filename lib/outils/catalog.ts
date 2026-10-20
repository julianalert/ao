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
  {
    slug: 'procedure-selon-montant',
    href: '/outils/procedure-selon-montant',
    emoji: '⚖️',
    title: 'Quelle procédure selon le montant ?',
    description: 'Procédure applicable, publicité obligatoire et délais minimum selon le montant et le type de marché.',
    cta: 'Trouver la procédure',
  },
  {
    slug: 'pieces-candidature',
    href: '/outils/pieces-candidature',
    emoji: '🗂️',
    title: 'Checklist des pièces de candidature',
    description: 'DC1, DC2, DUME, attestations : les pièces à fournir selon votre marché, leur validité et où les obtenir.',
    cta: 'Préparer ma checklist',
  },
  {
    slug: 'alertes-appels-offres',
    href: '/outils/alertes-appels-offres',
    emoji: '🔔',
    title: 'Alertes appels d\'offres',
    description: 'Les nouveaux AO de votre métier et de votre zone, chaque matin par email. Gratuit, sans compte.',
    cta: 'Créer mon alerte',
  },
  {
    slug: 'analyse-rc',
    href: '/outils/analyse-rc',
    emoji: '📑',
    title: 'Analyseur de RC et DCE',
    description: 'Déposez le règlement de consultation : dates, critères, pièces et points d\'attention, avec la page source de chaque info.',
    cta: 'Analyser un RC',
  },
  {
    slug: 'qui-gagne-quoi',
    href: '/qui-gagne-quoi',
    emoji: '🏅',
    title: 'Qui gagne quoi',
    description: 'Marchés attribués : qui a gagné, à quel montant, face à combien d\'offres. Et une fiche par acheteur public.',
    cta: 'Rechercher',
  },
]

export const OUTILS_BIENTOT: Omit<Outil, 'href' | 'cta'>[] = [
  {
    slug: 'go-no-go',
    emoji: '🚦',
    title: 'Go / No-Go appel d\'offres',
    description: 'Quelques questions sur le marché et votre entreprise : faut-il répondre, et avec quelles chances ?',
  },
]

export function getOutil(slug: string): Outil {
  const outil = OUTILS.find((o) => o.slug === slug)
  if (!outil) throw new Error(`Outil inconnu : ${slug}`)
  return outil
}
