// Corps d'état du BTP regroupant les catégories des avis (slugs de la colonne `categorie`).

export type CorpsEtat = { slug: string; label: string; categories: string[] }

export const CORPS_ETAT: CorpsEtat[] = [
  { slug: 'gros-oeuvre', label: 'Gros œuvre, maçonnerie', categories: ['gros-oeuvre', 'maconnerie', 'batiment', 'fondations-speciales', 'mur-de-soutenement'] },
  { slug: 'tce', label: 'Tous corps d\'état, réhabilitation', categories: ['tous-corps-d-etat', 'batiment', 'batiments-modulaires', 'monuments-historiques'] },
  { slug: 'vrd', label: 'VRD, voirie, terrassement', categories: ['voirie', 'voirie-et-reseaux-divers', 'reseaux-divers', 'terrassement', 'travaux-de-viabilite', 'materiaux-routiers', 'signalisation', 'glissieres-de-securite', 'ouvrage-d-infrastructure'] },
  { slug: 'eau-assainissement', label: 'Eau, assainissement, canalisations', categories: ['assainissement', 'alimentation-en-eau-potable', 'canalisations', 'station-d-epuration-travaux', 'station-de-pompage', 'station-de-refoulement', 'station-de-relevage', 'curage', 'captage', 'forage', 'reservoir', 'drainage', 'busage'] },
  { slug: 'genie-civil', label: 'Ouvrages d\'art, génie civil', categories: ['ouvrage-d-art', 'genie-civil', 'passerelle', 'ouvrage-hydraulique', 'digue', 'berge', 'barrage', 'ecluse', 'travaux-dans-l-eau', 'enrochements', 'installation-portuaire', 'ouvrage-metallique', 'palplanches'] },
  { slug: 'electricite', label: 'Électricité, éclairage, courants faibles', categories: ['electricite-travaux', 'eclairage-public', 'cablage', 'fibre-optique', 'photovoltaique', 'illumination', 'candelabre', 'electrification-rurale', 'detection-incendie', 'alarme', 'controle-d-acces', 'paratonnerre'] },
  { slug: 'cvc-plomberie', label: 'Plomberie, chauffage, ventilation', categories: ['plomberie-travaux', 'chauffage-travaux', 'chauffage-exploitation-entretien', 'climatisation', 'ventilation', 'sanitaire', 'geothermie', 'equipement-thermique'] },
  { slug: 'menuiserie', label: 'Menuiserie, charpente, serrurerie', categories: ['menuiserie', 'charpente', 'serrurerie', 'metallerie', 'ferronnerie', 'porte-automatique-portail', 'vitrerie', 'miroiterie', 'occultation', 'cloture'] },
  { slug: 'couverture', label: 'Couverture, étanchéité, bardage', categories: ['couverture', 'etancheite', 'bardage', 'zinguerie', 'gouttieres', 'isolation'] },
  { slug: 'finitions', label: 'Peinture, plâtrerie, sols', categories: ['peinture-travaux', 'platrerie', 'cloison-faux-plafond', 'revetements-de-sols', 'carrelage', 'revetements-muraux', 'ravalement', 'decoration-travaux', 'plancher-technique'] },
  { slug: 'demolition', label: 'Démolition, désamiantage, dépollution', categories: ['demolition', 'amiante-desamiantage', 'amiante', 'amiante-diagnostic', 'depollution'] },
  { slug: 'espaces-verts', label: 'Espaces verts, aménagement paysager', categories: ['espaces-verts', 'vegetaux', 'aire-de-jeux', 'terrain-de-sport', 'arrosage', 'travaux-forestiers', 'mobilier-urbain', 'equipement-sportif'] },
  { slug: 'ascenseurs-securite', label: 'Ascenseurs, sécurité incendie', categories: ['ascenseur', 'appareil-elevateur', 'securite-incendie', 'extincteur', 'materiel-de-secours-et-d-incendie'] },
  { slug: 'maitrise-oeuvre', label: 'Maîtrise d\'œuvre, études, contrôle', categories: ['maitrise-d-oeuvre', 'etude', 'ingenierie', 'assistance-a-maitrise-d-ouvrage', 'controle-technique', 'mission-d-ordonnancement-pilotage-coordination-opc', 'topographie', 'sondage', 'sondage-travaux'] },
  { slug: 'maintenance', label: 'Maintenance de bâtiments', categories: ['maintenance'] },
]

// Termes courants qui ne figurent pas dans les libellés de catégories
export const SYNONYMES: Record<string, string[]> = {
  cvc: ['chauffage-travaux', 'ventilation', 'climatisation'],
  plombier: ['plomberie-travaux', 'sanitaire'],
  electricien: ['electricite-travaux'],
  vrd: ['voirie-et-reseaux-divers', 'reseaux-divers', 'voirie'],
  peintre: ['peinture-travaux'],
  macon: ['maconnerie', 'gros-oeuvre'],
  couvreur: ['couverture', 'zinguerie'],
  menuisier: ['menuiserie'],
  charpentier: ['charpente'],
  platrier: ['platrerie', 'cloison-faux-plafond'],
  carreleur: ['carrelage', 'revetements-de-sols'],
  paysagiste: ['espaces-verts'],
  route: ['voirie', 'materiaux-routiers'],
  enrobe: ['voirie', 'materiaux-routiers'],
  desamiantage: ['amiante-desamiantage'],
  isolation: ['isolation'],
  architecte: ['maitrise-d-oeuvre'],
  moe: ['maitrise-d-oeuvre'],
  amo: ['assistance-a-maitrise-d-ouvrage'],
  opc: ['mission-d-ordonnancement-pilotage-coordination-opc'],
  pac: ['chauffage-travaux', 'geothermie'],
  'pompe a chaleur': ['chauffage-travaux', 'geothermie'],
  solaire: ['photovoltaique'],
  irve: ['electricite-travaux'],
  fibre: ['fibre-optique'],
}

export function normaliserTexte(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/** Recherche « en langage naturel » : libellés de catégories + synonymes métier. */
export function chercherCategories(
  query: string,
  categories: { slug: string; label: string; count?: number }[],
  limit = 8,
): { slug: string; label: string; count?: number }[] {
  const q = normaliserTexte(query)
  if (q.length < 2) return []
  const parSyn = Object.entries(SYNONYMES)
    .filter(([k]) => k.startsWith(q) || q.includes(k))
    .flatMap(([, slugs]) => slugs)
  const scored = categories
    .map((c) => {
      const l = normaliserTexte(c.label)
      const score = l.startsWith(q) ? 3 : l.split(/[\s,()'-]+/).some((w) => w.startsWith(q)) ? 2 : l.includes(q) ? 1 : parSyn.includes(c.slug) ? 1.5 : 0
      return { c, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (b.c.count ?? 0) - (a.c.count ?? 0))
  return scored.slice(0, limit).map((x) => x.c)
}
