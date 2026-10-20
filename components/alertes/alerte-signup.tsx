'use client'

import { useState } from 'react'
import Link from 'next/link'
import { criteresVersParams, criteresVides, CRITERES_VIDES, type Criteres } from '@/lib/alertes/criteres'

/**
 * Bloc d'inscription aux alertes, pré-rempli avec le contexte de la page
 * (catégorie, département ou région). Sans métier connu, il renvoie vers le formulaire complet.
 */
export default function AlerteSignup({
  criteres = {},
  contexte,
  source,
  compact = false,
}: {
  criteres?: Partial<Criteres>
  /** Ex. « de plomberie dans le Rhône » */
  contexte?: string
  source: string
  compact?: boolean
}) {
  const [email, setEmail] = useState('')
  const [etat, setEtat] = useState<{ ok: boolean; message: string } | null>(null)
  const [envoi, setEnvoi] = useState(false)
  const complets: Criteres = { ...CRITERES_VIDES, ...criteres }
  const direct = !criteresVides(complets)
  const lienForm = `/outils/alertes-appels-offres${criteresVersParams(criteres) ? `?${criteresVersParams(criteres)}` : ''}`

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setEnvoi(true)
    setEtat(null)
    try {
      const res = await fetch('/api/alertes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, criteres: complets, frequence: 'quotidienne', source, nom: contexte ? `AO ${contexte}` : null }),
      })
      const json = await res.json()
      if (!res.ok) setEtat({ ok: false, message: json.error ?? 'Une erreur est survenue.' })
      else setEtat({ ok: true, message: json.status === 'alerte-creee' ? 'Alerte créée.' : `Cliquez sur le lien envoyé à ${email} pour l'activer.` })
    } catch {
      setEtat({ ok: false, message: 'Une erreur est survenue.' })
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className={`no-print rounded-2xl border border-blue-100 bg-blue-50/70 ${compact ? 'p-5' : 'p-6 md:p-8'}`}>
      <p className={`font-bold text-gray-900 ${compact ? 'text-base' : 'text-xl'}`}>
        🔔 Recevez les nouveaux appels d'offres {contexte ?? 'de votre métier'} chaque matin
      </p>
      <p className="text-sm text-gray-600 mt-1 mb-4">Gratuit, sans compte, désinscription en un clic.</p>
      {direct ? (
        <form onSubmit={submit} className={`flex gap-2 ${compact ? 'flex-col' : 'flex-col sm:flex-row'}`}>
          <input
            type="email"
            required
            autoComplete="email"
            aria-label="Votre email"
            className="form-input w-full rounded-lg py-2.5 sm:flex-1"
            value={email}
            placeholder="vous@entreprise.fr"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={envoi} className="btn text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60">
            {envoi ? 'Création…' : 'Créer l\'alerte'}
          </button>
        </form>
      ) : (
        <Link href={lienForm} className="btn text-white bg-blue-500 hover:bg-blue-600">Créer mon alerte gratuite →</Link>
      )}
      {etat && <p className={`mt-2 text-sm ${etat.ok ? 'text-emerald-700' : 'text-red-600'}`} role="status">{etat.message}</p>}
      {direct && (
        <Link href={lienForm} className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline">Personnaliser l'alerte (zone, montant, mots-clés) →</Link>
      )}
    </div>
  )
}
