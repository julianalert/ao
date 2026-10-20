'use client'

import { useState } from 'react'

/** « Suivre cet AO » : rappel J-7 et J-2 avant la date limite. */
export default function FavoriButton({ aoId, ouvert }: { aoId: number; ouvert: boolean }) {
  const [etape, setEtape] = useState<'initial' | 'email' | 'ok' | 'confirmation'>('initial')
  const [email, setEmail] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [envoi, setEnvoi] = useState(false)

  if (!ouvert) return null

  async function suivre(avecEmail?: string) {
    setEnvoi(true)
    setErreur(null)
    try {
      const res = await fetch('/api/favoris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aoId, email: avecEmail }),
      })
      const json = await res.json()
      if (json.status === 'email-requis') setEtape('email')
      else if (!res.ok) setErreur(json.error ?? 'Une erreur est survenue.')
      else setEtape(json.status === 'confirmation-envoyee' ? 'confirmation' : 'ok')
    } catch {
      setErreur('Une erreur est survenue.')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="no-print border-t border-gray-100 pt-4">
      {etape === 'initial' && (
        <button type="button" disabled={envoi} onClick={() => suivre()} className="btn-sm w-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-50">
          ☆ Suivre cet AO
        </button>
      )}
      {etape === 'email' && (
        <form onSubmit={(e) => { e.preventDefault(); suivre(email) }} className="space-y-2">
          <p className="text-xs text-gray-600">Votre email pour un rappel 7 jours et 2 jours avant la date limite :</p>
          <input type="email" required autoComplete="email" aria-label="Votre email" className="form-input w-full rounded-lg text-sm" value={email} placeholder="vous@entreprise.fr" onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={envoi} className="btn-sm w-full text-white bg-blue-500 hover:bg-blue-600">Me rappeler la date limite</button>
        </form>
      )}
      {etape === 'ok' && <p className="text-sm text-emerald-700">★ AO suivi : rappel 7 jours et 2 jours avant la date limite.</p>}
      {etape === 'confirmation' && <p className="text-sm text-emerald-700">Confirmez votre adresse via l'email reçu pour activer les rappels.</p>}
      {erreur && <p className="mt-1 text-xs text-red-600">{erreur}</p>}
      {etape === 'initial' && <p className="mt-1.5 text-center text-xs text-gray-400">Rappel par email à J-7 et J-2</p>}
    </div>
  )
}
