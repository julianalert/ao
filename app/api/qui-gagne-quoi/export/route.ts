import { NextRequest, NextResponse } from 'next/server'
import { echantillonMarches } from '@/lib/decp/marches'
import { filtresDepuisParams } from '@/lib/decp/filtres'
import { emailValide, obtenirAbonne } from '@/lib/alertes/store'

const MAX_LIGNES = 2000
const csv = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v)
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// Export CSV d'une recherche, contre une adresse email (lead).
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { email?: unknown; params?: unknown }
  if (!emailValide(body.email)) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
  try {
    await obtenirAbonne(body.email, 'export-qui-gagne-quoi')
  } catch (err) {
    console.error('export qui-gagne-quoi (lead):', err instanceof Error ? err.message : err)
  }
  const filtres = filtresDepuisParams(new URLSearchParams(typeof body.params === 'string' ? body.params : ''))
  const lignes = await echantillonMarches(filtres, MAX_LIGNES)
  const entete = ['date_notification', 'objet', 'acheteur', 'acheteur_siret', 'departement', 'attributaire', 'attributaire_siret', 'montant_ht', 'offres_recues', 'procedure', 'type', 'cpv']
  const contenu = [
    entete.join(';'),
    ...lignes.map((m) =>
      [m.date_notification, m.objet, m.acheteur_nom, m.acheteur_id, m.acheteur_departement, m.titulaire_nom, m.titulaire_id, m.montant, m.offres_recues, m.procedure, m.type, m.cpv].map(csv).join(';'),
    ),
  ].join('\n')
  return new NextResponse(`﻿${contenu}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="marches-attribues-mon-ao-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
