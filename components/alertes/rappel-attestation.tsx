'use client'

import { useState } from 'react'
import { inputClass, selectClass } from '@/components/outils/form'

const PIECES = [
  { value: 'attestation-vigilance', label: 'Attestation de vigilance URSSAF (6 mois)' },
  { value: 'attestation-regularite-fiscale', label: 'Attestation de régularité fiscale (6 mois)' },
  { value: 'kbis', label: 'Extrait Kbis (3 mois)' },
  { value: 'attestation-assurance', label: 'Attestation d\'assurance (fin d\'année)' },
]

/** Rappel par email 15 jours avant l'expiration d'une attestation. */
export default function RappelAttestation() {
  const [email, setEmail] = useState('')
  const [piece, setPiece] = useState(PIECES[0].value)
  const [date, setDate] = useState('')
  const [etat, setEtat] = useState<{ ok: boolean; message: string } | null>(null)
  const [envoi, setEnvoi] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setEnvoi(true)
    setEtat(null)
    try {
      const res = await fetch('/api/rappels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, piece, delivreeLe: date }),
      })
      const json = await res.json()
      const expire = json.expireLe ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(json.expireLe)) : ''
      if (!res.ok) setEtat({ ok: false, message: json.error ?? 'Une erreur est survenue.' })
      else if (json.status === 'confirmation-envoyee') setEtat({ ok: true, message: `Vérifiez votre boîte mail pour confirmer : nous vous préviendrons 15 jours avant le ${expire}.` })
      else setEtat({ ok: true, message: `C'est noté : rappel 15 jours avant le ${expire}.` })
    } catch {
      setEtat({ ok: false, message: 'Une erreur est survenue.' })
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form onSubmit={submit} className="no-print rounded-2xl border border-blue-100 bg-blue-50/60 p-5 md:p-6">
      <p className="font-bold text-gray-900">Être prévenu avant l'expiration d'une attestation</p>
      <p className="text-sm text-gray-600 mt-1 mb-4">
        Un email 15 jours avant l'échéance, pour ne jamais perdre un marché gagné à cause d'une pièce périmée. Gratuit, désinscription
        en un clic.
      </p>
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1.2fr_auto] items-end">
        <label className="block text-sm">
          <span className="block font-medium text-gray-700 mb-1">Pièce</span>
          <select className={selectClass} value={piece} onChange={(e) => setPiece(e.target.value)}>
            {PIECES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="block font-medium text-gray-700 mb-1">Délivrée le</span>
          <input type="date" required className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="block font-medium text-gray-700 mb-1">Email</span>
          <input type="email" required autoComplete="email" className={inputClass} value={email} placeholder="vous@entreprise.fr" onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button type="submit" disabled={envoi} className="btn text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60">
          {envoi ? 'Envoi…' : 'Me prévenir'}
        </button>
      </div>
      {etat && <p className={`mt-3 text-sm ${etat.ok ? 'text-emerald-700' : 'text-red-600'}`} role="status">{etat.message}</p>}
    </form>
  )
}
