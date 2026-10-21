// Configuration éditoriale du blog : auteurs, piliers, CTA.
// Les articles eux-mêmes vivent dans content/blog/*.mdx (frontmatter + contenu).

export { SITE_URL } from '@/lib/site'

export const BLOG_PATH = '/blog'

// Pagination de l'index du blog : /blog, puis /blog/page/2, /blog/page/3…
export const POSTS_PER_PAGE = 9

export function blogPageHref(page: number): string {
  return page <= 1 ? BLOG_PATH : `${BLOG_PATH}/page/${page}`
}

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

// Chaque pilier a sa page silo (/blog/categorie/<slug>) : tête de silo qui
// présente le thème, renvoie vers ses articles et ses outils.
export type BlogCategory = {
  label: string            // court : pastilles, menu, fil d'Ariane
  description: string      // une ligne : menu et cartes
  emoji: string
  slug: string             // URL de la page silo
  title: string            // H1 de la page silo
  seoTitle: string         // <title> (≤ 60 caractères)
  metaDescription: string
  intro: string[]
  // L'essentiel du thème, chaque étape renvoie vers l'article ou l'outil qui la détaille
  steps: { title: string; text: string; href?: string; cta?: string }[]
  outils?: string[]        // slugs de OUTILS (lib/outils/catalog)
}

export const CATEGORIES: Record<string, BlogCategory> = {
  'trouver-et-qualifier': {
    label: 'Trouver et qualifier',
    description: "Repérer les appels d'offres qui valent le coup et décider go / no-go.",
    emoji: '🔎',
    slug: 'trouver-appels-offres',
    title: "Trouver des appels d'offres BTP et choisir les bons",
    seoTitle: "Trouver des appels d'offres BTP : veille, seuils, go / no-go",
    metaDescription:
      "Où sont publiés les appels d'offres de travaux, quels seuils s'appliquent en 2026 et comment décider en 20 minutes s'il faut répondre : nos guides pour trouver les bons marchés.",
    intro: [
      "Un marché gagné commence bien avant le dossier : il faut d'abord voir passer l'appel d'offres, puis décider vite s'il mérite plusieurs jours de travail. La plupart des PME du BTP ne manquent pas d'avis à lire ; elles manquent de temps pour trier.",
      "Ces guides couvrent les deux étapes : où chercher et selon quelles règles les marchés de travaux sont publiés, puis comment écarter en quelques minutes ceux qui ne sont pas pour vous.",
    ],
    steps: [
      {
        title: 'Connaître les seuils',
        text: "Sous 100 000 € HT, un marché de travaux peut vous être confié sans publicité ni mise en concurrence ; au-dessus de 5 404 000 € HT, la procédure est formalisée. Entre les deux, la procédure adaptée (MAPA) concentre l'essentiel des marchés des PME.",
        href: '/blog/seuils-marches-publics-2026-travaux',
      },
      {
        title: 'Monter sa veille',
        text: "Alertes gratuites du BOAMP, profils d'acheteurs de votre zone, journaux d'annonces légales : aucune source ne voit tout, mais une veille gratuite se monte en 30 minutes.",
        href: '/blog/veille-appels-offres-gratuite-payante',
      },
      {
        title: 'Trier avant de répondre',
        text: "4 critères éliminatoires, puis 6 critères notés de 0 à 2 : à 9 points sur 12 ou plus, vous y allez. La grille prend 20 minutes avec le règlement de consultation sous les yeux.",
        href: '/blog/go-no-go-appel-offres-grille',
      },
    ],
  },
  'monter-le-dossier': {
    label: 'Monter le dossier',
    description: 'DC1, DC2, DUME, attestations : les pièces à fournir et comment les préparer.',
    emoji: '📁',
    slug: 'dossier-reponse-appel-offres',
    title: "Monter le dossier de réponse à un appel d'offres",
    seoTitle: "Dossier de réponse à un appel d'offres : DC1, DC2, DUME",
    metaDescription:
      "Candidature, offre, attestations : les pièces d'un dossier de réponse à un appel d'offres BTP, comment les préparer et les erreurs qui éliminent un dossier avant même qu'il soit lu.",
    intro: [
      "Un dossier de réponse se compose de deux parties : la candidature, qui prouve que vous pouvez faire le chantier, et l'offre, qui dit ce que vous proposez et à quel prix. Seule l'offre est notée ; la candidature, elle, peut vous éliminer.",
      "L'objectif de ces guides : un dossier administratif prêt en 30 minutes, pour consacrer votre temps au mémoire technique et au prix.",
    ],
    steps: [
      {
        title: 'La candidature',
        text: "DC1 et DC2, ou un DUME : chiffre d'affaires, effectifs, références, qualifications. Depuis 2026, le chiffre d'affaires minimum exigé est plafonné à 1,5 fois le montant estimé du marché.",
        href: '/blog/repondre-appel-offres-btp-dossier',
      },
      {
        title: "L'offre",
        text: "Acte d'engagement, mémoire technique, décomposition du prix (DPGF, BPU ou DQE) et parfois un planning : c'est la seule partie du dossier qui est notée.",
      },
      {
        title: 'Les attestations',
        text: "Les attestations fiscales, sociales et d'assurance ne sont exigées en principe que de l'entreprise retenue, juste avant la signature. Si vous ne les avez pas sous la main à ce moment-là, vous perdez le marché.",
      },
    ],
  },
  gagner: {
    label: 'Gagner',
    description: "Critères, mémoire technique, prix : ce qui fait gagner un marché public.",
    emoji: '🎯',
    slug: 'gagner-appel-offres',
    title: "Gagner un appel d'offres : mémoire technique, prix et notation",
    seoTitle: "Gagner un appel d'offres BTP : mémoire technique et prix",
    metaDescription:
      "Comment les offres sont notées, comment rédiger un mémoire technique qui marque des points et comment fixer un prix qui vous fait passer premier sans brader votre marge.",
    intro: [
      "Un marché public est attribué à l'offre économiquement la plus avantageuse, selon les critères et la pondération annoncés dans le règlement de consultation. Le plus souvent, c'est un mélange de prix et de valeur technique.",
      "Quand les prix sont proches, c'est le mémoire technique qui départage. Ces guides et outils vous aident à comprendre la notation de l'acheteur et à placer vos efforts là où ils rapportent des points.",
    ],
    steps: [
      {
        title: 'Comprendre la notation',
        text: "Chaque critère est noté puis multiplié par sa pondération. La méthode de notation du prix (proportionnelle, linéaire, min-max) change beaucoup le poids réel d'un écart de prix.",
        href: '/outils/note-prix',
        cta: 'Simuler ma note',
      },
      {
        title: 'Rédiger le mémoire technique',
        text: "Une section par sous-critère du RC, dans le même ordre ; un texte qui parle de ce chantier-là ; des preuves plutôt que des affirmations.",
        href: '/blog/memoire-technique-btp-exemple',
      },
      {
        title: 'Fixer le bon prix',
        text: "Avec une pondération 40/60 et la méthode proportionnelle, être 5 % plus cher que le moins-disant se compense par environ 0,6 point de note technique sur 20. Gagner ces points coûte souvent moins cher qu'une remise.",
      },
    ],
    outils: ['note-prix'],
  },
  's-organiser': {
    label: "S'organiser et s'équiper",
    description: 'Interne, externalisation ou outil : organiser la réponse aux appels d’offres.',
    emoji: '🧭',
    slug: 'organiser-reponse-appels-offres',
    title: "Organiser la réponse aux appels d'offres dans une PME du BTP",
    seoTitle: "Réponse aux appels d'offres : coût, organisation, outils",
    metaDescription:
      "Combien coûte une réponse, qui s'en charge, que faut-il externaliser ou automatiser : des méthodes pour répondre aux appels d'offres sans y passer vos soirées.",
    intro: [
      "Les heures passées sur les dossiers sont souvent celles du dirigeant, le soir, et ne figurent sur aucune facture. Résultat : peu d'entreprises savent ce que leur coûte vraiment un marché gagné.",
      "Ces guides vous aident à mesurer ce coût, puis à décider ce qui reste en interne, ce qui s'externalise et ce qui peut être automatisé.",
    ],
    steps: [
      {
        title: 'Mesurer le coût par marché gagné',
        text: "Coût d'une réponse divisé par le taux de réussite : une réponse à 1 200 € avec un marché gagné sur cinq, c'est 6 000 € de réponses par marché gagné.",
        href: '/blog/cout-reponse-appel-offres-btp',
      },
      {
        title: 'Répondre moins, mais mieux',
        text: "Mieux vaut 4 réponses soignées par mois que 12 réponses bâclées : les acheteurs notent la qualité du mémoire technique, pas le nombre de dossiers envoyés.",
      },
      {
        title: "Automatiser ce qui ne rapporte pas de points",
        text: "Veille, lecture du règlement de consultation, pièces administratives : ce travail ne fait gagner aucun point. Le prix, les choix techniques et la relecture finale restent à l'entreprise.",
      },
    ],
  },
  'apres-attribution': {
    label: "Après l'attribution",
    description: 'Paiement, avances, sous-traitance : sécuriser l’exécution du marché.',
    emoji: '💶',
    slug: 'execution-marche-public',
    title: "Après l'attribution : exécuter un marché public et se faire payer",
    seoTitle: "Exécution d'un marché public : paiement, révision de prix",
    metaDescription:
      "Révision de prix avec les index BT et TP, délais de paiement, intérêts moratoires : les règles et les outils gratuits pour sécuriser l'exécution d'un marché public de travaux.",
    intro: [
      "Signer le marché n'est que la moitié du chemin : il faut ensuite être payé à temps, et au bon prix. Deux sujets coûtent régulièrement de l'argent aux entreprises de travaux : la révision de prix oubliée et les retards de paiement jamais réclamés.",
      "Cette rubrique rassemble les règles d'exécution et les outils gratuits de mon-ao.com pour les appliquer : calcul de révision avec les index INSEE, calcul des intérêts moratoires et courrier de réclamation.",
    ],
    steps: [
      {
        title: 'Réviser ou actualiser le prix',
        text: "Un prix ferme est actualisé si plus de trois mois séparent le mois zéro du début d'exécution ; un prix révisable suit les index BT ou TP prévus au CCAP.",
        href: '/outils/revision-de-prix',
        cta: 'Calculer ma révision',
      },
      {
        title: 'Surveiller les délais de paiement',
        text: "L'acheteur public doit payer sous 30 jours (50 jours pour les établissements publics de santé). Au-delà, les intérêts moratoires et une indemnité forfaitaire de 40 € sont dus de plein droit.",
        href: '/outils/interets-moratoires',
        cta: 'Calculer mes intérêts',
      },
      {
        title: 'Suivre les index BT et TP',
        text: "Les index du bâtiment et des travaux publics sont publiés chaque mois par l'INSEE. Leur historique depuis 2014 permet de vérifier un calcul de révision ou d'anticiper l'évolution d'un prix.",
        href: '/indices',
        cta: 'Consulter les index',
      },
    ],
    outils: ['revision-de-prix', 'interets-moratoires'],
  },
}

export const CATEGORY_BASE_PATH = `${BLOG_PATH}/categorie`

export function categoryHref(key: string): string {
  return `${CATEGORY_BASE_PATH}/${CATEGORIES[key].slug}`
}

export function getCategoryBySlug(slug: string): (BlogCategory & { key: string }) | undefined {
  const entry = Object.entries(CATEGORIES).find(([, c]) => c.slug === slug)
  return entry && { key: entry[0], ...entry[1] }
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

// Libellé du format d'un livrable téléchargeable, d'après son extension
export function downloadFormat(href: string): string {
  const ext = href.split('.').pop()?.toLowerCase()
  if (ext === 'xlsx' || ext === 'xls') return 'Excel'
  if (ext === 'docx' || ext === 'doc') return 'Word'
  return 'PDF'
}

// ─── Liens vers vision ────────────────────────────────────────────────────────

const VISION_HOST = 'visionbtp.com'

/**
 * Ajoute les paramètres UTM de mon-ao.com à un lien vers visionbtp.com, pour attribuer
 * les visites et les demandes de contact. Les autres liens, et ceux qui ont déjà
 * un utm_source, sont renvoyés tels quels.
 */
export function avecUtmVision(href: string, utm: { medium: string; campaign: string; content?: string }): string {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return href
  }
  if (!url.hostname.endsWith(VISION_HOST) || url.searchParams.has('utm_source')) return href
  url.searchParams.set('utm_source', 'mon-ao')
  url.searchParams.set('utm_medium', utm.medium)
  url.searchParams.set('utm_campaign', utm.campaign)
  if (utm.content) url.searchParams.set('utm_content', utm.content)
  return url.toString()
}

// CTA C : « on analyse 3 AO pour vous gratuitement »
export function analysisCtaHref(campaign: string, medium = 'blog'): string {
  return avecUtmVision('https://www.visionbtp.com/contact', { medium, campaign: 'analyse-3-ao', content: campaign })
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
