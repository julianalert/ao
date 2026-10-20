import { NextRequest, NextResponse } from 'next/server'
import { acheteurHref, echantillonMarches, rechercherMarches, statistiques } from '@/lib/decp/marches'
import { filtresDepuisParams } from '@/lib/decp/filtres'

// Recherche « Qui gagne quoi » : une page de résultats et, en page 1, les agrégats du segment.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const filtres = filtresDepuisParams(sp)
  const page = Math.min(500, Math.max(1, Number(sp.get('page') ?? 1) || 1))
  const [resultats, echantillon] = await Promise.all([
    rechercherMarches(filtres, page, 20),
    page === 1 ? echantillonMarches(filtres, 2000) : Promise.resolve(null),
  ])
  return NextResponse.json(
    {
      ...resultats,
      items: resultats.items.map((m) => ({ ...m, acheteur_href: acheteurHref(m.acheteur_nom, m.acheteur_id) })),
      stats: echantillon ? { ...statistiques(echantillon), echantillon: echantillon.length } : null,
    },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
  )
}
