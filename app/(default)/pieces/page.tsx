import { permanentRedirect } from 'next/navigation'

// /pieces n'a pas de contenu propre : la checklist est la page de tête.
export default function PiecesIndex() {
  permanentRedirect('/outils/pieces-candidature')
}
