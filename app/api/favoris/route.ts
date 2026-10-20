import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { emailConfirmation } from '@/lib/alertes/emails'
import { baseUrl, erreur, lireJson, tokenDepuis } from '@/lib/alertes/http'
import { abonneParToken, ajouterFavori, confirmationRecente, emailValide, journaliserEmail, obtenirAbonne, retirerFavori } from '@/lib/alertes/store'

// Favoris : rappel J-7 et J-2 avant la date limite. Sans cookie d'abonné, l'email est demandé.
export async function POST(req: NextRequest) {
  const body = await lireJson(req)
  const aoId = Number(body.aoId)
  if (!Number.isInteger(aoId) || aoId <= 0) return NextResponse.json({ error: 'AO invalide.' }, { status: 400 })

  try {
    let abonne = await abonneParToken(tokenDepuis(req, body))
    if (!abonne) {
      if (!emailValide(body.email)) return NextResponse.json({ status: 'email-requis' }, { status: 401 })
      abonne = await obtenirAbonne(body.email, 'favori')
    }
    await ajouterFavori(abonne.id, aoId)

    if (!abonne.confirmed_at) {
      if (!(await confirmationRecente(abonne.id))) {
        const msg = emailConfirmation({ to: abonne.email, baseUrl: baseUrl(req), confirmToken: abonne.confirm_token!, resume: null })
        const sent = await sendEmail(msg)
        await journaliserEmail(abonne.id, 'confirmation', msg.subject, sent.id)
      }
      return NextResponse.json({ status: 'confirmation-envoyee' })
    }
    return NextResponse.json({ status: 'favori-ajoute' })
  } catch (err) {
    return erreur(err, 'POST /api/favoris')
  }
}

export async function DELETE(req: NextRequest) {
  const aoId = Number(req.nextUrl.searchParams.get('ao'))
  try {
    const abonne = await abonneParToken(tokenDepuis(req))
    if (!abonne) return NextResponse.json({ error: 'Lien expiré ou invalide.' }, { status: 401 })
    await retirerFavori(abonne.id, aoId)
    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    return erreur(err, 'DELETE /api/favoris')
  }
}
