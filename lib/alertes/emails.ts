// Gabarits des emails (alertes, confirmations, rappels). HTML simple à styles en ligne.
import type { EmailMessage } from '@/lib/email'
import { departementLabel } from './geo'

export type AoEmail = {
  id: number
  href: string
  titre: string
  acheteur: string | null
  departement: string | null
  region_label: string | null
  montant_estime: number | null
  date_limite: string | null
}

const BLUE = '#3b82f6'
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const eur = (n: number) => `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)} €`
const date = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }).format(new Date(iso))

function utm(url: string, campaign: string): string {
  const u = new URL(url)
  u.searchParams.set('utm_source', 'alerte')
  u.searchParams.set('utm_medium', 'email')
  u.searchParams.set('utm_campaign', campaign)
  return u.toString()
}

function layout(body: string, liens: { gerer?: string; desinscrire?: string }): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f9fafb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #e5e7eb;border-radius:16px">
<tr><td style="padding:24px 28px 8px"><span style="font-weight:800;font-size:18px;color:#111827">mon-ao<span style="color:${BLUE}">.com</span></span></td></tr>
<tr><td style="padding:8px 28px 28px;font-size:15px;line-height:1.6">${body}</td></tr>
</table>
<p style="font-size:12px;color:#9ca3af;max-width:600px;line-height:1.6;margin:16px auto 0">
Vous recevez cet email car vous avez créé une alerte gratuite sur mon-ao.com.
${liens.gerer ? `<a href="${liens.gerer}" style="color:#6b7280">Gérer mes alertes</a>` : ''}
${liens.desinscrire ? ` · <a href="${liens.desinscrire}" style="color:#6b7280">Me désinscrire</a>` : ''}
</p></td></tr></table></body></html>`
}

function bouton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BLUE};color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:999px">${label}</a>`
}

export function emailConfirmation(p: { to: string; baseUrl: string; confirmToken: string; resume: string | null }): EmailMessage {
  const url = `${p.baseUrl}/api/alertes/confirmer?t=${p.confirmToken}`
  return {
    to: p.to,
    subject: 'Confirmez votre alerte appels d\'offres',
    html: layout(
      `<p style="font-size:20px;font-weight:800;margin:0 0 12px">Confirmez votre adresse email</p>
<p>Un clic suffit pour activer ${p.resume ? `votre alerte : <strong>${esc(p.resume)}</strong>` : 'vos alertes et rappels'}.</p>
<p style="margin:24px 0">${bouton(url, 'Confirmer mon adresse')}</p>
<p style="font-size:13px;color:#6b7280">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : rien ne sera envoyé.</p>`,
      {},
    ),
    text: `Confirmez votre adresse email pour activer ${p.resume ? `votre alerte : ${p.resume}` : 'vos alertes et rappels'}.\n\n${url}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
    tags: [{ name: 'type', value: 'confirmation' }],
  }
}

export function emailLienGestion(p: { to: string; baseUrl: string; token: string }): EmailMessage {
  const url = `${p.baseUrl}/alertes/gerer?t=${p.token}`
  return {
    to: p.to,
    subject: 'Votre lien pour gérer vos alertes mon-ao.com',
    html: layout(
      `<p style="font-size:20px;font-weight:800;margin:0 0 12px">Gérer vos alertes</p>
<p>Voici votre lien personnel, sans mot de passe, pour modifier ou supprimer vos alertes, favoris et rappels.</p>
<p style="margin:24px 0">${bouton(url, 'Gérer mes alertes')}</p>
<p style="font-size:13px;color:#6b7280">Ne transférez pas cet email : le lien donne accès à vos alertes.</p>`,
      {},
    ),
    text: `Votre lien personnel pour gérer vos alertes mon-ao.com :\n${url}`,
    tags: [{ name: 'type', value: 'lien' }],
  }
}

function ligneAo(ao: AoEmail, baseUrl: string): string {
  const meta = [
    ao.acheteur ? esc(ao.acheteur) : null,
    ao.departement ? esc(departementLabel(ao.departement)) : ao.region_label ? esc(ao.region_label) : null,
    ao.montant_estime ? eur(ao.montant_estime) : null,
    ao.date_limite ? `<strong style="color:#b91c1c">limite le ${date(ao.date_limite)}</strong>` : null,
  ].filter(Boolean)
  return `<tr><td style="padding:14px 0;border-top:1px solid #f3f4f6">
<a href="${utm(baseUrl + ao.href, 'digest')}" style="color:#111827;font-weight:600;text-decoration:none">${esc(ao.titre)}</a>
<div style="font-size:13px;color:#6b7280;margin-top:4px">${meta.join(' · ')}</div>
<div style="font-size:13px;margin-top:6px"><a href="${utm(`${baseUrl}/outils/analyse-rc?ao=${ao.id}`, 'digest')}" style="color:${BLUE};text-decoration:none">Analyser ce RC →</a></div>
</td></tr>`
}

export type SectionDigest = { nom: string; resume: string; aos: AoEmail[]; total: number }

export function emailDigest(p: { to: string; baseUrl: string; token: string; sections: SectionDigest[]; hebdo: boolean }): EmailMessage {
  const total = p.sections.reduce((s, x) => s + x.total, 0)
  const gerer = `${p.baseUrl}/alertes/gerer?t=${p.token}`
  const desinscrire = `${p.baseUrl}/api/alertes/desinscription?t=${p.token}`
  const body = p.sections
    .map(
      (s) => `<p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#9ca3af;margin:24px 0 4px">${esc(s.nom)} · ${s.total} AO</p>
<p style="font-size:13px;color:#6b7280;margin:0 0 4px">${esc(s.resume)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${s.aos.map((ao) => ligneAo(ao, p.baseUrl)).join('')}</table>
${s.total > s.aos.length ? `<p style="font-size:13px;color:#6b7280">… et ${s.total - s.aos.length} autres sur mon-ao.com.</p>` : ''}`,
    )
    .join('')
  return {
    to: p.to,
    subject: `${total} nouvel${total > 1 ? 's' : ''} appel${total > 1 ? 's' : ''} d'offres ${p.hebdo ? 'cette semaine' : 'pour vous'}`,
    html: layout(
      `<p style="font-size:20px;font-weight:800;margin:0">${total} nouvel${total > 1 ? 's' : ''} AO ${p.hebdo ? 'cette semaine' : 'depuis hier'}</p>${body}
<p style="margin-top:28px;padding:16px;background:#eff6ff;border-radius:12px;font-size:14px">Répondre prend du temps ? <a href="https://www.visionbtp.com" style="color:${BLUE};font-weight:600">VisionBTP automatise l'analyse des DCE et la préparation des réponses</a>.</p>`,
      { gerer, desinscrire },
    ),
    text: `${total} nouveaux appels d'offres\n\n${p.sections
      .map((s) => `${s.nom} (${s.resume})\n${s.aos.map((ao) => `- ${ao.titre}\n  ${p.baseUrl}${ao.href}`).join('\n')}`)
      .join('\n\n')}\n\nGérer mes alertes : ${gerer}\nSe désinscrire : ${desinscrire}`,
    unsubscribeUrl: desinscrire,
    tags: [{ name: 'type', value: 'digest' }],
  }
}

export function emailRappelFavori(p: { to: string; baseUrl: string; token: string; ao: AoEmail; jours: number }): EmailMessage {
  const gerer = `${p.baseUrl}/alertes/gerer?t=${p.token}`
  const lien = utm(p.baseUrl + p.ao.href, `favori-j${p.jours}`)
  return {
    to: p.to,
    subject: `J-${p.jours} : ${p.ao.titre.slice(0, 80)}`,
    html: layout(
      `<p style="font-size:20px;font-weight:800;margin:0 0 12px">Plus que ${p.jours} jours pour répondre</p>
<p><strong>${esc(p.ao.titre)}</strong></p>
<p style="color:#6b7280;font-size:14px">${[p.ao.acheteur, p.ao.date_limite ? `date limite le ${date(p.ao.date_limite)}` : null].filter(Boolean).map((x) => esc(String(x))).join(' · ')}</p>
<p style="margin:24px 0">${bouton(lien, 'Voir l\'appel d\'offres')}</p>`,
      { gerer },
    ),
    text: `Plus que ${p.jours} jours pour répondre : ${p.ao.titre}\n${lien}\n\nGérer mes favoris : ${gerer}`,
    tags: [{ name: 'type', value: 'favori' }],
  }
}

export function emailRappelAttestation(p: { to: string; baseUrl: string; token: string; piece: string; expireLe: string }): EmailMessage {
  const gerer = `${p.baseUrl}/alertes/gerer?t=${p.token}`
  const lien = utm(`${p.baseUrl}/outils/pieces-candidature`, 'attestation')
  return {
    to: p.to,
    subject: `Votre ${p.piece.toLowerCase()} expire le ${date(p.expireLe)}`,
    html: layout(
      `<p style="font-size:20px;font-weight:800;margin:0 0 12px">Pensez à renouveler votre ${esc(p.piece.toLowerCase())}</p>
<p>Elle arrive à échéance le <strong>${date(p.expireLe)}</strong>. Une pièce périmée au moment de l'attribution peut vous faire perdre un marché gagné.</p>
<p style="margin:24px 0">${bouton(lien, 'Voir ma checklist des pièces')}</p>`,
      { gerer },
    ),
    text: `Votre ${p.piece.toLowerCase()} expire le ${date(p.expireLe)}. Pensez à la renouveler.\n${lien}\n\nGérer mes rappels : ${gerer}`,
    tags: [{ name: 'type', value: 'attestation' }],
  }
}
