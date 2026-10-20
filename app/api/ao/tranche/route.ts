import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { aoHref } from '@/app/(default)/ao-item'

// AO encore ouverts dans une tranche de montant estimé (outil « procédure selon le montant »).
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const type = sp.get('type')
  const min = Number(sp.get('min') ?? 0)
  const max = sp.get('max') ? Number(sp.get('max')) : null
  if (!type || !['travaux', 'fournitures', 'services'].includes(type) || isNaN(min)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const sb = getSupabase()
  if (!sb) return NextResponse.json({ items: [], count: 0 })

  let q = sb
    .from('appels_offre')
    .select('id, slug, categorie, titre, acheteur, region_label, montant_estime, date_limite', { count: 'exact' })
    .eq('type_marche', type)
    .gte('montant_estime', min)
    .gte('date_limite', new Date().toISOString())
    .order('date_publication', { ascending: false })
    .limit(5)
  if (max !== null && !isNaN(max)) q = q.lt('montant_estime', max)

  const { data, count, error } = await q
  if (error) {
    console.error('api/ao/tranche:', error.message)
    return NextResponse.json({ items: [], count: 0 })
  }
  return NextResponse.json(
    {
      count: count ?? 0,
      items: (data ?? []).map((ao) => ({
        id: ao.id,
        href: aoHref(ao),
        titre: ao.titre,
        acheteur: ao.acheteur,
        region: ao.region_label,
        montant: ao.montant_estime,
        dateLimite: ao.date_limite,
      })),
    },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
  )
}
