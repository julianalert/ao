import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { criteresVides, validerCriteres } from '@/lib/alertes/criteres'
import { lireJson } from '@/lib/alertes/http'
import { chercherAos } from '@/lib/alertes/matching'

// Aperçu : AO correspondant aux critères publiés ces 30 derniers jours (lecture publique).
export async function POST(req: NextRequest) {
  const criteres = validerCriteres((await lireJson(req)).criteres)
  if (criteresVides(criteres)) return NextResponse.json({ total: 0, items: [] })
  const sb = getSupabase()
  if (!sb) return NextResponse.json({ total: 0, items: [] })
  const depuis = new Date(Date.now() - 30 * 86400000).toISOString()
  const { total, items } = await chercherAos(sb, criteres, depuis, 3)
  return NextResponse.json({ total, items })
}
