import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { emailLienGestion } from '@/lib/alertes/emails'
import { baseUrl, erreur, lireJson } from '@/lib/alertes/http'
import { abonneParEmail, emailValide, journaliserEmail } from '@/lib/alertes/store'

// Envoie le lien magique de gestion. Réponse identique que l'adresse existe ou non.
export async function POST(req: NextRequest) {
  const body = await lireJson(req)
  if (!emailValide(body.email)) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
  try {
    const abonne = await abonneParEmail(body.email)
    if (abonne && !abonne.unsubscribed_at) {
      const msg = emailLienGestion({ to: abonne.email, baseUrl: baseUrl(req), token: abonne.token })
      const sent = await sendEmail(msg)
      await journaliserEmail(abonne.id, 'lien', msg.subject, sent.id)
    }
    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    return erreur(err, 'POST /api/alertes/lien')
  }
}
