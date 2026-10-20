import { NextRequest, NextResponse } from 'next/server'
import { aoHref } from '@/app/(default)/ao-item'
import { sendEmail } from '@/lib/email'
import { decrireCriteres } from '@/lib/alertes/criteres'
import { emailDigest, emailRappelAttestation, emailRappelFavori, type SectionDigest } from '@/lib/alertes/emails'
import { chercherAos } from '@/lib/alertes/matching'
import { admin, DUREES_ATTESTATION, journaliserEmail, type Alerte } from '@/lib/alertes/store'
import { purgerFichiersAnciens } from '@/lib/analyse-rc/quota'

export const maxDuration = 300

type AbonneLight = { id: string; email: string; token: string }

// Tous les matins après l'import BOAMP : envoi des alertes, rappels J-7 / J-2 des favoris
// et rappels d'expiration des attestations.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin
  const sb = admin()
  const now = new Date()
  const lundi = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Europe/Paris' }).format(now) === 'Mon'
  const stats = { digests: 0, aos: 0, favoris: 0, attestations: 0, erreurs: 0 }

  // ─── 1. Alertes ─────────────────────────────────────────────────────────────
  const { data: alertes, error } = await sb
    .from('alertes')
    .select('*, abonnes!inner (id, email, token, confirmed_at, unsubscribed_at)')
    .eq('actif', true)
    .not('abonnes.confirmed_at', 'is', null)
    .is('abonnes.unsubscribed_at', null)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const parAbonne = new Map<string, { abonne: AbonneLight; alertes: Alerte[] }>()
  for (const a of (alertes ?? []) as (Alerte & { abonnes: AbonneLight })[]) {
    const dues =
      a.frequence === 'hebdomadaire'
        ? lundi && (!a.last_sent_at || now.getTime() - new Date(a.last_sent_at).getTime() > 6 * 86400000)
        : !a.last_sent_at || now.getTime() - new Date(a.last_sent_at).getTime() > 20 * 3600000
    if (!dues) continue
    if (!parAbonne.has(a.abonne_id)) parAbonne.set(a.abonne_id, { abonne: a.abonnes, alertes: [] })
    parAbonne.get(a.abonne_id)!.alertes.push(a)
  }

  for (const { abonne, alertes: liste } of Array.from(parAbonne.values())) {
    try {
      const sections: SectionDigest[] = []
      for (const a of liste) {
        const plancher = now.getTime() - (a.frequence === 'hebdomadaire' ? 8 : 3) * 86400000
        const depuis = new Date(Math.max(new Date(a.last_sent_at ?? a.created_at).getTime(), plancher)).toISOString()
        const { items, total } = await chercherAos(sb, a.criteres, depuis, 15)
        if (total > 0) sections.push({ nom: a.nom ?? 'Votre alerte', resume: decrireCriteres(a.criteres), aos: items, total })
      }
      if (sections.length) {
        const msg = emailDigest({ to: abonne.email, baseUrl: base, token: abonne.token, sections, hebdo: liste.every((a) => a.frequence === 'hebdomadaire') })
        const sent = await sendEmail(msg)
        const nb = sections.reduce((s, x) => s + x.total, 0)
        await journaliserEmail(abonne.id, 'digest', msg.subject, sent.id, nb)
        stats.digests++
        stats.aos += nb
      }
      await sb.from('alertes').update({ last_sent_at: now.toISOString() }).in('id', liste.map((a) => a.id))
    } catch (err) {
      stats.erreurs++
      console.error(`cron alertes (${abonne.id}):`, err)
    }
  }

  // ─── 2. Favoris : J-7 et J-2 ────────────────────────────────────────────────
  for (const jours of [7, 2] as const) {
    const colonne = jours === 7 ? 'rappel_j7_at' : 'rappel_j2_at'
    const debut = new Date(now.getTime() + (jours - 1) * 86400000).toISOString()
    const fin = new Date(now.getTime() + jours * 86400000).toISOString()
    const { data: favoris } = await sb
      .from('favoris')
      .select('abonne_id, ao_id, abonnes!inner (id, email, token, confirmed_at, unsubscribed_at), appels_offre!inner (id, slug, categorie, titre, acheteur, departement, region_label, montant_estime, date_limite)')
      .is(colonne, null)
      .not('abonnes.confirmed_at', 'is', null)
      .is('abonnes.unsubscribed_at', null)
      .gt('appels_offre.date_limite', debut)
      .lte('appels_offre.date_limite', fin)
    for (const f of (favoris ?? []) as unknown as { abonne_id: string; ao_id: number; abonnes: AbonneLight; appels_offre: Parameters<typeof aoHref>[0] & { titre: string; acheteur: string | null; departement: string | null; region_label: string | null; montant_estime: number | null; date_limite: string | null } }[]) {
      try {
        const ao = { ...f.appels_offre, href: aoHref(f.appels_offre) }
        const msg = emailRappelFavori({ to: f.abonnes.email, baseUrl: base, token: f.abonnes.token, ao, jours })
        const sent = await sendEmail(msg)
        await journaliserEmail(f.abonne_id, 'favori', msg.subject, sent.id)
        await sb.from('favoris').update({ [colonne]: now.toISOString() }).eq('abonne_id', f.abonne_id).eq('ao_id', f.ao_id)
        stats.favoris++
      } catch (err) {
        stats.erreurs++
        console.error('cron favoris:', err)
      }
    }
  }

  // ─── 3. Attestations : 15 jours avant expiration ───────────────────────────
  const limite = new Date(now.getTime() + 15 * 86400000).toISOString().slice(0, 10)
  const { data: rappels } = await sb
    .from('rappels_attestation')
    .select('id, abonne_id, piece, expire_le, abonnes!inner (id, email, token, confirmed_at, unsubscribed_at)')
    .is('rappel_envoye_at', null)
    .lte('expire_le', limite)
    .not('abonnes.confirmed_at', 'is', null)
    .is('abonnes.unsubscribed_at', null)
  for (const r of (rappels ?? []) as unknown as { id: string; abonne_id: string; piece: string; expire_le: string; abonnes: AbonneLight }[]) {
    try {
      const msg = emailRappelAttestation({ to: r.abonnes.email, baseUrl: base, token: r.abonnes.token, piece: DUREES_ATTESTATION[r.piece]?.label ?? r.piece, expireLe: r.expire_le })
      const sent = await sendEmail(msg)
      await journaliserEmail(r.abonne_id, 'attestation', msg.subject, sent.id)
      await sb.from('rappels_attestation').update({ rappel_envoye_at: now.toISOString() }).eq('id', r.id)
      stats.attestations++
    } catch (err) {
      stats.erreurs++
      console.error('cron attestations:', err)
    }
  }

  // ─── 4. Fichiers de l'analyseur de RC restés en stockage (échec d'analyse) ──
  let fichiersPurges = 0
  try {
    fichiersPurges = await purgerFichiersAnciens()
  } catch (err) {
    console.error('cron purge dce-temp:', err)
  }

  return NextResponse.json({ ok: true, ...stats, fichiersPurges })
}
