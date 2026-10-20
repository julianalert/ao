// Outil 4 : procédure, publicité et délais selon le montant estimé.
// Les montants des seuils viennent de la table `seuils` (voir lib/seuils.ts), jamais de ce fichier.

export type TypeMarche = 'travaux' | 'fournitures' | 'services'
export type TypeAcheteur = 'etat' | 'collectivite' | 'entite-adjudicatrice'
export type FamilleSeuil = 'travaux' | 'fournitures-services'
export type Niveau = 'dispense' | 'mapa' | 'formalisee'

export type Seuil = {
  id: string
  code: string
  type_marche: FamilleSeuil | null
  acheteur: TypeAcheteur | null
  montant: number
  valid_from: string
  valid_to: string | null
  libelle: string
  reference: string
  source_url: string | null
  note: string | null
}

export const TYPES_MARCHE: { value: TypeMarche; label: string }[] = [
  { value: 'travaux', label: 'Travaux' },
  { value: 'fournitures', label: 'Fournitures' },
  { value: 'services', label: 'Services' },
]

export const TYPES_ACHETEUR: { value: TypeAcheteur; label: string; hint: string }[] = [
  { value: 'etat', label: 'État', hint: 'ministères, services déconcentrés, établissements publics nationaux' },
  { value: 'collectivite', label: 'Collectivité territoriale', hint: 'communes, départements, régions, EPCI, établissements locaux' },
  { value: 'entite-adjudicatrice', label: 'Entité adjudicatrice', hint: 'réseaux : eau, énergie, transports, postes' },
]

export const NIVEAU_LABELS: Record<Niveau, string> = {
  dispense: 'Sans publicité ni mise en concurrence',
  mapa: 'Procédure adaptée (MAPA)',
  formalisee: 'Procédure formalisée',
}

export function familleSeuil(t: TypeMarche): FamilleSeuil {
  return t === 'travaux' ? 'travaux' : 'fournitures-services'
}

/** Seuil en vigueur à une date ; à égalité, le plus spécifique puis le plus récent. */
export function seuilApplicable(
  seuils: Seuil[],
  code: string,
  famille: FamilleSeuil | null,
  acheteur: TypeAcheteur | null,
  date: string,
): Seuil | null {
  const specificite = (s: Seuil) => (s.type_marche ? 2 : 0) + (s.acheteur ? 1 : 0)
  return (
    seuils
      .filter(
        (s) =>
          s.code === code &&
          (s.type_marche === null || s.type_marche === famille) &&
          (s.acheteur === null || s.acheteur === acheteur) &&
          s.valid_from <= date &&
          (s.valid_to === null || date <= s.valid_to),
      )
      .sort((a, b) => specificite(b) - specificite(a) || b.valid_from.localeCompare(a.valid_from))[0] ?? null
  )
}

export type Delai = { procedure: string; delai: string; reference: string }

const DELAIS_POUVOIR_ADJUDICATEUR: Delai[] = [
  {
    procedure: 'Appel d\'offres ouvert',
    delai: '35 jours après l\'envoi de l\'avis ; 30 jours si les offres peuvent être déposées en ligne ; 15 jours en cas d\'urgence ou d\'avis de préinformation',
    reference: 'Art. R2161-2 et R2161-3',
  },
  {
    procedure: 'Appel d\'offres restreint',
    delai: 'Candidatures : 30 jours. Offres : 30 jours après l\'invitation à soumissionner (25 jours en ligne, 10 jours en cas d\'urgence)',
    reference: 'Art. R2161-6 à R2161-8',
  },
  {
    procedure: 'Procédure avec négociation',
    delai: 'Candidatures : 30 jours (15 jours en cas d\'urgence), puis offres initiales dans le délai fixé par l\'invitation',
    reference: 'Art. R2161-12 et suivants',
  },
  {
    procedure: 'Dialogue compétitif',
    delai: 'Candidatures : 30 jours après l\'envoi de l\'avis',
    reference: 'Art. R2161-24',
  },
]

const DELAIS_ENTITE_ADJUDICATRICE: Delai[] = [
  {
    procedure: 'Appel d\'offres ouvert',
    delai: '35 jours après l\'envoi de l\'avis, réductible en cas d\'urgence ou d\'avis périodique indicatif',
    reference: 'Art. R2161-2 et suivants',
  },
  {
    procedure: 'Appel d\'offres restreint ou procédure avec négociation',
    delai: 'Candidatures : en principe 30 jours, jamais moins de 15 jours. Offres : fixées d\'un commun accord avec les candidats, à défaut au moins 10 jours',
    reference: 'Art. R2161-1 et suivants',
  },
]

export type ProcedureInput = {
  typeMarche: TypeMarche
  acheteur: TypeAcheteur
  montant: number
  date: string
  alloti: boolean
  montantLot: number | null
  /** Travaux d'installation de pompes à chaleur ou de raccordement à un réseau de chaleur */
  pac: boolean
}

export type ResultatProcedure = {
  niveau: Niveau
  dispense: Seuil | null
  formalise: Seuil | null
  publiciteMapa: Seuil | null
  ecrit: Seuil | null
  dceEnLigne: Seuil | null
  pacApplique: boolean
  procedures: string[]
  publicite: { titre: string; detail: string; reference: string }
  delais: Delai[] | null
  delaiMapa: string | null
  marcheEcrit: boolean
  dceObligatoire: boolean
  lot: { niveau: Niveau; titre: string; detail: string } | null
  /** Bornes de la tranche, pour chercher les AO comparables */
  tranche: { min: number; max: number | null }
}

export function determinerProcedure(input: ProcedureInput, seuils: Seuil[]): ResultatProcedure | null {
  const famille = familleSeuil(input.typeMarche)
  let dispense = seuilApplicable(seuils, 'dispense', famille, input.acheteur, input.date)
  const pac = input.pac && famille === 'travaux' ? seuilApplicable(seuils, 'dispense-pac', famille, input.acheteur, input.date) : null
  const pacApplique = !!pac && (!dispense || pac.montant > dispense.montant)
  if (pacApplique) dispense = pac
  const formalise = seuilApplicable(seuils, 'formalise', famille, input.acheteur, input.date)
  if (!dispense || !formalise || !(input.montant >= 0)) return null

  const publiciteMapa = seuilApplicable(seuils, 'publicite-mapa', famille, input.acheteur, input.date)
  const ecrit = seuilApplicable(seuils, 'ecrit', famille, input.acheteur, input.date)
  const dceEnLigne = seuilApplicable(seuils, 'dce-en-ligne', famille, input.acheteur, input.date)
  const etatOuCollectivite = input.acheteur !== 'entite-adjudicatrice'

  const niveau: Niveau = input.montant < dispense.montant ? 'dispense' : input.montant < formalise.montant ? 'mapa' : 'formalisee'

  let publicite: ResultatProcedure['publicite']
  let procedures: string[]
  if (niveau === 'dispense') {
    procedures = ['Achat sur devis, sans avis publié']
    publicite = {
      titre: 'Aucune publicité obligatoire',
      detail:
        'L\'acheteur peut consulter directement une ou plusieurs entreprises. Il doit choisir une offre pertinente, faire une bonne utilisation de l\'argent public et ne pas contracter systématiquement avec la même entreprise.',
      reference: 'Art. R2122-8',
    }
  } else if (niveau === 'mapa') {
    procedures = ['Procédure adaptée (MAPA) : l\'acheteur fixe les modalités, négociation possible si elle est prévue']
    publicite =
      etatOuCollectivite && publiciteMapa && input.montant >= publiciteMapa.montant
        ? {
            titre: 'BOAMP ou journal d\'annonces légales',
            detail:
              'Avis obligatoire au BOAMP ou dans un journal habilité à recevoir des annonces légales, complété si nécessaire par une publication dans la presse spécialisée ou au JOUE.',
            reference: 'Art. R2131-12',
          }
        : {
            titre: 'Publicité libre ou adaptée',
            detail: etatOuCollectivite
              ? 'L\'acheteur choisit le support selon le montant et la nature du marché : profil d\'acheteur, presse locale, site internet…'
              : 'Hors État et collectivités, l\'acheteur choisit librement le support de publicité adapté au marché.',
            reference: 'Art. R2131-12',
          }
  } else {
    procedures =
      input.acheteur === 'entite-adjudicatrice'
        ? ['Appel d\'offres ouvert ou restreint', 'Procédure avec négociation (librement utilisable par les entités adjudicatrices)', 'Dialogue compétitif']
        : ['Appel d\'offres ouvert ou restreint', 'Procédure avec négociation (dans les cas prévus par le Code)', 'Dialogue compétitif (dans les cas prévus par le Code)']
    publicite = etatOuCollectivite
      ? {
          titre: 'BOAMP et JOUE',
          detail: 'Avis de marché obligatoire au Bulletin officiel des annonces des marchés publics et au Journal officiel de l\'Union européenne.',
          reference: 'Art. R2131-16',
        }
      : {
          titre: 'JOUE',
          detail: 'Avis au Journal officiel de l\'Union européenne. Beaucoup d\'entités adjudicatrices publient aussi au BOAMP.',
          reference: 'Art. R2131-16',
        }
  }

  let lot: ResultatProcedure['lot'] = null
  if (input.alloti && input.montantLot && input.montantLot > 0 && niveau !== 'dispense') {
    const lotDispense = seuilApplicable(seuils, 'petit-lot-dispense', famille, input.acheteur, input.date)
    const lotMapa = seuilApplicable(seuils, 'petit-lot-mapa', famille, input.acheteur, input.date)
    const condition = 'si l\'acheteur le classe parmi ses « petits lots », dont le montant cumulé ne doit pas dépasser 20 % de la valeur totale'
    if (lotDispense && input.montantLot < lotDispense.montant) {
      lot = {
        niveau: 'dispense',
        titre: 'Ce lot peut être passé sans publicité ni mise en concurrence',
        detail: `Il fait moins de ${fmt(lotDispense.montant)} : c'est possible ${condition}. Sinon, il suit la procédure de l'opération.`,
      }
    } else if (niveau === 'formalisee' && lotMapa && input.montantLot < lotMapa.montant) {
      lot = {
        niveau: 'mapa',
        titre: 'Ce lot peut être passé en procédure adaptée',
        detail: `Il fait moins de ${fmt(lotMapa.montant)} : c'est possible ${condition}. Sinon, il suit la procédure formalisée de l'opération.`,
      }
    } else {
      lot = {
        niveau,
        titre: `Ce lot suit la procédure de l'opération : ${NIVEAU_LABELS[niveau].toLowerCase()}`,
        detail: 'Le seuil se compare à la valeur totale de tous les lots, pas au montant de votre lot.',
      }
    }
  }

  return {
    niveau,
    dispense,
    formalise,
    publiciteMapa,
    ecrit,
    dceEnLigne,
    pacApplique,
    procedures,
    publicite,
    delais: niveau === 'formalisee' ? (input.acheteur === 'entite-adjudicatrice' ? DELAIS_ENTITE_ADJUDICATRICE : DELAIS_POUVOIR_ADJUDICATEUR) : null,
    delaiMapa:
      niveau === 'mapa'
        ? 'Pas de délai minimum chiffré : l\'acheteur fixe un délai raisonnable, adapté à la complexité du marché et au temps nécessaire pour préparer une offre. En pratique, souvent 2 à 4 semaines.'
        : null,
    marcheEcrit: !!ecrit && input.montant >= ecrit.montant,
    dceObligatoire: niveau !== 'dispense' && !!dceEnLigne && input.montant >= dceEnLigne.montant,
    lot,
    tranche:
      niveau === 'dispense'
        ? { min: 0, max: dispense.montant }
        : niveau === 'mapa'
          ? { min: dispense.montant, max: formalise.montant }
          : { min: formalise.montant, max: null },
  }
}

function fmt(n: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)} € HT`
}

/** Période européenne (ex. « 2026-2027 ») d'un seuil formalisé. */
export function periodeEuropeenne(s: Seuil): string {
  const y = Number(s.valid_from.slice(0, 4))
  return `${y}-${y + 1}`
}
