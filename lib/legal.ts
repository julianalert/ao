// Informations légales affichées sur /mentions-legales et /confidentialite.
//
// TODO avant mise en ligne : compléter les champs à null avec les informations de
// la société qui édite le site (Kbis) et valider les durées de conservation.
// Tant qu'un champ est à null, la page affiche « à compléter ».

export type ChampLegal = string | null

export const EDITEUR: {
  nomCommercial: string
  raisonSociale: ChampLegal
  formeJuridique: ChampLegal
  capital: ChampLegal
  rcs: ChampLegal
  siege: ChampLegal
  directeurPublication: ChampLegal
  email: ChampLegal
  site: string
  contact: string
} = {
  nomCommercial: 'vision',
  raisonSociale: null, // ex. « VISION »
  formeJuridique: null, // ex. « SAS »
  capital: null, // ex. « 1 000 € »
  rcs: null, // ex. « RCS Toulon 123 456 789 »
  siege: null, // adresse du siège social
  directeurPublication: null, // prénom et nom du représentant légal
  email: null, // adresse de contact, aussi utilisée pour les demandes RGPD
  site: 'https://www.visionbtp.com',
  contact: 'https://www.visionbtp.com/contact',
}

export const HEBERGEUR = {
  nom: 'Vercel Inc.',
  adresse: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  site: 'https://vercel.com',
}

export const CONSERVATION = {
  journalAnalyses: '12 mois', // TODO : à valider (table analyses_rc, quota et lutte contre les abus)
  emails: "jusqu'à votre désinscription ou votre demande de suppression",
}

// Date de dernière mise à jour des pages légales
export const LEGAL_MAJ = '2026-10-21'
