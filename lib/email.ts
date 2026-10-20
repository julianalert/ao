// Envoi d'emails via l'API Resend. Sans RESEND_API_KEY (développement), le message est
// seulement écrit dans les logs du serveur, liens compris.

export type EmailMessage = {
  to: string
  subject: string
  html: string
  text: string
  /** Lien de désinscription en un clic (en-têtes List-Unsubscribe) */
  unsubscribeUrl?: string
  tags?: { name: string; value: string }[]
}

export type EmailResult = { id: string | null; dev: boolean }

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.info(`\n[email:dev] → ${msg.to}\nObjet : ${msg.subject}\n${msg.text}\n`)
    return { id: null, dev: true }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'mon-ao.com <alertes@mon-ao.com>',
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      tags: msg.tags,
      headers: msg.unsubscribeUrl
        ? { 'List-Unsubscribe': `<${msg.unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
        : undefined,
    }),
  })
  if (!res.ok) {
    console.error(`Resend ${res.status}:`, await res.text())
    throw new Error('Envoi de l\'email impossible')
  }
  const json = (await res.json()) as { id?: string }
  return { id: json.id ?? null, dev: false }
}
