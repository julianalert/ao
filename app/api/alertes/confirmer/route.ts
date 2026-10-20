import { NextRequest, NextResponse } from 'next/server'
import { poserCookieAbonne } from '@/lib/alertes/http'
import { confirmerAbonne } from '@/lib/alertes/store'

// Lien de confirmation (double opt-in) : active l'abonné puis ouvre sa page de gestion.
export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get('t') ?? ''
  try {
    const abonne = await confirmerAbonne(t)
    if (!abonne) return NextResponse.redirect(new URL('/alertes/gerer?erreur=lien', req.url))
    const res = NextResponse.redirect(new URL(`/alertes/gerer?t=${abonne.token}&bienvenue=1`, req.url))
    poserCookieAbonne(res, abonne.token)
    return res
  } catch (err) {
    console.error('GET /api/alertes/confirmer:', err)
    return NextResponse.redirect(new URL('/alertes/gerer?erreur=service', req.url))
  }
}
