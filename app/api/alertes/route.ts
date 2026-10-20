import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { criteresVides, decrireCriteres, validerCriteres, type Frequence } from '@/lib/alertes/criteres'
import { emailConfirmation } from '@/lib/alertes/emails'
import { baseUrl, erreur, lireJson } from '@/lib/alertes/http'
import { confirmationRecente, creerAlerte, emailValide, journaliserEmail, obtenirAbonne } from '@/lib/alertes/store'

// Création d'une alerte. Double opt-in : l'alerte n'envoie rien tant que l'adresse n'est pas confirmée.
export async function POST(req: NextRequest) {
  const body = await lireJson(req)
  if (body.website) return NextResponse.json({ status: 'confirmation-envoyee' }) // pot de miel
  if (!emailValide(body.email)) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })

  const criteres = validerCriteres(body.criteres)
  if (criteresVides(criteres)) {
    return NextResponse.json({ error: 'Choisissez au moins un métier, un code CPV ou un mot-clé.' }, { status: 400 })
  }
  const frequence: Frequence = body.frequence === 'hebdomadaire' ? 'hebdomadaire' : 'quotidienne'
  const nom = typeof body.nom === 'string' && body.nom.trim() ? body.nom.trim().slice(0, 80) : null
  const source = typeof body.source === 'string' ? body.source.slice(0, 200) : null

  try {
    const abonne = await obtenirAbonne(body.email, source)
    await creerAlerte(abonne.id, criteres, frequence, nom)

    if (abonne.confirmed_at) return NextResponse.json({ status: 'alerte-creee' })

    if (!(await confirmationRecente(abonne.id))) {
      const msg = emailConfirmation({ to: abonne.email, baseUrl: baseUrl(req), confirmToken: abonne.confirm_token!, resume: decrireCriteres(criteres) })
      const sent = await sendEmail(msg)
      await journaliserEmail(abonne.id, 'confirmation', msg.subject, sent.id)
    }
    return NextResponse.json({ status: 'confirmation-envoyee' })
  } catch (err) {
    return erreur(err, 'POST /api/alertes')
  }
}
