import { NextRequest, NextResponse } from 'next/server'
import { erreur, tokenDepuis } from '@/lib/alertes/http'
import { abonneParToken, supprimerRappel } from '@/lib/alertes/store'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const abonne = await abonneParToken(tokenDepuis(req))
    if (!abonne) return NextResponse.json({ error: 'Lien expiré ou invalide.' }, { status: 401 })
    await supprimerRappel(abonne.id, id)
    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    return erreur(err, 'DELETE /api/rappels/[id]')
  }
}
