import { NextRequest, NextResponse } from 'next/server'
import { validerCriteres } from '@/lib/alertes/criteres'
import { erreur, lireJson, tokenDepuis } from '@/lib/alertes/http'
import { abonneParToken, modifierAlerte, supprimerAlerte } from '@/lib/alertes/store'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const body = await lireJson(req)
  try {
    const abonne = await abonneParToken(tokenDepuis(req, body))
    if (!abonne) return NextResponse.json({ error: 'Lien expiré ou invalide.' }, { status: 401 })
    await modifierAlerte(abonne.id, id, {
      ...(body.frequence === 'quotidienne' || body.frequence === 'hebdomadaire' ? { frequence: body.frequence } : {}),
      ...(typeof body.actif === 'boolean' ? { actif: body.actif } : {}),
      ...(typeof body.nom === 'string' ? { nom: body.nom.trim().slice(0, 80) || null } : {}),
      ...(body.criteres ? { criteres: validerCriteres(body.criteres) } : {}),
    })
    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    return erreur(err, 'PATCH /api/alertes/[id]')
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  try {
    const abonne = await abonneParToken(tokenDepuis(req))
    if (!abonne) return NextResponse.json({ error: 'Lien expiré ou invalide.' }, { status: 401 })
    await supprimerAlerte(abonne.id, id)
    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    return erreur(err, 'DELETE /api/alertes/[id]')
  }
}
