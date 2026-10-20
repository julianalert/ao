import { NextResponse } from 'next/server'
import { getIndiceByCode } from '@/lib/indices-catalog'
import { getIndiceSerie } from '@/lib/indices'

// Historique d'un index BT / TP pour le calculateur de révision de prix.
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const def = getIndiceByCode(code)
  if (!def) return NextResponse.json({ error: 'Index inconnu' }, { status: 404 })

  const serie = await getIndiceSerie(def)
  if (!serie) return NextResponse.json({ error: 'Données INSEE momentanément indisponibles' }, { status: 502 })

  return NextResponse.json(serie, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
  })
}
