import { z } from 'zod'

// Fiche de synthèse renvoyée par Claude. Chaque information porte sa source :
// document, page (si paginé), section et extrait recopié mot pour mot.

export const SourceSchema = z.object({
  document: z.string().describe('Nom exact du document, tel qu\'indiqué dans son en-tête'),
  page: z.number().int().nullable().describe('Numéro de page, ou null si le document n\'est pas paginé'),
  section: z.string().nullable().describe('Article ou titre de section, par ex. « Article 5.2 - Critères »'),
  extrait: z.string().describe('Passage copié mot pour mot depuis le document, 10 à 300 caractères, sans reformulation'),
})

const Champ = z
  .object({ valeur: z.string().describe('Information en français, courte et factuelle'), source: SourceSchema })
  .nullable()
  .describe('null si l\'information ne figure pas explicitement dans les documents')

const Element = z.object({ libelle: z.string(), source: SourceSchema })

export const FicheSchema = z.object({
  type_marche: z.enum(['travaux', 'fournitures', 'services', 'inconnu']),
  procedure_type: z.enum(['mapa', 'formalisee', 'inconnue']),
  identite: z.object({
    acheteur: Champ,
    objet: Champ,
    reference: Champ,
    procedure: Champ,
    montant_estime: Champ,
  }),
  calendrier: z.object({
    date_limite_remise: Champ,
    date_visite: Champ,
    date_demarrage: Champ,
    duree: Champ,
    validite_offres: Champ,
  }),
  lots: z.object({
    allotissement: Champ,
    plusieurs_lots: Champ.describe('Possibilité de répondre à plusieurs lots, ou limitation du nombre de lots attribuables'),
    liste: z.array(
      z.object({ numero: z.string(), intitule: z.string(), montant: z.string().nullable(), source: SourceSchema }),
    ),
  }),
  criteres: z.object({
    liste: z.array(
      z.object({
        critere: z.string(),
        ponderation: z.string().nullable(),
        sous_criteres: z.array(z.string()),
        source: SourceSchema,
      }),
    ),
    methode_notation_prix: Champ,
    methode_code: z
      .enum(['proportionnelle', 'lineaire', 'minmax', 'coefficient', 'autre', 'non_precisee'])
      .describe('proportionnelle : Nmax × Pmin / P ; lineaire : Nmax × (1 − (P − Pmin)/Pmin) ; minmax : utilise Pmax et Pmin ; coefficient : linéaire avec un coefficient k'),
    poids_prix: z.number().nullable().describe('Pondération du critère prix en pourcentage, si elle est indiquée'),
    note_max: z.number().nullable().describe('Note maximale utilisée (10, 20, 100), si elle est indiquée'),
  }),
  pieces: z.object({
    candidature: z.array(Element),
    offre: z.array(Element),
  }),
  conditions: z.object({
    visite_obligatoire: Champ,
    variantes: Champ,
    pse: Champ.describe('Prestations supplémentaires éventuelles'),
    groupement: Champ,
    sous_traitance: Champ,
    avance: Champ,
    retenue_garantie: Champ,
    penalites: Champ,
  }),
  points_attention: z.array(
    z.object({
      titre: z.string(),
      detail: z.string(),
      gravite: z.enum(['haute', 'moyenne', 'basse']),
      source: SourceSchema,
    }),
  ),
})

export type Source = z.infer<typeof SourceSchema>
export type Fiche = z.infer<typeof FicheSchema>

/** Statut de vérification ajouté côté serveur à chaque source. */
export type SourceVerifiee = Source & { verifie: boolean | null }

export type DocumentAnalyse = {
  nom: string
  type: string
  pages: number | null
  mode: 'texte' | 'pdf-image' | 'ignore'
  note: string | null
}

export type ResultatAnalyse = {
  fiche: Fiche
  documents: DocumentAnalyse[]
  /** Informations écartées car leur extrait n'a pas été retrouvé dans les documents */
  ecartees: number
  verifiees: number
  nonVerifiables: number
  ao: { id: number; titre: string; href: string } | null
  avisSeul: boolean
}
