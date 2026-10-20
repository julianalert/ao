// Outil 7 : pièces de candidature, conditions d'exigibilité et durée de validité.
// Durées de validité et cas d'exigibilité à faire valider par l'expert marchés publics.

export type ContexteCandidature = {
  typeMarche: 'travaux' | 'fournitures' | 'services'
  procedure: 'mapa' | 'formalisee'
  groupement: boolean
  sousTraitance: boolean
  etrangere: boolean
  moinsUnAn: boolean
}

export type EtapePiece = 'candidature' | 'offre' | 'attributaire'

export type Piece = {
  slug: string
  /** Libellé court pour la checklist */
  nom: string
  /** Titre complet de la page dédiée */
  titre: string
  etape: EtapePiece
  quand: string
  validite: string
  ou: { label: string; href: string | null }
  /** Rappel de validité à proposer par email */
  expire?: boolean
  inclure: (c: ContexteCandidature) => boolean
  /** Précision contextuelle affichée dans la checklist */
  note?: (c: ContexteCandidature) => string | null
  /** Contenu de la page /pieces/[slug] (facultatif) */
  page?: {
    description: string
    aQuoiSert: string[]
    commentFaire: string[]
    erreurs: string[]
    faq: { q: string; a: string }[]
  }
}

const DAJ_FORMULAIRES = 'https://www.economie.gouv.fr/daj/commande-publique/formulaires-commande-publique'
const DAJ_DUME = 'https://www.economie.gouv.fr/daj/document-unique-de-marche-europeen-dume'

export const PIECES: Piece[] = [
  {
    slug: 'dc1',
    nom: 'DC1 (lettre de candidature) ou DUME',
    titre: 'DC1 : la lettre de candidature',
    etape: 'candidature',
    quand: 'Toujours',
    validite: 'Une par consultation',
    ou: { label: 'Formulaire DAJ (Bercy)', href: DAJ_FORMULAIRES },
    inclure: () => true,
    note: (c) => (c.groupement ? 'Un DC1 unique pour le groupement, qui désigne le mandataire et liste chaque membre.' : null),
    page: {
      description: 'Le DC1 identifie le candidat, les lots visés et la forme de la candidature, et contient la déclaration sur l\'honneur. Comment le remplir et les erreurs qui font écarter une candidature.',
      aQuoiSert: [
        'Le DC1 est la lettre de candidature : il identifie l\'entreprise (ou les membres du groupement), précise la consultation et les lots auxquels vous répondez, et indique si vous candidatez seul ou en groupement.',
        'Il contient la déclaration sur l\'honneur : vous attestez ne pas être dans un cas d\'interdiction de soumissionner (condamnations, liquidation judiciaire, défaut de déclarations fiscales ou sociales…).',
        'Le formulaire n\'est pas obligatoire : vous pouvez utiliser le DUME à la place, que l\'acheteur doit accepter. Mais il reste le format le plus courant dans les MAPA.',
      ],
      commentFaire: [
        'Téléchargez la dernière version sur le site de la DAJ (Bercy) : l\'acheteur peut aussi fournir son propre modèle dans le dossier de consultation.',
        'Recopiez exactement l\'objet de la consultation et les numéros de lots tels qu\'ils figurent dans le règlement de la consultation.',
        'En groupement, précisez s\'il est conjoint ou solidaire, désignez le mandataire et faites figurer chaque membre.',
        'Signez si le règlement de la consultation le demande ; à défaut, la signature n\'est souvent exigée qu\'à l\'attribution.',
      ],
      erreurs: [
        'Utiliser une ancienne version du formulaire ou un DC1 copié d\'une précédente consultation, avec un objet ou des lots erronés.',
        'Oublier de cocher les lots visés, ou viser un lot auquel l\'offre ne répond pas.',
        'En groupement, oublier un membre ou ne pas préciser la nature du groupement.',
      ],
      faq: [
        { q: 'Le DC1 est-il obligatoire ?', a: 'Non. L\'acheteur doit accepter un DUME à la place du DC1 et du DC2. Il peut aussi demander une simple lettre de candidature et une déclaration sur l\'honneur. Vérifiez le règlement de la consultation.' },
        { q: 'Faut-il signer le DC1 ?', a: 'Pas toujours. Beaucoup d\'acheteurs ne demandent la signature qu\'à l\'attribution. Le règlement de la consultation indique ce qui est exigé au moment du dépôt.' },
      ],
    },
  },
  {
    slug: 'dc2',
    nom: 'DC2 (déclaration du candidat) ou DUME',
    titre: 'DC2 : la déclaration du candidat',
    etape: 'candidature',
    quand: 'Toujours',
    validite: 'Une par consultation',
    ou: { label: 'Formulaire DAJ (Bercy)', href: DAJ_FORMULAIRES },
    inclure: () => true,
    note: (c) => {
      const notes = []
      if (c.groupement) notes.push('Un DC2 par membre du groupement.')
      if (c.moinsUnAn) notes.push('Entreprise de moins d\'un an : indiquez le chiffre d\'affaires disponible depuis la création ; à défaut, joignez une attestation bancaire ou un autre document prouvant votre capacité financière.')
      return notes.join(' ') || null
    },
    page: {
      description: 'Le DC2 décrit la capacité économique, financière, technique et professionnelle du candidat. Ce qu\'il contient, comment le remplir, et les erreurs fréquentes.',
      aQuoiSert: [
        'Le DC2 présente votre entreprise : identité, chiffre d\'affaires des trois derniers exercices, effectifs, moyens matériels, références et qualifications.',
        'L\'acheteur s\'en sert pour vérifier que vous avez les capacités demandées par le règlement de la consultation. Depuis 2026, il ne peut pas exiger un chiffre d\'affaires minimum supérieur à 1,5 fois le montant estimé du marché, sauf justification.',
        'Comme le DC1, il peut être remplacé par un DUME.',
      ],
      commentFaire: [
        'Préparez un DC2 générique à jour (chiffres d\'affaires, effectifs, qualifications) et adaptez seulement l\'en-tête et les références à chaque consultation.',
        'Choisissez des références comparables au marché : même type d\'ouvrage, montant proche, acheteur public si possible.',
        'Si le règlement de la consultation exige un niveau minimal de capacité, montrez clairement que vous l\'atteignez.',
      ],
      erreurs: [
        'Un chiffre d\'affaires manquant ou incohérent avec les bilans.',
        'Des références anciennes ou sans rapport avec le marché.',
        'Une qualification exigée non mentionnée, alors que vous la détenez ou pouvez prouver une capacité équivalente.',
      ],
      faq: [
        { q: 'Mon entreprise a moins de trois ans : que mettre dans le DC2 ?', a: 'Indiquez les chiffres d\'affaires des exercices disponibles. Si vous ne pouvez pas produire les documents demandés pour une raison justifiée, vous pouvez prouver votre capacité financière par tout autre moyen que l\'acheteur juge approprié, par exemple une attestation bancaire.' },
        { q: 'Je n\'ai pas la qualification demandée, puis-je candidater ?', a: 'Oui : l\'acheteur doit accepter des preuves équivalentes, comme des références de chantiers comparables et des certificats de bonne exécution.' },
      ],
    },
  },
  {
    slug: 'dume',
    nom: 'DUME (à la place du DC1 et du DC2)',
    titre: 'DUME : le document unique de marché européen',
    etape: 'candidature',
    quand: 'Au choix du candidat, à la place du DC1 et du DC2',
    validite: 'Réutilisable, à adapter à chaque consultation',
    ou: { label: 'Profil d\'acheteur ou DAJ', href: DAJ_DUME },
    inclure: (c) => c.procedure === 'formalisee' || c.etrangere,
    note: (c) => (c.etrangere ? 'Format européen, reconnu dans tous les États membres : pratique pour une entreprise étrangère.' : 'L\'acheteur doit l\'accepter ; vous restez libre d\'utiliser le DC1 et le DC2.'),
    page: {
      description: 'Le DUME remplace le DC1 et le DC2 en un seul formulaire européen. Quand l\'utiliser, où le remplir, et comment le réutiliser d\'une consultation à l\'autre.',
      aQuoiSert: [
        'Le document unique de marché européen (DUME) est une déclaration sur l\'honneur standardisée au niveau européen : il regroupe en un seul formulaire ce que contiennent le DC1 et le DC2.',
        'Les acheteurs sont tenus de l\'accepter. Vous êtes libre de l\'utiliser ou de répondre avec le DC1 et le DC2.',
        'Son principal intérêt : un DUME générique bien rempli se réutilise d\'une consultation à l\'autre, en ne modifiant que les informations propres au marché.',
      ],
      commentFaire: [
        'Beaucoup de profils d\'acheteur proposent de remplir le DUME en ligne directement dans la consultation : c\'est le plus simple.',
        'Sinon, utilisez le modèle et les explications de la DAJ, puis joignez le fichier à votre candidature.',
        'Complétez la partie IV (critères de sélection) en reprenant les exigences du règlement de la consultation.',
      ],
      erreurs: [
        'Laisser des parties vides qui correspondent à des exigences du règlement de la consultation.',
        'Réutiliser un DUME sans mettre à jour la consultation, les lots ou les chiffres d\'affaires.',
        'Oublier qu\'un DUME par membre est nécessaire en groupement, et par sous-traitant dont vous invoquez les capacités.',
      ],
      faq: [
        { q: 'DC1/DC2 ou DUME : lequel choisir ?', a: 'Les deux sont valables et l\'acheteur doit les accepter. Le DC1/DC2 reste le plus courant en MAPA ; le DUME devient intéressant si vous répondez souvent, car il se réutilise, ou si vous répondez dans d\'autres pays européens.' },
        { q: 'Le DUME est-il obligatoire ?', a: 'Non pour le candidat. Ce sont les acheteurs qui ont l\'obligation de l\'accepter.' },
      ],
    },
  },
  {
    slug: 'dc4',
    nom: 'DC4 (déclaration de sous-traitance)',
    titre: 'DC4 : la déclaration de sous-traitance',
    etape: 'candidature',
    quand: 'Si vous sous-traitez une partie du marché',
    validite: 'Un par sous-traitant',
    ou: { label: 'Formulaire DAJ (Bercy)', href: DAJ_FORMULAIRES },
    inclure: (c) => c.sousTraitance,
    note: () => 'Joignez aussi, pour chaque sous-traitant, son DC2 ou DUME et ses attestations s\'il demande le paiement direct.',
    page: {
      description: 'Le DC4 présente un sous-traitant à l\'acheteur pour acceptation et agrément de ses conditions de paiement. Quand le fournir, comment le remplir, et le paiement direct.',
      aQuoiSert: [
        'Le DC4 demande à l\'acheteur d\'accepter un sous-traitant et d\'agréer ses conditions de paiement. Sans acceptation, le sous-traitant ne peut pas intervenir sur le chantier.',
        'Il fixe le montant maximal des prestations sous-traitées et ouvre droit au paiement direct du sous-traitant par l\'acheteur, au-dessus de 600 € TTC.',
        'Il peut être fourni avec la candidature ou en cours d\'exécution du marché, avant l\'intervention du sous-traitant.',
      ],
      commentFaire: [
        'Remplissez un DC4 par sous-traitant, avec la nature et le montant des prestations sous-traitées.',
        'Joignez les pièces du sous-traitant demandées par l\'acheteur (DC2 ou DUME, attestations, assurances).',
        'Faites signer le DC4 par vous et par le sous-traitant.',
      ],
      erreurs: [
        'Faire intervenir un sous-traitant avant son acceptation par l\'acheteur.',
        'Sous-estimer le montant sous-traité : tout dépassement nécessite un DC4 modificatif.',
        'Oublier les attestations du sous-traitant, ce qui bloque son acceptation.',
      ],
      faq: [
        { q: 'Quand faut-il fournir le DC4 ?', a: 'Dès la candidature si vous connaissez déjà vos sous-traitants, ou plus tard, en cours d\'exécution, mais toujours avant que le sous-traitant n\'intervienne.' },
        { q: 'Un fournisseur de matériaux est-il un sous-traitant ?', a: 'Non. Un simple fournisseur ne réalise pas une partie des prestations du marché : il ne fait pas l\'objet d\'un DC4.' },
      ],
    },
  },
  {
    slug: 'groupement',
    nom: 'Convention de groupement et habilitation du mandataire',
    titre: 'Convention de groupement',
    etape: 'candidature',
    quand: 'En groupement',
    validite: 'Une par consultation',
    ou: { label: 'Rédigée entre les membres', href: null },
    inclure: (c) => c.groupement,
    note: () => 'L\'habilitation du mandataire peut figurer dans le DC1 signé par chaque membre.',
  },
  {
    slug: 'references',
    nom: 'Références et certificats de capacité',
    titre: 'Références et certificats de capacité',
    etape: 'candidature',
    quand: 'Selon le règlement de la consultation',
    validite: 'Sans limite (références de moins de 5 ans en travaux le plus souvent)',
    ou: { label: 'Vos dossiers, attestations des maîtres d\'ouvrage', href: null },
    inclure: () => true,
    note: (c) => (c.moinsUnAn ? 'Sans références propres, citez celles des dirigeants ou de l\'équipe et décrivez vos moyens.' : null),
  },
  {
    slug: 'qualifications',
    nom: 'Certificats de qualification (Qualibat, Qualifelec, OPQIBI…)',
    titre: 'Certificats de qualification professionnelle',
    etape: 'candidature',
    quand: 'Si le règlement de la consultation les demande',
    validite: 'Selon l\'organisme',
    ou: { label: 'Organisme de qualification', href: null },
    inclure: (c) => c.typeMarche === 'travaux',
    note: () => 'L\'acheteur doit accepter des preuves équivalentes.',
  },
  {
    slug: 'attestation-assurance',
    nom: 'Attestations d\'assurance (RC professionnelle, décennale)',
    titre: 'Attestations d\'assurance RC et décennale',
    etape: 'candidature',
    quand: 'Souvent exigées dès la candidature',
    validite: 'Année en cours',
    ou: { label: 'Votre assureur', href: null },
    expire: true,
    inclure: () => true,
    note: (c) => (c.typeMarche === 'travaux' ? 'Travaux : la décennale doit couvrir les activités du marché.' : null),
    page: {
      description: 'Responsabilité civile professionnelle et garantie décennale : quelles attestations fournir dans un marché public, quand, et ce que l\'acheteur vérifie.',
      aQuoiSert: [
        'L\'attestation de responsabilité civile professionnelle prouve que vous êtes assuré pour les dommages causés à des tiers pendant l\'exécution.',
        'Pour les travaux de construction, l\'attestation d\'assurance décennale est obligatoire : elle couvre les dommages qui compromettent la solidité de l\'ouvrage pendant dix ans après la réception.',
        'L\'acheteur vérifie surtout que les activités déclarées à l\'assureur correspondent aux travaux du marché.',
      ],
      commentFaire: [
        'Demandez à votre assureur une attestation de l\'année en cours, nominative, qui liste vos activités garanties.',
        'Vérifiez que chaque activité du marché (par exemple étanchéité, charpente, électricité) figure bien dans l\'attestation.',
        'Pour un marché important, vérifiez aussi les plafonds de garantie.',
      ],
      erreurs: [
        'Fournir l\'attestation de l\'année précédente.',
        'Une activité du marché absente de l\'attestation décennale.',
        'Un sous-traitant sans attestation à jour.',
      ],
      faq: [
        { q: 'L\'assurance décennale est-elle obligatoire pour tous les marchés de travaux ?', a: 'Elle est obligatoire pour les travaux de construction d\'ouvrages relevant de la responsabilité décennale. Pour de simples travaux d\'entretien, elle peut ne pas l\'être, mais l\'acheteur demande souvent une attestation : lisez le règlement de la consultation.' },
      ],
    },
  },
  {
    slug: 'acte-engagement',
    nom: 'Acte d\'engagement (ATTRI1 ou modèle de l\'acheteur)',
    titre: 'Acte d\'engagement',
    etape: 'offre',
    quand: 'Toujours (signé à l\'attribution le plus souvent)',
    validite: 'Une par consultation',
    ou: { label: 'Dossier de consultation ou formulaire ATTRI1', href: DAJ_FORMULAIRES },
    inclure: () => true,
  },
  {
    slug: 'memoire-technique',
    nom: 'Mémoire technique',
    titre: 'Mémoire technique',
    etape: 'offre',
    quand: 'Quand la valeur technique est un critère',
    validite: 'Une par consultation',
    ou: { label: 'À rédiger selon le cadre de réponse', href: null },
    inclure: () => true,
  },
  {
    slug: 'decomposition-prix',
    nom: 'Décomposition du prix (DPGF, BPU, DQE)',
    titre: 'Décomposition du prix',
    etape: 'offre',
    quand: 'Toujours',
    validite: 'Une par consultation',
    ou: { label: 'Cadre fourni dans le dossier de consultation', href: null },
    inclure: () => true,
  },
  {
    slug: 'attestation-vigilance',
    nom: 'Attestation de vigilance URSSAF (ou MSA)',
    titre: 'Attestation de vigilance URSSAF',
    etape: 'attributaire',
    quand: 'Attributaire, avant signature',
    validite: '6 mois, à renouveler tous les 6 mois pendant l\'exécution',
    ou: { label: 'Espace en ligne urssaf.fr', href: 'https://www.urssaf.fr' },
    expire: true,
    inclure: () => true,
    note: (c) => (c.etrangere ? 'Entreprise étrangère : document équivalent de l\'organisme de protection sociale du pays d\'établissement, traduit en français.' : null),
    page: {
      description: 'L\'attestation de vigilance URSSAF prouve que vous êtes à jour de vos déclarations et cotisations sociales. Validité de 6 mois, renouvellement pendant le marché, comment l\'obtenir.',
      aQuoiSert: [
        'L\'attestation de vigilance prouve que vous déclarez vos salariés et payez vos cotisations sociales. L\'acheteur doit la demander à l\'entreprise retenue avant de signer le marché.',
        'Elle vaut 6 mois. Pour les marchés d\'au moins 5 000 € HT, l\'acheteur doit vous la redemander tous les 6 mois jusqu\'à la fin de l\'exécution.',
        'Beaucoup d\'acheteurs la récupèrent automatiquement via la plateforme e-attestations, si vous y avez un compte.',
      ],
      commentFaire: [
        'Connectez-vous à votre espace en ligne sur urssaf.fr (ou msa.fr pour le régime agricole) et téléchargez l\'attestation de vigilance.',
        'Vérifiez sa date : elle doit avoir moins de 6 mois au moment où l\'acheteur la demande.',
        'Notez la date d\'expiration pour la renouveler avant chaque échéance pendant le marché.',
      ],
      erreurs: [
        'Fournir une attestation de plus de 6 mois au moment de l\'attribution : le marché peut être attribué au candidat suivant.',
        'Oublier le renouvellement pendant l\'exécution, ce qui bloque les paiements chez certains acheteurs.',
        'Confondre attestation de vigilance et attestation de régularité fiscale.',
      ],
      faq: [
        { q: 'Que faire si mon attestation expire pendant la consultation ?', a: 'Téléchargez-en une nouvelle sur urssaf.fr : elle est délivrée immédiatement si vous êtes à jour. Ce qui compte, c\'est qu\'elle ait moins de 6 mois quand l\'acheteur vous la demande avant l\'attribution.' },
        { q: 'L\'attestation de vigilance est-elle exigée dès la candidature ?', a: 'Non, en principe seulement de l\'entreprise retenue, avant la signature. Certains règlements de consultation la demandent plus tôt : lisez-le.' },
      ],
    },
  },
  {
    slug: 'attestation-regularite-fiscale',
    nom: 'Attestation de régularité fiscale',
    titre: 'Attestation de régularité fiscale',
    etape: 'attributaire',
    quand: 'Attributaire, avant signature',
    validite: 'Pas de durée fixe : la plus récente possible',
    ou: { label: 'Espace professionnel impots.gouv.fr', href: 'https://www.impots.gouv.fr/professionnel' },
    expire: true,
    inclure: () => true,
    note: (c) => (c.etrangere ? 'Entreprise étrangère : certificat équivalent de l\'administration fiscale du pays d\'établissement.' : null),
    page: {
      description: 'L\'attestation de régularité fiscale prouve que vous êtes à jour de vos déclarations et paiements d\'impôts. Où la télécharger, quelle date, et les erreurs fréquentes.',
      aQuoiSert: [
        'Elle atteste que vous avez souscrit vos déclarations fiscales et payé vos impôts (TVA, impôt sur les sociétés ou sur le revenu) à la date de délivrance.',
        'Elle est demandée à l\'entreprise retenue avant la signature du marché, avec l\'attestation de vigilance URSSAF.',
      ],
      commentFaire: [
        'Téléchargez-la dans votre espace professionnel sur impots.gouv.fr, rubrique « Attestations », où elle est délivrée immédiatement.',
        'Fournissez la plus récente possible : beaucoup d\'acheteurs attendent une attestation de l\'année en cours.',
      ],
      erreurs: [
        'Fournir une attestation ancienne alors qu\'une version récente se télécharge en quelques secondes.',
        'Attendre l\'attribution pour vérifier qu\'aucune déclaration n\'est en retard : l\'attestation ne peut pas être délivrée dans ce cas.',
      ],
      faq: [
        { q: 'Quelle est la durée de validité de l\'attestation de régularité fiscale ?', a: 'Aucune durée n\'est fixée par les textes : elle atteste de votre situation à sa date de délivrance. En pratique, fournissez une attestation récente, de l\'année en cours.' },
      ],
    },
  },
  {
    slug: 'kbis',
    nom: 'Extrait Kbis (ou D1 pour les artisans)',
    titre: 'Extrait Kbis',
    etape: 'attributaire',
    quand: 'Attributaire, avant signature',
    validite: 'Moins de 3 mois en pratique',
    ou: { label: 'Infogreffe', href: 'https://www.infogreffe.fr' },
    expire: true,
    inclure: () => true,
    note: (c) => (c.etrangere ? 'Entreprise étrangère : extrait du registre professionnel du pays d\'établissement, traduit en français.' : null),
    page: {
      description: 'L\'extrait Kbis prouve l\'existence juridique de votre entreprise. Quelle ancienneté, où l\'obtenir gratuitement, et l\'équivalent pour les artisans et les entreprises étrangères.',
      aQuoiSert: [
        'L\'extrait Kbis prouve l\'immatriculation de votre société au registre du commerce et des sociétés, et identifie ses dirigeants.',
        'Les artisans fournissent un extrait d\'immatriculation au registre national des entreprises ou au répertoire des métiers.',
      ],
      commentFaire: [
        'Téléchargez votre extrait sur infogreffe.fr ou via Monidenum, gratuitement pour les dirigeants de société.',
        'Fournissez un extrait récent : les acheteurs demandent le plus souvent moins de 3 mois.',
      ],
      erreurs: [
        'Un extrait de plus de 3 mois quand l\'acheteur exige un document récent.',
        'Un signataire qui n\'apparaît pas sur le Kbis sans délégation de pouvoir jointe.',
      ],
      faq: [
        { q: 'Combien de temps un Kbis est-il valable ?', a: 'Les textes ne fixent pas de durée. En pratique, les acheteurs demandent un extrait de moins de 3 mois au moment de l\'attribution.' },
      ],
    },
  },
  {
    slug: 'salaries-etrangers',
    nom: 'Liste des salariés étrangers soumis à autorisation de travail',
    titre: 'Liste des salariés étrangers',
    etape: 'attributaire',
    quand: 'Attributaire qui emploie des salariés étrangers soumis à autorisation de travail',
    validite: 'À renouveler tous les 6 mois pendant l\'exécution',
    ou: { label: 'Document établi par l\'entreprise', href: null },
    inclure: () => true,
  },
  {
    slug: 'detachement',
    nom: 'Déclaration de détachement (SIPSI) et documents traduits',
    titre: 'Détachement de salariés',
    etape: 'attributaire',
    quand: 'Entreprise étrangère qui détache des salariés en France',
    validite: 'Par chantier',
    ou: { label: 'Téléservice SIPSI', href: 'https://www.sipsi.travail.gouv.fr' },
    inclure: (c) => c.etrangere,
  },
]

export const ETAPE_LABELS: Record<EtapePiece, string> = {
  candidature: 'Candidature',
  offre: 'Offre',
  attributaire: 'Si vous êtes retenu',
}

export function piecesPour(c: ContexteCandidature): Piece[] {
  return PIECES.filter((p) => p.inclure(c))
}

export const PIECES_AVEC_PAGE = PIECES.filter((p) => p.page)

export function pieceHref(slug: string): string {
  return `/pieces/${slug}`
}
