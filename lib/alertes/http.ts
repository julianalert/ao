import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_ABONNE, StoreIndisponible } from './store'

export function baseUrl(req: NextRequest): string {
  return req.nextUrl.origin
}

/** Token d'abonné : paramètre `t`, corps JSON `t`, ou cookie posé après confirmation. */
export function tokenDepuis(req: NextRequest, body?: { t?: unknown }): string | null {
  const t = req.nextUrl.searchParams.get('t') ?? (typeof body?.t === 'string' ? body.t : null) ?? req.cookies.get(COOKIE_ABONNE)?.value
  return t || null
}

export function poserCookieAbonne(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_ABONNE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
}

export function erreur(err: unknown, contexte: string): NextResponse {
  if (err instanceof StoreIndisponible) {
    console.error(`${contexte}:`, err.message)
    return NextResponse.json({ error: 'Service momentanément indisponible.' }, { status: 503 })
  }
  const message = err instanceof Error ? err.message : 'Erreur inattendue'
  console.error(`${contexte}:`, message)
  return NextResponse.json({ error: message.startsWith('Maximum') ? message : 'Une erreur est survenue, réessayez.' }, { status: message.startsWith('Maximum') ? 400 : 500 })
}

export async function lireJson(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    const body = await req.json()
    return body && typeof body === 'object' ? body : {}
  } catch {
    return {}
  }
}
