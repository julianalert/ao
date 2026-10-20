import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import type { DocPrepare } from './extraction'
import { FicheSchema, type Fiche } from './schema'

export const MODELE = 'claude-opus-5-5'

export class AnalyseErreur extends Error {
  constructor(message: string, public status = 500) {
    super(message)
  }
}

export type ProfilEntreprise = { corpsEtat?: string; effectif?: string; chiffreAffaires?: string; zone?: string }

const SYSTEM = `Tu analyses le dossier de consultation (DCE) d'un marché public français pour une entreprise qui envisage de répondre, et tu remplis une fiche de synthèse structurée.

Règles de fiabilité, non négociables :
- Utilise uniquement ce qui est écrit dans les documents fournis : aucune connaissance extérieure, aucune déduction. Si une information n'y figure pas explicitement, le champ vaut null (ou une liste vide).
- Chaque information porte sa source : le nom exact du document, le numéro de page donné par le marqueur [Page N] ou par la page du PDF (null si le document n'est pas paginé), la section (article ou titre) si elle est identifiable, et un extrait.
- L'extrait est un passage continu du document, recopié à l'identique (même orthographe, même ponctuation), de 10 à 300 caractères, qui contient l'information. Ne reformule jamais un extrait, ne le coupe pas au milieu d'un mot et n'y ajoute pas de points de suspension.
- La valeur est rédigée en français, courte et factuelle. Elle peut condenser l'extrait mais n'y ajoute rien.

Contenu attendu :
- Identité, calendrier (dates avec l'heure quand elle est indiquée), lots, critères avec pondérations et sous-critères, méthode de notation du prix si elle est décrite, pièces exigées à la candidature et à l'offre, conditions (visite, variantes, PSE, groupement, sous-traitance, avance, retenue de garantie, pénalités).
- methode_code classe la formule de notation du prix quand elle est décrite, sinon non_precisee. poids_prix et note_max seulement s'ils sont écrits.
- type_marche et procedure_type se lisent dans le texte : procédure adaptée = mapa ; appel d'offres, procédure avec négociation ou dialogue compétitif = formalisee ; sinon inconnu ou inconnue.
- Points d'attention : ce qu'une entreprise du BTP doit repérer avant de répondre (clauses inhabituelles, pénalités élevées, délais courts, exigences de capacité ou de qualification élevées, visite obligatoire, incohérences entre documents, par exemple des dates ou pondérations différentes entre RC et CCAP). Chacun cite le passage qui le justifie. Trois à huit points, les plus utiles d'abord, ou aucun s'il n'y a rien de notable.
- Si un profil d'entreprise est fourni, signale dans les points d'attention les exigences qui semblent poser problème pour ce profil (chiffre d'affaires minimum, qualifications, zone), toujours avec la source.`

function formaterDocument(d: DocPrepare): string {
  const corps = d.pagine ? d.pages!.map((p, i) => `[Page ${i + 1}]\n${p.trim()}`).join('\n\n') : d.pages!.join('\n')
  return `<document nom="${d.nom}" type="${d.type}" pagine="${d.pagine ? 'oui' : 'non'}">\n${corps}\n</document>`
}

function consigne(profil: ProfilEntreprise | null): string {
  const p = profil && Object.values(profil).some(Boolean)
    ? `\n\nProfil de l'entreprise : ${[
        profil.corpsEtat && `corps d'état ${profil.corpsEtat}`,
        profil.effectif && `${profil.effectif} salariés`,
        profil.chiffreAffaires && `chiffre d'affaires annuel ${profil.chiffreAffaires} €`,
        profil.zone && `zone d'intervention ${profil.zone}`,
      ].filter(Boolean).join(', ')}.`
    : ''
  return `Remplis la fiche de synthèse à partir des documents ci-dessus.${p}`
}

/** Envoie les documents à Claude et renvoie la fiche structurée (avant vérification des sources). */
export async function analyserAvecClaude(docs: DocPrepare[], profil: ProfilEntreprise | null): Promise<{ fiche: Fiche; tokens: { entree: number; sortie: number } }> {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) throw new AnalyseErreur('L\'analyse est momentanément indisponible.', 503)
  if (!docs.length) throw new AnalyseErreur('Aucun document exploitable dans le fichier : déposez le RC en PDF ou en DOCX.', 422)

  const content: Anthropic.Beta.BetaContentBlockParam[] = []
  for (const d of docs) {
    if (d.pdfBase64) {
      content.push({ type: 'document', title: d.nom, source: { type: 'base64', media_type: 'application/pdf', data: d.pdfBase64 } })
    } else if (d.pages) {
      content.push({ type: 'text', text: formaterDocument(d) })
    }
  }
  content.push({ type: 'text', text: consigne(profil) })

  const client = new Anthropic()
  try {
    const stream = client.beta.messages.stream({
      model: MODELE,
      max_tokens: 32000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium', format: betaZodOutputFormat(FicheSchema) },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content }],
    })
    const message = await stream.finalMessage()

    if (message.stop_reason === 'refusal') throw new AnalyseErreur('Ce document n\'a pas pu être analysé.', 422)
    if (message.stop_reason === 'max_tokens') throw new AnalyseErreur('Le dossier est trop volumineux pour une analyse complète : déposez le RC seul.', 422)
    if (!message.parsed_output) throw new AnalyseErreur('La réponse de l\'analyse n\'a pas pu être lue, réessayez.', 502)

    return { fiche: message.parsed_output, tokens: { entree: message.usage.input_tokens, sortie: message.usage.output_tokens } }
  } catch (err) {
    if (err instanceof AnalyseErreur) throw err
    if (err instanceof Anthropic.RateLimitError) throw new AnalyseErreur('Trop de demandes en ce moment, réessayez dans une minute.', 503)
    if (err instanceof Anthropic.BadRequestError) {
      console.error('analyse-rc, requête refusée :', err.message)
      throw new AnalyseErreur('Ce fichier n\'a pas pu être analysé (format ou taille).', 422)
    }
    if (err instanceof Anthropic.APIError) {
      console.error(`analyse-rc, API ${err.status} :`, err.message)
      throw new AnalyseErreur('Le service d\'analyse est momentanément indisponible.', 503)
    }
    throw err
  }
}
