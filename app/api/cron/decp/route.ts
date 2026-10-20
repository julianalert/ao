import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { mapperLigne, pageTabulaire } from '@/lib/decp/mapping.mjs'

export const maxDuration = 300

// Mise à jour quotidienne des marchés attribués : données publiées ces 3 derniers jours
// (le jeu consolidé est reconstruit chaque nuit vers 5 h UTC).
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: 'Supabase admin non configuré' }, { status: 500 })

  const jours = Math.min(30, Math.max(1, Number(req.nextUrl.searchParams.get('jours') ?? 3)))
  const depuis = new Date(Date.now() - jours * 86400000).toISOString().slice(0, 10)
  const params = { donneesActuelles__exact: 'true', datePublicationDonnees__greater: depuis, datePublicationDonnees__sort: 'asc' }

  try {
    const { total } = await pageTabulaire(params, 1, 1)
    const pages = Math.min(Math.ceil(total / 200), 150)
    let lignes = 0
    for (let debut = 1; debut <= pages; debut += 5) {
      const lot = await Promise.all(
        Array.from({ length: Math.min(5, pages - debut + 1) }, (_, i) => pageTabulaire(params, debut + i, 200, { cache: 'no-store' })),
      )
      const mappees = lot.flatMap((p) => p.rows.map(mapperLigne)).filter((m): m is NonNullable<typeof m> => m !== null)
      const uniques = Array.from(new Map(mappees.map((m) => [m.id, { ...m, updated_at: new Date().toISOString() }])).values())
      if (uniques.length) {
        const { error } = await sb.from('marches_attribues').upsert(uniques, { onConflict: 'id' })
        if (error) throw new Error(error.message)
      }
      lignes += uniques.length
    }
    const { error: refresh } = await sb.rpc('refresh_acheteurs_index')
    return NextResponse.json({ ok: true, depuis, total, lignes, indexRafraichi: !refresh, ...(refresh ? { erreurIndex: refresh.message } : {}) })
  } catch (err) {
    console.error('cron decp:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 })
  }
}
