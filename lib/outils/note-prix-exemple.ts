import type { Candidat, ParamsNotation } from './note-prix'

/** Cas pré-rempli du simulateur, repris dans l'exemple chiffré de la page. */
export const EXEMPLE_NOTE_PRIX: { params: ParamsNotation; moi: Candidat; concurrents: Candidat[] } = {
  params: { methode: 'proportionnelle', nmax: 20, poidsPrix: 40, k: 2 },
  moi: { id: 'moi', nom: 'Votre offre', prix: 412000, noteTech: 15, moi: true },
  concurrents: [
    { id: 'c1', nom: 'Concurrent A', prix: 389000, noteTech: 14 },
    { id: 'c2', nom: 'Concurrent B', prix: 436000, noteTech: 16 },
    { id: 'c3', nom: 'Concurrent C', prix: 455000, noteTech: 13 },
  ],
}
