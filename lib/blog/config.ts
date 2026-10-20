// Configuration éditoriale du blog : auteurs, piliers, CTA.
// Les articles eux-mêmes vivent dans content/blog/*.mdx (frontmatter + contenu).

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mon-ao.com'

export const BLOG_PATH = '/blog'

// Dimensions standard des miniatures d'articles (16:9)
export const COVER_WIDTH = 1600
export const COVER_HEIGHT = 900

// ─── Auteurs ──────────────────────────────────────────────────────────────────

export type Author = {
  slug: string
  name: string
  role: string
  image: string
  shortBio: string
  bio: string[]
  knowsAbout: string[]
  worksFor?: { name: string; url: string }
  // Profils publics (LinkedIn, page équipe…) : renforcent l'EEAT via schema.org sameAs
  sameAs: string[]
}

export const AUTHORS: Record<string, Author> = {
  julien: {
    slug: 'julien',
    name: 'Julien',
    role: 'Créateur de mon-ao.com · Cofondateur de vision',
    image: '/blog/auteurs/julien.jpg',
    shortBio:
      "Julien construit mon-ao.com, l'annuaire des appels d'offres publics mis à jour chaque jour depuis le BOAMP, et conçoit des outils qui aident les entreprises du BTP à trouver, trier et préparer leurs réponses.",
    bio: [
      "Julien construit mon-ao.com, l'annuaire des appels d'offres publics français mis à jour chaque jour à partir du BOAMP. Il est aussi cofondateur de vision, agence d'automatisation IA dédiée aux entreprises du bâtiment, où il est en charge du produit et des systèmes.",
      "Son travail : concevoir des outils qui trouvent les appels d'offres pertinents pour une entreprise, les analysent et préparent au maximum le dossier de réponse, pour que les dirigeants de TPE et PME du BTP passent leur temps sur le prix et le mémoire technique plutôt que sur l'administratif.",
      "Sur ce blog, il partage des méthodes concrètes, appuyées sur les textes officiels et sur les appels d'offres réellement publiés sur mon-ao.com.",
    ],
    knowsAbout: [
      'Marchés publics',
      "Appels d'offres BTP",
      'Code de la commande publique',
      'DUME',
      'Mémoire technique',
      'Automatisation',
    ],
    worksFor: { name: 'vision', url: 'https://www.visionbtp.com/' },
    sameAs: ['https://www.visionbtp.com/equipe'],
  },
}

// ─── Piliers éditoriaux ───────────────────────────────────────────────────────

export const CATEGORIES: Record<string, { label: string; description: string }> = {
  'trouver-et-qualifier': {
    label: 'Trouver et qualifier',
    description: "Repérer les appels d'offres qui valent le coup et décider go / no-go.",
  },
  'monter-le-dossier': {
    label: 'Monter le dossier',
    description: 'DC1, DC2, DUME, attestations : les pièces à fournir et comment les préparer.',
  },
  gagner: {
    label: 'Gagner',
    description: "Critères, mémoire technique, prix : ce qui fait gagner un marché public.",
  },
  's-organiser': {
    label: "S'organiser et s'équiper",
    description: 'Interne, externalisation ou outil : organiser la réponse aux appels d’offres.',
  },
  'apres-attribution': {
    label: "Après l'attribution",
    description: 'Paiement, avances, sous-traitance : sécuriser l’exécution du marché.',
  },
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

// Libellé du format d'un livrable téléchargeable, d'après son extension
export function downloadFormat(href: string): string {
  const ext = href.split('.').pop()?.toLowerCase()
  if (ext === 'xlsx' || ext === 'xls') return 'Excel'
  if (ext === 'docx' || ext === 'doc') return 'Word'
  return 'PDF'
}

// CTA C : « on analyse 3 AO pour vous gratuitement »
export function analysisCtaHref(campaign: string): string {
  const params = new URLSearchParams({
    utm_source: 'mon-ao',
    utm_medium: 'blog',
    utm_campaign: 'analyse-3-ao',
    utm_content: campaign,
  })
  return `https://www.visionbtp.com/contact?${params.toString()}`
}

// Catégories d'AO mises en avant en fin d'article (maillage vers les pages catégories)
export const TRAVAUX_CATEGORY_LINKS = [
  { label: 'Bâtiment', href: '/batiment' },
  { label: 'Gros œuvre', href: '/gros-oeuvre' },
  { label: "Tous corps d'état", href: '/tous-corps-d-etat' },
  { label: 'Électricité', href: '/electricite-travaux' },
  { label: 'Plomberie', href: '/plomberie-travaux' },
  { label: 'VRD', href: '/voirie-et-reseaux-divers' },
  { label: "Maîtrise d'œuvre", href: '/maitrise-d-oeuvre' },
]
