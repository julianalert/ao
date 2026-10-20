import { NextRequest, NextResponse } from 'next/server'
import { abonneParToken, desinscrire } from '@/lib/alertes/store'

// Désinscription en un clic : GET depuis le lien de l'email, POST depuis le client mail (RFC 8058).
async function traiter(req: NextRequest) {
  const abonne = await abonneParToken(req.nextUrl.searchParams.get('t'))
  if (abonne && !abonne.unsubscribed_at) await desinscrire(abonne.id)
  return abonne
}

export async function GET(req: NextRequest) {
  try {
    const abonne = await traiter(req)
    return NextResponse.redirect(new URL(abonne ? '/alertes/desinscrit' : '/alertes/gerer?erreur=lien', req.url))
  } catch (err) {
    console.error('GET /api/alertes/desinscription:', err)
    return NextResponse.redirect(new URL('/alertes/gerer?erreur=service', req.url))
  }
}

export async function POST(req: NextRequest) {
  try {
    await traiter(req)
    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('POST /api/alertes/desinscription:', err)
    return NextResponse.json({ error: 'Service indisponible' }, { status: 503 })
  }
}
