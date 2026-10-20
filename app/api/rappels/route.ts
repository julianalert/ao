import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { emailConfirmation } from '@/lib/alertes/emails'
import { baseUrl, erreur, lireJson, tokenDepuis } from '@/lib/alertes/http'
import {
  abonneParToken, ajouterRappel, confirmationRecente, dateExpiration, DUREES_ATTESTATION, emailValide, journaliserEmail, obtenirAbonne,
} from '@/lib/alertes/store'

// Rappel par email avant l'expiration d'une attestation (outil « pièces de candidature »).
export async function POST(req: NextRequest) {
  const body = await lireJson(req)
  const piece = typeof body.piece === 'string' ? body.piece : ''
  const delivreeLe = typeof body.delivreeLe === 'string' ? body.delivreeLe : ''
  const expireLe = dateExpiration(piece, delivreeLe)
  if (!expireLe || !DUREES_ATTESTATION[piece]) return NextResponse.json({ error: 'Pièce ou date invalide.' }, { status: 400 })

  try {
    let abonne = await abonneParToken(tokenDepuis(req, body))
    if (!abonne) {
      if (!emailValide(body.email)) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
      abonne = await obtenirAbonne(body.email, 'rappel-attestation')
    }
    await ajouterRappel(abonne.id, piece, delivreeLe, expireLe)

    if (!abonne.confirmed_at) {
      if (!(await confirmationRecente(abonne.id))) {
        const msg = emailConfirmation({ to: abonne.email, baseUrl: baseUrl(req), confirmToken: abonne.confirm_token!, resume: null })
        const sent = await sendEmail(msg)
        await journaliserEmail(abonne.id, 'confirmation', msg.subject, sent.id)
      }
      return NextResponse.json({ status: 'confirmation-envoyee', expireLe })
    }
    return NextResponse.json({ status: 'rappel-cree', expireLe })
  } catch (err) {
    return erreur(err, 'POST /api/rappels')
  }
}
